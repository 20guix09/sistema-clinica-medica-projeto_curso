require('dotenv').config()  // ← primeira linha — antes de tudo

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
// Middleware global de erros — deve ter 4 parâmetros exatamente
app.use((err, req, res, next) => {
  // Registra o erro no terminal para diagnóstico
  console.error(`[ERRO] ${err.message}`)

  // Usa o status do erro se definido, ou 500 como padrão
  const status = err.status || 500
  const mensagem = err.message || 'Erro interno do servidor'

  res.status(status).json({ erro: mensagem })
})




//ROTAS INICIAS
app.get('/', (req, res) => {
  res.send('Finalmente, o projeto da clínica médica está funcionando!')
})
app.get('/oi', (req, res) => {
  res.json({
    status: 'online',
    horario: req.horario  // veio do middleware
  })
})


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})