
import { Task, TaskStatus, EscalationPriority, ObservationStatus, TaskInstance, TaskApproval } from '@/types';

export type TaskServiceProps = {
  tasks: Task[];
  calendarTasks: Task[]; // Added calendarTasks to include recurring instances
  isLoading: boolean;
  isCalendarLoading: boolean; // Loading state for calendar tasks
  getUserAccessibleTasks: (userId: string, userRole: string) => Task[]; 
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, comment?: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByAssignee: (userId: string) => Task[];
  getTasksByChecker: (userId: string) => Task[];
  getUserById: (userId: string) => any | undefined;
  addTaskAttachment: (taskId: string, attachmentData: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    s3Key: string;
  }) => Promise<void>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => void;
  uploadTaskAttachment: (taskId: string, file: File) => Promise<void>;
  deleteTaskAttachment: (taskId: string, attachmentId: string) => void;
  // New methods for observations status
  updateObservationStatus: (taskId: string, status: ObservationStatus, userId: string) => void;
  // Existing methods for escalations
  escalateTask: (taskId: string, priority: EscalationPriority, reason: string) => void;
  deescalateTask: (taskId: string) => void;
  getEscalatedTasks: () => Task[];
  
  // New methods for task instances
  createTaskInstance: (baseTaskId: string) => Promise<string>; // Returns the new instance ID
  getTaskInstanceById: (instanceId: string) => TaskInstance | undefined;
  getTaskInstances: (baseTaskId: string) => TaskInstance[];
  addTaskApproval: (
    instanceId: string, 
    approval: Omit<TaskApproval, 'id' | 'timestamp'>
  ) => void;
  completeTaskInstance: (instanceId: string) => void;
  rolloverRecurringTask: (baseTaskId: string) => Promise<string>; // Creates next instance based on frequency
};
