const express = require('express')
const router = express.Router()
const db = require('../database') // ../ porque routes/ está uma pasta abaixo da raiz

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
// Exemplo com a tabela "produtos" — adapte para o nome do seu recurso
router.get('/', (req, res, next) => {
  try {
    const pacientes = db.prepare('SELECT * FROM pacientes').all()
    res.json(pacientes)
  } catch (err) {
    next(err)
  }
})

//Busca de pacientes
router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const pacientes = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(id)
    if (!pacientes) return res.status(404).json({ erro: 'Não encontrado' })
    res.json(pacientes)
  } catch (err) { next(err) }
})

// Cadastrar pacientes
router.post('/', (req, res, next) => {
  try {
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

    const resultado = db.prepare(`
      INSERT INTO pacientes (
        nome,
        cpf,
        data_nascimento,
        sexo,
        telefone,
        email,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
    )

    const novoPaciente = db.prepare(
      'SELECT * FROM pacientes WHERE id = ?'
    ).get(resultado.lastInsertRowid)

    res.status(201).json(novoPaciente)

  } catch (err) {
    next(err)
  }
})

//Editar pacientes
router.put('/:id', (req, res) => {

  try{
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

  } catch (err) {
    next(err)
  }
})

//Excluir pacientes
router.delete('/:id', (req, res) => {

  try{
    const id = Number(req.params.id)
    
    const index = pacientes.findIndex(p => p.id === id)
    
    if (index === -1) {
      return res.status(404).json({
        erro: 'Paciente não encontrado, verifique se foi cadastrado.'
      })
    }
  
    pacientes.splice(index, 1)
  
    res.status(204).send()
  
  } catch (err) {
    next(err)
  }
})

module.exports = router //exporta o router para que o index.js possa importá-lo