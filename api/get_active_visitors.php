<?php
require_once '../config.php';

header('Content-Type: application/json');

try {
    // Pobierz aktywnych odwiedzających z ostatnich 5 minut
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT ip_address) as active_visitors,
            COUNT(*) as total_views,
            page_url,
            MAX(visit_timestamp) as last_visit
        FROM visitor_tracking 
        WHERE visit_timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        GROUP BY page_url
        ORDER BY last_visit DESC
    ");

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Pobierz sumaryczne statystyki
    $totalStmt = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT ip_address) as total_active_visitors,
            COUNT(*) as total_page_views
        FROM visitor_tracking 
        WHERE visit_timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    ");

    $totalStmt->execute();
    $totals = $totalStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'active_pages' => $results,
            'totals' => $totals
        ]
    ]);

} catch (Exception $e) {
    error_log('Error getting active visitors: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Wystąpił błąd podczas pobierania danych o aktywnych odwiedzających'
    ]);
} 