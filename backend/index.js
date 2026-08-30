require('dotenv').config()

const express = require('express')
const cors = require('cors')

const db = require('./database')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Middleware de log
app.use((req, res, next) => {
  const horario = new Date().toLocaleTimeString('pt-BR')

  console.log(`[${horario}] ${req.method} ${req.path}`)

  req.horario = horario

  next()
})

// Importar rotas
const authRouter = require('./routes/auth')
const pacientesRoutes = require('./routes/pacientes')
const consultasRoutes = require('./routes/consultas')
const especialidadeRoutes = require('./routes/especialidade')
const medicoRoutes = require('./routes/medico')
const dashboardRoutes = require('./routes/dashboard')

const autenticarToken = require('./middlewares/autenticarToken')

// ==========================================
// ROTAS PÚBLICAS
// ==========================================

app.use('/auth', authRouter)

// ==========================================
// ROTAS PROTEGIDAS
// ==========================================

app.use('/pacientes', autenticarToken, pacientesRoutes)

app.use('/consultas', autenticarToken, consultasRoutes)

app.use('/especialidade', autenticarToken, especialidadeRoutes)

app.use('/medico', autenticarToken, medicoRoutes)

app.use('/dashboard', autenticarToken, dashboardRoutes)

// ==========================================
// ROTAS INICIAIS
// ==========================================

app.get('/', (req, res) => {
  res.send('Finalmente, o projeto da clínica médica está funcionando!')
})

app.get('/oi', (req, res) => {
  res.json({
    status: 'online',
    horario: req.horario
  })
})

// ==========================================
// MIDDLEWARE GLOBAL DE ERROS
// ==========================================

app.use((err, req, res, next) => {
  console.error(`[ERRO] ${err.message}`)

  const status = err.status || 500
  const mensagem = err.message || 'Erro interno do servidor'

  res.status(status).json({
    erro: mensagem
  })
})

// ==========================================
// SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})