// routes/auth.js
const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const { validarObrigatorios, emailValido } = require('../helpers/validacao')

// POST /auth/cadastro
router.post('/cadastro', async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body

    // Validação dos campos
    const erros = validarObrigatorios(req.body, ['nome', 'email', 'senha'])
    if (email && !emailValido(email)) erros.push('email com formato inválido')
    if (senha && senha.length < 6) erros.push('senha deve ter pelo menos 6 caracteres')
    if (erros.length > 0) return res.status(400).json({ erros })

    // Verificar se email já está cadastrado
    const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?')
      .get(email.toLowerCase().trim())
    if (existe) return res.status(409).json({ erro: 'Email já cadastrado' })

    // Gerar o hash da senha (custo 10)
    const senha_hash = await bcrypt.hash(senha, 10)

    // Salvar o usuário — nunca retornar o senha_hash
    const resultado = db.prepare(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)'
    ).run(nome.trim(), email.toLowerCase().trim(), senha_hash)

    res.status(201).json({
      id: resultado.lastInsertRowid,
      nome: nome.trim(),
      email: email.toLowerCase().trim()
    })
  } catch (err) { next(err) }
})

module.exports = router