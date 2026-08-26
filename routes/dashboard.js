const express = require('express')
const router = express.Router()
const db = require('../database')
const { validarObrigatorios, validarRange } = require('../helpers/validacao')


// CONSULTAS DE HOJE
router.get('/consultas-hoje', (req, res, next) => {
  try {
    const consultasHoje = db.prepare(`
      SELECT
        consultas.id,
        consultas.data,
        consultas.horario,
        consultas.tipo,
        consultas.status,
        consultas.observacao,

        pacientes.nome AS paciente,
        medicos.nome AS medico,
        especialidades.nome AS especialidade

      FROM consultas

      JOIN pacientes
        ON consultas.paciente_id = pacientes.id

      JOIN medicos
        ON consultas.medico_id = medicos.id

      JOIN especialidades
        ON consultas.especialidade_id = especialidades.id

      WHERE DATE(consultas.data) = DATE('now', 'localtime')

      ORDER BY consultas.horario
    `).all()

    res.status(200).json(consultasHoje)

  } catch (err) {
    next(err)
  }
})


// CALENDÁRIO
router.get('/calendario', (req, res, next) => {
  try {
    const consultas = db.prepare(`
      SELECT
        consultas.id,
        consultas.data,
        consultas.horario,
        consultas.tipo,
        consultas.status,

        pacientes.nome AS paciente,
        medicos.nome AS medico,
        especialidades.nome AS especialidade

      FROM consultas

      JOIN pacientes
        ON consultas.paciente_id = pacientes.id

      JOIN medicos
        ON consultas.medico_id = medicos.id

      JOIN especialidades
        ON consultas.especialidade_id = especialidades.id

      ORDER BY consultas.data, consultas.horario
    `).all()

    res.status(200).json(consultas)

  } catch (err) {
    next(err)
  }
})


// RESUMO DO DASHBOARD
router.get('/summary', (req, res, next) => {
  try {

    // Conta quantas consultas existem hoje
    const consultasHoje = db.prepare(`
      SELECT COUNT(*) AS total
      FROM consultas
      WHERE DATE(data) = DATE('now', 'localtime')
    `).get()

    // Conta todos os pacientes cadastrados
    const pacientesCadastrados = db.prepare(`
      SELECT COUNT(*) AS total
      FROM pacientes
    `).get()

    // Conta somente médicos ativos
    const medicosAtivos = db.prepare(`
      SELECT COUNT(*) AS total
      FROM medicos
      WHERE status = 'ativo'
    `).get()

    // Conta consultas pendentes
    const consultasPendentes = db.prepare(`
      SELECT COUNT(*) AS total
      FROM consultas
      WHERE status = 'pendente'
    `).get()

    const resumo = {
      consultasHoje: consultasHoje.total,
      pacientesCadastrados: pacientesCadastrados.total,
      medicosAtivos: medicosAtivos.total,
      consultasPendentes: consultasPendentes.total
    }

    res.status(200).json(resumo)

  } catch (err) {
    next(err)
  }
})


module.exports = router