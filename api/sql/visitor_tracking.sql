CREATE TABLE IF NOT EXISTS visitor_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_url VARCHAR(255) NOT NULL,
    referrer VARCHAR(255),
    user_agent TEXT,
    screen_resolution VARCHAR(20),
    language VARCHAR(10),
    visit_timestamp DATETIME,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 