<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Listar todos os livros de um usuário
if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do usuário é obrigatório'
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM livros WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $livros = [];
    while ($row = $result->fetch_assoc()) {
        $livros[] = $row;
    }

    echo json_encode([
        'success' => true,
        'livros' => $livros
    ]);
    exit;
}

// POST - Adicionar novo livro
if ($method === 'POST') {
    $user_id = $_POST['user_id'] ?? null;
    $titulo = $_POST['titulo'] ?? '';
    $autor = $_POST['autor'] ?? '';
    $genre = $_POST['genre'] ?? '';
    $paginas = $_POST['paginas'] ?? null;
    $status = $_POST['status'] ?? 'Quero Ler';
    $capa = $_POST['capa'] ?? '';

    if (!$user_id || !$titulo || !$autor) {
        echo json_encode([
            'success' => false,
            'message' => 'Campos obrigatórios: user_id, titulo, autor'
        ]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO livros (user_id, titulo, autor, genre, paginas, status, capa) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssiis", $user_id, $titulo, $autor, $genre, $paginas, $status, $capa);
    $stmt->execute();

    $livro_id = $conn->insert_id;

    echo json_encode([
        'success' => true,
        'message' => 'Livro adicionado com sucesso',
        'livro' => [
            'id' => $livro_id,
            'user_id' => $user_id,
            'titulo' => $titulo,
            'autor' => $autor,
            'paginas' => $paginas,
            'status' => $status,
            'capa' => $capa
        ]
    ]);
    exit;
}

// PUT - Atualizar livro existente
if ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);

    $id = $_PUT['id'] ?? null;
    $titulo = $_PUT['titulo'] ?? '';
    $autor = $_PUT['autor'] ?? '';
    $genre = $_PUT['genre'] ?? '';
    $paginas = $_PUT['paginas'] ?? null;
    $current_page = $_PUT['current_page'] ?? 0;
    $status = $_PUT['status'] ?? 'Quero Ler';
    $capa = $_PUT['capa'] ?? '';

    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do livro é obrigatório'
        ]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE livros SET titulo = ?, autor = ?, genre = ?, paginas = ?, current_page = ?, status = ?, capa = ? WHERE id = ?");
    $stmt->bind_param("sssiissi", $titulo, $autor, $genre, $paginas, $current_page, $status, $capa, $id);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Livro atualizado com sucesso'
    ]);
    exit;
}

// DELETE - Remover livro
if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);

    $id = $_DELETE['id'] ?? null;

    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do livro é obrigatório'
        ]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM livros WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Livro removido com sucesso'
    ]);
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'Método não suportado'
]);
?>
