const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Middleware de log — registra toda requisição recebida
app.use((req, res, next) => {
  const horario = new Date().toLocaleTimeString('pt-BR')
  console.log(`[${horario}] ${req.method} ${req.path}`)
  req.horario = horario  // disponível em todas as rotas
  next()
})

// Importar o arquivo de rotas
const pacientesRoutes = require('./routes/pacientes')

// Registrar com o prefixo do recurso
app.use('/pacientes', pacientesRoutes)



// Bancos de dados temporários
const contas = [
  {
    email: 'nicole@gmail.com',
    senha: '12345678'
  }
]

// ========================
// ROTA INICIAL
// ========================

app.get('/', (req, res) => {
  res.send('Finalmente, o projeto da clínica médica está funcionando!')
})

app.get('/oi', (req, res) => {
  res.json({
    status: 'online',
    horario: req.horario  // veio do middleware
  })
})

// ========================
// CONTAS
// ========================

app.post('/conta', (req, res) => {

  const {
    nome,
    email,
    senha,
    cpf
  } = req.body

  const novaConta = {
    id: contas.length + 1,
    nome,
    email,
    senha,
    cpf
  }

  contas.push(novaConta)

  res.status(201).json(novaConta)
})


// ========================
// LOGIN
// ========================

app.post('/login', (req, res) => {

  const {
    email,
    senha
  } = req.body

  const usuario = contas.find(conta =>
    conta.email === email &&
    conta.senha === senha
  )

  if (!usuario) {
    return res.status(401).json({
      mensagem: 'E-mail ou senha inválidos'
    })
  }

  res.status(200).json({
    mensagem: 'Login realizado com sucesso',

    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }
  })
})


// ========================
// DASHBOARD
// ========================

// Resumo
app.get('/dashboard/summary', (req, res) => {

  const resumo = {
    consultasHoje: 18,
    pacientCadastrados: 1284,
    medicosAtivos: 17,
    consultasPendentes: 6
  }

  res.status(200).json(resumo)
})


// Calendário
app.get('/dashboard/calendario', (req, res) => {

  const consultas = [
    {
      id: 1,
      paciente: 'Ana',
      medico: 'Dra. Helena',
      data: '2026-08-11',
      horario: '08:00'
    },
    {
      id: 2,
      paciente: 'João',
      medico: 'Dr. Bruno',
      data: '2026-08-12',
      horario: '09:30'
    }
  ]

  res.status(200).json(consultas)
})


// Consultas de hoje
app.get('/dashboard/consultas-hoje', (req, res) => {

  const consultasHoje = [
    {
      id: 1,
      paciente: 'Ana',
      medico: 'Dra. Helena',
      horario: '08:00'
    },
    {
      id: 2,
      paciente: 'João',
      medico: 'Dr. Bruno',
      horario: '09:30'
    }
  ]

  res.status(200).json(consultasHoje)
})


// ========================
// SERVIDOR
// ========================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})