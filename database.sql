-- ================================================
-- Scriba - Sistema de Gerenciamento de Biblioteca
-- Script de Criação do Banco de Dados
-- ================================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS scriba_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Selecionar o banco
USE scriba_db;

-- ================================================
-- Tabela: usuarios
-- Armazena dados dos usuários cadastrados
-- ================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL COMMENT 'Nome de usuário (login/identificação)',
    nome VARCHAR(100) NOT NULL COMMENT 'Nome completo do usuário',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email único para login',
    senha VARCHAR(255) NOT NULL COMMENT 'Senha (texto puro - NÃO usar em produção)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela de usuários do sistema';

-- Ajuste para bancos já existentes (execute se a coluna não existir)
-- ALTER TABLE usuarios ADD COLUMN usuario VARCHAR(100) UNIQUE NOT NULL AFTER id;

-- ================================================
-- Tabela: livros
-- Armazena a biblioteca de livros de cada usuário
-- ================================================
CREATE TABLE IF NOT EXISTS livros (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL COMMENT 'ID do usuário dono do livro',
    titulo VARCHAR(200) NOT NULL COMMENT 'Título do livro',
    autor VARCHAR(100) NOT NULL COMMENT 'Nome do autor',
    genre VARCHAR(100) DEFAULT NULL COMMENT 'Gênero literário (Ficção, Romance, etc)',
    paginas INT(11) DEFAULT 0 COMMENT 'Total de páginas do livro',
    current_page INT(11) DEFAULT 0 COMMENT 'Página atual de leitura',
    status VARCHAR(50) DEFAULT 'Quero Ler' COMMENT 'Status: Lendo, Lido, Quero Ler',
    capa VARCHAR(255) DEFAULT NULL COMMENT 'URL da capa do livro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de adição',

    -- Chave estrangeira com deleção em cascata
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Índices para melhor performance
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Biblioteca de livros dos usuários';

-- ================================================
-- Dados de Exemplo (Opcional - Comentar/Descomentar)
-- ================================================

-- Inserir usuário de teste
-- INSERT INTO usuarios (nome, email, senha) VALUES
-- ('João Silva', 'joao@email.com', 'senha123');

-- Inserir livros de exemplo (descomente após criar o usuário acima)
-- INSERT INTO livros (user_id, titulo, autor, genre, paginas, current_page, status, capa) VALUES
-- (1, '1984', 'George Orwell', 'Ficção Distópica', 328, 150, 'Lendo', 'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg'),
-- (1, 'O Senhor dos Anéis', 'J.R.R. Tolkien', 'Fantasia', 1200, 0, 'Quero Ler', 'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg'),
-- (1, 'Dom Casmurro', 'Machado de Assis', 'Romance', 256, 256, 'Lido', 'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg');

-- ================================================
-- Verificação
-- ================================================
SHOW TABLES;
DESCRIBE usuarios;
DESCRIBE livros;

-- ================================================
-- Instruções de Uso
-- ================================================
-- 1. Execute este script no phpMyAdmin ou via terminal:
--    Linux: /opt/lampp/bin/mysql -u root < database.sql
--    Windows: C:\xampp\mysql\bin\mysql.exe -u root < database.sql
--
-- 2. Verifique se as tabelas foram criadas:
--    USE scriba_db;
--    SHOW TABLES;
--
-- 3. Acesse a aplicação:
--    http://localhost/scriba/home_scriba/frontend/inicial/index.html
-- ================================================
