<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['capa']) || $_FILES['capa']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            'success' => false,
            'message' => 'Nenhum arquivo foi enviado ou ocorreu um erro no upload'
        ]);
        exit;
    }

    $file = $_FILES['capa'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];

    // Verificar extensão do arquivo
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png'];

    if (!in_array($fileExt, $allowed)) {
        echo json_encode([
            'success' => false,
            'message' => 'Apenas arquivos JPG, JPEG e PNG são permitidos'
        ]);
        exit;
    }

    // Verificar tamanho (máximo 5MB)
    if ($fileSize > 5242880) {
        echo json_encode([
            'success' => false,
            'message' => 'O arquivo não pode ser maior que 5MB'
        ]);
        exit;
    }

    // Gerar nome único para o arquivo
    $newFileName = uniqid('capa_', true) . '.' . $fileExt;
    $uploadPath = '../uploads/' . $newFileName;

    // Mover arquivo para a pasta uploads
    if (move_uploaded_file($fileTmpName, $uploadPath)) {
        $fileUrl = 'http://localhost/scriba/home_scriba/uploads/' . $newFileName;

        echo json_encode([
            'success' => true,
            'message' => 'Upload realizado com sucesso',
            'url' => $fileUrl
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao salvar o arquivo'
        ]);
    }
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'Método não suportado'
]);
?>
