import {
  Activity,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit3,
  Eye,
  HeartPulse,
  History,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { consultasService } from '../services/consultasService.js';
import { dashboardService } from '../services/dashboardService.js';
import { especialidadesService } from '../services/especialidadesService.js';
import { apiRequest, shouldUseMocks } from '../services/api.js';
import { mockCrudService } from '../mocks/mockCrudService.js';
import { pacientesService } from '../services/pacientesService.js';
import '../styles/dashboard.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pacientes', path: '/pacientes', icon: UsersRound },
  { label: 'Médicos', path: '/medicos', icon: Stethoscope },
  { label: 'Consultas', path: '/consultas', icon: CalendarClock },
  { label: 'Especialidades', path: '/especialidades', icon: Activity },
];

const statusTone = {
  Ativo: 'success',
  ativo: 'success',
  Inativo: 'muted',
  inativo: 'muted',
  Confirmada: 'success',
  Pendente: 'warning',
  Finalizada: 'info',
  Cancelada: 'danger',
};

const fieldPlaceholders = {
  nome: 'Ex.: Mariana Oliveira',
  cpf: 'Ex.: 123.456.789-01',
  telefone: 'Ex.: (11) 99999-1234',
  email: 'Ex.: exemplo@e-mail.com',
  dataNascimento: 'Ex.: 29/08/1990',
  crm: 'Ex.: CRM-SP 123456',
  especialidade: 'Ex.: Cardiologia',
  estado_crm: 'Ex.: PR',
  especialidade_id: 'Selecione uma especialidade',
  data: 'Ex.: 29/08/2026',
  horario: 'Ex.: 08:30',
  paciente: 'Ex.: Ana Beatriz Costa',
  medico: 'Ex.: Dra. Helena Duarte',
  tipo: 'Ex.: Consulta de retorno',
  observacao: 'Ex.: Retorno com exames em mãos.',
  descricao: 'Ex.: Atendimento e acompanhamento especializado.',
};

const resourceNames = {
  consultas: 'Consulta',
  especialidades: 'Especialidade',
  medicos: 'Médico',
  pacientes: 'Paciente',
};

// O backend atual expõe médicos em /medico (singular).
// Mantemos esta adaptação aqui para não depender de um endpoint incorreto
// no serviço antigo.
const medicosService = {
  list() {
    return shouldUseMocks()
      ? mockCrudService.list('medicos')
      : apiRequest('/medico');
  },

  getById(id) {
    return shouldUseMocks()
      ? mockCrudService.getById('medicos', id)
      : apiRequest(`/medico/${id}`);
  },

  create(payload) {
    return shouldUseMocks()
      ? mockCrudService.create('medicos', payload)
      : apiRequest('/medico', {
          method: 'POST',
          body: payload,
        });
  },

  update(id, payload) {
    return shouldUseMocks()
      ? mockCrudService.update('medicos', id, payload)
      : apiRequest(`/medico/${id}`, {
          method: 'PUT',
          body: payload,
        });
  },

  remove(id) {
    return shouldUseMocks()
      ? mockCrudService.remove('medicos', id)
      : apiRequest(`/medico/${id}`, {
          method: 'DELETE',
        });
  },
};

