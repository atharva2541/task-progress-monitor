
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { TaskServiceProps } from '@/models/TaskModel';
import { useTaskService } from '@/services/TaskService';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { checkTasksForNotifications } from '@/utils/notification-scheduler';

const TaskContext = createContext<TaskServiceProps | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const taskService = useTaskService();
  const { addNotification } = useNotification();
  const { user } = useAuth();
  
  // Check for task notifications periodically
  useEffect(() => {
    if (!user || !taskService.tasks || taskService.tasks.length === 0) return;
    
    // Initial check
    checkTasksForNotifications(taskService.tasks, taskService.getUserById);
    
    // Set up periodic checks
    const interval = setInterval(() => {
      checkTasksForNotifications(taskService.tasks, taskService.getUserById);
    }, 3600000); // Check every hour
    
    return () => clearInterval(interval);
  }, [taskService.tasks, user]);
  
  return (
    <TaskContext.Provider value={taskService}>
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

// Fixed helper function to filter tasks based on user role and access rights
// Properly spreads all properties from the original context
export function useAuthorizedTasks() {
  const taskContext = useTask();
  const { user } = useAuth();
  
  if (!user) return { tasks: [] };
  
  // Filter tasks based on user role and involvement
  const authorizedTasks = taskContext.getUserAccessibleTasks(user.id, user.role);
  
  // Return all the original taskContext properties, but with filtered tasks
  return { ...taskContext, tasks: authorizedTasks };
}
