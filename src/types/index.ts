
export type UserRole = 'admin' | 'maker' | 'checker1' | 'checker2';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Primary role
  roles?: UserRole[]; // All roles the user can have
  avatar?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  assignedTo: string; // User ID of the Maker
  checker1: string; // User ID of Checker 1
  checker2: string; // User ID of Checker 2
  priority: TaskPriority;
  status: TaskStatus;
  frequency: TaskFrequency;
  dueDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string; // ISO date string
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string; // ISO date string
}
