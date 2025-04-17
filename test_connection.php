<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

try {
    // Sprawdź czy połączenie jest aktywne
    if ($pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS)) {
        echo "Status połączenia: " . $pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS) . "\n";
    }
    
    // Sprawdź wersję serwera
    $version = $pdo->query('SELECT version()')->fetchColumn();
    echo "Wersja MySQL: " . $version . "\n";
    
    // Sprawdź uprawnienia użytkownika
    $grants = $pdo->query('SHOW GRANTS')->fetchAll(PDO::FETCH_COLUMN);
    echo "\nUprawnienia użytkownika:\n";
    foreach ($grants as $grant) {
        echo "- " . $grant . "\n";
    }
    
    // Sprawdź dostępne bazy danych
    $databases = $pdo->query('SHOW DATABASES')->fetchAll(PDO::FETCH_COLUMN);
    echo "\nDostępne bazy danych:\n";
    foreach ($databases as $database) {
        echo "- " . $database . "\n";
    }
    
    // Sprawdź czy tabela gallery istnieje
    $tables = $pdo->query("SHOW TABLES LIKE 'gallery'")->fetchAll();
    if (count($tables) > 0) {
        echo "\nTabela 'gallery' istnieje\n";
        
        // Pokaż strukturę tabeli
        $columns = $pdo->query("SHOW COLUMNS FROM gallery")->fetchAll();
        echo "Struktura tabeli:\n";
        foreach ($columns as $column) {
            echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
        }
    } else {
        echo "\nTabela 'gallery' nie istnieje\n";
    }
    
} catch (PDOException $e) {
    echo "Błąd podczas testowania połączenia:\n";
    echo "Kod błędu: " . $e->getCode() . "\n";
    echo "Komunikat: " . $e->getMessage() . "\n";
} 