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
  createdAt: string;
  updatedAt: string;
}

export interface TaskNotificationSettings {
  remindBefore?: number;
  escalateAfter?: number;
  notifyCheckers?: boolean;
  enablePreNotifications?: boolean;
  preDays?: number[];
  enablePostNotifications?: boolean;
  postNotificationFrequency?: 'daily' | 'weekly';
  sendEmails?: boolean;
  notifyMaker?: boolean;
  notifyChecker1?: boolean;
  notifyChecker2?: boolean;
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
  notificationSettings?: TaskNotificationSettings;
  isTemplate?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  timestamp: string;
  link?: string;
  taskId?: string;
  notificationType?: 'task_assignment' | 'due_date_reminder' | 'status_change' | 'system' | 'general';
  referenceId?: string;
  priority?: 'high' | 'normal' | 'low';
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
  actionUrl?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  taskAssignment: boolean;
  taskUpdates: boolean;
  dueDateReminders: boolean;
  systemNotifications: boolean;
  digestFrequency: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string;
  quietHoursEnd?: string;
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
  category: string; // Added category property (system, user, task)
  level: string; // Added level property (info, warning, error)
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
