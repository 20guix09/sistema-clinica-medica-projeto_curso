const express = require('express')
const router = express.Router()

const pacientes = [
  {
    id: 1,
    nome: 'Guilherme',
    cpf: '12244850927',
    tel: '43988024099',
    email: 'guilhermelimadejesus44@gmail.com',
    nasc: '31/10/2009'
  },
  {
    id: 2,
    nome: 'Nicole',
    cpf: '14455365874',
    tel: '43558421365',
    email: 'nicole@gmail.com',
    nasc: '15/05/2010'
  }
]

//Listar pacientes
router.get('/', (req, res) => {
  res.json(paciente)
})

//Busca de pacientes
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)

  console.log('ID recebido:', id)
  console.log('Pacientes:', pacientes)

  const paciente = pacientes.find(p => p.id === id)

  if (!paciente) {
    return res.status(404).json({
      erro: 'Não encontrado'
    })
  }

  res.json(paciente)
})
//Cadastrar pacientes
router.post('/', (req, res) => {

  const {
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  } = req.body

  const novoPaciente = {
    id: pacientes.length + 1,
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  }

  pacientes.push(novoPaciente)

  res.status(201).json(novoPaciente)
})

//Editar pacientes
router.put('/:id', (req, res) => {

  const id = Number(req.params.id)

  const index = pacientes.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({
      erro: 'Paciente não encontrado, verifique se foi cadastrado.'
    })
  }

  const {
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  } = req.body

  pacientes[index] = {
    id,
    nome,
    cpf,
    nasc,
    sexo,
    tel,
    email,
    cep,
    rua,
    num,
    comp,
    bairro,
    cid,
    est
  }

  res.status(200).json(pacientes[index])
})

//Excluir pacientes
router.delete('/:id', (req, res) => {

  const id = Number(req.params.id)

  const index = pacientes.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({
      erro: 'Paciente não encontrado, verifique se foi cadastrado.'
    })
  }

  pacientes.splice(index, 1)

  res.status(204).send()
})

module.exports = router //exporta o router para que o index.js possa importá-lo