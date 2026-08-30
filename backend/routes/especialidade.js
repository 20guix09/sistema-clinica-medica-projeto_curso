const express = require('express')
const router = express.Router()

const db = require('../database')

const {
  validarObrigatorios,
  validarLista
} = require('../helpers/validacao')


// LISTAR TODAS AS ESPECIALIDADES
router.get('/', (req, res, next) => {
  try {
    const especialidades = db.prepare(`
      SELECT * FROM especialidades
      ORDER BY nome
    `).all()

    res.json(especialidades)

  } catch (err) {
    next(err)
  }
})


// BUSCAR ESPECIALIDADE POR ID
router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const especialidade = db.prepare(`
      SELECT * FROM especialidades
      WHERE id = ?
    `).get(id)

    if (!especialidade) {
      return res.status(404).json({
        erro: 'Especialidade não encontrada'
      })
    }

    res.json(especialidade)

  } catch (err) {
    next(err)
  }
})


// CADASTRAR ESPECIALIDADE
router.post('/', (req, res, next) => {
  try {
    const {
      nome,
      descricao,
      status
    } = req.body

      const erros = validarObrigatorios(
        req.body,
        ['nome']
      )
      
      const erroStatus = validarLista(
        'status',
        status,
        ['ativo', 'inativo']
      )
      
      if (erroStatus) {
        erros.push(erroStatus)
      }
      
      if (erros.length > 0) {
        return res.status(400).json({ erros })
      }

    const resultado = db.prepare(`
      INSERT INTO especialidades (
        nome,
        descricao,
        status
      )
      VALUES (?, ?, ?)
    `).run(
      nome,
      descricao ?? null,
      status ?? 'ativo'
    )

    const novaEspecialidade = db.prepare(`
      SELECT * FROM especialidades
      WHERE id = ?
    `).get(resultado.lastInsertRowid)

    res.status(201).json(novaEspecialidade)

  } catch (err) {
    next(err)
  }
})


// EDITAR ESPECIALIDADE
router.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT * FROM especialidades
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Especialidade não encontrada'
      })
    }

    const {
      nome,
      descricao,
      status
    } = req.body

    db.prepare(`
      UPDATE especialidades SET
        nome = ?,
        descricao = ?,
        status = ?
      WHERE id = ?
    `).run(
      nome ?? existente.nome,
      descricao ?? existente.descricao,
      status ?? existente.status,
      id
    )

    const atualizada = db.prepare(`
      SELECT * FROM especialidades
      WHERE id = ?
    `).get(id)

    res.json(atualizada)

  } catch (err) {
    next(err)
  }
})


// EXCLUIR ESPECIALIDADE
router.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT * FROM especialidades
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Especialidade não encontrada'
      })
    }

    // Verifica se existem médicos vinculados
    const medicoVinculado = db.prepare(`
      SELECT id FROM medicos
      WHERE especialidade_id = ?
      LIMIT 1
    `).get(id)

    if (medicoVinculado) {
      return res.status(409).json({
        erro: 'Não é possível excluir a especialidade porque existem médicos vinculados'
      })
    }

    // Verifica se existem consultas vinculadas
    const consultaVinculada = db.prepare(`
      SELECT id FROM consultas
      WHERE especialidade_id = ?
      LIMIT 1
    `).get(id)

    if (consultaVinculada) {
      return res.status(409).json({
        erro: 'Não é possível excluir a especialidade porque existem consultas vinculadas'
      })
    }

    db.prepare(`
      DELETE FROM especialidades
      WHERE id = ?
    `).run(id)

    res.status(204).send()

  } catch (err) {
    next(err)
  }
})


module.exports = router