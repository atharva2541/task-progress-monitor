// Database model types for MySQL integration

// AWS Settings table
export interface DbAwsSettings {
  id: number;
  region: string;
  s3_bucket_name: string;
  ses_from_email: string;
  created_at: string;
  updated_at: string;
}

// AWS Credentials table (for encrypted credentials)
export interface DbAwsCredentials {
  id: number;
  access_key_id: string; // Encrypted
  secret_access_key: string; // Encrypted
  created_at: string;
  updated_at: string;
}

// User table
export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string; // JSON string of roles array
  avatar?: string;
  password_hash?: string;
  temporary_password?: string; // Added temporary password field
  temp_password_expiry?: string; // Added temporary password expiry field
  password_expiry_date: string;
  is_first_login: boolean;
  last_otp?: string;
  otp_expiry?: string; // Added OTP expiry field
  created_at: string;
  updated_at: string;
}

// Task table
export interface DbTask {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  frequency: string;
  is_recurring: boolean;
  assigned_to: string;
  checker1: string;
  checker2: string;
  observation_status?: string;
  is_escalated: boolean;
  escalation_priority?: string;
  escalation_reason?: string;
  escalated_at?: string;
  escalated_by?: string;
  is_template: boolean;
  current_instance_id?: string;
  next_instance_date?: string;
}

// Task instance table
export interface DbTaskInstance {
  id: string;
  base_task_id: string;
  status: string;
  due_date: string;
  submitted_at?: string;
  completed_at?: string;
  assigned_to: string;
  checker1: string;
  checker2: string;
  observation_status?: string;
  instance_reference?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
  updated_at: string;
  name?: string;
  description?: string;
  category?: string;
}

// Task approval table
export interface DbTaskApproval {
  id: string;
  instance_id: string;
  user_id: string;
  user_role: string;
  status: string;
  comment?: string;
  created_at: string;
}

// Task comment table
export interface DbTaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Task attachment table
export interface DbTaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  s3_key?: string;
  uploaded_at: string;
}

// Activity log table
export interface DbActivityLog {
  id: string;
  timestamp: string;
  action_type: string;
  user_id: string;
  user_role: string;
  task_id: string;
  instance_id?: string;
  category: string;
  level: string;
  details: string; // JSON string with log details
}

// Notification table
export interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  is_read: boolean;
  user_id: string;
  link?: string;
  task_id?: string;
  created_at: string;
  notification_type?: string;
  reference_id?: string;
  priority?: string;
  delivery_status?: string;
  action_url?: string;
}

// User Notification Preferences table
export interface DbNotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  task_assignment: boolean;
  task_updates: boolean;
  due_date_reminders: boolean;
  system_notifications: boolean;
  digest_frequency: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

// Task notification settings table
export interface DbTaskNotificationSettings {
  task_id: string;
  remind_before?: number;
  escalate_after?: number;
  notify_checkers: boolean;
  enable_pre_notifications: boolean;
  pre_days: string; // JSON string array of days
  enable_post_notifications: boolean;
  post_notification_frequency?: string;
  send_emails: boolean;
  notify_maker: boolean;
  notify_checker1: boolean;
  notify_checker2: boolean;
}
