
import { Task, TaskStatus, EscalationPriority } from '@/types';

export type TaskServiceProps = {
  tasks: Task[];
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
  // New methods for escalations
  escalateTask: (taskId: string, priority: EscalationPriority, reason: string) => void;
  deescalateTask: (taskId: string) => void;
  getEscalatedTasks: () => Task[];
};
