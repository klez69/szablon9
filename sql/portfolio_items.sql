CREATE TABLE IF NOT EXISTS `portfolio_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `detail_url` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wyczyść istniejące dane
TRUNCATE TABLE `portfolio_items`;

-- Dodaj przykładowe dane używając istniejących zdjęć
INSERT INTO `portfolio_items` (`title`, `description`, `image_url`, `category`, `detail_url`) VALUES
('Stylowe cięcie męskie', 'Nowoczesne cięcie dla mężczyzn', 'images/1.jpg', 'men', NULL),
('Koloryzacja', 'Profesjonalna koloryzacja włosów', 'images/2.jpg', 'color', NULL),
('Fryzura ślubna', 'Elegancka fryzura na specjalne okazje', 'images/3.jpg', 'special', NULL),
('Stylizacja damska', 'Modna fryzura dla kobiet', 'images/4.jpg', 'women', NULL),
('Męskie trendy', 'Trendy w męskich fryzurach', 'images/5.jpg', 'men', NULL),
('Pasemka i refleksy', 'Delikatne pasemka', 'images/6.jpg', 'color', NULL),
('Upięcie wieczorowe', 'Eleganckie upięcie na wieczór', 'images/7.jpg', 'special', NULL),
('Strzyżenie damskie', 'Precyzyjne strzyżenie', 'images/8.jpg', 'women', NULL),
('Koloryzacja kreatywna', 'Nowoczesne techniki koloryzacji', 'images/9.jpg', 'color', NULL),
('Fryzura okolicznościowa', 'Wyjątkowa fryzura na special okazje', 'images/10.jpg', 'special', NULL),
('Stylizacja męska', 'Klasyczne cięcie męskie', 'images/11.jpg', 'men', NULL),
('Fryzura wieczorowa', 'Elegancka fryzura wieczorowa', 'images/12.jpg', 'women', NULL); 