<?php
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/visitors_error.log');

// Ustaw nagłówki CORS i JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Funkcja do logowania błędów
function logError($message, $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' Context: ' . json_encode($context) : '';
    error_log("[$timestamp] $message$contextStr");
}

// Funkcja do sprawdzania i tworzenia tabeli
function ensureTableExists($pdo) {
    try {
        // Sprawdź czy tabela istnieje
        $stmt = $pdo->query("SHOW TABLES LIKE 'visitors'");
        if ($stmt->rowCount() === 0) {
            // Utwórz tabelę jeśli nie istnieje
            $sql = file_get_contents(__DIR__ . '/sql/visitors.sql');
            $pdo->exec($sql);
            logError("Created visitors table");
        }
        return true;
    } catch (PDOException $e) {
        logError("Failed to create/check visitors table: " . $e->getMessage());
        return false;
    }
}

// Funkcja do czyszczenia starych wpisów (starszych niż 5 minut)
function cleanOldVisitors($pdo) {
    try {
        $sql = "DELETE FROM visitors WHERE last_activity < DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return true;
    } catch (PDOException $e) {
        logError("Failed to clean old visitors: " . $e->getMessage());
        return false;
    }
}

// Funkcja do pobierania aktywnych odwiedzających
function getVisitors($pdo) {
    try {
        // Najpierw sprawdź czy tabela istnieje
        if (!ensureTableExists($pdo)) {
            throw new Exception("Visitors table does not exist");
        }
        
        // Wyczyść stare wpisy
        cleanOldVisitors($pdo);
        
        // Pobierz aktywnych odwiedzających
        $sql = "SELECT * FROM visitors ORDER BY last_activity DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        
        return [
            'status' => 'success',
            'visitors' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ];
    } catch (Exception $e) {
        logError("Failed to get visitors: " . $e->getMessage());
        throw $e;
    }
}

// Funkcja do aktualizacji statusu odwiedzającego
function updateVisitor($pdo, $page) {
    try {
        // Sprawdź czy tabela istnieje
        if (!ensureTableExists($pdo)) {
            throw new Exception("Visitors table does not exist");
        }
        
        // Generuj unikalny identyfikator sesji jeśli nie istnieje
        if (!isset($_COOKIE['visitor_id'])) {
            $visitor_id = uniqid('v_', true);
            setcookie('visitor_id', $visitor_id, time() + (86400 * 30), '/'); // Cookie ważne przez 30 dni
        } else {
            $visitor_id = $_COOKIE['visitor_id'];
        }
        
        // Spróbuj zaktualizować istniejący wpis
        $sql = "INSERT INTO visitors (id, page, last_activity) 
                VALUES (:id, :page, NOW()) 
                ON DUPLICATE KEY UPDATE 
                page = :page, 
                last_activity = NOW()";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $visitor_id,
            ':page' => $page
        ]);
        
        return [
            'status' => 'success',
            'visitor_id' => $visitor_id
        ];
    } catch (PDOException $e) {
        logError("Error updating visitor: " . $e->getMessage(), ['page' => $page]);
        throw $e;
    }
}

// Obsługa żądań
try {
    // Test database connection
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'get':
            echo json_encode(getVisitors($pdo));
            break;
            
        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            $page = $data['page'] ?? '/';
            echo json_encode(updateVisitor($pdo, $page));
            break;
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
} catch (PDOException $e) {
    logError("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    logError("API Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 