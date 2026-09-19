// Verifica campos obrigatórios

// valida obrigatorios
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

// valida range
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

// valida lista
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

// função para email valido
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


function dataHojeNoFuso() {
  const fuso = process.env.APP_TIME_ZONE || 'America/Sao_Paulo'
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date())
  const v = Object.fromEntries(partes.map(({type,value}) => [type,value]))
  return `${v.year}-${v.month}-${v.day}`
}

function idValido(valor) {
  const id = Number(valor)
  return Number.isInteger(id) && id > 0
}

module.exports = {
  validarObrigatorios,
  validarRange,
  validarLista,
  emailValido,
  dataHojeNoFuso,
  idValido
}
