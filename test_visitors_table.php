<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Test database connection
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if visitors table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'visitors'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        // Create the table if it doesn't exist
        $sql = file_get_contents('sql/visitors.sql');
        $pdo->exec($sql);
        echo json_encode([
            'status' => 'success',
            'message' => 'Visitors table created successfully'
        ]);
    } else {
        // Test inserting a record
        $testId = 'test_' . uniqid();
        $stmt = $pdo->prepare("
            INSERT INTO visitors (id, page, last_activity) 
            VALUES (:id, :page, NOW())
        ");
        $stmt->execute([
            ':id' => $testId,
            ':page' => '/test'
        ]);
        
        // Test selecting records
        $stmt = $pdo->query("SELECT * FROM visitors LIMIT 1");
        $record = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Clean up test record
        $pdo->exec("DELETE FROM visitors WHERE id = '$testId'");
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Visitors table exists and is working correctly',
            'sample_record' => $record
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'General error: ' . $e->getMessage()
    ]);
} 