const express = require('express')
const router = express.Router()

const consulta = [
  {
    id: 1,
    paciente: 'Ana',
    medico: 'Dra. Helena',
    horario: '08:00'
  },
  {
    id: 2,
    paciente: 'João',
    medico: 'Dr. Bruno',
    horario: '09:30'
  }
]

//Consultas de hoje
router.get('/consultas-hoje', (req, res) =>{
  try{
    res.status(200).json(consulta)

  } catch (err) {
    next(err)
  }
})

//Calendário
router,get('/calendario', (req, res) =>{
  try{
    res.status(200).json(consulta)

  } catch (err) {
    next(err)
  }
})

//Resumo
router.get('/summary', (req, res) => {

  const resumo = {
    consultasHoje: 18,
    pacientCadastrados: 1284,
    medicosAtivos: 17,
    consultasPendentes: 6
  } 
  
  try{
    res.status(200).json(resumo)

  } catch (err) {
    next(err)
  }
})

module.exports = router