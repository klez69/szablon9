<?php
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/visitor_tracking.log');

// Set CORS and JSON headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Function to log errors with more detail
function logError($message, $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' Context: ' . json_encode($context) : '';
    $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
    $caller = isset($backtrace[1]) ? basename($backtrace[1]['file']) . ':' . $backtrace[1]['line'] : 'unknown';
    $logMessage = "[$timestamp] [$caller] $message$contextStr\n";
    error_log($logMessage, 3, __DIR__ . '/logs/visitor_tracking.log');
}

// Function to check and create table
function ensureTableExists($pdo) {
    try {
        // Create logs directory if it doesn't exist
        if (!file_exists(__DIR__ . '/logs')) {
            mkdir(__DIR__ . '/logs', 0755, true);
        }

        // Check if table exists
        $sql = "SHOW TABLES LIKE 'visitors'";
        $result = $pdo->query($sql);
        
        if ($result->rowCount() === 0) {
            // Create table if it doesn't exist
            $sql = "CREATE TABLE IF NOT EXISTS visitors (
                id VARCHAR(50) PRIMARY KEY,
                page_url TEXT NOT NULL,
                referrer TEXT,
                user_agent VARCHAR(255),
                screen_resolution VARCHAR(20),
                language VARCHAR(10),
                ip_address VARCHAR(45),
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_last_activity (last_activity)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $pdo->exec($sql);
            logError("Created visitors table successfully");
            return true;
        }
        return true;
    } catch (PDOException $e) {
        logError("Database error ensuring table exists: " . $e->getMessage(), [
            'error_code' => $e->getCode(),
            'sql_state' => $e->errorInfo[0] ?? null
        ]);
        return false;
    } catch (Exception $e) {
        logError("Error ensuring table exists: " . $e->getMessage());
        return false;
    }
}

// Function to clean old entries (older than 5 minutes)
function cleanOldVisitors($pdo) {
    try {
        $sql = "DELETE FROM visitors WHERE last_activity < DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute();
        
        if ($result) {
            $rowCount = $stmt->rowCount();
            logError("Cleaned {$rowCount} old visitor records");
        }
        
        return true;
    } catch (PDOException $e) {
        logError("Failed to clean old visitors: " . $e->getMessage(), [
            'error_code' => $e->getCode(),
            'sql_state' => $e->errorInfo[0] ?? null
        ]);
        return false;
    }
}

// Function to get active visitors
function getVisitors($pdo) {
    try {
        // First check if table exists
        if (!ensureTableExists($pdo)) {
            throw new Exception("Visitors table does not exist");
        }
        
        // Clean old entries
        cleanOldVisitors($pdo);
        
        // Get active visitors
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

// Function to update visitor status
function updateVisitor($pdo, $page) {
    try {
        // Pobierz dane JSON z żądania
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);
        
        if (!$data) {
            throw new Exception('Nieprawidłowe dane JSON');
        }

        // Pobierz IP użytkownika
        $ip_address = $_SERVER['REMOTE_ADDR'];
        
        // Przygotuj zapytanie SQL
        $sql = "INSERT INTO visitors (page_url, referrer, user_agent, screen_resolution, language, ip_address, last_activity) 
                VALUES (:page_url, :referrer, :user_agent, :screen_resolution, :language, :ip_address, NOW())
                ON DUPLICATE KEY UPDATE 
                    page_url = VALUES(page_url),
                    referrer = VALUES(referrer),
                    user_agent = VALUES(user_agent),
                    screen_resolution = VALUES(screen_resolution),
                    language = VALUES(language),
                    ip_address = VALUES(ip_address),
                    last_activity = NOW()";
        
        $stmt = $pdo->prepare($sql);
        
        // Wykonaj zapytanie z parametrami
        $result = $stmt->execute([
            ':page_url' => $data['page_url'],
            ':referrer' => $data['referrer'],
            ':user_agent' => $data['user_agent'],
            ':screen_resolution' => $data['screen_resolution'],
            ':language' => $data['language'],
            ':ip_address' => $ip_address
        ]);
        
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            throw new Exception('Błąd podczas aktualizacji danych');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Handle requests
try {
    // Test database connection
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'get':
            echo json_encode(getVisitors($pdo));
            break;
            
        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            $page = $data['page'] ?? '/';
            updateVisitor($pdo, $page);
            break;
            
        default:
            throw new Exception('Invalid action specified. Expected "get" or "update", got: ' . $action);
    }
} catch (PDOException $e) {
    logError("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'A database error occurred'
    ]);
} catch (Exception $e) {
    logError("API Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 