// Arquivo usado para testar rotas da API

// Importa o Express, cria a aplicação e define a porta do servidor
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Permite que o servidor leia dados enviados no corpo da requisição em formato JSON
app.use(express.json())

// Banco de dados temporário em memória
const frases = [
  { id: 1, texto: 'A jornada de mil milhas começa com um único passo.', autor: 'Lao-Tzu' },
  { id: 2, texto: 'A simplicidade é a sofisticação máxima.', autor: 'Leonardo da Vinci' }
]

// Rota GET: retorna todas as frases cadastradas
app.get('/frases', (req, res) => {
  res.json(frases)
})

// Rota POST: cria uma nova frase
app.post('/frases', (req, res) => {

  // req.body acessa os dados enviados pelo cliente no corpo da requisição
  const { texto, autor } = req.body

  // Cria um novo objeto com ID automático
  const novaFrase = {
    id: frases.length + 1,
    texto,
    autor
  }

  // Adiciona a nova frase ao array temporário
  frases.push(novaFrase)

  // Retorna status 201, indicando que um novo recurso foi criado
  res.status(201).json(novaFrase)
})

// Rota DELETE: recebe o ID da frase pela URL
app.delete('/frases/:id', (req, res) => {

  // req.params.id acessa o valor colocado no lugar de :id
  // Number() converte esse valor de texto para número
  const id = Number(req.params.id)

  // Neste exemplo, a frase ainda não é removida de verdade
  // A rota apenas retorna uma mensagem informando qual frase seria excluída
  res.json({
    mensagem: `Frase ${id} será excluída`
  })
})

// Rota PUT: atualiza uma frase específica pelo ID
app.put('/frases/:id', (req, res) => {

  // Pega o ID informado na URL e converte para número
  const id = Number(req.params.id)

  // Pega os novos dados enviados no corpo da requisição
  const { texto, autor } = req.body

  // .find() procura a primeira frase cujo ID seja igual ao ID informado
  const frase = frases.find(frase => frase.id === id)

  // Se nenhuma frase for encontrada, retorna erro 404
  if (!frase) {
    return res.status(404).json({
      erro: 'Frase não encontrada'
    })
  }

  // Atualiza os dados da frase encontrada
  frase.texto = texto
  frase.autor = autor

  // Retorna a frase já atualizada em formato JSON
  res.json(frase)
})

// Inicia o servidor e faz ele escutar na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})