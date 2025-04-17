-- Create active visitors table
CREATE TABLE IF NOT EXISTS `visitors` (
    `id` VARCHAR(50) NOT NULL,
    `page` VARCHAR(255) NOT NULL,
    `last_activity` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for last_activity to optimize cleanup queries
CREATE INDEX `idx_last_activity` ON `visitors` (`last_activity`); 