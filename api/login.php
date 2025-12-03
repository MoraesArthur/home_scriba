<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

// Permitir login com email OU usuario (nome de usuário)
$identifier = $_POST['identifier'] ?? ($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';

if (!$identifier || !$senha) {
    echo json_encode([
        'success' => false,
        'message' => 'Informe usuário/email e senha'
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT id, usuario, nome, email FROM usuarios WHERE (email = ? OR usuario = ?) AND senha = ?");
$stmt->bind_param("sss", $identifier, $identifier, $senha);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Email ou senha incorretos'
    ]);
    exit;
}

$user = $result->fetch_assoc();

echo json_encode([
    'success' => true,
    'message' => 'Login realizado com sucesso',
    'user' => $user
]);
?>
