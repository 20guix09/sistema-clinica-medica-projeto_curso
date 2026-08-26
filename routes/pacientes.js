const express = require('express')
const router = express.Router()
const db = require('../database') // ../ porque routes/ está uma pasta abaixo da raiz
const { validarObrigatorios, validarRange } = require('../helpers/validacao')


//LISTAR PACIENTES
// Exemplo com a tabela "produtos" — adapte para o nome do seu recurso
router.get('/', (req, res, next) => {
  try {
    const pacientes = db.prepare('SELECT * FROM pacientes').all()
    res.json(pacientes)
  } catch (err) {
    next(err)
  }
})

//BUSCAR PACIENTES
router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const pacientes = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(id)
    if (!pacientes) return res.status(404).json({ erro: 'Não encontrado' })
    res.json(pacientes)
  } catch (err) { next(err) }
})

//CADASTRAR PACIENTES
router.post('/', async (req, res, next) => {
  try {
    const senha_hash = await bcrypt.hash(senha, 10) //Espera o resultado

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

//EDITAR PACIENTES
router.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const existente = db.prepare(
      'SELECT * FROM pacientes WHERE id = ?'
    ).get(id)

    if (!existente) {
      return res.status(404).json({
        erro: 'Paciente não cadastrado'
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

    db.prepare(`
      UPDATE pacientes SET
        nome = ?,
        cpf = ?,
        data_nascimento = ?,
        sexo = ?,
        telefone = ?,
        email = ?,
        cep = ?,
        rua = ?,
        numero = ?,
        complemento = ?,
        bairro = ?,
        cidade = ?,
        estado = ?
      WHERE id = ?
    `).run(
      nome ?? existente.nome,
      cpf ?? existente.cpf,
      nasc ?? existente.data_nascimento,
      sexo ?? existente.sexo,
      tel ?? existente.telefone,
      email ?? existente.email,
      cep ?? existente.cep,
      rua ?? existente.rua,
      num ?? existente.numero,
      comp ?? existente.complemento,
      bairro ?? existente.bairro,
      cid ?? existente.cidade,
      est ?? existente.estado,
      id
    )

    const atualizado = db.prepare(
      'SELECT * FROM pacientes WHERE id = ?'
    ).get(id)

    res.json(atualizado)

  } catch (err) {
    next(err)
  }
})

//EXCLUIR PACIENTES
router.delete('/:id', (req, res, next) => {
  try {
    const existente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id)
    if (!existente) return res.status(404).json({ erro: 'Paciente não cadastrado' })

    db.prepare('DELETE FROM pacientes WHERE id = ?').run(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})

module.exports = router //EXPORTAR O ROUTER PARA QUE O index.js possa importá-lo