const express = require('express')
const router = express.Router()

const db = require('../database')

const {
  validarObrigatorios,
  emailValido
} = require('../helpers/validacao')

// ======================================================
// LISTAR PACIENTES DO USUÁRIO LOGADO
// ======================================================

router.get('/', (req, res, next) => {
  try {
    const usuarioId = req.usuario.id

    const pacientes = db.prepare(`
      SELECT *
      FROM pacientes
      WHERE usuario_id = ?
      ORDER BY nome
    `).all(usuarioId)

    res.json(pacientes)

  } catch (err) {
    next(err)
  }
})

// ======================================================
// BUSCAR PACIENTE POR ID
// ======================================================

router.get('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const usuarioId = req.usuario.id

    const paciente = db.prepare(`
      SELECT *
      FROM pacientes
      WHERE id = ?
      AND usuario_id = ?
    `).get(id, usuarioId)

    if (!paciente) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
      })
    }

    res.json(paciente)

  } catch (err) {
    next(err)
  }
})

// ======================================================
// CADASTRAR PACIENTE
// ======================================================

router.post('/', (req, res, next) => {
  try {
    const usuarioId = req.usuario.id

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

    const erros = validarObrigatorios(
      req.body,
      ['nome', 'cpf', 'nasc', 'tel', 'email']
    )

    if (email && !emailValido(email)) {
      erros.push('Email com formato inválido')
    }

    if (erros.length > 0) {
      return res.status(400).json({ erros })
    }

    // CPF só precisa ser único dentro da conta
    const cpfExistente = db.prepare(`
      SELECT id
      FROM pacientes
      WHERE cpf = ?
      AND usuario_id = ?
    `).get(cpf, usuarioId)

    if (cpfExistente) {
      return res.status(409).json({
        erro: 'CPF já cadastrado'
      })
    }

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
        estado,
        usuario_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome,
      cpf,
      nasc,
      sexo ?? null,
      tel,
      email,
      cep ?? null,
      rua ?? null,
      num ?? null,
      comp ?? null,
      bairro ?? null,
      cid ?? null,
      est ?? null,
      usuarioId
    )

    const novoPaciente = db.prepare(`
      SELECT *
      FROM pacientes
      WHERE id = ?
      AND usuario_id = ?
    `).get(resultado.lastInsertRowid, usuarioId)

    res.status(201).json(novoPaciente)

  } catch (err) {
    next(err)
  }
})

// ======================================================
// EDITAR PACIENTE
// ======================================================

router.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const usuarioId = req.usuario.id

    const existente = db.prepare(`
      SELECT *
      FROM pacientes
      WHERE id = ?
      AND usuario_id = ?
    `).get(id, usuarioId)

    if (!existente) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
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

    if (email && !emailValido(email)) {
      return res.status(400).json({
        erro: 'Email com formato inválido'
      })
    }

    if (cpf) {
      const cpfExistente = db.prepare(`
        SELECT id
        FROM pacientes
        WHERE cpf = ?
        AND usuario_id = ?
        AND id != ?
      `).get(cpf, usuarioId, id)

      if (cpfExistente) {
        return res.status(409).json({
          erro: 'CPF já cadastrado'
        })
      }
    }

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
      AND usuario_id = ?
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
      id,
      usuarioId
    )

    const atualizado = db.prepare(`
      SELECT *
      FROM pacientes
      WHERE id = ?
      AND usuario_id = ?
    `).get(id, usuarioId)

    res.json(atualizado)

  } catch (err) {
    next(err)
  }
})

// ======================================================
// EXCLUIR PACIENTE
// ======================================================

router.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const usuarioId = req.usuario.id

    const existente = db.prepare(`
      SELECT id
      FROM pacientes
      WHERE id = ?
      AND usuario_id = ?
    `).get(id, usuarioId)

    if (!existente) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
      })
    }

    const consulta = db.prepare(`
      SELECT id
      FROM consultas
      WHERE paciente_id = ?
      AND usuario_id = ?
      LIMIT 1
    `).get(id, usuarioId)

    if (consulta) {
      return res.status(409).json({
        erro: 'Não é possível excluir um paciente com histórico de consultas'
      })
    }

    db.prepare(`
      DELETE FROM pacientes
      WHERE id = ?
      AND usuario_id = ?
    `).run(id, usuarioId)

    res.status(204).send()

  } catch (err) {
    next(err)
  }
})

module.exports = router