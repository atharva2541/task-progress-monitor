import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskFrequency, TaskAttachment, TaskNotificationSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Mock tasks for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Monthly Financial Report',
    description: 'Prepare the monthly financial report with all transaction details.',
    category: 'Finance',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'high',
    status: 'pending',
    frequency: 'monthly',
    isRecurring: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [], // Initialize empty attachments array
    notificationSettings: {
      enablePreNotifications: true,
      preDays: [1, 3, 7],
      enablePostNotifications: true,
      postNotificationFrequency: 'daily',
      sendEmails: false,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    }
  },
  {
    id: '2',
    name: 'Daily System Check',
    description: 'Perform daily system health check and report any issues.',
    category: 'IT',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'medium',
    status: 'in-progress',
    frequency: 'daily',
    isRecurring: true,
    dueDate: new Date().toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [] // Initialize empty attachments array
  },
  {
    id: '3',
    name: 'Quarterly Compliance Audit',
    description: 'Complete the quarterly compliance audit for regulatory requirements.',
    category: 'Compliance',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'high',
    status: 'submitted',
    frequency: 'quarterly',
    isRecurring: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [] // Initialize empty attachments array
  },
  {
    id: '4',
    name: 'Weekly Team Report',
    description: 'Compile weekly team performance metrics and highlights.',
    category: 'HR',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'low',
    status: 'approved',
    frequency: 'weekly',
    isRecurring: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [] // Initialize empty attachments array
  },
  {
    id: '5',
    name: 'System Security Review',
    description: 'Conduct security review of all systems and document findings.',
    category: 'Security',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'high',
    status: 'rejected',
    frequency: 'monthly',
    isRecurring: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [
      {
        id: '1',
        taskId: '5',
        userId: '3',
        content: 'Please include more details about the security vulnerabilities found.',
        createdAt: new Date().toISOString()
      }
    ],
    attachments: [] // Initialize empty attachments array
  }
];

interface TaskContextType {
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
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const { toast } = useToast();
  const { getUserById: authGetUserById, user } = useAuth();

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [], // Initialize empty attachments array
      notificationSettings: task.notificationSettings || {
        enablePreNotifications: false,
        preDays: [1, 3, 7],
        enablePostNotifications: false,
        postNotificationFrequency: 'daily',
        sendEmails: false,
        notifyMaker: true,
        notifyChecker1: true,
        notifyChecker2: true
      }
    };
    
    setTasks([...tasks, newTask]);
    toast({
      title: 'Task created',
      description: `Task "${newTask.name}" has been created successfully.`
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
    
    toast({
      title: 'Task updated',
      description: `Task has been updated successfully.`
    });
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: 'Task deleted',
        description: `Task "${taskToDelete.name}" has been deleted.`,
        variant: 'destructive'
      });
    }
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, comment?: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          status,
          updatedAt: new Date().toISOString()
        };
        
        if (comment) {
          updatedTask.comments = [
            ...(task.comments || []),
            {
              id: Date.now().toString(),
              taskId,
              userId: user?.id || '1',
              content: comment,
              createdAt: new Date().toISOString()
            }
          ];
        }
        
        return updatedTask;
      }
      return task;
    }));
    
    const statusMessages = {
      'pending': 'Task marked as pending',
      'in-progress': 'Task started',
      'submitted': 'Task submitted for review',
      'approved': 'Task approved',
      'rejected': 'Task rejected'
    };
    
    toast({
      title: statusMessages[status],
      description: `The task status has been updated to ${status}.`,
      variant: status === 'rejected' ? 'destructive' : 'default'
    });
  };

  const addTaskAttachment = async (taskId: string, attachmentData: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    s3Key: string;
  }): Promise<void> => {
    const attachment: TaskAttachment = {
      id: Date.now().toString(),
      taskId,
      fileName: attachmentData.fileName,
      fileUrl: attachmentData.fileUrl,
      fileType: attachmentData.fileType,
      s3Key: attachmentData.s3Key,
      uploadedBy: user?.id || '1',
      uploadedAt: new Date().toISOString()
    };
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          attachments: [...(task.attachments || []), attachment],
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
    
    toast({
      title: 'File uploaded',
      description: `${attachmentData.fileName} has been attached to the task.`
    });
  };

  const removeTaskAttachment = (taskId: string, attachmentId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.attachments) {
        return {
          ...task,
          attachments: task.attachments.filter(att => att.id !== attachmentId),
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
    
    toast({
      title: 'File removed',
      description: 'The attachment has been removed from the task.'
    });
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByAssignee = (userId: string) => {
    return tasks.filter(task => task.assignedTo === userId);
  };

  const getTasksByChecker = (userId: string) => {
    return tasks.filter(task => task.checker1 === userId || task.checker2 === userId);
  };

  // Use the getUserById function from AuthContext
  const getUserById = (userId: string) => {
    return authGetUserById(userId);
  };

  // Persist tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Load tasks from localStorage on init
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to parse saved tasks:', error);
      }
    }
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      getTaskById,
      getTasksByStatus,
      getTasksByAssignee,
      getTasksByChecker,
      getUserById,
      addTaskAttachment,
      removeTaskAttachment
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
