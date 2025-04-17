<?php
require_once 'config.php';

try {
    // Pobierz wszystkie rekordy z tabeli gallery
    $stmt = $pdo->query("SELECT id, image_src FROM gallery");
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Znaleziono " . count($records) . " rekordów.\n";
    
    // Przygotuj zapytanie do aktualizacji
    $updateStmt = $pdo->prepare("UPDATE gallery SET image_src = :image_src WHERE id = :id");
    
    foreach ($records as $record) {
        $currentPath = $record['image_src'];
        $id = $record['id'];
        
        // Sprawdź czy ścieżka zaczyna się od 'images/'
        if (strpos($currentPath, 'images/') !== 0) {
            // Jeśli nie, dodaj prefix 'images/'
            $newPath = 'images/' . basename($currentPath);
            
            // Sprawdź czy plik istnieje
            if (file_exists(__DIR__ . '/' . $newPath)) {
                try {
                    $updateStmt->execute([
                        ':image_src' => $newPath,
                        ':id' => $id
                    ]);
                    echo "Zaktualizowano ścieżkę dla ID $id: $currentPath -> $newPath\n";
                } catch (PDOException $e) {
                    echo "Błąd podczas aktualizacji rekordu $id: " . $e->getMessage() . "\n";
                }
            } else {
                echo "UWAGA: Plik nie istnieje: $newPath (ID: $id)\n";
            }
        } else {
            echo "Ścieżka jest poprawna dla ID $id: $currentPath\n";
        }
    }
    
    echo "\nZakończono sprawdzanie i naprawę ścieżek.\n";
    
} catch (PDOException $e) {
    echo "Błąd bazy danych: " . $e->getMessage() . "\n";
    error_log("Błąd bazy danych: " . $e->getMessage(), 3, __DIR__ . '/logs/db_errors.log');
} 