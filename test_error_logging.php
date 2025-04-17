<?php
require_once 'config.php';

// Test błędu PHP - niezdefiniowana zmienna
$niezdefiniowanaZmienna;  // To wygeneruje notice

// Test ostrzeżenia - próba odczytu nieistniejącego pliku
file_get_contents('nieistniejacy-plik.txt');  // To wygeneruje warning

// Test własnego handlera błędów
trigger_error("To jest testowy błąd użytkownika", E_USER_WARNING);

// Test połączenia z bazą danych (tylko w trybie development)
if (ENVIRONMENT === 'development') {
    try {
        // Test zapytania do nieistniejącej tabeli
        $pdo->query("SELECT * FROM nieistniejaca_tabela");
    } catch (PDOException $e) {
        error_log("Test błędu bazy danych: " . $e->getMessage());
    }
    
    // Test połączenia z bazą z błędnymi danymi
    try {
        $testDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=nieistniejaca_baza;charset=utf8mb4";
        $testPdo = new PDO($testDsn, DB_USER, DB_PASS);
    } catch (PDOException $e) {
        error_log("Test błędu połączenia: " . $e->getMessage());
    }
}

echo "Test logowania błędów zakończony. Sprawdź katalog logs, aby zobaczyć wyniki.\n";

// Wyświetl informacje o lokalizacji plików logów
echo "\nPliki logów znajdują się w następujących lokalizacjach:\n";
echo "- Błędy PHP: " . __DIR__ . "/logs/php_errors.log\n";
echo "- Błędy niestandardowe: " . __DIR__ . "/logs/custom_errors.log\n";
echo "- Błędy bazy danych: " . __DIR__ . "/logs/db_errors.log\n";
?> 