<?php
// Konfiguracja środowiska
define('ENVIRONMENT', 'development'); // Zmień na 'production' dla wersji produkcyjnej

// Konfiguracja raportowania błędów
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
    ini_set('display_errors', 0);
}

// Włączenie logowania błędów dla wszystkich środowisk
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

// Konfiguracja bazy danych
define('DB_HOST', 'mysql7.ibc.pl');
define('DB_USER', 'admin5829_salon');
define('DB_PASS', 'y2G}z0D,i2');
define('DB_NAME', 'baza5829_salon');
define('DB_PORT', 3306);

// Niestandardowy handler błędów
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    $timestamp = date('Y-m-d H:i:s');
    $errorTypes = [
        E_ERROR => 'Błąd krytyczny',
        E_WARNING => 'Ostrzeżenie',
        E_PARSE => 'Błąd parsowania',
        E_NOTICE => 'Informacja',
        E_USER_ERROR => 'Błąd użytkownika',
        E_USER_WARNING => 'Ostrzeżenie użytkownika',
        E_USER_NOTICE => 'Informacja użytkownika'
    ];
    
    $errorType = isset($errorTypes[$errno]) ? $errorTypes[$errno] : 'Nieznany błąd';
    
    $message = sprintf(
        "[%s] %s: %s\nPlik: %s\nLinia: %d\n",
        $timestamp,
        $errorType,
        $errstr,
        $errfile,
        $errline
    );
    
    error_log($message, 3, __DIR__ . '/logs/custom_errors.log');
    
    if (ENVIRONMENT === 'development') {
        echo '<div style="color: red; background-color: #ffebee; padding: 10px; margin: 10px; border: 1px solid #ef9a9a;">';
        echo nl2br(htmlspecialchars($message));
        echo '</div>';
    }
    return true;
}

// Ustawienie niestandardowego handlera błędów
set_error_handler('customErrorHandler');

try {
    // Utworzenie katalogu logów jeśli nie istnieje
    if (!file_exists(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0755, true);
    }
    
    // Połączenie z bazą danych z ulepszoną obsługą błędów
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    $errorMessage = "Błąd połączenia z bazą danych: " . $e->getMessage();
    error_log($errorMessage, 3, __DIR__ . '/logs/db_errors.log');
    
    if (ENVIRONMENT === 'development') {
        throw new Exception($errorMessage);
    } else {
        die('Przepraszamy, wystąpił błąd połączenia z bazą danych. Prosimy spróbować później.');
    }
}

// Konfiguracja sesji
ini_set('session.gc_maxlifetime', 3600); // 1 godzina
session_set_cookie_params([
    'lifetime' => 3600,
    'path' => '/',
    'secure' => true,    // Tylko przez HTTPS
    'httponly' => true,  // Niedostępne przez JavaScript
    'samesite' => 'Strict' // Ochrona przed CSRF
]);