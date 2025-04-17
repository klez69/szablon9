CREATE TABLE IF NOT EXISTS visitor_tracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_url VARCHAR(255) NOT NULL,
    referrer VARCHAR(255),
    user_agent VARCHAR(255),
    screen_resolution VARCHAR(50),
    language VARCHAR(50),
    visit_timestamp DATETIME NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for common queries
CREATE INDEX idx_visit_timestamp ON visitor_tracking(visit_timestamp);
CREATE INDEX idx_page_url ON visitor_tracking(page_url);
CREATE INDEX idx_ip_address ON visitor_tracking(ip_address); 