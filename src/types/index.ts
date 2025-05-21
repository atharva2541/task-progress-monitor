
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
export type TaskStatus = 'pending' | 'in-progress' | 'submitted' | 'checker1-approved' | 'approved' | 'rejected';
export type TaskFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annually' | 'one-time';

// New type for escalation priority
export type EscalationPriority = 'critical' | 'high' | 'medium' | 'low';

// New type for observations status
export type ObservationStatus = 'yes' | 'no' | 'mixed';

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string; // User ID
  uploadedAt: string; // ISO date string
  s3Key?: string; // S3 object key for AWS S3 integration
}

export interface TaskNotificationSettings {
  enablePreNotifications: boolean;
  preDays: number[];
  enablePostNotifications: boolean;
  postNotificationFrequency: 'daily' | 'weekly';
  sendEmails: boolean;
  notifyMaker: boolean;
  notifyChecker1: boolean;
  notifyChecker2: boolean;
}

// New interface for task approval history
export interface TaskApproval {
  id: string;
  timestamp: string; // ISO date string
  userId: string; // User ID who approved/rejected
  userRole: UserRole; // Role of the user who approved/rejected
  status: 'approved' | 'rejected';
  comment?: string;
}

// New interface for task instances (recurring task occurrences)
export interface TaskInstance {
  id: string;
  baseTaskId: string; // ID of the parent recurring task
  instanceReference: string; // Human-readable reference code (e.g., "TASK-123-202505")
  periodStart: string; // ISO date string for the start of the period this instance covers
  periodEnd: string; // ISO date string for the end of the period this instance covers
  status: TaskStatus;
  dueDate: string; // ISO date string
  submittedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  comments: TaskComment[];
  attachments: TaskAttachment[];
  approvals: TaskApproval[]; // Record of each approval/rejection
  observationStatus: ObservationStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

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
  isRecurring: boolean; // Whether the task repeats
  dueDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  submittedAt?: string; // ISO date string for when the task was submitted for review
  comments?: TaskComment[];
  attachments?: TaskAttachment[]; // New field for file attachments
  notificationSettings?: TaskNotificationSettings; // New field for notification settings
  observationStatus: ObservationStatus;
  // New fields to track observation status history
  observationHistory?: {
    previousStatus: ObservationStatus;
    changedAt: string; // ISO date string
    changedBy: string; // User ID who changed the status
  };
  // New field to indicate if task is escalated and its priority
  escalation?: {
    isEscalated: boolean;
    priority: EscalationPriority;
    reason: string;
    escalatedAt: string; // ISO date string
    escalatedBy?: string; // User ID who escalated the task
  };
  // New field to track instances of recurring tasks
  instances?: TaskInstance[];
  // Flag to indicate if this is the task template (true) or an active instance (false)
  isTemplate?: boolean;
  // Reference to the next scheduled instance (if this is a template)
  currentInstanceId?: string;
  // Date when the next instance should be generated
  nextInstanceDate?: string; // ISO date string
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

// New type for notification settings
export interface TaskNotificationSettings {
  enablePreNotifications: boolean; // Send notifications before due date
  preDays: number[]; // Days before due date to send notifications
  enablePostNotifications: boolean; // Send notifications after due date if not submitted
  postNotificationFrequency: 'daily' | 'weekly'; // How often to send reminders
  sendEmails: boolean; // Whether to send email notifications
  notifyMaker: boolean; // Whether to notify the maker
  notifyChecker1: boolean; // Whether to notify checker1
  notifyChecker2: boolean; // Whether to notify checker2
}

// Admin log types
export type AdminLogActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import' | 'settings_change' | 'system_event';
export type AdminLogEntityType = 'user' | 'task' | 'system' | 'file' | 'setting' | 'report' | 'auth' | 'settings';

export interface AdminLog {
  id: string;
  timestamp: string; // ISO date string
  userId: string;
  userName: string;
  action: AdminLogActionType;
  entityType: AdminLogEntityType;
  entityId?: string;
  details: string;
  beforeState?: string; // JSON stringified
  afterState?: string; // JSON stringified
}

export interface AdminLogFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: AdminLogActionType;
  entityType?: AdminLogEntityType;
  searchQuery?: string;
}
