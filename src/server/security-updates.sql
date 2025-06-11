
-- Security updates to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP NULL AFTER last_otp,
ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0 AFTER otp_expiry,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL AFTER login_attempts,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL AFTER locked_until;

-- Create index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_otp ON users(last_otp, otp_expiry);

-- Remove any existing test users (they will be recreated with proper security)
DELETE FROM users WHERE email IN ('admin@test.com', 'maker@test.com', 'checker1@test.com', 'checker2@test.com');

-- Note: Run this after setting up proper environment variables
-- New users should be created through the admin interface with strong passwords
