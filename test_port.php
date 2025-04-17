<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

function testPort($host, $port = 3306, $timeout = 5) {
    echo "Próba połączenia z {$host}:{$port}...\n";
    
    $connection = @fsockopen($host, $port, $errno, $errstr, $timeout);
    
    if (is_resource($connection)) {
        echo "Port {$port} jest otwarty i dostępny\n";
        fclose($connection);
        return true;
    } else {
        echo "Nie można połączyć się z portem {$port}\n";
        echo "Błąd: {$errstr} (kod: {$errno})\n";
        return false;
    }
}

// Test połączenia
testPort(DB_HOST); 