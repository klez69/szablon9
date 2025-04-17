<?php
require_once 'config.php';

try {
    // Check if table exists
    $tableExists = $pdo->query("SHOW TABLES LIKE 'gallery'")->rowCount() > 0;
    echo "Table exists: " . ($tableExists ? "Yes" : "No") . "\n";
    
    if ($tableExists) {
        // Check table structure
        $result = $pdo->query("DESCRIBE gallery");
        echo "\nTable structure:\n";
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            echo "{$row['Field']} - {$row['Type']}\n";
        }
        
        // Check record count
        $count = $pdo->query("SELECT COUNT(*) FROM gallery")->fetchColumn();
        echo "\nNumber of records: $count\n";
        
        if ($count > 0) {
            // Show sample records
            $records = $pdo->query("SELECT * FROM gallery LIMIT 3")->fetchAll();
            echo "\nSample records:\n";
            print_r($records);
        }
    } else {
        // Create table and import data from baza.js
        require_once 'create_gallery_table.php';
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    error_log("Database error: " . $e->getMessage(), 3, __DIR__ . '/logs/db_errors.log');
} 