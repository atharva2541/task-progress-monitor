
-- Add missing AWS tables for credentials and settings storage

-- AWS Settings Table (if not exists)
CREATE TABLE IF NOT EXISTS aws_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region VARCHAR(50) NOT NULL,
  s3_bucket_name VARCHAR(255) NOT NULL,
  ses_from_email VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- AWS Credentials Table (if not exists) - Encrypted storage
CREATE TABLE IF NOT EXISTS aws_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_key_id TEXT NOT NULL,
  secret_access_key TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Add encryption key settings if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP NULL AFTER last_otp,
ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0 AFTER otp_expiry,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL AFTER login_attempts,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL AFTER locked_until;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_otp ON users(last_otp, otp_expiry);
