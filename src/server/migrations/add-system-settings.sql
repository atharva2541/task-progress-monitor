
-- Add system_settings table for admin configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'string',
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default file management settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('max_file_size_kb', '1', 'number', 'Maximum file size allowed in KB'),
('allowed_file_types', '["pdf","doc","docx","txt","jpg","png","xlsx","csv"]', 'json', 'Allowed file types for upload'),
('max_files_per_task', '5', 'number', 'Maximum number of files allowed per task'),
('enable_file_uploads', 'true', 'boolean', 'Enable or disable file uploads globally')
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = CURRENT_TIMESTAMP;