const systemGuide = [
  {
    title: 'Para que serve',
    text: 'O MedAgenda organiza a rotina da clínica em um painel único: pacientes, médicos, consultas, especialidades, agenda do mês e resumo do dia.',
  },
  {
    title: 'Dashboard',
    text: 'Mostra a visão geral com consultas de hoje, pacientes cadastrados, médicos ativos, pendências e um calendário para conferir a agenda por dia.',
  },
  {
    title: 'Pacientes',
    text: 'Permite cadastrar, pesquisar, visualizar, editar e excluir pacientes, mantendo os principais dados de contato sempre acessiveis.',
  },
  {
    title: 'Médicos',
    text: 'Reúne profissionais, CRM, especialidade, contato e status de atendimento para facilitar a organização da equipe.',
  },
  {
    title: 'Consultas',
    text: 'Centraliza os agendamentos, horários, paciente, médico, especialidade, tipo, status e observações de atendimento.',
  },
  {
    title: 'Especialidades',
    text: 'Organiza as áreas de atendimento oferecidas pela clínica e ajuda a conectar médicos e consultas a cada especialidade.',
  },
];

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getUserGreeting(user, firstName) {
  const userKey = user?.id ?? user?.email ?? firstName.toLowerCase();
  const storageKey = `medagenda:welcome-seen:${userKey}`;

  if (window.localStorage.getItem(storageKey) !== 'true') {
    window.localStorage.setItem(storageKey, 'true');
    return `Seja bem-vindo, ${firstName}`;
  }

  return `${getTimeGreeting()}, ${firstName}`;
}

