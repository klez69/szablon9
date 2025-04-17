<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test połączenia z bazą danych...\n\n";

// Dane połączenia
$host = 'mysql7.ibc.pl';
$db   = 'baza5829_salon';
$user = 'admin5829_salon';
$pass = 'y2G}z0D,i2';
$port = 3306;

echo "Próba połączenia z:\n";
echo "Host: $host\n";
echo "Baza: $db\n";
echo "Port: $port\n";
echo "Użytkownik: $user\n\n";

// Test połączenia przez socket
echo "Test 1: Sprawdzanie dostępności portu...\n";
$socket = @fsockopen($host, $port, $errno, $errstr, 5);
if ($socket) {
    echo "OK: Port $port jest dostępny\n";
    fclose($socket);
} else {
    echo "BŁĄD: Nie można połączyć się z portem $port\n";
    echo "Komunikat: $errstr (kod: $errno)\n";
}

echo "\nTest 2: Próba połączenia przez PDO...\n";
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "OK: Połączenie PDO ustanowione\n";
    
    $stmt = $pdo->query("SELECT VERSION()");
    $version = $stmt->fetchColumn();
    echo "Wersja MySQL: $version\n";
    
} catch (PDOException $e) {
    echo "BŁĄD: " . $e->getMessage() . "\n";
    echo "Kod błędu: " . $e->getCode() . "\n";
}

echo "\nTest 3: Sprawdzanie tabeli gallery...\n";
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'gallery'");
    $exists = $stmt->rowCount() > 0;
    
    if ($exists) {
        echo "OK: Tabela gallery istnieje\n";
        
        $stmt = $pdo->query("SELECT COUNT(*) FROM gallery");
        $count = $stmt->fetchColumn();
        echo "Liczba rekordów w tabeli: $count\n";
    } else {
        echo "UWAGA: Tabela gallery nie istnieje\n";
    }
} catch (PDOException $e) {
    echo "BŁĄD: " . $e->getMessage() . "\n";
} 