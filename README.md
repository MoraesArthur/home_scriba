# 📚 Scriba - Sistema de Gerenciamento de Biblioteca Pessoal

Um sistema completo de gerenciamento de leituras pessoais com interface intuitiva, controle de progresso e organização por status.

## 🛠️ Tecnologias Utilizadas

- **Backend**: PHP 8.2 com MySQLi
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: MySQL 8.0
- **Servidor**: Apache 2.4 (XAMPP/LAMPP)

## 📁 Estrutura do Projeto

```
home_scriba/
├── api/                      # APIs PHP (Backend)
│   ├── db.php               # Conexão com MySQL
│   ├── cadastro.php         # Registro de usuários
│   ├── login.php            # Autenticação
│   ├── livros.php           # CRUD completo de livros
│   └── upload.php           # Upload de capas de livros
├── frontend/                 # Interface do usuário
│   ├── config.js            # Configuração de URLs
│   ├── inicial/             # Landing page
│   ├── cadastro/            # Página de registro
│   ├── login/               # Página de autenticação
│   └── home/                # Dashboard principal
├── uploads/                  # Armazenamento de imagens
│   ├── .htaccess            # Configuração de MIME types
│   ├── capa_padrao_1.svg    # Capa padrão marrom/laranja
│   ├── capa_padrao_2.svg    # Capa padrão cinza escuro
│   ├── capa_padrao_3.svg    # Capa padrão roxa fantasia
│   └── capa_padrao_4.svg    # Capa padrão turquesa natureza
├── .gitignore                # Arquivos ignorados pelo Git
├── database.sql              # Script de criação do banco
├── QUICKSTART.md             # Guia rápido de instalação
├── README.md                 # Documentação completa
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- **XAMPP/LAMPP** instalado (Apache + MySQL + PHP 8.0+)
  - Windows: [Download XAMPP](https://www.apachefriends.org/)
  - Linux: [Download LAMPP](https://www.apachefriends.org/download.html)

### Passo 1: Instalar XAMPP/LAMPP

#### Windows:
1. Execute o instalador XAMPP
2. Instale em `C:\xampp`
3. Abra o XAMPP Control Panel
4. Inicie os módulos **Apache** e **MySQL**

#### Linux:
```bash
# Dar permissão de execução ao instalador
chmod +x xampp-linux-*-installer.run

# Executar instalador
sudo ./xampp-linux-*-installer.run

# Iniciar serviços
sudo /opt/lampp/lampp start
```

### Passo 2: Clonar/Baixar o Projeto

**Importante:** O repositório `home_scriba` JÁ É o projeto completo. Clone diretamente na pasta `scriba/`:

```bash
# Linux
cd /opt/lampp/htdocs
mkdir -p scriba
cd scriba
git clone <seu-repositorio> .
```

```bash
# Windows
cd C:\xampp\htdocs
mkdir scriba
cd scriba
git clone <seu-repositorio> .
```

**Estrutura final esperada:**
- `/opt/lampp/htdocs/scriba/home_scriba/` (Linux) OU
- `C:\xampp\htdocs\scriba\home_scriba\` (Windows)

### Passo 3: Criar o Banco de Dados

#### Opção 1: Via phpMyAdmin (Recomendado)
1. Acesse http://localhost/phpmyadmin
2. Clique em "Novo" para criar banco de dados
3. Nome: `scriba_db`
4. Collation: `utf8mb4_general_ci`
5. Clique em "Criar"
6. Na aba "SQL", execute o script database.sql (se quiser já com livros e usuário existentes deve remover as # de exemplo)


### Passo 4: Configurar URLs (se necessário)

⚠️ **IMPORTANTE**: As URLs estão centralizadas no arquivo `frontend/config.js`

Se você instalou em um caminho diferente de `/scriba`, edite APENAS dois arquivos:

#### 1. Frontend Config (Principal)
**Arquivo:** `frontend/config.js`
```javascript
const APP_CONFIG = {
    BASE_URL: 'http://localhost/SEU_CAMINHO_AQUI',
    // As demais URLs são geradas automaticamente
};
```

#### 2. Upload PHP (Secundário)
**Arquivo:** `api/upload.php` (linha ~55)
```php
$fileUrl = 'http://localhost/SEU_CAMINHO_AQUI/uploads/' . $newFileName;
```

💡 **Dica**: Se mantiver o caminho padrão, não precisa alterar nada!

### Passo 5: Verificar Permissões (Linux/macOS)

```bash
# Dar permissão de escrita na pasta uploads
sudo chmod -R 777 /opt/lampp/htdocs/scriba/home_scriba/uploads
```

### Passo 6: Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost/scriba/home_scriba/frontend/inicial/index.html
```

