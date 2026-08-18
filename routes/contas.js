const express = require('express')
const router = express.Router()

const conta = [
  {
    email: 'nicole@gmail.com',
    senha: '12345678'
  }
]

router.get('/', (req, res) => {
  try{
    res.json(conta)

  } catch (err) {
    next(err)
  }
})

router.post('/', (req, res) => {

  try{
    const {
      nome,
      email,
      senha,
      cpf
    } = req.body

    const novaConta = {
      id: contas.length + 1,
      nome,
      email,
      senha,
      cpf
    }

    contas.push(novaConta)

    res.status(201).json(novaConta)

  } catch (err) {
    next(err)
  }
})

module.exports = router