// inicia e configura o servidor da API
require('dotenv').config()
const express = require('express')
const cors = require('cors')
require('./database')

const app = express()
const PORT = process.env.PORT || 3000
const producao = process.env.NODE_ENV === 'production'

// Em produção, segredos obrigatórios devem ser fortes e explícitos.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('troque-por')) {
  throw new Error('JWT_SECRET ausente ou inseguro. Configure uma chave com pelo menos 32 caracteres.')
}

const origensConfiguradas = (process.env.CORS_ORIGINS || '')
  .split(',').map(v => v.trim()).filter(Boolean)
const origensDesenvolvimento = ['http://localhost:5173', 'http://127.0.0.1:5173']
const origensPermitidas = producao ? origensConfiguradas : [...new Set([...origensDesenvolvimento, ...origensConfiguradas])]

app.disable('x-powered-by')
app.use((req,res,next) => {
  res.setHeader('X-Content-Type-Options','nosniff')
  res.setHeader('X-Frame-Options','DENY')
  res.setHeader('Referrer-Policy','no-referrer')
  next()
})
app.use(cors({
  origin(origin, callback) {
    if (!origin || origensPermitidas.includes(origin)) return callback(null, true)
    return callback(Object.assign(new Error('Origem não permitida pelo CORS'), { status: 403 }))
  }
}))
app.use(express.json({ limit: '256kb' }))

// Limite simples em memória para reduzir abuso nas rotas de autenticação.
const tentativas = new Map()
function limitarAutenticacao(req,res,next) {
  const agora=Date.now(), janela=15*60*1000, max=30, chave=req.ip
  const item=tentativas.get(chave)
  if (!item || agora-item.inicio>=janela) { tentativas.set(chave,{inicio:agora,total:1}); return next() }
  if (item.total>=max) return res.status(429).json({erro:'Muitas tentativas. Aguarde alguns minutos e tente novamente.'})
  item.total += 1
  next()
}

app.use((req,res,next)=>{ const horario=new Date().toLocaleTimeString('pt-BR',{timeZone:process.env.APP_TIME_ZONE||'America/Sao_Paulo'}); console.log(`[${horario}] ${req.method} ${req.path}`); req.horario=horario; next() })

const authRouter=require('./routes/auth')
const pacientesRoutes=require('./routes/pacientes')
const consultasRoutes=require('./routes/consultas')
const especialidadeRoutes=require('./routes/especialidade')
const medicoRoutes=require('./routes/medico')
const dashboardRoutes=require('./routes/dashboard')
const autenticarToken=require('./middlewares/autenticarToken')

app.use('/auth', limitarAutenticacao, authRouter)
app.use('/pacientes',autenticarToken,pacientesRoutes)
app.use('/consultas',autenticarToken,consultasRoutes)
app.use('/especialidade',autenticarToken,especialidadeRoutes)
app.use('/medico',autenticarToken,medicoRoutes)
app.use('/dashboard',autenticarToken,dashboardRoutes)
app.get('/',(req,res)=>res.send('Finalmente, o projeto da clínica médica está funcionando!'))
app.get('/oi',(req,res)=>res.json({status:'online',horario:req.horario}))
app.use((req,res)=>res.status(404).json({erro:'Rota não encontrada'}))
app.use((err,req,res,next)=>{ console.error(`[ERRO] ${err.message}`); const status=err.status||500; res.status(status).json({erro: status===500 && producao ? 'Erro interno do servidor' : (err.message||'Erro interno do servidor')}) })
app.listen(PORT,()=>console.log(`Servidor iniciado na porta ${PORT}`))
