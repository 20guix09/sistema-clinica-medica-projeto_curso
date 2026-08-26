const express = require('express')
const router = express.Router()
const db = require('../database')
const { validarObrigatorios, validarRange } = require('../helpers/validacao')


// LISTAR MÉDICOS
router.get('/', (req, res, next) => {
  try {
    const medicos = db.prepare(`
      SELECT
        medicos.id,
        medicos.nome,
        medicos.cpf,
        medicos.crm,
        medicos.estado_crm,
        medicos.telefone,
        medicos.email,
        medicos.status,
        medicos.foto,
        especialidades.nome AS especialidade
      FROM medicos
      JOIN especialidades
        ON medicos.especialidade_id = especialidades.id
      ORDER BY medicos.nome
    `).all()

    res.json(medicos)

  } catch (err) {
    next(err)
  }
})


// BUSCAR MÉDICO POR ID
router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const medico = db.prepare(`
      SELECT
        medicos.id,
        medicos.nome,
        medicos.cpf,
        medicos.crm,
        medicos.estado_crm,
        medicos.telefone,
        medicos.email,
        medicos.status,
        medicos.foto,
        medicos.especialidade_id,
        especialidades.nome AS especialidade
      FROM medicos
      JOIN especialidades
        ON medicos.especialidade_id = especialidades.id
      WHERE medicos.id = ?
    `).get(id)

    if (!medico) {
      return res.status(404).json({
        erro: 'Médico não encontrado'
      })
    }

    const disponibilidades = db.prepare(`
      SELECT
        id,
        dia_semana,
        horario_inicio,
        horario_fim
      FROM disponibilidades_medicos
      WHERE medico_id = ?
    `).all(id)

    res.json({
      ...medico,
      disponibilidades
    })

  } catch (err) {
    next(err)
  }
})


// CADASTRAR MÉDICO
router.post('/', (req, res, next) => {
  try {
    const {
      nome,
      cpf,
      crm,
      estado_crm,
      telefone,
      email,
      status,
      foto,
      especialidade_id,
      disponibilidades
    } = req.body

    const especialidade = db.prepare(`
      SELECT id
      FROM especialidades
      WHERE id = ?
    `).get(especialidade_id)

    if (!especialidade) {
      return res.status(400).json({
        erro: 'Especialidade informada não existe'
      })
    }

    const resultado = db.prepare(`
      INSERT INTO medicos (
        nome,
        cpf,
        crm,
        estado_crm,
        telefone,
        email,
        status,
        foto,
        especialidade_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome,
      cpf,
      crm,
      estado_crm,
      telefone,
      email,
      status ?? 'ativo',
      foto ?? null,
      especialidade_id
    )

    const medicoId = resultado.lastInsertRowid

    if (Array.isArray(disponibilidades)) {
      const inserirDisponibilidade = db.prepare(`
        INSERT INTO disponibilidades_medicos (
          medico_id,
          dia_semana,
          horario_inicio,
          horario_fim
        )
        VALUES (?, ?, ?, ?)
      `)

      for (const disponibilidade of disponibilidades) {
        inserirDisponibilidade.run(
          medicoId,
          disponibilidade.dia_semana,
          disponibilidade.horario_inicio,
          disponibilidade.horario_fim
        )
      }
    }

    const novoMedico = db.prepare(`
      SELECT *
      FROM medicos
      WHERE id = ?
    `).get(medicoId)

    res.status(201).json(novoMedico)

  } catch (err) {
    next(err)
  }
})


// EDITAR MÉDICO
router.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT *
      FROM medicos
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Médico não encontrado'
      })
    }

    const {
      nome,
      cpf,
      crm,
      estado_crm,
      telefone,
      email,
      status,
      foto,
      especialidade_id
    } = req.body

    if (especialidade_id !== undefined) {
      const especialidade = db.prepare(`
        SELECT id
        FROM especialidades
        WHERE id = ?
      `).get(especialidade_id)

      if (!especialidade) {
        return res.status(400).json({
          erro: 'Especialidade informada não existe'
        })
      }
    }

    db.prepare(`
      UPDATE medicos SET
        nome = ?,
        cpf = ?,
        crm = ?,
        estado_crm = ?,
        telefone = ?,
        email = ?,
        status = ?,
        foto = ?,
        especialidade_id = ?
      WHERE id = ?
    `).run(
      nome ?? existente.nome,
      cpf ?? existente.cpf,
      crm ?? existente.crm,
      estado_crm ?? existente.estado_crm,
      telefone ?? existente.telefone,
      email ?? existente.email,
      status ?? existente.status,
      foto ?? existente.foto,
      especialidade_id ?? existente.especialidade_id,
      id
    )

    const atualizado = db.prepare(`
      SELECT *
      FROM medicos
      WHERE id = ?
    `).get(id)

    res.json(atualizado)

  } catch (err) {
    next(err)
  }
})


// ATIVAR / DESATIVAR MÉDICO
router.patch('/:id/status', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body

    const existente = db.prepare(`
      SELECT *
      FROM medicos
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Médico não encontrado'
      })
    }

    if (status !== 'ativo' && status !== 'inativo') {
      return res.status(400).json({
        erro: 'Status deve ser ativo ou inativo'
      })
    }

    db.prepare(`
      UPDATE medicos
      SET status = ?
      WHERE id = ?
    `).run(status, id)

    const atualizado = db.prepare(`
      SELECT *
      FROM medicos
      WHERE id = ?
    `).get(id)

    res.json(atualizado)

  } catch (err) {
    next(err)
  }
})


// EXCLUIR MÉDICO
router.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT *
      FROM medicos
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Médico não encontrado'
      })
    }

    const consultaVinculada = db.prepare(`
      SELECT id
      FROM consultas
      WHERE medico_id = ?
      LIMIT 1
    `).get(id)

    if (consultaVinculada) {
      return res.status(409).json({
        erro: 'Não é possível excluir o médico porque existem consultas vinculadas. Desative o médico.'
      })
    }

    db.prepare(`
      DELETE FROM medicos
      WHERE id = ?
    `).run(id)

    res.status(204).send()

  } catch (err) {
    next(err)
  }
})


module.exports = router