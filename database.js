const Database = require('better-sqlite3')
const db = new Database('banco.db')

// Cria a tabela de pacientes se ela ainda não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    data_nascimento TEXT NOT NULL,
    sexo TEXT,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    cep TEXT,
    rua TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT
  )
`)

module.exports = db