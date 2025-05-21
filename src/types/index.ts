import { ReactNode } from "react";

// Append to the existing types file
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

export type UserRole = 'admin' | 'maker' | 'checker1' | 'checker2';
export type TaskStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'escalated';
