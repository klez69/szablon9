<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*'));
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: false');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

if (!$data) {
    error_log('Invalid JSON data received: ' . $rawData);
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$requiredFields = ['page_url', 'referrer', 'user_agent', 'screen_resolution', 'language', 'visit_timestamp'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field])) {
        error_log('Missing required field: ' . $field);
        http_response_code(400);
        echo json_encode(['error' => 'Missing required field: ' . $field]);
        exit;
    }
}

// Anonymize IP address
function anonymizeIP($ip) {
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return preg_replace('/\d+$/', '0', $ip);
    } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        return substr($ip, 0, strrpos($ip, ':')) . ':0000';
    }
    return 'unknown';
}

// Get and anonymize IP address
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
$anonymizedIP = anonymizeIP($ip);

try {
    // Verify database connection
    if (!isset($pdo)) {
        throw new Exception('Database connection not established');
    }

    // Clean and sanitize data
    $cleanData = [
        'page_url' => filter_var($data['page_url'], FILTER_SANITIZE_URL),
        'referrer' => filter_var($data['referrer'], FILTER_SANITIZE_URL),
        'user_agent' => substr(strip_tags($data['user_agent']), 0, 255),
        'screen_resolution' => preg_replace('/[^0-9x]/', '', $data['screen_resolution']),
        'language' => substr(preg_replace('/[^a-zA-Z\-]/', '', $data['language']), 0, 10),
        'visit_timestamp' => date('Y-m-d H:i:s', strtotime($data['visit_timestamp'])),
        'ip_address' => $anonymizedIP
    ];

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

    // Execute the statement with the cleaned data
    $result = $stmt->execute($cleanData);

    if ($result) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Visit tracked successfully']);
    } else {
        throw new Exception('Failed to insert tracking data');
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
} catch (Exception $e) {
    error_log('Visitor tracking error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
} 