const Database = require('better-sqlite3')

// Abre (ou cria, se não existir) o arquivo do banco
const db = new Database('banco.db')

// Cria a tabela se ela ainda não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS conta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL
  )
`)

module.exports = db