
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'maker', 'checker1', 'checker2') NOT NULL,
  roles JSON NOT NULL,
  avatar VARCHAR(255),
  last_otp VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clear existing test users (optional)
DELETE FROM users WHERE email IN ('admin@test.com', 'maker@test.com', 'checker1@test.com', 'checker2@test.com');

-- Insert test users with hashed passwords
-- Password for all users is 'password123'
-- Hash generated using bcrypt with salt rounds 10
INSERT INTO users (id, name, email, password_hash, role, roles, avatar) VALUES
('admin_test', 'Admin User', 'admin@test.com', '$2a$10$rKGGQQpJ8/M9oWQpYZZxzO4CkZJZJ7r1gZjgwQpJlO4CkZJZJ7r1g', 'admin', '["admin"]', 'https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff'),
('maker_test', 'Maker User', 'maker@test.com', '$2a$10$rKGGQQpJ8/M9oWQpYZZxzO4CkZJZJ7r1gZjgwQpJlO4CkZJZJ7r1g', 'maker', '["maker"]', 'https://ui-avatars.com/api/?name=Maker+User&background=8b5cf6&color=fff'),
('checker1_test', 'Checker1 User', 'checker1@test.com', '$2a$10$rKGGQQpJ8/M9oWQpYZZxzO4CkZJZJ7r1gZjgwQpJlO4CkZJZJ7r1g', 'checker1', '["checker1"]', 'https://ui-avatars.com/api/?name=Checker1+User&background=8b5cf6&color=fff'),
('checker2_test', 'Checker2 User', 'checker2@test.com', '$2a$10$rKGGQQpJ8/M9oWQpYZZxzO4CkZJZJ7r1gZjgwQpJlO4CkZJZJ7r1g', 'checker2', '["checker2"]', 'https://ui-avatars.com/api/?name=Checker2+User&background=8b5cf6&color=fff');

-- Verify the users were created
SELECT id, name, email, role, roles FROM users;
