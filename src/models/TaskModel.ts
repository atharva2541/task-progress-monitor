
import { Task, TaskStatus } from '@/types';

export type TaskServiceProps = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
};
