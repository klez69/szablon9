<?php
if (!defined('IMPORTING_DATA')) {
    require_once 'config.php';
}

try {
    // Upewnij się, że katalog logs istnieje
    if (!file_exists(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0777, true);
    }

    // Sprawdź czy tabela istnieje
    $tableExists = $pdo->query("SHOW TABLES LIKE 'gallery'")->rowCount() > 0;
    
    if (!$tableExists) {
        // Utwórz tabelę gallery
        $sql = "CREATE TABLE gallery (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            image_src VARCHAR(255) NOT NULL,
            alt_text VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($sql);
        
        // Dodaj przykładowe dane
        $sampleData = [
            [
                'title' => 'Nowoczesne strzyżenie z grzywką',
                'description' => 'Strzyżenie, modelowanie',
                'category' => 'women',
                'image_src' => '../images/4.jpg',
                'alt_text' => 'Stylowe strzyżenie damskie z grzywką'
            ],
            [
                'title' => 'Baleyage w ciepłych odcieniach',
                'description' => 'Koloryzacja, pielęgnacja',
                'category' => 'color',
                'image_src' => '../images/5.jpg',
                'alt_text' => 'Profesjonalna koloryzacja włosów'
            ]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO gallery (title, description, category, image_src, alt_text)
            VALUES (:title, :description, :category, :image_src, :alt_text)
        ");
        
        foreach ($sampleData as $data) {
            $stmt->execute($data);
        }
    }
    
    if (!defined('IMPORTING_DATA')) {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Tabela została utworzona pomyślnie']);
    }
    
} catch (PDOException $e) {
    $error = "Błąd: " . $e->getMessage();
    error_log($error, 3, __DIR__ . '/logs/db_errors.log');
    
    if (!defined('IMPORTING_DATA')) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => $error]);
    }
} 