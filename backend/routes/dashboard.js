const express = require('express')
const router = express.Router()

const db = require('../database')

// ======================================================
// CONSULTAS DE HOJE — SOMENTE DO USUÁRIO LOGADO
// ======================================================

router.get('/consultas-hoje', (req, res, next) => {
  try {
    const usuarioId = req.usuario.id

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
        AND pacientes.usuario_id = consultas.usuario_id

      JOIN medicos
        ON consultas.medico_id = medicos.id
        AND medicos.usuario_id = consultas.usuario_id

      JOIN especialidades
        ON consultas.especialidade_id = especialidades.id
        AND especialidades.usuario_id = consultas.usuario_id

      WHERE DATE(consultas.data) = DATE('now', 'localtime')
      AND consultas.usuario_id = ?

      ORDER BY consultas.horario
    `).all(usuarioId)

    res.status(200).json(consultasHoje)

  } catch (err) {
    next(err)
  }
})

// ======================================================
// CALENDÁRIO — SOMENTE DO USUÁRIO LOGADO
// ======================================================

router.get('/calendario', (req, res, next) => {
  try {
    const usuarioId = req.usuario.id

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
        AND pacientes.usuario_id = consultas.usuario_id

      JOIN medicos
        ON consultas.medico_id = medicos.id
        AND medicos.usuario_id = consultas.usuario_id

      JOIN especialidades
        ON consultas.especialidade_id = especialidades.id
        AND especialidades.usuario_id = consultas.usuario_id

      WHERE consultas.usuario_id = ?

      ORDER BY consultas.data, consultas.horario
    `).all(usuarioId)

    res.status(200).json(consultas)

  } catch (err) {
    next(err)
  }
})

// ======================================================
// RESUMO — SOMENTE DO USUÁRIO LOGADO
// ======================================================

router.get('/summary', (req, res, next) => {
  try {
    const usuarioId = req.usuario.id

    const consultasHoje = db.prepare(`
      SELECT COUNT(*) AS total
      FROM consultas
      WHERE usuario_id = ?
      AND DATE(data) = DATE('now', 'localtime')
    `).get(usuarioId)

    const pacientesCadastrados = db.prepare(`
      SELECT COUNT(*) AS total
      FROM pacientes
      WHERE usuario_id = ?
    `).get(usuarioId)

    const medicosAtivos = db.prepare(`
      SELECT COUNT(*) AS total
      FROM medicos
      WHERE usuario_id = ?
      AND status = 'ativo'
    `).get(usuarioId)

    const consultasPendentes = db.prepare(`
      SELECT COUNT(*) AS total
      FROM consultas
      WHERE usuario_id = ?
      AND status = 'pendente'
    `).get(usuarioId)

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