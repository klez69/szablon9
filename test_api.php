<?php
// Włącz wyświetlanie błędów
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Funkcja do testowania API
function testGalleryApi() {
    echo "=== Test API Galerii ===\n\n";
    
    // Test połączenia z bazą danych
    require_once 'config.php';
    echo "Połączenie z bazą danych: OK\n\n";
    
    // Test pobierania danych
    $url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/gallery_api.php?action=get';
    echo "Testowanie URL: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    echo "Kod odpowiedzi HTTP: $httpCode\n\n";
    
    if ($response === false) {
        echo "BŁĄD: " . curl_error($ch) . "\n";
    } else {
        $data = json_decode($response, true);
        echo "Odpowiedź API:\n";
        print_r($data);
    }
    
    curl_close($ch);
    
    // Test bezpośredniego zapytania do bazy
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM gallery");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\nLiczba rekordów w bazie: " . $result['count'] . "\n";
        
        $stmt = $pdo->query("SELECT * FROM gallery LIMIT 1");
        $sample = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\nPrzykładowy rekord:\n";
        print_r($sample);
        
    } catch (PDOException $e) {
        echo "BŁĄD bazy danych: " . $e->getMessage() . "\n";
    }
}

// Uruchom test
testGalleryApi(); 