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

### Autenticação
- **Cadastro**: Nome, Usuário, Email e Senha com confirmação
- **Login**: Autenticação por email e senha
- **Logout**: Sair e retornar à página inicial
- **Saudação Personalizada**: Dashboard exibe o primeiro nome do usuário logado

### 📚 Gerenciamento de Livros
- **Adicionar Livros**: Título, autor, categoria, páginas totais, URL da capa e status inicial
- **Editar Livros**: Clique em qualquer livro para atualizar dados
- **Remover Livros**: Excluir livros da biblioteca
- **Busca em Tempo Real**: Filtrar por título, autor ou categoria
- **Filtros por Status**: Todos, Lendo, Lidos, Quero Ler (com contadores)
- **Progresso de Leitura**: Barra visual mostrando página atual / total de páginas

### 🏠 Dashboard Inteligente
- **Destaque do Último Livro**: Card destacado com o livro sendo lido ou atualizado recentemente
- **Barra de Progresso**: Visualização do progresso de leitura em %
- **Botão "Continuar Leitura"**: Acesso rápido ao modal de atualização
- **Adicionados Recentemente**: Grid com últimos 4 livros (clicáveis)

### 🎯 Metas de Leitura
- **Criar Metas**: Definir objetivos (ex: "Ler 24 livros em 2025")
- **Acompanhar Progresso**: Barra visual e porcentagem de conclusão
- **Editar e Excluir**: Gerenciar metas existentes

### 📁 Listas e Coleções
- **Criar Listas Personalizadas**: Organizar livros por temas
- **Adicionar Livros às Listas**: Selecionar livros da biblioteca
- **Remover Livros de Listas**: Ícone de lixeira com confirmação
- **Contador de Livros**: Ver quantidade por lista

### 📜 Histórico
- **Últimas Atualizações**: Livros ordenados por data de modificação
- **Timestamp**: Data e hora da última alteração
- **Acesso Rápido**: Clique para editar direto do histórico

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
- **Senha em Texto Puro**: As senhas NÃO estão sendo criptografadas.
- **Sem JWT**: Autenticação básica usando localStorage.
- **CORS Aberto**: CORS está configurado para aceitar qualquer origem.

## 🎨 Interface

- Design minimalista com paleta creme (#e8dec7) e dark (#1a222e)
- Tipografia elegante: Playfair Display (serifas) + Poppins (sans-serif)
- Sidebar fixa com navegação intuitiva
- Modais para adicionar/editar conteúdo
- Animações suaves e transições fluidas
- Cards clicáveis com hover effects
- Badges de contagem nos filtros
- Ícones Font Awesome 6.4

## 💡 Recursos da Interface

### Página Inicial (Dashboard)
- Saudação personalizada com nome do usuário
- Card destacado do último livro sendo lido
- Progresso visual com barra e porcentagem
- Grid de "Adicionados Recentemente" (clicáveis)

### Meus Livros
- Busca instantânea por título/autor/categoria
- Filtros com badges de contagem dinâmica
- Cards com capa, título, autor, categoria e status
- Mini barra de progresso em cada card
- Botão de remover (ícone de lixeira)
- Clique no card para editar

### Listas
- Cards de pasta com ícone e contador
- Modal com seleção de livros disponíveis
- Lista de livros com botão de remover
- Editar nome da lista

### Histórico
- Ordenação por última atualização
- Timestamp de modificação
- Progresso de cada livro
- Acesso direto ao modal de edição

## 🔜 Próximos Passos

- [ ] Implementar banco de dados.
