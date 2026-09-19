// Rotas de agendamento e gestão de consultas.
const express = require('express')
const router = express.Router()
const db = require('../database')
const { validarObrigatorios, validarLista } = require('../helpers/validacao')

// função para consulta completa
function consultaCompleta(id, usuarioId) {
  return db.prepare(`SELECT c.*, p.nome AS paciente, m.nome AS medico, e.nome AS especialidade
    FROM consultas c
    JOIN pacientes p ON p.id=c.paciente_id AND p.usuario_id=c.usuario_id
    JOIN medicos m ON m.id=c.medico_id AND m.usuario_id=c.usuario_id
    JOIN especialidades e ON e.id=c.especialidade_id AND e.usuario_id=c.usuario_id
    WHERE c.id=? AND c.usuario_id=?`).get(id, usuarioId)
}
// valida vinculos
function validarVinculos(usuarioId, pacienteId, medicoId, especialidadeId) {
  const p = db.prepare(`SELECT id FROM pacientes WHERE id=? AND usuario_id=?`).get(pacienteId, usuarioId)
  const m = db.prepare(`SELECT id FROM medicos WHERE id=? AND usuario_id=?`).get(medicoId, usuarioId)
  const e = db.prepare(`SELECT id FROM especialidades WHERE id=? AND usuario_id=?`).get(especialidadeId, usuarioId)
  if (!p) return 'Paciente informado não pertence a esta conta'
  if (!m) return 'Médico informado não pertence a esta conta'
  if (!e) return 'Especialidade informada não pertence a esta conta'
  const vinculo = db.prepare(`SELECT 1 FROM medico_especialidades WHERE medico_id=? AND especialidade_id=? AND usuario_id=?`).get(medicoId, especialidadeId, usuarioId)
  const primaria = db.prepare(`SELECT 1 FROM medicos WHERE id=? AND especialidade_id=? AND usuario_id=?`).get(medicoId, especialidadeId, usuarioId)
  if (!vinculo && !primaria) return 'O médico selecionado não possui esta especialidade'
  return null
}


// valida se a nova consulta não está no passado
function validarDataHorarioFuturo(data, horario) {
  const fuso = process.env.APP_TIME_ZONE || 'America/Sao_Paulo'
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date())
  const valor = Object.fromEntries(partes.map(({type,value}) => [type,value]))
  const hoje = `${valor.year}-${valor.month}-${valor.day}`
  const agora = `${valor.hour}:${valor.minute}`
  const hora = String(horario || '').slice(0,5)

  if (String(data) < hoje || (String(data) === hoje && hora < agora)) {
    return 'Não é possível cadastrar uma consulta em uma data ou horário que já passou'
  }
  return null
}

// visualizar lista de consultas
router.get('/', (req,res,next)=>{ try {
  const u=req.usuario.id
  res.json(db.prepare(`SELECT c.*, p.nome AS paciente, m.nome AS medico, e.nome AS especialidade
    FROM consultas c JOIN pacientes p ON p.id=c.paciente_id AND p.usuario_id=c.usuario_id
    JOIN medicos m ON m.id=c.medico_id AND m.usuario_id=c.usuario_id
    JOIN especialidades e ON e.id=c.especialidade_id AND e.usuario_id=c.usuario_id
    WHERE c.usuario_id=? ORDER BY c.data,c.horario`).all(u))
} catch(e){next(e)} })

// visualizar consultas por id
router.get('/:id',(req,res,next)=>{try{
  const c=consultaCompleta(Number(req.params.id),req.usuario.id)
  if(!c)return res.status(404).json({erro:'Consulta não encontrada'})
  res.json(c)
}catch(e){next(e)}})

