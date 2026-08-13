const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json())

const contas = []
const login = []

app.get('/', (req, res) => {
    res.send('Finalmente, o projeto da clínica médica está funcionando!');
});

// 1. Corrigido para '/pacientes'
app.get('/pacientes', (req, res) => {
    res.json([
        {
            id: 1, 
            nome: 'Guilheme', 
            cpf: '12244850927', // 2. Agora é texto (com aspas)
            tel: '43988024099', // 2. Agora é texto
            email: 'guilhermelimadejesus44@gmail.com', 
            nasc: '31/10/2009'  // 3. Formatado como data real
        },
        {
            id: 2, 
            nome: 'Nicole', 
            cpf: '14455365874', // 2. Agora é texto
            tel: '43558421365', // 2. Agora é texto
            email: 'nicole@gmail.com',
            nasc: '15/05/2010'  // Exemplo de data para a Nicole
        }
    ]);
});

app.post('/conta', (req, res) => {

    //serve como um banco de dados temporário.
  const { nome, email, senha, cpf } = req.body

  //Cria o objeto
  const novaConta = {
    id: contas.length + 1,
    nome,
    email,
    senha,
    cpf
  }

  //a conta fica salva só na memória enquanto o servidor estiver rodando.
  contas.push(novaConta)

  //responde ao Postman dizendo: “criei com sucesso”.
  res.status(201).json(novaConta)
})

app.post('/login', (req, res) => {
  const { email, senha } = req.body

  const usuario = contas.find(conta =>
    conta.email === email && conta.senha === senha
  )

  if (!usuario) {
    return res.status(401).json({
      mensagem: 'E-mail ou senha inválidos'
    })
  }

  res.status(200).json({
    mensagem: 'Login realizado com sucesso',
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }
  })
})

app.get('/dashboard/summary', (req, res) => {

  //Dados temporário
  const resumo = {
    consultasHoje: 18,
    pacientesCadastrados: 1284,
    medicosAtivos: 17,
    consultasPendentes: 6
  }
  //responde o Postman
  res.status(200).json(resumo)
})

app.get('/dashboard/calendario', (req, res) => {

  const consultas = [
    {
     id: 1,
     paciente: "Ana",
      medico: "Dra. Helena",
      data: "2026-08-11",
     horario: "08:00"
   },
   {
     id: 2,
     paciente: "João",
     medico: "Dr. Bruno",
     data: "2026-08-12",
      horario: "09:30"
    }
  ]

  res.status(200).json(consultas)
})

app.get('/dashboard/consultas-hoje', (req, res) => {
  const consultasHoje = [
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

app.get('/dashboard/consultas-hoje', (req, res) => {
  res.json(consultasHoje)
})

app.post('/pacientes')

app.put('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id)
  const indedx = pacientes.findIndex(c => c.id === id)

  if (index === -1) {
    return res.status (404).json({
      erro: 'Paciente não encontrado, verefique se foi cadastrado. '
    })

    const { nome, cpf, nasc, sexo, tel, email, cep, rua, num, comp, bairro, cid, est } = req.body

    pacientes[index] = { id, nome, cpf, nasc, sexo, tel, email, cep, rua, num, comp, bairro, cid, est }

    res.json(pacientes[index])
  }
})

app.delete('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = pacientes.findIndex(c => c.id === id)

  if (index === -1) {
    return res.statuts(404).json({erro: 'Paciente não encontrado, verifique se foi cadastrado.'})
  }

  pacientes.splice(index, 1)
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})