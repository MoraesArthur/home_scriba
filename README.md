# Scriba - Sistema de Gerenciamento de Biblioteca Pessoal

## 📁 Estrutura do Projeto

```
home_scriba/
├── backend/          # Servidor Node.js + Express
│   ├── server.js
│   ├── package.json
│   └── .gitignore
└── frontend/         # Páginas HTML/CSS/JS
    ├── inicial/      # Página inicial
    ├── cadastro/     # Página de cadastro
    ├── login/        # Página de login
    └── home/         # Dashboard principal
```

## 🚀 Como Usar

### 1. Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### 3. Acessar a Aplicação

Abra o navegador e acesse:
```
http://localhost:3000/inicial/index.html
```

## 🔐 Funcionalidades

### Cadastro
- Acesse a tela de cadastro
- Preencha: Nome, Usuário, Email, Senha
- Confirme a senha
- Clique em "Cadastrar"
- Você será redirecionado automaticamente para a home

### Login
- Acesse a tela de login
- Digite seu email e senha cadastrados
- Clique em "Entrar"
- Você será redirecionado para a home

### Logout
- Na tela home, clique em "Sair"
- Você será redirecionado para a página inicial

## 📝 API Endpoints

### POST `/api/cadastro`
Registra um novo usuário

**Body:**
```json
{
  "nome": "João Silva",
  "usuario": "joaosilva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### POST `/api/login`
Autentica um usuário

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### GET `/api/usuarios`
Lista todos os usuários cadastrados (apenas para debug)

## ⚠️ Observações Importantes

- **Armazenamento Temporário**: Os dados estão sendo armazenados em memória (array). Quando o servidor reiniciar, todos os dados serão perdidos.
- **Senha em Texto Puro**: As senhas NÃO estão sendo criptografadas. Em produção, use bcrypt.
- **Sem JWT**: Autenticação básica usando localStorage. Em produção, implemente JWT tokens.
- **CORS Aberto**: CORS está configurado para aceitar qualquer origem. Em produção, restrinja.

## 🔜 Próximos Passos

- [ ] Implementar banco de dados (MongoDB, PostgreSQL, etc.)
- [ ] Adicionar criptografia de senha (bcrypt)
- [ ] Implementar autenticação com JWT
- [ ] Adicionar validações mais robustas
- [ ] Criar sistema de sessões
- [ ] Implementar recuperação de senha
