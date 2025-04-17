<?php
require_once 'config.php';

try {
    // Odczytaj zawartość pliku SQL
    $sql = file_get_contents('create_tables.sql');
    
    // Wykonaj zapytania SQL
    $pdo->exec($sql);
    
    echo "Tabele zostały utworzone pomyślnie!\n";
    
} catch(PDOException $e) {
    die("Błąd podczas tworzenia tabel: " . $e->getMessage() . "\n");
} 