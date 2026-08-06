// Arquivo para teste de rotas

// Criação do app
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Habilita leitura do corpo das requisições
app.use(express.json())

// Dados para as rotas
const frases = [
  { id: 1, texto: 'A jornada de mil milhas começa com um único passo.', autor: 'Lao-Tzu' },
  { id: 2, texto: 'A simplicidade é a sofisticação máxima.', autor: 'Leonardo da Vinci' }
]

app.get('/frases', (req,res) =>{
  res.json(frases)
})

app.post('/frases', (req, res) => {
  // Extrair os dados enviados pelo cliente do corpo da requisição
  const { texto, autor } = req.body

  // Criar o novo objeto com um ID único
  const novaFrase = {
    id: frases.length + 1,
    texto,
    autor
  }

  // Adicionar ao array e retornar o novo item criado
  frases.push(novaFrase)
  res.status(201).json(novaFrase)
})

app.delete('/frases/:id', (req, res) => {
  const id = Number(req.params.id)

  res.json({
    mensagem: `Frase ${id} será excluída`
  })
})

app.put('/frases/:id', (req, res) => {
  const id = Number(req.params.id)
  const { texto, autor } = req.body

  const frase = frases.find(frase => frase.id === id)

  if (!frase) {
    return res.status(404).json({
      erro: 'Frase não encontrada'
    })
  }

  frase.texto = texto
  frase.autor = autor

  res.json(frase)
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})