
-- Add temporary password fields to users table
ALTER TABLE users 
ADD COLUMN temporary_password VARCHAR(255) NULL AFTER password_hash,
ADD COLUMN temp_password_expiry DATETIME NULL AFTER temporary_password;

-- Add index for temporary password expiry to optimize cleanup queries
ALTER TABLE users ADD INDEX idx_temp_password_expiry (temp_password_expiry);

-- Update existing users to have proper default values
UPDATE users SET is_first_login = FALSE WHERE is_first_login IS NULL;
