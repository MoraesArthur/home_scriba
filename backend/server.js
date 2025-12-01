const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Armazenamento temporário em memória (será substituído por banco de dados)
const users = [];

// Rota de cadastro
app.post('/api/cadastro', (req, res) => {
    const { nome, usuario, email, senha } = req.body;

    // Validações básicas
    if (!nome || !usuario || !email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios'
        });
    }

    // Verificar se email já existe
    const emailExists = users.find(user => user.email === email);
    if (emailExists) {
        return res.status(400).json({
            success: false,
            message: 'Este email já está cadastrado'
        });
    }

    // Verificar se usuário já existe
    const usuarioExists = users.find(user => user.usuario === usuario);
    if (usuarioExists) {
        return res.status(400).json({
            success: false,
            message: 'Este nome de usuário já está em uso'
        });
    }

    // Adicionar usuário
    const newUser = {
        id: users.length + 1,
        nome,
        usuario,
        email,
        senha // Em produção, usar hash de senha (bcrypt)
    };

    users.push(newUser);

    res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: {
            id: newUser.id,
            nome: newUser.nome,
            usuario: newUser.usuario,
            email: newUser.email
        }
    });
});

// Rota de login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Validações básicas
    if (!email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'Email e senha são obrigatórios'
        });
    }

    // Buscar usuário
    const user = users.find(u => u.email === email && u.senha === senha);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Email ou senha incorretos'
        });
    }

    // Login bem-sucedido
    res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            email: user.email
        }
    });
});

// Rota para listar usuários (apenas para debug - remover em produção)
app.get('/api/usuarios', (req, res) => {
    res.json({
        total: users.length,
        users: users.map(u => ({
            id: u.id,
            nome: u.nome,
            usuario: u.usuario,
            email: u.email
        }))
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Frontend servido de: ${path.join(__dirname, '../frontend')}`);
});
