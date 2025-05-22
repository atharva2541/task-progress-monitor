
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { TaskServiceProps } from '@/models/TaskModel';
import { useTaskService } from '@/services/TaskService';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { checkTasksForNotifications } from '@/utils/notification-scheduler';
import axios from 'axios';
import { Task } from '@/types';
import { toast } from 'sonner';

const TaskContext = createContext<TaskServiceProps | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState<boolean>(false);
  
  let taskService;
  
  try {
    // This might fail if AuthProvider is not available
    taskService = useTaskService();
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

    // Load calendar tasks (base tasks + instances)
    useEffect(() => {
      const loadCalendarTasks = async () => {
        if (!user) return;
        
        try {
          setIsCalendarLoading(true);
          const response = await axios.get('/api/tasks/calendar');
          setCalendarTasks(response.data);
        } catch (error) {
          console.error('Error loading calendar tasks:', error);
          toast.error('Failed to load calendar tasks');
        } finally {
          setIsCalendarLoading(false);
        }
      };

      loadCalendarTasks();
      // Refresh calendar tasks every 15 minutes
      const refreshInterval = setInterval(loadCalendarTasks, 900000);
      
      return () => clearInterval(refreshInterval);
    }, [user]);

    // Enhance taskService with calendar tasks
    taskService = {
      ...taskService,
      calendarTasks,
      isCalendarLoading
    };
  } catch (error) {
    console.error("Error in TaskProvider:", error);
    // Provide fallback taskService with empty values
    taskService = {
      tasks: [],
      calendarTasks: [],
      isLoading: false,
      isCalendarLoading: false,
      addTask: () => {},
      updateTask: () => {},
      deleteTask: () => {},
      getTaskById: () => undefined,
      getUserAccessibleTasks: () => [],
      getUserById: () => undefined
    };
  }
  
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
  let user;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.error("Error accessing auth context in useAuthorizedTasks:", error);
    return { ...taskContext, tasks: [], calendarTasks: [] };
  }
  
  if (!user) return { ...taskContext, tasks: [], calendarTasks: [] };
  
  // Filter tasks based on user role and involvement
  const authorizedTasks = taskContext.getUserAccessibleTasks(user.id, user.role);
  
  // Filter calendar tasks based on user role and involvement
  const authorizedCalendarTasks = taskContext.calendarTasks.filter(task => {
    // Admin sees all
    if (user.role === 'admin') return true;
    
    // Maker sees assigned tasks
    if (user.role === 'maker' && task.assignedTo === user.id) return true;
    
    // Checker1 sees tasks where they are checker1
    if (user.role === 'checker1' && task.checker1 === user.id) return true;
    
    // Checker2 sees tasks where they are checker2
    if (user.role === 'checker2' && task.checker2 === user.id) return true;
    
    return false;
  });
  
  // Return all the original taskContext properties, but with filtered tasks
  return { 
    ...taskContext, 
    tasks: authorizedTasks,
    calendarTasks: authorizedCalendarTasks
  };
}
