<?php
// Ustawienia
$target_dir = "../images/uploads/"; // Katalog docelowy dla uploadu (względem tego pliku)
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Dozwolone typy plików
$max_file_size = 5 * 1024 * 1024; // 5MB - maksymalny rozmiar pliku
$compress_quality = 85; // Jakość kompresji dla obrazów JPG (0-100)
$resize_threshold = 1600; // Maksymalny wymiar obrazu w pikselach (szerokość/wysokość)

// Upewnij się, że katalog docelowy istnieje
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

// Przygotuj odpowiedź
$response = [
    'success' => false,
    'message' => '',
    'file_path' => ''
];

// Sprawdź czy mamy plik
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $response['message'] = 'Nie przesłano pliku lub wystąpił błąd podczas przesyłania.';
    echo json_encode($response);
    exit;
}

$file = $_FILES['image'];

// Sprawdź typ pliku
if (!in_array($file['type'], $allowed_types)) {
    $response['message'] = 'Niedozwolony typ pliku. Dozwolone są tylko pliki JPG, PNG, GIF i WEBP.';
    echo json_encode($response);
    exit;
}

// Sprawdź rozmiar pliku
if ($file['size'] > $max_file_size) {
    $response['message'] = 'Plik jest zbyt duży. Maksymalny rozmiar to 5MB.';
    echo json_encode($response);
    exit;
}

// Generuj unikalną nazwę pliku
$timestamp = time();
$file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$new_filename = 'upload_' . $timestamp . '_' . mt_rand(1000, 9999) . '.' . $file_extension;
$target_file = $target_dir . $new_filename;

// Sprawdź czy mamy do czynienia z obrazem
$image_info = getimagesize($file['tmp_name']);
if ($image_info === false) {
    $response['message'] = 'Przesłany plik nie jest prawidłowym obrazem.';
    echo json_encode($response);
    exit;
}

// Przeprowadź optymalizację obrazu
try {
    // Utwórz obraz źródłowy
    $source_image = null;
    $image_width = $image_info[0];
    $image_height = $image_info[1];
    $mime_type = $image_info['mime'];

    switch ($mime_type) {
        case 'image/jpeg':
            $source_image = imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
            $source_image = imagecreatefrompng($file['tmp_name']);
            break;
        case 'image/gif':
            $source_image = imagecreatefromgif($file['tmp_name']);
            break;
        case 'image/webp':
            $source_image = imagecreatefromwebp($file['tmp_name']);
            break;
        default:
            // Przenieś plik bez optymalizacji
            move_uploaded_file($file['tmp_name'], $target_file);
            break;
    }

    // Jeśli udało się utworzyć obraz źródłowy
    if ($source_image) {
        // Sprawdź, czy potrzebujemy zmienić rozmiar
        $resize_needed = ($image_width > $resize_threshold || $image_height > $resize_threshold);
        
        if ($resize_needed) {
            // Oblicz nowe wymiary z zachowaniem proporcji
            if ($image_width > $image_height) {
                $new_width = $resize_threshold;
                $new_height = intval($image_height * ($resize_threshold / $image_width));
            } else {
                $new_height = $resize_threshold;
                $new_width = intval($image_width * ($resize_threshold / $image_height));
            }
            
            // Utwórz nowy obraz o zmniejszonych wymiarach
            $resized_image = imagecreatetruecolor($new_width, $new_height);
            
            // Zachowaj przezroczystość dla PNG
            if ($mime_type === 'image/png') {
                imagealphablending($resized_image, false);
                imagesavealpha($resized_image, true);
                $transparent = imagecolorallocatealpha($resized_image, 255, 255, 255, 127);
                imagefilledrectangle($resized_image, 0, 0, $new_width, $new_height, $transparent);
            }
            
            // Przeskaluj obraz
            imagecopyresampled(
                $resized_image, 
                $source_image, 
                0, 0, 0, 0, 
                $new_width, $new_height, 
                $image_width, $image_height
            );
            
            // Zamień referencję obrazu
            imagedestroy($source_image);
            $source_image = $resized_image;
        }
        
        // Zapisz zoptymalizowany obraz
        switch ($mime_type) {
            case 'image/jpeg':
                imagejpeg($source_image, $target_file, $compress_quality);
                break;
            case 'image/png':
                // Kompresja PNG (0-9)
                $png_quality = floor((100 - $compress_quality) / 10);
                imagepng($source_image, $target_file, $png_quality);
                break;
            case 'image/gif':
                imagegif($source_image, $target_file);
                break;
            case 'image/webp':
                imagewebp($source_image, $target_file, $compress_quality);
                break;
        }
        
        // Zwolnij pamięć
        imagedestroy($source_image);
    } else {
        // Fallback - przenieś plik bez optymalizacji
        move_uploaded_file($file['tmp_name'], $target_file);
    }

    $response['success'] = true;
    $response['message'] = 'Plik został pomyślnie przesłany i zoptymalizowany.';
    $response['file_path'] = 'images/uploads/' . $new_filename;
} catch (Exception $e) {
    // Obsługa błędów - przenieś plik bez optymalizacji
    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        $response['success'] = true;
        $response['message'] = 'Plik został przesłany, ale wystąpił błąd podczas optymalizacji.';
        $response['file_path'] = 'images/uploads/' . $new_filename;
    } else {
        $response['message'] = 'Wystąpił błąd podczas zapisywania pliku na serwerze: ' . $e->getMessage();
    }
}

// Zwróć odpowiedź w formacie JSON
header('Content-Type: application/json');
echo json_encode($response); 