### Campos de Cadastro de Usuário

Ao criar uma conta, os campos exigidos são:
- Usuário (nome de usuário único)
- Nome e Sobrenome
- Email
- Senha

### ✅ Checklist de Instalação

- [ ] XAMPP/LAMPP instalado e Apache + MySQL rodando
- [ ] Projeto copiado para a pasta `htdocs`
- [ ] Banco de dados `scriba_db` criado
- [ ] Tabelas `usuarios` e `livros` criadas
- [ ] Pasta `uploads` com permissão de escrita (Linux/macOS)
- [ ] Aplicação acessível no navegador

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Cadastro de usuários com validação de email
- Login com autenticação por **email OU usuário** (aceita ambos no mesmo campo)
- Logout com limpeza de sessão
- Saudação personalizada no dashboard
- Dados isolados por usuário (foreign key)

### 📚 Gerenciamento Completo de Livros

#### Adicionar Livros
- Título, autor e gênero
- Total de páginas
- Status inicial (Quero Ler, Lendo, Lido)
- Upload de capa personalizada (JPG/PNG, até 5MB)
- 4 capas padrão SVG com alternância automática

#### Visualização e Organização
- Busca em tempo real por título, autor ou gênero
- Filtros por status com contadores dinâmicos:
  - 📚 Todos os livros
  - 📖 Lendo
  - ✅ Lidos
  - 📌 Quero Ler
- Cards com capa, título, autor, gênero e progresso
- Mini barra de progresso visual em cada card

#### Edição e Acompanhamento
- **Modal de Visualização**: Detalhes completos do livro
- **Modal de Progresso**: Atualizar páginas lidas e status
- **Modal de Edição Completa**: Modificar todos os dados + trocar capa
- Mudança automática para "Lido" ao completar todas as páginas
- Persistência de gênero, status e progresso no banco

#### Exclusão
- Botão de remover com ícone de lixeira
- Deleção em cascata (remove junto com o usuário)

### 🏠 Dashboard Inteligente

#### Seção "Em Destaque"
- Card grande do último livro em andamento
- Barra de progresso visual (%)
- Botão "Continuar Leitura" para atualização rápida
- Permite edição completa clicando no card

#### Seção "Adicionados Recentemente"
- Grid 2x2 com últimos 4 livros adicionados
- Cards clicáveis para visualização
- Exibe capa, título e autor
- Sistema inteligente de capas padrão alternadas

### 🎨 Sistema de Capas

#### Capas Padrão
- 4 designs SVG únicos e elegantes:
  1. **Capa 1**: Tom marrom/laranja (clássico)
  2. **Capa 2**: Cinza escuro moderno
  3. **Capa 3**: Roxa fantasia
  4. **Capa 4**: Turquesa natureza
- Atribuição sequencial automática
- Seleção determinística por ID do livro

#### Upload Personalizado
- Formatos aceitos: JPG, JPEG, PNG
- Tamanho máximo: 5MB
- Preview antes de salvar
- Possibilidade de trocar capa posteriormente
- Armazenamento na pasta `uploads/`

### 📊 Controle de Progresso de Leitura
- Campo de página atual vs. total de páginas
- Cálculo automático de porcentagem
- Barra visual responsiva
- Atualização de status inteligente
- Persistência no banco de dados MySQL

## 🔌 Documentação da API

### Base URL
```
http://localhost/scriba/home_scriba/api
```

### Configuração CORS
Todas as APIs incluem:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
```

---

## 🎨 Design e Interface

### Paleta de Cores
- **Background Principal**: `#e8dec7` (Creme suave)
- **Background Secundário**: `#1a222e` (Dark blue)
- **Texto Primário**: `#1a222e` (Dark)
- **Texto Secundário**: `#e8dec7` (Light)
- **Accent**: `#d4af37` (Dourado)
- **Bordas**: `rgba(26, 34, 46, 0.1)` (Transparente)

### Tipografia
- **Títulos e Destaque**: Playfair Display (serif elegante)
- **Corpo e UI**: Poppins (sans-serif moderna)
- **Tamanhos**: 14px (corpo) a 48px (títulos principais)


## 📚 Documentação Adicional

Este projeto inclui documentação abrangente para facilitar o uso:

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de instalação em 5 minutos
- **[database.sql](database.sql)** - Script SQL pronto para executar

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## 👨‍💻 Desenvolvedores

Arthur De Moraes e Diego Bourguignon Rangel

---

<div align="center"

📚 Scriba - Organize suas leituras com estilo

</div>
