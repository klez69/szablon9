<?php
require_once 'config.php';

header('Content-Type: application/json');

// Funkcja do logowania błędów
function logError($message, $context = []) {
    $errorLog = date('Y-m-d H:i:s') . " - " . $message . "\n";
    if (!empty($context)) {
        $errorLog .= "Kontekst: " . json_encode($context, JSON_UNESCAPED_UNICODE) . "\n";
    }
    error_log($errorLog, 3, __DIR__ . '/logs/gallery_errors.log');
}

// Pobieranie wszystkich zdjęć
function getGallery() {
    global $pdo;
    
    try {
        // Sprawdź czy tabela istnieje
        $tableExists = $pdo->query("SHOW TABLES LIKE 'gallery'")->rowCount() > 0;
        
        if (!$tableExists) {
            error_log("Tabela 'gallery' nie istnieje. Próba utworzenia...", 3, __DIR__ . '/logs/db_errors.log');
            
            // Załaduj i wykonaj SQL do utworzenia tabeli
            $sql = file_get_contents(__DIR__ . '/create_gallery_table.sql');
            $pdo->exec($sql);
            
            error_log("Tabela 'gallery' została utworzona pomyślnie.", 3, __DIR__ . '/logs/db_errors.log');
            
            // Zaimportuj przykładowe dane
            define('IMPORTING_DATA', true);
            require_once __DIR__ . '/create_gallery_table.php';
        }
        
        // Pobierz dane z tabeli
        $stmt = $pdo->query("SELECT * FROM gallery ORDER BY created_at DESC");
        $gallery = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'data' => $gallery ?: [] // Zwróć pustą tablicę jeśli brak danych
        ];
        
    } catch (PDOException $e) {
        $error = "Błąd podczas pobierania danych z galerii: " . $e->getMessage();
        error_log($error, 3, __DIR__ . '/logs/db_errors.log');
        
        return [
            'success' => false,
            'error' => $error,
            'data' => [] // Zawsze zwracamy tablicę data, nawet w przypadku błędu
        ];
    }
}

// Dodawanie nowego zdjęcia
function addGalleryItem($data) {
    global $pdo;
    try {
        // Walidacja danych
        if (empty($data['title']) || empty($data['category']) || empty($data['image_src'])) {
            return ['success' => false, 'error' => 'Brakujące wymagane pola'];
        }

        // Walidacja kategorii
        $validCategories = ['women', 'men', 'color', 'special'];
        if (!in_array($data['category'], $validCategories)) {
            return ['success' => false, 'error' => 'Nieprawidłowa kategoria'];
        }

        $stmt = $pdo->prepare("
            INSERT INTO gallery (title, description, category, image_src, alt_text)
            VALUES (:title, :description, :category, :image_src, :alt_text)
        ");
        
        $result = $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':category' => $data['category'],
            ':image_src' => $data['image_src'],
            ':alt_text' => $data['alt_text'] ?? ''
        ]);

        if ($result) {
            return ['success' => true, 'id' => $pdo->lastInsertId()];
        } else {
            logError("Błąd podczas dodawania zdjęcia", ['data' => $data]);
            return ['success' => false, 'error' => 'Nie udało się dodać zdjęcia'];
        }
    } catch(PDOException $e) {
        logError("Błąd bazy danych podczas dodawania zdjęcia: " . $e->getMessage(), ['data' => $data]);
        return ['success' => false, 'error' => 'Wystąpił błąd podczas zapisywania danych'];
    }
}

