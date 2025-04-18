<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config.php';
require_once '../config/database.php';

// Function to create portfolio_items table if it doesn't exist
function createPortfolioItemsTable($pdo) {
    $sql = file_get_contents(__DIR__ . '/../sql/portfolio_items.sql');
    try {
        $pdo->exec($sql);
        error_log("[" . basename(__FILE__) . "] Portfolio items table created successfully");
        return true;
    } catch (PDOException $e) {
        error_log("[" . basename(__FILE__) . "] Error creating portfolio items table: " . $e->getMessage());
        return false;
    }
}

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'portfolio_items'");
    if ($stmt->rowCount() == 0) {
        // Jeśli tabela nie istnieje, uruchom skrypt konfiguracyjny
        require_once '../setup_database.php';
    }

    $stmt = $pdo->prepare("SELECT id, title, description, image_url, category, detail_url, created_at, updated_at FROM portfolio_items ORDER BY created_at DESC");
    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Przekształć ścieżki do obrazów na pełne URL-e
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
    $items = array_map(function($item) use ($baseUrl) {
        if (!filter_var($item['image_url'], FILTER_VALIDATE_URL)) {
            $item['image_url'] = $baseUrl . '/' . ltrim($item['image_url'], '/');
        }
        return $item;
    }, $items);

    echo json_encode([
        'success' => true,
        'items' => $items
    ]);

} catch (PDOException $e) {
    error_log("Database error in get-portfolio-items.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Wystąpił błąd podczas pobierania danych z bazy'
    ]);
} catch (Exception $e) {
    error_log("General error in get-portfolio-items.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Wystąpił nieoczekiwany błąd'
    ]);
} 