
import { ReactNode } from "react";

// User types
export type UserRole = 'admin' | 'maker' | 'checker1' | 'checker2';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  avatar?: string;
}

// Task types
export type TaskStatus = 
  | 'draft' 
  | 'pending'
  | 'in-progress'
  | 'submitted' 
  | 'in_review' 
  | 'checker1-approved' 
  | 'approved' 
  | 'rejected' 
  | 'escalated';

export type TaskPriority = 'low' | 'medium' | 'high';
export type ObservationStatus = 'yes' | 'no' | 'mixed';
export type EscalationPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one-time' | 'fortnightly' | 'annually';

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  s3Key?: string;
  uploadedAt: string;
  // No uploadedBy property, use userId instead
}

export interface TaskEscalation {
  isEscalated: boolean;
  priority: EscalationPriority;
  reason?: string;
  escalatedAt?: string;
  escalatedBy?: string;
}

export interface TaskApproval {
  id: string;
  instanceId: string;
  userId: string;
  userRole: UserRole;
  status: 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface TaskInstance {
  id: string;
  baseTaskId: string;
  status: TaskStatus;
  dueDate: string;
  submittedAt?: string;
  completedAt?: string;
  assignedTo: string;
  checker1: string;
  checker2: string;
  observationStatus?: ObservationStatus;
  approvals: TaskApproval[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  // Additional properties needed by components
  instanceReference?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  frequency: TaskFrequency;
  isRecurring: boolean;
  assignedTo: string;
  checker1: string;
  checker2: string;
  observationStatus?: ObservationStatus;
  isEscalated?: boolean;
  escalationPriority?: EscalationPriority;
  escalationReason?: string;
  escalatedAt?: string;
  escalatedBy?: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  instances?: TaskInstance[];
  // Added fields for escalation as a separate object
  escalation?: TaskEscalation;
  // Added fields for recurring task management
  currentInstanceId?: string;
  nextInstanceDate?: string;
  notificationSettings?: {
    remindBefore?: number;
    escalateAfter?: number;
    notifyCheckers?: boolean;
  };
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean; // Changed from read to isRead to match usage
  userId: string;
  link?: string;
  taskId?: string;
  createdAt: string; // Added createdAt field
}

// Activity Log types
export type ActivityLogActionType = 
  | 'task-created'
  | 'task-updated'
  | 'task-submitted'
  | 'task-approved' 
  | 'task-rejected'
  | 'task-escalated'
  | 'task-deescalated'
  | 'file-attached'
  | 'file-removed'
  | 'observation-updated'
  | 'instance-created'
  | 'comment-added';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO date string
  actionType: ActivityLogActionType;
  userId: string; // User who performed the action
  userRole: UserRole; // Role of the user at the time of action
  taskId: string; // Related task ID
  instanceId?: string; // Optional task instance ID
  details: {
    taskName: string;
    taskCategory: string;
    maker?: string; // User ID of maker
    checker1?: string; // User ID of checker1
    checker2?: string; // User ID of checker2
    dueDate?: string; // Task due date
    overdueBy?: number; // Days overdue (if applicable)
    status?: TaskStatus; // Task status after action
    attachmentId?: string; // Related attachment ID (if applicable)
    attachmentName?: string; // Attachment name (if applicable)
    comment?: string; // Any comment associated with the action
    oldValue?: string; // Previous value (for updates)
    newValue?: string; // New value (for updates)
  };
}
