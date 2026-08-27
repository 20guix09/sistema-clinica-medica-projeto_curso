const Database = require('better-sqlite3')
const db = new Database('banco.db')

// Ativa o funcionamento das chaves estrangeiras no SQLite
db.pragma('foreign_keys = ON')

// CADASTRO
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL
  )
`)


// PACIENTES
db.exec(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
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


// ESPECIALIDADES
db.exec(`
  CREATE TABLE IF NOT EXISTS especialidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'ativo'
  )
`)


// MÉDICOS
db.exec(`
  CREATE TABLE IF NOT EXISTS medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    crm TEXT NOT NULL UNIQUE,
    estado_crm TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo',
    foto TEXT,

    especialidade_id INTEGER NOT NULL,

    FOREIGN KEY (especialidade_id)
      REFERENCES especialidades(id)
  )
`)


// DIAS E HORÁRIOS DE ATENDIMENTO DOS MÉDICOS
db.exec(`
  CREATE TABLE IF NOT EXISTS disponibilidades_medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medico_id INTEGER NOT NULL,
    dia_semana TEXT NOT NULL,
    horario_inicio TEXT NOT NULL,
    horario_fim TEXT NOT NULL,

    FOREIGN KEY (medico_id)
      REFERENCES medicos(id)
      ON DELETE CASCADE
  )
`)


// CONSULTAS
db.exec(`
  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    paciente_id INTEGER NOT NULL,
    medico_id INTEGER NOT NULL,
    especialidade_id INTEGER NOT NULL,

    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    observacao TEXT,

    motivo_cancelamento TEXT,

    FOREIGN KEY (paciente_id)
      REFERENCES pacientes(id),

    FOREIGN KEY (medico_id)
      REFERENCES medicos(id),

    FOREIGN KEY (especialidade_id)
      REFERENCES especialidades(id)
  )
`)


module.exports = db