// Aktualizacja zdjęcia
function updateGalleryItem($id, $data) {
    global $pdo;
    try {
        // Walidacja danych
        if (empty($id) || empty($data['title']) || empty($data['category'])) {
            return ['success' => false, 'error' => 'Brakujące wymagane pola'];
        }

        // Walidacja kategorii
        $validCategories = ['women', 'men', 'color', 'special'];
        if (!in_array($data['category'], $validCategories)) {
            return ['success' => false, 'error' => 'Nieprawidłowa kategoria'];
        }

        $stmt = $pdo->prepare("
            UPDATE gallery 
            SET title = :title,
                description = :description,
                category = :category,
                image_src = :image_src,
                alt_text = :alt_text
            WHERE id = :id
        ");
        
        $result = $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':category' => $data['category'],
            ':image_src' => $data['image_src'],
            ':alt_text' => $data['alt_text'] ?? ''
        ]);

        if ($result) {
            return ['success' => true];
        } else {
            logError("Błąd podczas aktualizacji zdjęcia", ['id' => $id, 'data' => $data]);
            return ['success' => false, 'error' => 'Nie udało się zaktualizować zdjęcia'];
        }
    } catch(PDOException $e) {
        logError("Błąd bazy danych podczas aktualizacji zdjęcia: " . $e->getMessage(), ['id' => $id, 'data' => $data]);
        return ['success' => false, 'error' => 'Wystąpił błąd podczas aktualizacji danych'];
    }
}

// Usuwanie zdjęcia
function deleteGalleryItem($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($result) {
            return ['success' => true];
        } else {
            logError("Błąd podczas usuwania zdjęcia", ['id' => $id]);
            return ['success' => false, 'error' => 'Nie udało się usunąć zdjęcia'];
        }
    } catch(PDOException $e) {
        logError("Błąd bazy danych podczas usuwania zdjęcia: " . $e->getMessage(), ['id' => $id]);
        return ['success' => false, 'error' => 'Wystąpił błąd podczas usuwania zdjęcia'];
    }
}

// Obsługa żądań
$action = $_GET['action'] ?? '';
$response = ['success' => false, 'error' => 'Nieznana akcja'];

try {
    // Logowanie otrzymanych danych
    $input = file_get_contents('php://input');
    logError("Otrzymane dane: " . $input, ['action' => $action]);

    switch($action) {
        case 'get':
            $response = getGallery();
            break;
        
        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                // Logowanie danych przed dodaniem
                logError("Dane przed dodaniem:", $data);
                
                // Sprawdź kategorię
                if (!isset($data['category']) || !in_array($data['category'], ['women', 'men', 'color', 'special'])) {
                    $response = ['success' => false, 'error' => 'Nieprawidłowa kategoria: ' . ($data['category'] ?? 'brak')];
                    break;
                }
                
                $response = addGalleryItem($data);
            } else {
                $response = ['success' => false, 'error' => 'Nieprawidłowe dane wejściowe'];
            }
            break;
        
        case 'update':
            $id = $_GET['id'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            if ($id && $data) {
                // Logowanie danych przed aktualizacją
                logError("Dane przed aktualizacją:", ['id' => $id, 'data' => $data]);
                
                // Sprawdź kategorię
                if (!isset($data['category']) || !in_array($data['category'], ['women', 'men', 'color', 'special'])) {
                    $response = ['success' => false, 'error' => 'Nieprawidłowa kategoria: ' . ($data['category'] ?? 'brak')];
                    break;
                }
                
                $response = updateGalleryItem($id, $data);
            } else {
                $response = ['success' => false, 'error' => 'Nieprawidłowe dane wejściowe'];
            }
            break;
        
        case 'delete':
            $id = $_GET['id'] ?? 0;
            if ($id) {
                $response = deleteGalleryItem($id);
            } else {
                $response = ['success' => false, 'error' => 'Nie podano ID'];
            }
            break;
        default:
            logError("Nieznana akcja: " . $action);
            $response = ['success' => false, 'error' => 'Nieznana akcja'];
    }
} catch (Exception $e) {
    logError("Nieobsłużony błąd: " . $e->getMessage());
    $response = ['success' => false, 'error' => 'Wystąpił błąd podczas przetwarzania żądania'];
}

// Logowanie odpowiedzi
logError("Odpowiedź:", $response);

// Wyślij odpowiedź JSON
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit();