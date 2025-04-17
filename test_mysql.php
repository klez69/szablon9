<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test połączenia z bazą danych (mysqli)...\n\n";

$host = 'mysql7.ibc.pl';
$db   = 'baza5829_salon';
$user = 'admin5829_salon';
$pass = 'y2G}z0D,i2';
$port = 3306;

echo "Konfiguracja:\n";
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Host: $host\n";
echo "Port: $port\n";
echo "Baza: $db\n";
echo "Użytkownik: $user\n\n";

// Test 1: Ping hosta
echo "Test 1: Ping hosta...\n";
exec("ping -n 1 " . $host, $output, $result);
echo implode("\n", $output) . "\n\n";

// Test 2: Połączenie przez mysqli
echo "Test 2: Próba połączenia przez mysqli...\n";
$mysqli = new mysqli($host, $user, $pass, $db, $port);

if ($mysqli->connect_errno) {
    echo "BŁĄD mysqli: " . $mysqli->connect_error . "\n";
    echo "Kod błędu: " . $mysqli->connect_errno . "\n";
    
    // Sprawdź czy to błąd dostępu
    if ($mysqli->connect_errno == 1045) {
        echo "Błąd dostępu - sprawdź nazwę użytkownika i hasło\n";
    }
    // Sprawdź czy to błąd połączenia
    else if ($mysqli->connect_errno == 2002) {
        echo "Nie można połączyć się z serwerem - sprawdź firewall i uprawnienia dostępu\n";
    }
    // Sprawdź czy baza istnieje
    else if ($mysqli->connect_errno == 1049) {
        echo "Baza danych nie istnieje\n";
    }
} else {
    echo "OK: Połączenie mysqli ustanowione\n";
    
    // Sprawdź wersję MySQL
    $version = $mysqli->get_server_info();
    echo "Wersja MySQL: $version\n";
    
    // Sprawdź uprawnienia użytkownika
    $result = $mysqli->query("SHOW GRANTS");
    if ($result) {
        echo "\nUprawnienia użytkownika:\n";
        while ($row = $result->fetch_row()) {
            echo "- " . $row[0] . "\n";
        }
    }
    
    // Sprawdź czy tabela istnieje
    $result = $mysqli->query("SHOW TABLES LIKE 'gallery'");
    if ($result->num_rows > 0) {
        echo "\nOK: Tabela gallery istnieje\n";
        
        // Sprawdź liczbę rekordów
        $result = $mysqli->query("SELECT COUNT(*) FROM gallery");
        $count = $result->fetch_row()[0];
        echo "Liczba rekordów: $count\n";
    } else {
        echo "\nUWAGA: Tabela gallery nie istnieje\n";
    }
    
    $mysqli->close();
} 