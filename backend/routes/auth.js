const express = require('express')
const router = express.Router()

const db = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  validarObrigatorios,
  emailValido
} = require('../helpers/validacao')

// CADASTRO
router.post('/cadastro', async (req, res, next) => {
  try {
    const {
      nome,
      email,
      senha
    } = req.body

    const erros = validarObrigatorios(
      req.body,
      ['nome', 'email', 'senha']
    )

    if (email && !emailValido(email)) {
      erros.push('Email com formato inválido')
    }

    if (senha && senha.length < 6) {
      erros.push('Senha deve ter pelo menos 6 caracteres')
    }

    if (erros.length > 0) {
      return res.status(400).json({
        erros
      })
    }

    const emailNormalizado = email
      .toLowerCase()
      .trim()

    const existe = db.prepare(`
      SELECT id
      FROM usuarios
      WHERE email = ?
    `).get(emailNormalizado)

    if (existe) {
      return res.status(409).json({
        erro: 'Email já cadastrado'
      })
    }

    const senha_hash = await bcrypt.hash(
      senha,
      10
    )

    const resultado = db.prepare(`
      INSERT INTO usuarios (
        nome,
        email,
        senha_hash
      )
      VALUES (?, ?, ?)
    `).run(
      nome.trim(),
      emailNormalizado,
      senha_hash
    )

    res.status(201).json({
      id: resultado.lastInsertRowid,
      nome: nome.trim(),
      email: emailNormalizado
    })

  } catch (err) {
    next(err)
  }
})

// LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const {
      email,
      senha
    } = req.body

    const erros = validarObrigatorios(
      req.body,
      ['email', 'senha']
    )

    if (email && !emailValido(email)) {
      erros.push('Email com formato inválido')
    }

    if (erros.length > 0) {
      return res.status(400).json({
        erros
      })
    }

    const emailNormalizado = email
      .toLowerCase()
      .trim()

    const usuario = db.prepare(`
      SELECT *
      FROM usuarios
      WHERE email = ?
    `).get(emailNormalizado)

    if (!usuario) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      })
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha_hash
    )

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      })
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })

  } catch (err) {
    next(err)
  }
})

module.exports = router