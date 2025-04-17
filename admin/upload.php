<?php
// Włącz raportowanie wszystkich błędów
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Funkcja do debugowania
function debug_to_file($message, $data = null) {
    $debug_file = __DIR__ . '/debug.txt';
    $log = date('Y-m-d H:i:s') . " - " . $message . "\n";
    if ($data !== null) {
        $log .= "Data: " . print_r($data, true) . "\n";
    }
    file_put_contents($debug_file, $log, FILE_APPEND);
}

// Loguj początek skryptu
debug_to_file("Script started");

// Sprawdź czy mamy dostęp do katalogu
$upload_dir = __DIR__ . "/../images/uploads/";
if (!file_exists($upload_dir)) {
    debug_to_file("Creating upload directory");
    mkdir($upload_dir, 0777, true);
}
debug_to_file("Upload directory status", [
    'path' => $upload_dir,
    'exists' => file_exists($upload_dir),
    'writable' => is_writable($upload_dir)
]);

try {
    // Próba połączenia z bazą danych
    require_once '../config.php';
    debug_to_file("Config file included");

    // Test połączenia z bazą
    $test = $pdo->query('SELECT 1');
    debug_to_file("Database connection successful");
} catch (Exception $e) {
    debug_to_file("Database connection error", $e->getMessage());
    die(json_encode(['success' => false, 'message' => 'Database connection error: ' . $e->getMessage()]));
}

// Sprawdź czy mamy plik
debug_to_file("FILES array content", $_FILES);

if (!isset($_FILES['image'])) {
    debug_to_file("No file uploaded");
    die(json_encode(['success' => false, 'message' => 'No file uploaded']));
}

$file = $_FILES['image'];
debug_to_file("File information", $file);

// Sprawdź błędy uploadu
if ($file['error'] !== UPLOAD_ERR_OK) {
    debug_to_file("Upload error", $file['error']);
    die(json_encode(['success' => false, 'message' => 'Upload error: ' . $file['error']]));
}

// Generuj unikalną nazwę pliku
$file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$new_filename = 'upload_' . time() . '_' . mt_rand(1000, 9999) . '.' . $file_extension;
$target_file = $upload_dir . $new_filename;
$db_file_path = 'images/uploads/' . $new_filename;

debug_to_file("File paths", [
    'target_file' => $target_file,
    'db_file_path' => $db_file_path
]);

// Przenieś plik
if (!move_uploaded_file($file['tmp_name'], $target_file)) {
    debug_to_file("Failed to move uploaded file");
    die(json_encode(['success' => false, 'message' => 'Failed to move uploaded file']));
}

debug_to_file("File moved successfully");

try {
    // Próba zapisu do bazy danych
    $stmt = $pdo->prepare("
        INSERT INTO gallery (title, description, category, image_src, alt_text)
        VALUES (:title, :description, :category, :image_src, :alt_text)
    ");

    $data = [
        ':title' => 'Nowe zdjęcie',
        ':description' => 'Opis zostanie dodany',
        ':category' => 'other',
        ':image_src' => $db_file_path,
        ':alt_text' => $file['name']
    ];

    debug_to_file("Attempting database insert", $data);

    if (!$stmt->execute($data)) {
        $error = $stmt->errorInfo();
        debug_to_file("Database insert error", $error);
        throw new Exception("Database error: " . implode(" ", $error));
    }

    $id = $pdo->lastInsertId();
    debug_to_file("Database insert successful", ['id' => $id]);

    $response = [
        'success' => true,
        'message' => 'File uploaded and saved to database successfully',
        'file_path' => $db_file_path,
        'id' => $id
    ];

    debug_to_file("Success response", $response);
    echo json_encode($response);

} catch (Exception $e) {
    debug_to_file("Final error", $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 