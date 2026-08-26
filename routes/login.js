const express = require('express')
const router = express.Router()
const db = require('../database')
const { validarObrigatorios, validarRange, emailValido } = require('../helpers/validacao')


// LOGIN
router.post('/', (req, res, next) => {
  try {
    const {
      email,
      senha
    } = req.body

    const usuario = db.prepare(`
      SELECT *
      FROM usuarios
      WHERE email = ?
      AND senha = ?
    `).get(
      email,
      senha
    )

    if (!usuario) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos'
      })
    }

    res.status(200).json({
      mensagem: 'Login realizado com sucesso',

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