<?php
require_once '../config.php';

header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Get real IP address
function getClientIP() {
    $headers = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = trim(explode(',', $_SERVER[$header])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'];
}

try {
    // Prepare the SQL statement
    $stmt = $pdo->prepare("
        INSERT INTO visitor_tracking (
            page_url,
            referrer,
            user_agent,
            screen_resolution,
            language,
            visit_timestamp,
            ip_address
        ) VALUES (
            :page_url,
            :referrer,
            :user_agent,
            :screen_resolution,
            :language,
            :visit_timestamp,
            :ip_address
        )
    ");

    // Execute the statement with the data
    $result = $stmt->execute([
        'page_url' => $data['page_url'],
        'referrer' => $data['referrer'],
        'user_agent' => $data['user_agent'],
        'screen_resolution' => $data['screen_resolution'],
        'language' => $data['language'],
        'visit_timestamp' => $data['visit_timestamp'],
        'ip_address' => getClientIP()
    ]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Visit tracked successfully']);
    } else {
        throw new Exception('Failed to insert tracking data');
    }
} catch (Exception $e) {
    error_log('Visitor tracking error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
} 