function getDisplayName(user) {
  const name = user?.nome?.trim();

  if (name && !name.toLowerCase().startsWith('profissional')) {
    return name;
  }

  const emailName = user?.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();

  if (emailName) {
    return emailName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return 'Guilherme';
}

const pages = {
  '/pacientes': {
    resource: 'pacientes',
    title: 'Pacientes',
    subtitle: 'Cadastros, contatos e histórico da base atendida',
    action: 'Novo paciente',
    search: 'Pesquisar por nome, CPF, telefone ou email',
    service: pacientesService,
    columns: [
      ['nome', 'Paciente'],
      ['cpf', 'CPF'],
      ['telefone', 'Telefone'],
      ['email', 'E-mail'],
    ],
    fields: [
      ['nome', 'Nome'],
      ['cpf', 'CPF'],
      ['tel', 'Telefone'],
      ['email', 'E-mail'],
      ['nasc', 'Nascimento', 'date'],
      ['sexo', 'Sexo'],
      ['cep', 'CEP'],
      ['rua', 'Rua'],
      ['num', 'Número'],
      ['comp', 'Complemento'],
      ['bairro', 'Bairro'],
      ['cid', 'Cidade'],
      ['est', 'Estado'],
    ],
  },

  '/medicos': {
    resource: 'medicos',
    title: 'Médicos',
    subtitle: 'Profissionais, especialidades e disponibilidade da clínica',
    action: 'Novo médico',
    search: 'Pesquisar por nome, CRM ou e-mail',
    service: medicosService,
    columns: [
      ['nome', 'Profissional'],
      ['crm', 'CRM'],
      ['especialidade', 'Especialidade'],
      ['telefone', 'Telefone'],
      ['status', 'Status'],
    ],
    fields: [
      ['nome', 'Nome'],
      ['cpf', 'CPF'],
      ['crm', 'CRM'],
      ['estado_crm', 'Estado do CRM'],
      ['especialidade_id', 'Especialidade', 'specialty'],
      ['telefone', 'Telefone'],
      ['email', 'E-mail'],
      ['status', 'Status', 'select', ['ativo', 'inativo']],
    ],
  },

  '/consultas': {
    resource: 'consultas',
    title: 'Consultas',
    subtitle: 'Atendimentos agendados e status operacional',
    action: 'Nova consulta',
    search: 'Pesquisar por paciente ou médico',
    service: consultasService,
    columns: [
      ['data', 'Data'],
      ['horario', 'Horário'],
      ['paciente', 'Paciente'],
      ['medico', 'Médico'],
      ['especialidade', 'Especialidade'],
      ['status', 'Status'],
    ],
    fields: [
      ['data', 'Data', 'date'],
      ['horario', 'Horário', 'time'],
      ['paciente_id', 'Paciente', 'patient'],
      ['medico_id', 'Médico', 'doctor'],
      ['especialidade_id', 'Especialidade', 'specialty'],
      ['tipo', 'Tipo'],
      ['status', 'Status', 'select', ['pendente', 'confirmada', 'finalizada', 'cancelada']],
      ['observacao', 'Observação'],
    ],
  },

  '/especialidades': {
    resource: 'especialidades',
    title: 'Especialidades',
    subtitle: 'Áreas de atendimento oferecidas pela clínica',
    action: 'Nova especialidade',
    search: 'Pesquisar especialidade',
    service: especialidadesService,
    columns: [
      ['nome', 'Especialidade'],
      ['descricao', 'Descrição'],
      ['status', 'Status'],
    ],
    fields: [
      ['nome', 'Nome'],
      ['descricao', 'Descrição'],
      ['status', 'Status', 'select', ['ativo', 'inativo']],
    ],
  },
};

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [summary, setSummary] = useState(null);
  const [consultasHoje, setConsultasHoje] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardModal, setDashboardModal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [systemModal, setSystemModal] = useState(null);
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [topbarGreeting, setTopbarGreeting] = useState('');
  const [resourceRefreshKey, setResourceRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const currentPage = pages[location.pathname];

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const [summaryData, consultasData, calendarioData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getConsultasHoje(),
        dashboardService.getCalendario(),
      ]);

      setSummary(summaryData);
     setConsultasHoje(consultasData);
      setCalendario(calendarioData);
    } catch (error) {
     console.error('Erro ao carregar dashboard:', error);
   } finally {
     setIsLoading(false);
   }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsOptionsOpen(false);
  }, [location.pathname]);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const firstName = useMemo(() => displayName.split(' ')[0] ?? 'Guilherme', [displayName]);

  useEffect(() => {
    setTopbarGreeting(getUserGreeting(user, firstName));
  }, [firstName, user?.email, user?.id]);

  useEffect(() => {
    if (!toastMessage) return undefined;

    const timer = window.setTimeout(() => setToastMessage(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function handleRecordDeleted(entry) {
    setDeletedHistory((current) => [
      {
        id: `${entry.resource}-${entry.record.id}-${Date.now()}`,
        date: new Date().toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        ...entry,
      },
      ...current,
    ]);
  }

  async function handleRecordRestore(entry) {
    const config = Object.values(pages).find((page) => page.resource === entry.resource);

    if (!config) return;

    await config.service.restore(entry.record);
    setDeletedHistory((current) =>
      current.map((item) =>
        item.id === entry.id
          ? {
              ...item,
              restored: true,
              restoredAt: new Date().toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              }),
            }
          : item,
      ),
    );
    setToastMessage(`${entry.resourceLabel} restaurado com sucesso.`);
    setResourceRefreshKey((current) => current + 1);
    await loadDashboard();
  }

  return (
    <main className="app-frame">
      <button
        className={`mobile-sidebar-backdrop ${isMobileMenuOpen ? 'is-visible' : ''}`}
        type="button"
        aria-label="Fechar menu"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`app-sidebar ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <div className="app-brand" aria-label="MedAgenda">
          <div className="app-brand-mark">
            <HeartPulse size={22} strokeWidth={1.75} />
          </div>
          <strong>
            <span>Med</span>Agenda
          </strong>
        </div>

        <nav className="app-nav" aria-label="Navegação principal">
          <small>Gestão</small>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink className="app-nav-item" key={item.path} to={item.path}>
                <Icon size={18} strokeWidth={1.65} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="app-sidebar-tools">
          <button className="app-options-trigger" type="button" onClick={() => setIsOptionsOpen((current) => !current)}>
            <MoreHorizontal size={19} strokeWidth={1.7} />
            <span>Opções</span>
          </button>

          {isOptionsOpen ? (
            <div className="app-options-menu">
              <button
                type="button"
                onClick={() => {
                  setSystemModal('info');
                  setIsOptionsOpen(false);
                }}
              >
                <Info size={18} strokeWidth={1.8} />
                <span>Informações</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSystemModal('history');
                  setIsOptionsOpen(false);
                }}
              >
                <History size={17} strokeWidth={1.7} />
                <span>Histórico</span>
              </button>
            </div>
          ) : null}
        </div>

        <button className="app-logout" type="button" onClick={logout}>
          <LogOut size={18} strokeWidth={1.65} />
          <span>Sair</span>
        </button>
      </aside>

      <section className="app-workspace">
        <header className="app-topbar">
          <button
            className="mobile-menu-trigger"
            type="button"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <X size={21} strokeWidth={1.8} /> : <Menu size={21} strokeWidth={1.8} />}
          </button>

          <div>
            <strong>{topbarGreeting || `${getTimeGreeting()}, ${firstName}`}</strong>
            <span>{currentPage?.title ?? 'Visão geral'}</span>
          </div>

          <label className="app-search">
            <Search size={18} strokeWidth={1.6} />
            <input type="search" placeholder="Pesquisar no sistema..." />
          </label>

          <div className="app-profile">
            <span>{firstName.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{displayName}</strong>
              <small>{user?.perfil ?? 'Administrador'}</small>
            </div>
          </div>
        </header>

        <div className="dashboard-surface">
          {currentPage ? (
            <ResourcePage
              config={currentPage}
              onDataChange={loadDashboard}
              onRecordDeleted={handleRecordDeleted}
              refreshKey={resourceRefreshKey}
            />
          ) : (
            <>
              <section className="dashboard-hero">
                <div>
                  <p>Bom retorno, {firstName}</p>
                  <h1>Agenda clínica sob controle.</h1>
                  <span>Uma leitura rápida do movimento de hoje, com foco no que precisa de atenção primeiro.</span>
                </div>
                <button className="dashboard-primary-action interactive-press" type="button" onClick={() => setDashboardModal({ mode: 'create' })}>
                  <CalendarDays size={18} strokeWidth={1.7} />
                  <span>Nova consulta</span>
                </button>
              </section>

              <section className="metric-grid" aria-label="Resumo do dashboard">
                <MetricCard icon={CalendarClock} label="Consultas de hoje" value={summary?.consultasHoje} detail="Atendimentos previstos" />
                <MetricCard icon={UsersRound} label="Pacientes cadastrados" value={summary?.pacientesCadastrados} detail="Base ativa da clínica" />
                <MetricCard icon={Stethoscope} label="Médicos ativos" value={summary?.medicosAtivos} detail="Profissionais atendendo" />
                <MetricCard icon={Activity} label="Consultas pendentes" value={summary?.consultasPendentes} detail="Aguardando confirmação" />
              </section>

              <section className="dashboard-grid">
                <article className="dashboard-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Consultas de hoje</h2>
                      <p>Dados vindos da rota de dashboard</p>
                    </div>
                    <span>{isLoading ? 'Carregando' : `${consultasHoje.length} registros`}</span>
                  </div>

                  <div className="appointments-list">
                    {consultasHoje.map((consulta) => (
                      <div className="appointment-row" key={consulta.id}>
                        <strong>{consulta.horario}</strong>
                        <div>
                          <span>{consulta.paciente}</span>
                          <small>{consulta.medico} - {consulta.especialidade}</small>
                        </div>
                        <StatusBadge status={consulta.status} />
                      </div>
                    ))}
                  </div>
                </article>

                <article className="dashboard-panel dashboard-calendar">
                  <div className="panel-heading">
                    <div>
                      <h2>Agenda do mês</h2>
                      <p>Dias com consultas marcadas</p>
                    </div>
                  </div>
                  <MiniCalendar calendario={calendario} />
                </article>
              </section>
            </>
          )}
        </div>
      </section>

      {dashboardModal ? (
        <ResourceModal
          config={pages['/consultas']}
          mode={dashboardModal.mode}
          onClose={() => setDashboardModal(null)}
          onSave={async (values) => {
            await consultasService.create({
              status: 'Pendente',
              ...values,
            });
            setDashboardModal(null);
            await loadDashboard();
          }}
        />
      ) : null}

      {systemModal ? (
        <SystemModal
          deletedHistory={deletedHistory}
          mode={systemModal}
          onClose={() => setSystemModal(null)}
          onRestore={handleRecordRestore}
        />
      ) : null}

      {toastMessage ? (
        <div className="app-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </main>
  );
}

function MetricCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="metric-card">
      <div>
        <span>{label}</span>
        <strong>{value ?? '--'}</strong>
        <small>{detail}</small>
      </div>
      <div className="metric-icon">
        <Icon size={20} strokeWidth={1.65} />
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge is-${statusTone[status] ?? 'info'}`}>{status}</span>;
}

function MiniCalendar({ calendario }) {
  const initialMonth = useMemo(() => {
    const firstDate = calendario[0]?.data ? new Date(`${calendario[0].data}T12:00:00`) : new Date();
    return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  }, [calendario]);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    setVisibleMonth(initialMonth);
    setSelectedDay(null);
  }, [initialMonth]);

  const scheduledDays = useMemo(() => {
  const grouped = new Map();

  calendario.forEach((consulta) => {
    if (!consulta?.data) return;

    const date = new Date(`${consulta.data}T12:00:00`);

    if (
      date.getFullYear() !== visibleMonth.getFullYear() ||
      date.getMonth() !== visibleMonth.getMonth()
    ) {
      return;
    }

    const day = Number(consulta.data.split('-')[2]);

    if (!grouped.has(day)) {
      grouped.set(day, {
        consultas: [],
        total: 0,
      });
    }

    grouped.get(day).consultas.push(consulta);
    grouped.get(day).total += 1;
  });

  return grouped;
}, [calendario, visibleMonth]);
  
  const selectedAppointments = selectedDay ? (scheduledDays.get(selectedDay)?.consultas ?? []) : [];
  const monthLabel = visibleMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const firstWeekDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const emptyDays = Array.from({ length: firstWeekDay }, (_, index) => `empty-${index}`);
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  function changeMonth(direction) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    setSelectedDay(null);
  }

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-title">
        <div>
          <strong>{monthLabel}</strong>
          <span>{scheduledDays.size} dias com agenda</span>
        </div>
        <div className="mini-calendar-actions">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior">
            <ChevronLeft size={16} strokeWidth={1.7} />
          </button>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês">
            <ChevronRight size={16} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div className="mini-calendar-week" aria-hidden="true">
        {weekDays.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="mini-calendar-grid">
        {emptyDays.map((day) => (
          <span key={day} aria-hidden="true" />
        ))}
        {monthDays.map((day) => {
          const appointments = scheduledDays.get(day)?.total;

          return (
            <button
              className={`${appointments ? 'has-events' : ''} ${selectedDay === day ? 'is-selected' : ''}`}
              key={day}
              type="button"
              onClick={() => setSelectedDay((current) => (current === day ? null : day))}
            >
              <span>{day}</span>
              {appointments ? <small>{appointments}</small> : null}
            </button>
          );
        })}
      </div>

      <div className="calendar-day-card">
        {selectedDay ? (
          <>
            <strong>Dia {String(selectedDay).padStart(2, '0')}</strong>
            {selectedAppointments.length ? (
              <div className="calendar-day-list">
                {selectedAppointments.map((consulta) => (
                  <div key={consulta.id}>
                    <span>{consulta.horario}</span>
                    <p>{consulta.paciente}</p>
                    <small>{consulta.medico}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma consulta marcada para este dia.</p>
            )}
          </>
        ) : (
          <p>Selecione um dia para ver os horários.</p>
        )}
      </div>
    </div>
  );
}

function ResourcePage({ config, onDataChange, onRecordDeleted, refreshKey }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      setIsLoading(true);
      const data = await config.service.list();

      if (!isMounted) return;
      setItems(data);
      setIsLoading(false);
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [config, refreshKey]);

  const filteredItems = useMemo(() => {
    const search = query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    if (!search) return items;

    return items.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .includes(search),
      ),
    );
  }, [items, query]);

  async function reloadItems() {
    setIsLoading(true);
    const data = await config.service.list();
    setItems(data);
    setIsLoading(false);
  }

  async function handleSave(values) {
    try {
      if (modal?.mode === 'edit') {
        await config.service.update(modal.item.id, values);
      } else {
        const payload = { ...values };

        if (config.resource === 'consultas') {
          payload.status = payload.status || 'pendente';
        }

        await config.service.create(payload);
      }

      setModal(null);
      await reloadItems();
      await onDataChange();
    } catch (error) {
      console.error(`Erro ao salvar ${config.resource}:`, error);
      window.alert(error?.message || 'Não foi possível salvar o registro.');
    }
  }

  async function handleDelete(item) {
    const result = await config.service.remove(item.id);
    onRecordDeleted({
      resource: config.resource,
      resourceLabel: resourceNames[config.resource] ?? config.title,
      record: result?.record ?? item,
    });
    await reloadItems();
    await onDataChange();
  }

  return (
    <>
      <section className="dashboard-hero resource-hero">
        <div>
          <p>MedAgenda</p>
          <h1>{config.title}</h1>
          <span>{config.subtitle}</span>
        </div>
        <button className="dashboard-primary-action interactive-press" type="button" onClick={() => setModal({ mode: 'create' })}>
          <Plus size={18} strokeWidth={1.7} />
          <span>{config.action}</span>
        </button>
      </section>

      <article className="dashboard-panel resource-panel">
        <div className="resource-toolbar">
          <label className="app-search resource-search">
            <Search size={18} strokeWidth={1.6} />
            <input type="search" placeholder={config.search} value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <span>{isLoading ? 'Carregando' : `${filteredItems.length} registros`}</span>
        </div>

        <div className="resource-table-wrap">
          <table className="resource-table">
            <thead>
              <tr>
                {config.columns.map(([, label]) => (
                  <th key={label}>{label}</th>
                ))}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  {config.columns.map(([key]) => (
                    <td key={key}>{key === 'status' ? <StatusBadge status={item[key]} /> : item[key] || '-'}</td>
                  ))}
                  <td>
                    <div className="resource-actions">
                      <button type="button" aria-label="Visualizar" onClick={() => setModal({ mode: 'view', item })}>
                        <Eye size={16} strokeWidth={1.65} />
                      </button>
                      <button type="button" aria-label="Editar" onClick={() => setModal({ mode: 'edit', item })}>
                        <Edit3 size={16} strokeWidth={1.65} />
                      </button>
                      <button type="button" aria-label="Excluir" onClick={() => handleDelete(item)}>
                        <Trash2 size={16} strokeWidth={1.65} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {modal ? (
        <ResourceModal
          config={config}
          item={modal.item}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}

function ResourceModal({ config, item = {}, mode, onClose, onSave }) {
  const isView = mode === 'view';
  const title =
    mode === 'create'
      ? config.action
      : mode === 'edit'
        ? `Editar ${config.title}`
        : `Detalhes de ${config.title}`;

  const [formValues, setFormValues] = useState(() =>
    Object.fromEntries(
      config.fields
        .filter(([, , type]) => !['select', 'patient', 'doctor', 'specialty'].includes(type))
        .map(([key]) => [key, item[key] ?? '']),
    ),
  );

  const [selectValues, setSelectValues] = useState(() =>
    Object.fromEntries(
      config.fields
        .filter(([, , type]) => type === 'select')
        .map(([key]) => [key, item[key] ?? '']),
    ),
  );

  const [relationOptions, setRelationOptions] = useState({
    patient: [],
    doctor: [],
    specialty: [],
  });
  const [relationValues, setRelationValues] = useState(() => ({
    patient: item.paciente_id ?? '',
    doctor: item.medico_id ?? '',
    specialty: item.especialidade_id ?? '',
  }));
  const [isLoadingRelations, setIsLoadingRelations] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRelations() {
      const relationTypes = config.fields
        .map(([, , type]) => type)
        .filter((type) => ['patient', 'doctor', 'specialty'].includes(type));

      if (!relationTypes.length) return;

      setIsLoadingRelations(true);

      try {
        const requests = relationTypes.map((type) => {
          if (type === 'patient') return pacientesService.list();
          if (type === 'doctor') return medicosService.list();
          return especialidadesService.list();
        });

        const results = await Promise.all(requests);

        if (!isMounted) return;

        const next = { patient: [], doctor: [], specialty: [] };

        relationTypes.forEach((type, index) => {
          next[type] = Array.isArray(results[index]) ? results[index] : [];
        });

        setRelationOptions(next);
      } catch (error) {
        console.error('Erro ao carregar opções do formulário:', error);
      } finally {
        if (isMounted) setIsLoadingRelations(false);
      }
    }

    loadRelations();

    return () => {
      isMounted = false;
    };
  }, [config]);

  function handleSubmit(event) {
    event.preventDefault();

    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    if (config.resource === 'medicos') {
      values.especialidade_id = relationValues.specialty;
    }

    if (config.resource === 'consultas') {
      values.paciente_id = relationValues.patient;
      values.medico_id = relationValues.doctor;
      values.especialidade_id = relationValues.specialty;
    }

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'string') {
        values[key] = value.trim();
      }
    });

    onSave(values);
  }

  function getRelationLabel(type, option) {
    if (type === 'patient') return option.nome;
    if (type === 'doctor') {
      return option.nome
        ? `${option.nome}${option.crm ? ` — ${option.crm}` : ''}`
        : '';
    }
    return option.nome;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="resource-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading">
          <div>
            <p>MedAgenda</p>
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            x
          </button>
        </div>

        {isView ? (
          <div className="detail-summary">
            {config.fields.map(([key, label, type]) => {
              let value = item[key];

              if (type === 'patient') value = item.paciente ?? item.paciente_id;
              if (type === 'doctor') value = item.medico ?? item.medico_id;
              if (type === 'specialty') value = item.especialidade ?? item.especialidade_id;

              return (
                <div
                  className={key === 'observacao' || key === 'descricao' ? 'is-wide' : ''}
                  key={key}
                >
                  <span>{label}</span>
                  {key === 'status' ? (
                    <StatusBadge status={item[key]} />
                  ) : (
                    <strong>{value || '-'}</strong>
                  )}
                </div>
              );
            })}

            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            {config.fields.map(([key, label, type = 'text', options]) => (
              <label key={key}>
                <span>{label}</span>

                {type === 'select' ? (
                  <FieldSelect
                    name={key}
                    options={options}
                    value={selectValues[key]}
                    onChange={(value) =>
                      setSelectValues((current) => ({
                        ...current,
                        [key]: value,
                      }))
                    }
                  />
                ) : ['patient', 'doctor', 'specialty'].includes(type) ? (
                  <RelationSelect
                    name={key}
                    relationType={type}
                    options={relationOptions[type]}
                    value={relationValues[type]}
                    disabled={isLoadingRelations}
                    onChange={(value) =>
                      setRelationValues((current) => ({
                        ...current,
                        [type]: value,
                      }))
                    }
                    getLabel={getRelationLabel}
                  />
                ) : (
                  <div className="modal-input-wrap">
                    {key === 'observacao' || key === 'descricao' ? (
                      <textarea
                        name={key}
                        value={formValues[key] ?? ''}
                        placeholder={fieldPlaceholders[key]}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      <input
                        name={key}
                        type={type}
                        value={formValues[key] ?? ''}
                        placeholder={fieldPlaceholders[key]}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                )}
              </label>
            ))}

            <div className="modal-actions">
              <button className="modal-cancel-action" type="button" onClick={onClose}>
                Cancelar
              </button>
              <button className="modal-save-action" type="submit">
                <span>Salvar</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function RelationSelect({
  name,
  relationType,
  options,
  value,
  disabled,
  onChange,
  getLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleOutsideClick(event) {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const selected = options.find((option) => String(option.id) === String(value));
  const selectedLabel = selected ? getLabel(relationType, selected) : 'Selecione uma opção';

  return (
    <div className={`modal-select ${isOpen ? 'is-open' : ''}`} ref={selectRef}>
      <input type="hidden" name={name} value={value ?? ''} />

      <button
        className="modal-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{disabled ? 'Carregando...' : selectedLabel}</span>
        {isOpen ? (
          <ChevronUp size={17} strokeWidth={1.7} />
        ) : (
          <ChevronDown size={17} strokeWidth={1.7} />
        )}
      </button>

      {isOpen ? (
        <div className="modal-select-menu" role="listbox" aria-label={name}>
          {options.length ? (
            options.map((option) => (
              <button
                className={String(option.id) === String(value) ? 'is-selected' : ''}
                key={option.id}
                type="button"
                role="option"
                aria-selected={String(option.id) === String(value)}
                onClick={() => {
                  onChange(String(option.id));
                  setIsOpen(false);
                }}
              >
                {getLabel(relationType, option)}
              </button>
            ))
          ) : (
            <span className="modal-select-empty">Nenhuma opção cadastrada.</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FieldSelect({ name, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleOutsideClick(event) {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className={`modal-select ${isOpen ? 'is-open' : ''}`} ref={selectRef}>
      <input type="hidden" name={name} value={value} />
      <button
        className="modal-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{value}</span>
        {isOpen ? <ChevronUp size={17} strokeWidth={1.7} /> : <ChevronDown size={17} strokeWidth={1.7} />}
      </button>
      {isOpen ? (
        <div className="modal-select-menu" role="listbox" aria-label={name}>
          {options.map((option) => (
            <button
              className={option === value ? 'is-selected' : ''}
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SystemModal({ deletedHistory, mode, onClose, onRestore }) {
  const isHistory = mode === 'history';

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`resource-modal system-modal ${isHistory ? 'is-history' : ''}`} role="dialog" aria-modal="true" aria-label={isHistory ? 'Histórico' : 'Informações'}>
        <div className="modal-heading">
          <div>
            <p>MedAgenda</p>
            <h2>{isHistory ? 'Histórico' : 'Informações do sistema'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            x
          </button>
        </div>

        {isHistory ? (
          <div className="history-list">
            {deletedHistory.length ? (
              deletedHistory.map((entry) => (
                <article key={entry.id}>
                  <div>
                    <span>{entry.restored ? `${entry.resourceLabel} restaurado` : `${entry.resourceLabel} excluído`}</span>
                    <strong>{getRecordTitle(entry.record)}</strong>
                  </div>
                  <small>{entry.restored ? `Restaurado em ${entry.restoredAt}` : `Excluído em ${entry.date}`}</small>
                  <p>{getRecordSummary(entry.record)}</p>
                  <button className="history-restore-action" type="button" onClick={() => onRestore(entry)} disabled={entry.restored}>
                    <RotateCcw size={15} strokeWidth={1.8} />
                    <span>{entry.restored ? 'Restaurado' : 'Restaurar'}</span>
                  </button>
                </article>
              ))
            ) : (
              <p>Nenhum registro excluído por enquanto.</p>
            )}
            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="system-info-grid">
            {systemGuide.map((section) => (
              <article key={section.title}>
                <strong>{section.title}</strong>
                <p>{section.text}</p>
              </article>
            ))}
            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function getRecordTitle(record) {
  return record?.nome ?? record?.paciente ?? record?.especialidade ?? record?.email ?? 'Registro sem nome';
}

function getRecordSummary(record) {
  const details = [
    record?.cpf,
    record?.crm,
    record?.telefone,
    record?.email,
    record?.medico,
    record?.data && record?.horario ? `${record.data} às ${record.horario}` : record?.data,
    record?.status,
  ].filter(Boolean);

  return details.length ? details.join(' - ') : 'Sem detalhes adicionais.';
}
