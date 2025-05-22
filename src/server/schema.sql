
-- MySQL Database Schema for Audit Tracker Application

-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  roles TEXT NOT NULL, -- JSON string of roles array
  avatar VARCHAR(255),
  password_hash VARCHAR(255),
  password_expiry_date DATETIME NOT NULL,
  is_first_login BOOLEAN DEFAULT TRUE,
  last_otp VARCHAR(10),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  due_date DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  submitted_at DATETIME,
  frequency VARCHAR(50) NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  assigned_to VARCHAR(36) NOT NULL,
  checker1 VARCHAR(36) NOT NULL,
  checker2 VARCHAR(36) NOT NULL,
  observation_status VARCHAR(50),
  is_escalated BOOLEAN DEFAULT FALSE,
  escalation_priority VARCHAR(50),
  escalation_reason TEXT,
  escalated_at DATETIME,
  escalated_by VARCHAR(36),
  is_template BOOLEAN DEFAULT FALSE,
  current_instance_id VARCHAR(36),
  next_instance_date DATETIME,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (checker1) REFERENCES users(id),
  FOREIGN KEY (checker2) REFERENCES users(id)
);

-- Task Instances Table
CREATE TABLE task_instances (
  id VARCHAR(36) PRIMARY KEY,
  base_task_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL,
  due_date DATETIME NOT NULL,
  submitted_at DATETIME,
  completed_at DATETIME,
  assigned_to VARCHAR(36) NOT NULL,
  checker1 VARCHAR(36) NOT NULL,
  checker2 VARCHAR(36) NOT NULL,
  observation_status VARCHAR(50),
  instance_reference VARCHAR(100),
  period_start DATETIME,
  period_end DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (base_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (checker1) REFERENCES users(id),
  FOREIGN KEY (checker2) REFERENCES users(id)
);

-- Task Approvals Table
CREATE TABLE task_approvals (
  id VARCHAR(36) PRIMARY KEY,
  instance_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (instance_id) REFERENCES task_instances(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Task Comments Table
CREATE TABLE task_comments (
  id VARCHAR(36) PRIMARY KEY,
  task_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Task Attachments Table
CREATE TABLE task_attachments (
  id VARCHAR(36) PRIMARY KEY,
  task_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  s3_key VARCHAR(255),
  uploaded_at DATETIME NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  task_id VARCHAR(36) NOT NULL,
  instance_id VARCHAR(36),
  category VARCHAR(50) NOT NULL,
  level VARCHAR(50) NOT NULL,
  details TEXT NOT NULL, -- JSON string with log details
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  timestamp DATETIME NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(36) NOT NULL,
  link VARCHAR(255),
  task_id VARCHAR(36),
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task Notification Settings Table
CREATE TABLE task_notification_settings (
  task_id VARCHAR(36) PRIMARY KEY,
  remind_before INT,
  escalate_after INT,
  notify_checkers BOOLEAN DEFAULT TRUE,
  enable_pre_notifications BOOLEAN DEFAULT FALSE,
  pre_days TEXT, -- JSON string array of days
  enable_post_notifications BOOLEAN DEFAULT FALSE,
  post_notification_frequency VARCHAR(50),
  send_emails BOOLEAN DEFAULT TRUE,
  notify_maker BOOLEAN DEFAULT TRUE,
  notify_checker1 BOOLEAN DEFAULT TRUE,
  notify_checker2 BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- AWS Settings Table
CREATE TABLE aws_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region VARCHAR(50) NOT NULL,
  s3_bucket_name VARCHAR(255) NOT NULL,
  ses_from_email VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- AWS Credentials Table (Encrypted)
CREATE TABLE aws_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_key_id TEXT NOT NULL, -- Encrypted
  secret_access_key TEXT NOT NULL, -- Encrypted
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_instances_base_task_id ON task_instances(base_task_id);
CREATE INDEX idx_task_instances_status ON task_instances(status);
CREATE INDEX idx_task_instances_due_date ON task_instances(due_date);
CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
