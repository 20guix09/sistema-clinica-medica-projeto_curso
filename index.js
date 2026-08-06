const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Finalmente, o projeto da biblioteca está funcionando!');
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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
