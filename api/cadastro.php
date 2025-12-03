<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

$usuario = $_POST['usuario'] ?? '';
$nome = $_POST['nome'] ?? '';
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

if (!$usuario || !$nome || !$email || !$senha) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos os campos são obrigatórios'
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? OR usuario = ?");
$stmt->bind_param("ss", $email, $usuario);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Email ou usuário já cadastrado!'
    ]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO usuarios (usuario, nome, email, senha) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao preparar a inserção: ' . $conn->error
    ]);
    exit;
}
$stmt->bind_param("ssss", $usuario, $nome, $email, $senha);
if (!$stmt->execute()) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao cadastrar usuário: ' . $stmt->error
    ]);
    exit;
}

$user_id = $conn->insert_id;

echo json_encode([
    'success' => true,
    'message' => 'Cadastro realizado com sucesso',
    'user' => [
        'id' => $user_id,
        'usuario' => $usuario,
        'nome' => $nome,
        'email' => $email
    ]
]);
?>
