const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Bancos de dados temporários
const contas = []

const pacientes = [
  {
    id: 1,
    nome: 'Guilherme',
    cpf: '12244850927',
    tel: '43988024099',
    email: 'guilhermelimadejesus44@gmail.com',
    nasc: '31/10/2009'
  },
  {
    id: 2,
    nome: 'Nicole',
    cpf: '14455365874',
    tel: '43558421365',
    email: 'nicole@gmail.com',
    nasc: '15/05/2010'
  }
]


// ========================
// ROTA INICIAL
// ========================

app.get('/', (req, res) => {
  res.send('Finalmente, o projeto da clínica médica está funcionando!')
})


// ========================
// PACIENTES
// ========================

// Listar pacientes
app.get('/pacientes', (req, res) => {
  res.json(pacientes)
})


// Cadastrar paciente
app.post('/pacientes', (req, res) => {

  const {
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  } = req.body

  const novoPaciente = {
    id: pacientes.length + 1,
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  }

  pacientes.push(novoPaciente)

  res.status(201).json(novoPaciente)
})


// Atualizar paciente
app.put('/pacientes/:id', (req, res) => {

  const id = Number(req.params.id)

  const index = pacientes.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({
      erro: 'Paciente não encontrado, verifique se foi cadastrado.'
    })
  }

  const {
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  } = req.body

  pacientes[index] = {
    id,
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  }

  res.status(200).json(pacientes[index])
})


// Excluir paciente
app.delete('/pacientes/:id', (req, res) => {

  const id = Number(req.params.id)

  const index = pacientes.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({
      erro: 'Paciente não encontrado, verifique se foi cadastrado.'
    })
  }

  pacientes.splice(index, 1)

  res.status(204).send()
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
    pacientesCadastrados: 1284,
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