// cadastrar consultas
router.post('/',(req,res,next)=>{try{
  const u=req.usuario.id
  const {paciente_id,medico_id,especialidade_id,data,horario,tipo,status,observacao}=req.body
  const erros=validarObrigatorios(req.body,['paciente_id','medico_id','especialidade_id','data','horario','tipo'])
  const es=validarLista('status',status,['pendente','confirmada','finalizada','cancelada']); if(es)erros.push(es)
  if(erros.length)return res.status(400).json({erros})
  const erroDataHorario=validarDataHorarioFuturo(data,horario); if(erroDataHorario)return res.status(400).json({erro:erroDataHorario})
  const ev=validarVinculos(u,paciente_id,medico_id,especialidade_id); if(ev)return res.status(400).json({erro:ev})
  const medicoAtivo=db.prepare(`SELECT 1 FROM medicos WHERE id=? AND usuario_id=? AND LOWER(status)='ativo'`).get(medico_id,u)
  const especialidadeAtiva=db.prepare(`SELECT 1 FROM especialidades WHERE id=? AND usuario_id=? AND LOWER(status)='ativo'`).get(especialidade_id,u)
  if(!medicoAtivo)return res.status(400).json({erro:'O médico selecionado está inativo'})
  if(!especialidadeAtiva)return res.status(400).json({erro:'A especialidade selecionada está inativa'})
  const r=db.prepare(`INSERT INTO consultas (paciente_id,medico_id,especialidade_id,data,horario,tipo,status,observacao,usuario_id)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(paciente_id,medico_id,especialidade_id,data,horario,tipo,'pendente',observacao||null,u)
  res.status(201).json(consultaCompleta(r.lastInsertRowid,u))
}catch(e){next(e)}})

// editar consultas
router.put('/:id',(req,res,next)=>{try{
  const id=Number(req.params.id),u=req.usuario.id
  const ex=db.prepare(`SELECT * FROM consultas WHERE id=? AND usuario_id=?`).get(id,u)
  if(!ex)return res.status(404).json({erro:'Consulta não encontrada'})
  const v={...ex,...req.body}
  const erros=validarObrigatorios(v,['paciente_id','medico_id','especialidade_id','data','horario','tipo'])
  const erroStatus=validarLista('status',v.status,['pendente','confirmada','finalizada','cancelada']); if(erroStatus)erros.push(erroStatus)
  if(erros.length)return res.status(400).json({erros})
  if (req.body.data !== undefined || req.body.horario !== undefined) {
    const erroDataHorario=validarDataHorarioFuturo(v.data,v.horario); if(erroDataHorario)return res.status(400).json({erro:erroDataHorario})
  }
  const ev=validarVinculos(u,v.paciente_id,v.medico_id,v.especialidade_id); if(ev)return res.status(400).json({erro:ev})
  db.prepare(`UPDATE consultas SET paciente_id=?,medico_id=?,especialidade_id=?,data=?,horario=?,tipo=?,status=?,observacao=? WHERE id=? AND usuario_id=?`).run(
    v.paciente_id,v.medico_id,v.especialidade_id,v.data,v.horario,v.tipo,v.status,v.observacao,id,u)
  res.json(consultaCompleta(id,u))
}catch(e){next(e)}})

for (const [rota,status] of [['confirmar','confirmada'],['finalizar','finalizada']]) {
  router.patch(`/:id/${rota}`,(req,res,next)=>{try{
    const id=Number(req.params.id),u=req.usuario.id
    const r=db.prepare(`UPDATE consultas SET status=? WHERE id=? AND usuario_id=?`).run(status,id,u)
    if(!r.changes)return res.status(404).json({erro:'Consulta não encontrada'})
    res.json(consultaCompleta(id,u))
  }catch(e){next(e)}})
}
// PATCH /:id/cancelar
router.patch('/:id/cancelar',(req,res,next)=>{try{
  const id=Number(req.params.id),u=req.usuario.id
  const motivo=req.body.motivo ?? req.body.motivoCancelamento ?? null
  const r=db.prepare(`UPDATE consultas SET status='cancelada',motivo_cancelamento=? WHERE id=? AND usuario_id=?`).run(motivo,id,u)
  if(!r.changes)return res.status(404).json({erro:'Consulta não encontrada'})
  res.json(consultaCompleta(id,u))
}catch(e){next(e)}})
// excluir consultas
router.delete('/:id',(req,res,next)=>{try{
  const id=Number(req.params.id),u=req.usuario.id
  const ex=consultaCompleta(id,u); if(!ex)return res.status(404).json({erro:'Consulta não encontrada'})
  db.prepare(`DELETE FROM consultas WHERE id=? AND usuario_id=?`).run(id,u)
  res.status(200).json(ex)
}catch(e){next(e)}})
module.exports=router
