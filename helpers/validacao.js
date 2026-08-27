// Verifica campos obrigatórios
function validarObrigatorios(dados, campos) {
  return campos
    .filter(campo => {
      const valor = dados[campo]

      return (
        valor === undefined ||
        valor === null ||
        (typeof valor === 'string' && valor.trim() === '')
      )
    })
    .map(campo => `O campo "${campo}" é obrigatório`)
}


// Valida números dentro de um intervalo
function validarRange(campo, valor, min, max) {
  if (
    typeof valor !== 'number' ||
    valor < min ||
    valor > max
  ) {
    return `${campo} deve ser um número entre ${min} e ${max}`
  }

  return null
}


// Valida valores permitidos
function validarLista(campo, valor, permitidos) {
  if (
    valor !== undefined &&
    !permitidos.includes(valor)
  ) {
    return `${campo} deve ser um de: ${permitidos.join(', ')}`
  }

  return null
}


// Valida email
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


module.exports = {
  validarObrigatorios,
  validarRange,
  validarLista,
  emailValido
}