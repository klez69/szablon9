<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

// Funkcja do logowania
function logUpload($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message . "\n";
    if ($data) {
        $log .= "Data: " . print_r($data, true) . "\n";
    }
    file_put_contents(__DIR__ . '/debug_upload.txt', $log, FILE_APPEND);
}

header('Content-Type: application/json');

try {
    logUpload("Rozpoczęcie uploadu", $_FILES);

    if (!isset($_FILES['image'])) {
        throw new Exception('Nie przesłano pliku');
    }

    $file = $_FILES['image'];
    $fileName = $file['name'];
    $fileType = $file['type'];
    $fileTmpName = $file['tmp_name'];
    $fileError = $file['error'];
    $fileSize = $file['size'];

    // Sprawdź błędy uploadu
    if ($fileError !== UPLOAD_ERR_OK) {
        throw new Exception("Błąd podczas uploadu: " . $fileError);
    }

    // Sprawdź typ pliku
    if (!in_array($fileType, ['image/jpeg', 'image/png', 'image/gif'])) {
        throw new Exception("Niedozwolony typ pliku: " . $fileType);
    }

    // Sprawdź rozmiar (max 5MB)
    if ($fileSize > 5 * 1024 * 1024) {
        throw new Exception("Plik jest za duży (max 5MB)");
    }

    // Utwórz folder uploads jeśli nie istnieje
    $uploadDir = __DIR__ . '/images/uploads/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception("Nie można utworzyć katalogu images/uploads");
        }
        // Dodaj plik .htaccess dla bezpieczeństwa
        file_put_contents($uploadDir . '.htaccess', "Options -Indexes\nAllow from all");
    }

    // Sprawdź uprawnienia do zapisu
    if (!is_writable($uploadDir)) {
        throw new Exception("Brak uprawnień do zapisu w katalogu images/uploads");
    }

    // Generuj unikalną nazwę pliku
    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
    $newFileName = uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $newFileName;
    $dbImagePath = 'images/uploads/' . $newFileName; // Zaktualizowana ścieżka względna do bazy danych

    logUpload("Próba przeniesienia pliku", [
        'source' => $fileTmpName,
        'target' => $targetPath,
        'permissions' => substr(sprintf('%o', fileperms($uploadDir)), -4)
    ]);

    // Przenieś plik
    if (!move_uploaded_file($fileTmpName, $targetPath)) {
        throw new Exception("Nie udało się przenieść pliku. Sprawdź uprawnienia katalogu.");
    }

    // Zwróć sukces i ścieżkę do pliku
    $response = [
        'success' => true,
        'message' => 'Plik został przesłany pomyślnie',
        'file_path' => $dbImagePath
    ];

    logUpload("Upload zakończony sukcesem", $response);
    echo json_encode($response);

    $data = [
        ':title' => $_POST['title'] ?? 'Nowe zdjęcie',
        ':description' => $_POST['description'] ?? 'Opis zostanie dodany',
        ':category' => $_POST['category'] ?? 'other',
        ':image_src' => $dbImagePath,
        ':alt_text' => $_POST['alt_text'] ?? $_POST['title'] ?? $file['name']
    ];

} catch (Exception $e) {
    $error = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    logUpload("Błąd: " . $e->getMessage());
    http_response_code(500);
    echo json_encode($error);
} 