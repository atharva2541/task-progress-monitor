
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'maker' | 'checker1' | 'checker2';
  roles: string[];
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'under_review' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
