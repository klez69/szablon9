<?php
function checkPermissions($path) {
    echo "Sprawdzanie uprawnień dla: $path\n";
    
    if (!file_exists($path)) {
        echo "BŁĄD: Ścieżka nie istnieje: $path\n";
        return;
    }
    
    // Sprawdź uprawnienia
    $perms = fileperms($path);
    $owner = fileowner($path);
    $group = filegroup($path);
    
    echo "Uprawnienia: " . substr(sprintf('%o', $perms), -4) . "\n";
    echo "Właściciel: " . $owner . "\n";
    echo "Grupa: " . $group . "\n";
    
    // Sprawdź czy PHP może czytać
    if (is_readable($path)) {
        echo "PHP może czytać: TAK\n";
    } else {
        echo "PHP może czytać: NIE\n";
    }
    
    // Sprawdź czy PHP może zapisywać
    if (is_writable($path)) {
        echo "PHP może zapisywać: TAK\n";
    } else {
        echo "PHP może zapisywać: NIE\n";
    }
    
    // Jeśli to katalog, sprawdź jego zawartość
    if (is_dir($path)) {
        echo "\nZawartość katalogu:\n";
        $files = scandir($path);
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                $fullPath = $path . DIRECTORY_SEPARATOR . $file;
                echo "\n$file:\n";
                echo "Uprawnienia: " . substr(sprintf('%o', fileperms($fullPath)), -4) . "\n";
                echo "Rozmiar: " . filesize($fullPath) . " bajtów\n";
            }
        }
    }
}

// Sprawdź katalogi
$directories = [
    __DIR__ . '/images',
    __DIR__ . '/images/uploads'
];

foreach ($directories as $dir) {
    echo "\n=== Sprawdzanie katalogu: $dir ===\n";
    checkPermissions($dir);
} 