// Rotas de autenticação e acesso com Google.
const express = require('express')
const router = express.Router()

const db = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const {
  validarObrigatorios,
  emailValido
} = require('../helpers/validacao')

// cadastrar usuário
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

// entrar com email e senha
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


// entrar com a conta Google
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ erro: 'Credencial do Google não informada' })
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ erro: 'Login com Google não configurado no servidor' })
    }

    // Valida assinatura, validade e público do token diretamente com o Google.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const googleSub = payload?.sub
    const email = payload?.email?.toLowerCase().trim()
    const nome = payload?.name?.trim() || email?.split('@')[0] || 'Usuário MedAgenda'

    if (!googleSub || !email || !payload?.email_verified) {
      return res.status(401).json({ erro: 'Conta Google não pôde ser verificada' })
    }

    let usuario = db.prepare(`
      SELECT * FROM usuarios
      WHERE google_sub = ? OR email = ?
      LIMIT 1
    `).get(googleSub, email)

    let novoUsuario = false

    if (!usuario) {
      // Mantém senha_hash compatível com a estrutura atual, mas ela nunca é usada no login Google.
      const senhaAleatoria = await bcrypt.hash(`google:${googleSub}:${Date.now()}`, 10)
      const resultado = db.prepare(`
        INSERT INTO usuarios (nome, email, senha_hash, google_sub, auth_provider)
        VALUES (?, ?, ?, ?, 'google')
      `).run(nome, email, senhaAleatoria, googleSub)

      usuario = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(resultado.lastInsertRowid)
      novoUsuario = true
    } else if (!usuario.google_sub) {
      // Vincula a Conta Google ao cadastro local que já usa o mesmo e-mail.
      db.prepare(`
        UPDATE usuarios
        SET google_sub = ?, auth_provider = CASE WHEN auth_provider = 'local' THEN 'local+google' ELSE auth_provider END
        WHERE id = ?
      `).run(googleSub, usuario.id)
      usuario = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(usuario.id)
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({
      mensagem: novoUsuario ? 'Conta criada com Google' : 'Login com Google realizado com sucesso',
      token,
      novoUsuario,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })
  } catch (err) {
    if (err?.message?.toLowerCase().includes('token')) {
      return res.status(401).json({ erro: 'Login com Google inválido ou expirado' })
    }
    next(err)
  }
})

module.exports = router
