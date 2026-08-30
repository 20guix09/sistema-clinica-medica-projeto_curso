export const ENDPOINTS = {
  auth: {
    cadastro: '/auth/cadastro',
    login: '/auth/login',
  },

  dashboard: {
    calendario: '/dashboard/calendario',
    consultasHoje: '/dashboard/consultas-hoje',
    summary: '/dashboard/summary',
  },

  pacientes: {
    base: '/pacientes',
    byId: (id) => `/pacientes/${id}`,
  },

  medicos: {
    base: '/medico',
    byId: (id) => `/medico/${id}`,
  },

  especialidades: {
    base: '/especialidade',
    byId: (id) => `/especialidade/${id}`,
  },

  consultas: {
    base: '/consultas',
    byId: (id) => `/consultas/${id}`,
    cancelar: (id) => `/consultas/${id}/cancelar`,
    confirmar: (id) => `/consultas/${id}/confirmar`,
    finalizar: (id) => `/consultas/${id}/finalizar`,
  },
};