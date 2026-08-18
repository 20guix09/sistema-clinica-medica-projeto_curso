const express = require('express')
const router = express.Router()

router.post('/login', (req, res) => {

    try{
        const {
          email,
          senha
        } = req.body

        const usuario = contas.find(conta =>
          conta.email === email &&
          conta.senha === senha
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