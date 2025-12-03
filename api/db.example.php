<?php
/**
 * Configuração de Conexão com MySQL
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo e renomeie para db.php
 * 2. Ajuste os valores abaixo conforme sua instalação
 * 3. O db.php está no .gitignore para proteger suas credenciais
 */

// Configurações do banco de dados
$host = "localhost";          // Host do MySQL (geralmente localhost)
$user = "root";               // Usuário do MySQL (padrão: root)
$pass = "";                   // Senha do MySQL (padrão: vazio no XAMPP)
$db   = "scriba_db";         // Nome do banco de dados

// Estabelecer conexão
$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Erro na conexão com o banco de dados: ' . $conn->connect_error
    ]));
}

// Definir charset para UTF-8
$conn->set_charset("utf8mb4");

/**
 * CONFIGURAÇÕES ALTERNATIVAS:
 *
 * Se você está usando senha no MySQL:
 * $pass = "sua_senha_aqui";
 *
 * Se está usando outro banco:
 * $db = "nome_do_seu_banco";
 *
 * Se está usando host remoto:
 * $host = "192.168.1.100";
 *
 * Se está usando porta customizada:
 * $host = "localhost:3307";
 */
?>
