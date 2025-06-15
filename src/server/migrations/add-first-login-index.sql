
-- Add index for is_first_login field to optimize first login queries
ALTER TABLE users ADD INDEX idx_is_first_login (is_first_login);

-- Add index for email field to optimize login queries
ALTER TABLE users ADD INDEX idx_email (email);

-- Add index for otp_expiry field to optimize OTP verification queries
ALTER TABLE users ADD INDEX idx_otp_expiry (otp_expiry);
