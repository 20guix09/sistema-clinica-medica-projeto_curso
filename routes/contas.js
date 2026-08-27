const express = require('express')
const router = express.Router()

const db = require('../database')

const {
  validarObrigatorios,
  validarLista
} = require('../helpers/validacao')

// LISTAR CONTAS
router.get('/', (req, res, next) => {
  try {
    const contas = db.prepare(`
      SELECT id, nome, email, cpf
      FROM usuarios
    `).all()

    res.json(contas)

  } catch (err) {
    next(err)
  }
})


// BUSCAR CONTA POR ID
router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const conta = db.prepare(`
      SELECT id, nome, email, cpf
      FROM usuarios
      WHERE id = ?
    `).get(id)

    if (!conta) {
      return res.status(404).json({
        erro: 'Conta não encontrada'
      })
    }

    res.json(conta)

  } catch (err) {
    next(err)
  }
})


// CADASTRAR CONTA
router.post('/', (req, res, next) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf
    } = req.body

    const erros = validarObrigatorios(req.body, [
      'nome',
      'email',
      'senha',
      'cpf'
    ])

    if (email && !emailValido(email)) {
      erros.push('Email com formato inválido')
    }

    if (erros.length > 0) {
      return res.status(400).json({
        erros
      })
    }

    const resultado = db.prepare(`
      INSERT INTO usuarios (
        nome,
        email,
        senha,
        cpf
      )
      VALUES (?, ?, ?, ?)
    `).run(
      nome,
      email,
      senha,
      cpf
    )

    const novaConta = db.prepare(`
      SELECT id, nome, email, cpf
      FROM usuarios
      WHERE id = ?
    `).get(resultado.lastInsertRowid)

    res.status(201).json(novaConta)

  } catch (err) {
    next(err)
  }
})


// EDITAR CONTA
router.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT *
      FROM usuarios
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Conta não encontrada'
      })
    }

    const {
      nome,
      email,
      senha,
      cpf
    } = req.body

    db.prepare(`
      UPDATE usuarios SET
        nome = ?,
        email = ?,
        senha = ?,
        cpf = ?
      WHERE id = ?
    `).run(
      nome ?? existente.nome,
      email ?? existente.email,
      senha ?? existente.senha,
      cpf ?? existente.cpf,
      id
    )

    const atualizada = db.prepare(`
      SELECT id, nome, email, cpf
      FROM usuarios
      WHERE id = ?
    `).get(id)

    res.json(atualizada)

  } catch (err) {
    next(err)
  }
})


// EXCLUIR CONTA
router.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(`
      SELECT id
      FROM usuarios
      WHERE id = ?
    `).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Conta não encontrada'
      })
    }

    db.prepare(`
      DELETE FROM usuarios
      WHERE id = ?
    `).run(id)

    res.status(204).send()

  } catch (err) {
    next(err)
  }
})


module.exports = router