<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

// Permitir login com email OU usuário
$identifier = $_POST['identifier'] ?? ($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';

if (!$identifier || !$senha) {
    echo json_encode([
        'success' => false,
        'message' => 'Informe usuário/email e senha'
    ]);
    exit;
}

// Buscar usuário apenas por email/usuario (sem testar senha aqui!)
$stmt = $conn->prepare("SELECT id, usuario, nome, email, senha FROM usuarios WHERE email = ? OR usuario = ?");
$stmt->bind_param("ss", $identifier, $identifier);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuário não encontrado'
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verificar a senha
if (!password_verify($senha, $user['senha'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Senha incorreta'
    ]);
    exit;
}

// Remover a senha do retorno
unset($user['senha']);

echo json_encode([
    'success' => true,
    'message' => 'Login realizado com sucesso',
    'user' => $user
]);
?>
