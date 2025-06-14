import { useState, useEffect } from 'react';
import { 
  Task, 
  TaskStatus, 
  TaskComment, 
  TaskAttachment, 
  EscalationPriority, 
  ObservationStatus, 
  TaskInstance,
  TaskApproval,
  TaskFrequency
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { tasksApi } from '@/services/api-client';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

export function useTaskService() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { getUserById: authGetUserById, user } = useAuth();

  // Load tasks from backend
  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await tasksApi.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load task instances from backend
  const loadTaskInstances = async (taskId: string) => {
    try {
      const response = await tasksApi.getTaskInstances(taskId);
      return response.data;
    } catch (error) {
      console.error('Error loading task instances:', error);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Helper to generate consistent instance references
  const generateInstanceReference = (baseTaskId: string, date: Date): string => {
    const shortId = baseTaskId.substring(0, 6);
    const period = format(date, 'yyyyMM');
    return `TASK-${shortId}-${period}`;
  };

  // Calculate the next instance date based on frequency
  const calculateNextInstanceDate = (fromDate: string, frequency: TaskFrequency): string => {
    const date = new Date(fromDate);
    let nextDate: Date;
    
    switch (frequency) {
      case 'daily':
        nextDate = addDays(date, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(date, 1);
        break;
      case 'bi-weekly':
        nextDate = addWeeks(date, 2);
        break;
      case 'monthly':
        nextDate = addMonths(date, 1);
        break;
      case 'quarterly':
        nextDate = addMonths(date, 3);
        break;
      case 'yearly':
        nextDate = addMonths(date, 12);
        break;
      default:
        nextDate = date;
    }
    
    return nextDate.toISOString();
  };

  // Generate period start and end dates
  const calculatePeriodDates = (dueDate: string, frequency: TaskFrequency): { start: string, end: string } => {
    const date = new Date(dueDate);
    let startDate: Date;
    let endDate: Date = new Date(dueDate);
    
    switch (frequency) {
      case 'daily':
        startDate = date;
        break;
      case 'weekly':
        startDate = new Date(date);
        startDate.setDate(date.getDate() - 7);
        break;
      case 'bi-weekly':
        startDate = new Date(date);
        startDate.setDate(date.getDate() - 14);
        break;
      case 'monthly':
        startDate = new Date(date);
        startDate.setMonth(date.getMonth() - 1);
        break;
      case 'quarterly':
        startDate = new Date(date);
        startDate.setMonth(date.getMonth() - 3);
        break;
      case 'yearly':
        startDate = new Date(date);
        startDate.setFullYear(date.getFullYear() - 1);
        break;
      default:
        startDate = date;
    }
    
    return { 
      start: startDate.toISOString(), 
      end: endDate.toISOString() 
    };
  };

  // Get tasks accessible to a specific user
  const getUserAccessibleTasks = (userId: string, userRole: string): Task[] => {
    if (userRole === 'admin') return tasks;
    
    return tasks.filter(task => 
      task.assignedTo === userId || 
      task.checker1 === userId ||   
      task.checker2 === userId      
    );
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      const response = await tasksApi.createTask(task);
      
      // Refresh tasks from backend
      await loadTasks();
      
      toast({
        title: 'Task created',
        description: `Task "${task.name}" has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTaskInstance = async (baseTaskId: string): Promise<string> => {
    try {
      const response = await tasksApi.getTask(baseTaskId);
      const baseTask = response.data;
      
      // This would be handled by the backend
      const instanceId = `${baseTaskId}-${Date.now()}`;
      
      toast({
        title: 'Instance created',
        description: `New instance of task "${baseTask.name}" has been created.`
      });
      
      return instanceId;
    } catch (error) {
      console.error('Error creating task instance:', error);
      throw new Error("Failed to create task instance");
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setIsLoading(true);
      await tasksApi.updateTask(taskId, updates);
      
      // Refresh tasks from backend
      await loadTasks();
      
      toast({
        title: 'Task updated',
        description: `Task has been updated successfully.`
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    try {
      setIsLoading(true);
      await tasksApi.deleteTask(taskId);
      
      // Refresh tasks from backend
      await loadTasks();
      
      toast({
        title: 'Task deleted',
        description: `Task "${taskToDelete?.name || 'Unknown'}" has been deleted.`,
        variant: 'destructive'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus, comment?: string) => {
    try {
      await tasksApi.updateTask(taskId, { 
        status,
        ...(comment && { comment })
      });
      
      // Refresh tasks from backend
      await loadTasks();
      
      const statusMessages = {
        'pending': 'Task marked as pending',
        'in-progress': 'Task started',
        'submitted': 'Task submitted for review',
        'checker1-approved': 'Task approved by Checker 1',
        'approved': 'Task fully approved',
        'rejected': 'Task rejected'
      };
      
      toast({
        title: statusMessages[status],
        description: `The task status has been updated to ${status}.`,
        variant: status === 'rejected' ? 'destructive' : 'default'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const updateObservationStatus = async (taskId: string, status: ObservationStatus, userId: string) => {
    try {
      await tasksApi.updateTask(taskId, { observationStatus: status });
      
      // Refresh tasks from backend
      await loadTasks();

      toast({
        title: 'Observation status updated',
        description: `Task observation status has been set to ${status === 'yes' ? 'Yes' : status === 'no' ? 'No' : 'Mixed'}.`
      });
    } catch (error) {
      console.error('Error updating observation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update observation status',
        variant: 'destructive'
      });
    }
  };

  const addTaskAttachment = async (taskId: string, attachmentData: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    s3Key: string;
  }): Promise<void> => {
    try {
      // This would be handled by a file upload API endpoint
      console.log('Adding attachment:', attachmentData);
      
      toast({
        title: 'File uploaded',
        description: `${attachmentData.fileName} has been attached to the task.`
      });
    } catch (error) {
      console.error('Error adding attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive'
      });
    }
  };

  const removeTaskAttachment = async (taskId: string, attachmentId: string) => {
    try {
      // This would be handled by a delete attachment API endpoint
      console.log('Removing attachment:', attachmentId);
      
      toast({
        title: 'File removed',
        description: 'The attachment has been removed from the task.'
      });
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove attachment',
        variant: 'destructive'
      });
    }
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getTaskInstanceById = (instanceId: string) => {
    return taskInstances.find(instance => instance.id === instanceId);
  };

  const getTaskInstances = (baseTaskId: string) => {
    return taskInstances.filter(instance => instance.baseTaskId === baseTaskId);
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

  const getUserById = (userId: string) => {
    return authGetUserById(userId);
  };

  // Escalation methods (would need backend implementation)
  const escalateTask = async (taskId: string, priority: EscalationPriority, reason: string) => {
    try {
      await tasksApi.updateTask(taskId, { 
        isEscalated: true,
        escalationPriority: priority,
        escalationReason: reason 
      });
      
      await loadTasks();
      
      const priorityLabels = {
        'critical': 'Critical',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };
      
      toast({
        title: `Task Escalated - ${priorityLabels[priority]} Priority`,
        description: `The task has been escalated with reason: ${reason}`,
        variant: priority === 'critical' || priority === 'high' ? 'destructive' : 'default'
      });
    } catch (error) {
      console.error('Error escalating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to escalate task',
        variant: 'destructive'
      });
    }
  };

  const deescalateTask = async (taskId: string) => {
    try {
      await tasksApi.updateTask(taskId, { 
        isEscalated: false,
        escalationPriority: undefined,
        escalationReason: undefined 
      });
      
      await loadTasks();
      
      toast({
        title: 'Task De-escalated',
        description: 'The task has been de-escalated and returned to normal workflow.'
      });
    } catch (error) {
      console.error('Error de-escalating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to de-escalate task',
        variant: 'destructive'
      });
    }
  };

  const getEscalatedTasks = () => {
    return tasks.filter(task => task.isEscalated);
  };

  // Task instance methods (placeholder implementations)
  const addTaskApproval = async (
    instanceId: string, 
    approval: Omit<TaskApproval, 'id' | 'timestamp'>
  ) => {
    console.log('Adding task approval:', { instanceId, approval });
    // Would need backend implementation
  };

  const completeTaskInstance = async (instanceId: string) => {
    console.log('Completing task instance:', instanceId);
    // Would need backend implementation
  };

  const rolloverRecurringTask = async (baseTaskId: string): Promise<string> => {
    console.log('Rolling over recurring task:', baseTaskId);
    // Would need backend implementation
    return `${baseTaskId}-${Date.now()}`;
  };

  return {
    tasks,
    isLoading,
    getUserAccessibleTasks,
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
    removeTaskAttachment,
    escalateTask,
    deescalateTask,
    getEscalatedTasks,
    updateObservationStatus,
    createTaskInstance,
    getTaskInstanceById,
    getTaskInstances,
    addTaskApproval,
    completeTaskInstance,
    rolloverRecurringTask
  };
}
