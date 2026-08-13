// Importa o Express, cria a aplicação e define a porta do servidor
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Permite que o servidor leia dados enviados no corpo da requisição em formato JSON
app.use(express.json())

// Banco de dados temporário em memória
const livros = [
  { id: 1, titulo: 'O Alquimista', genero: 'Romance', disponivel: true },
  { id: 2, titulo: '1984', genero: 'Ficção Científica', disponivel: false },
  { id: 3, titulo: 'Dom Casmurro', genero: 'Romance', disponivel: true },
  { id: 4, titulo: 'Sapiens', genero: 'Não-Ficção', disponivel: true }
]

// Rota GET 1: lista todos os livros ou filtra pelo gênero informado na query string
app.get('/livros', (req, res) => {

  // req.query acessa os parâmetros enviados depois do ? na URL
  // Exemplo: /livros?genero=Romance
  const { genero } = req.query

  // Se um gênero foi informado, filtra o array e retorna apenas os livros daquele gênero
  if (genero) {
    const filtrados = livros.filter(livro => livro.genero === genero)
    return res.json(filtrados)
  }

  // Se nenhum gênero foi informado, retorna todos os livros
  res.json(livros)
})

// Rota GET 2: busca um livro específico pelo ID informado na URL
app.get('/livros/:id', (req, res) => {

  // req.params.id acessa o valor colocado no lugar de :id na rota
  // Number() converte esse valor de texto para número
  const id = Number(req.params.id)

  // .find() procura no array o primeiro livro cujo ID seja igual ao ID informado
  const livro = livros.find(l => l.id === id)

  // Se nenhum livro for encontrado, retorna o status 404
  if (!livro) {
    return res.status(404).json({
      erro: 'Livro não encontrado'
    })
  }

  // Se o livro for encontrado, retorna esse livro em formato JSON
  res.json(livro)
})

// Inicia o servidor e faz ele escutar na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})