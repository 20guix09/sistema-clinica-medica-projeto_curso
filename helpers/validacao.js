// helpers/validacao.js

// Verifica se todos os campos obrigatórios estão presentes e não vazios
function validarObrigatorios(dados, campos) {
  return campos
    .filter(campo => {
      const valor = dados[campo]
      return valor === undefined || valor === null ||
             (typeof valor === 'string' && valor.trim() === '')
    })
    .map(campo => `O campo "${campo}" é obrigatório`)
}

// Verifica se um número está dentro de um intervalo
function validarRange(campo, valor, min, max) {
  if (typeof valor !== 'number' || valor < min || valor > max) {
    return `${campo} deve ser um número entre ${min} e ${max}`
  }
  return null
}

// Verifica se um valor está em uma lista de permitidos
function validarLista(campo, valor, permitidos) {
  if (valor !== undefined && !permitidos.includes(valor)) {
    return `${campo} deve ser um de: ${permitidos.join(', ')}`
  }
  return null
}

function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function validarProduto(req, res, next) {
  const erros = validarObrigatorios(req.body, ['nome', 'preco'])
  if (erros.length > 0) return res.status(400).json({ erros })
  next() // Passa para o próximo handler
}

module.exports = { validarObrigatorios, validarRange, validarLista, emailValido }