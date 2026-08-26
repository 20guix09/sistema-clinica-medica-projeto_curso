const express = require('express')
const router = express.Router()
const db = require('../database')
const { validarObrigatorios, validarRange } = require('../helpers/validacao')


// LISTAR TODAS AS CONSULTAS
router.get('/', (req, res, next) => {
  try {
    const consultas = db.prepare(`
      SELECT * FROM consultas
    `).all()

    res.json(consultas)

  } catch (err) {
    next(err)
  }
})


// BUSCAR CONSULTA POR ID
router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const consulta = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    if (!consulta) {
      return res.status(404).json({
        erro: 'Consulta não encontrada'
      })
    }

    res.json(consulta)

  } catch (err) {
    next(err)
  }
})


// AGENDAR NOVA CONSULTA
router.post('/', (req, res, next) => {
  try {
    const {
      paciente_id,
      medico_id,
      especialidade_id,
      data,
      horario,
      tipo,
      status,
      observacao
    } = req.body

    const resultado = db.prepare(`
      INSERT INTO consultas (
        paciente_id,
        medico_id,
        especialidade_id,
        data,
        horario,
        tipo,
        status,
        observacao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      paciente_id,
      medico_id,
      especialidade_id,
      data,
      horario,
      tipo,
      status ?? 'pendente',
      observacao ?? null
    )

    const novaConsulta = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(resultado.lastInsertRowid)

    res.status(201).json(novaConsulta)

  } catch (err) {
    next(err)
  }
})


// EDITAR / REAGENDAR CONSULTA
router.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Consulta não encontrada'
      })
    }

    const {
      paciente_id,
      medico_id,
      especialidade_id,
      data,
      horario,
      tipo,
      status,
      observacao
    } = req.body

    db.prepare(`
      UPDATE consultas SET
        paciente_id = ?,
        medico_id = ?,
        especialidade_id = ?,
        data = ?,
        horario = ?,
        tipo = ?,
        status = ?,
        observacao = ?
      WHERE id = ?
    `).run(
      paciente_id ?? existente.paciente_id,
      medico_id ?? existente.medico_id,
      especialidade_id ?? existente.especialidade_id,
      data ?? existente.data,
      horario ?? existente.horario,
      tipo ?? existente.tipo,
      status ?? existente.status,
      observacao ?? existente.observacao,
      id
    )

    const atualizada = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    res.json(atualizada)

  } catch (err) {
    next(err)
  }
})


// CONFIRMAR CONSULTA
router.patch('/:id/confirmar', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Consulta não encontrada'
      })
    }

    db.prepare(`
      UPDATE consultas
      SET status = 'confirmada'
      WHERE id = ?
    `).run(id)

    const consulta = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    res.json(consulta)

  } catch (err) {
    next(err)
  }
})


// FINALIZAR CONSULTA
router.patch('/:id/finalizar', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Consulta não encontrada'
      })
    }

    db.prepare(`
      UPDATE consultas
      SET status = 'finalizada'
      WHERE id = ?
    `).run(id)

    const consulta = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    res.json(consulta)

  } catch (err) {
    next(err)
  }
})


// CANCELAR CONSULTA
router.patch('/:id/cancelar', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { motivo } = req.body

    const existente = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Consulta não encontrada'
      })
    }

    db.prepare(`
      UPDATE consultas SET
        status = 'cancelada',
        motivo_cancelamento = ?
      WHERE id = ?
    `).run(
      motivo ?? null,
      id
    )

    const consulta = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    res.json(consulta)

  } catch (err) {
    next(err)
  }
})


// EXCLUIR CONSULTA
router.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT * FROM consultas
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Consulta não encontrada'
      })
    }

    db.prepare(`
      DELETE FROM consultas
      WHERE id = ?
    `).run(id)

    res.status(204).send()

  } catch (err) {
    next(err)
  }
})


module.exports = router