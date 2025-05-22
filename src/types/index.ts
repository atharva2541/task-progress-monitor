
// Auth types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: string[];
  avatar?: string;
  passwordExpiryDate: string;
  isFirstLogin: boolean;
}

// Define the ExtendedUser type that's being used in AuthContext
export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: string[];
  avatar?: string;
  passwordExpiryDate?: string;
  isFirstLogin?: boolean;
}

// Common user type for components
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: string[];
  avatar?: string;
  passwordExpiryDate?: string;
  isFirstLogin?: boolean;
}

export type UserRole = 'admin' | 'maker' | 'checker1' | 'checker2';

// AWS types
export interface AWSSettings {
  region: string;
  s3BucketName: string;
  sesFromEmail: string;
}

// Logs types
export interface Log {
  id: string;
  timestamp: string;
  actionType: string;
  userId: string;
  userRole: string;
  taskId: string;
  instanceId?: string;
  category: string;
  level: string;
  details: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: ActivityLogActionType;
  userId: string;
  details: string;
  metadata?: Record<string, any>;
}

export type ActivityLogActionType = 
  | 'login' 
  | 'logout' 
  | 'create_task' 
  | 'update_task' 
  | 'delete_task'
  | 'submit_task'
  | 'approve_task'
  | 'reject_task'
  | 'escalate_task'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'system';

export interface LogFilters {
  level?: string;
  category?: string;
  user?: string;
  task?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
  userId: string;
  link?: string;
  taskId?: string;
  createdAt: string;
  notificationType?: string;
  referenceId?: string;
  priority?: string;
  deliveryStatus?: string;
  actionUrl?: string;
}

export interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
}

// Task types
export type TaskStatus = 'pending' | 'in-progress' | 'submitted' | 'checker1-approved' | 'approved' | 'rejected';

export type TaskPriority = 'low' | 'medium' | 'high';

export type EscalationPriority = 'low' | 'medium' | 'high' | 'critical';

export type ObservationStatus = 'yes' | 'no' | 'mixed' | 'clean' | 'observation-noted' | 'observation-resolved';

export interface TaskEscalation {
  isEscalated: boolean;
  priority?: EscalationPriority;
  reason?: string;
  escalatedAt?: string;
  escalatedBy?: string;
}

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
}

export interface TaskApproval {
  id: string;
  instanceId: string;
  userId: string;
  userRole: string;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp: string;
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
  frequency: 'once' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  isRecurring: boolean;
  assignedTo: string;
  checker1: string;
  checker2: string;
  observationStatus?: ObservationStatus;
  isEscalated: boolean;
  escalation?: TaskEscalation;
  escalationPriority?: EscalationPriority;
  escalationReason?: string;
  escalatedAt?: string;
  escalatedBy?: string;
  isTemplate: boolean;
  currentInstanceId?: string;
  nextInstanceDate?: string;
  // New fields to help with calendar display
  isInstance?: boolean;
  baseTaskId?: string;
  instanceReference?: string;
  periodStart?: string;
  periodEnd?: string;
  // Additional fields
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
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
  instanceReference?: string;
  periodStart?: string;
  periodEnd?: string;
  createdAt: string;
  updatedAt: string;
  // Display properties
  name?: string; // Inherited from base task
  description?: string; // Inherited from base task
  category?: string; // Inherited from base task
  // Additional fields
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  approvals?: TaskApproval[];
}

export interface TaskNotificationSettings {
  taskId: string;
  remindBefore?: number;
  escalateAfter?: number;
  notifyCheckers: boolean;
  enablePreNotifications: boolean;
  preDays: number[];
  enablePostNotifications: boolean;
  postNotificationFrequency?: 'daily' | 'weekly';
  sendEmails: boolean;
  notifyMaker: boolean;
  notifyChecker1: boolean;
  notifyChecker2: boolean;
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

export interface UserNotificationPreferences {
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
