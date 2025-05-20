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
import { mockTasks } from '@/data/mockTasks';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

export function useTaskService() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const { toast } = useToast();
  const { getUserById: authGetUserById, user } = useAuth();

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
      case 'fortnightly':
        nextDate = addWeeks(date, 2);
        break;
      case 'monthly':
        nextDate = addMonths(date, 1);
        break;
      case 'quarterly':
        nextDate = addMonths(date, 3);
        break;
      case 'annually':
        nextDate = addMonths(date, 12);
        break;
      default:
        nextDate = date; // one-time tasks don't have next instances
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
      case 'fortnightly':
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
      case 'annually':
        startDate = new Date(date);
        startDate.setFullYear(date.getFullYear() - 1);
        break;
      default:
        startDate = date; // For one-time tasks, period starts on the due date
    }
    
    return { 
      start: startDate.toISOString(), 
      end: endDate.toISOString() 
    };
  };

  // New method to get tasks accessible to a specific user
  const getUserAccessibleTasks = (userId: string, userRole: string): Task[] => {
    // Admin can see all tasks
    if (userRole === 'admin') return tasks;
    
    // Non-admins can only see tasks they're involved in
    return tasks.filter(task => 
      task.assignedTo === userId || // As Maker
      task.checker1 === userId ||   // As Checker1
      task.checker2 === userId      // As Checker2
    );
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const taskId = Date.now().toString();
    
    const newTask: Task = {
      ...task,
      id: taskId,
      createdAt: now,
      updatedAt: now,
      comments: [],
      attachments: [], // Initialize empty attachments array
      notificationSettings: {
        enablePreNotifications: task.notificationSettings?.enablePreNotifications ?? true,
        preDays: task.notificationSettings?.preDays ?? [1, 3, 7],
        enablePostNotifications: true, // Always mandatory
        postNotificationFrequency: task.notificationSettings?.postNotificationFrequency ?? 'daily',
        sendEmails: true, // Always mandatory
        notifyMaker: true, // Always mandatory
        notifyChecker1: true, // Always mandatory
        notifyChecker2: true // Always mandatory
      },
      instances: [],
      isTemplate: task.isRecurring // If recurring, this is a template
    };
    
    // If it's a recurring task, create the first instance
    if (newTask.isRecurring) {
      // Set next instance date based on frequency
      newTask.nextInstanceDate = calculateNextInstanceDate(
        task.dueDate, 
        task.frequency
      );
      
      // Create the first instance
      createTaskInstanceInternal(newTask).then(instanceId => {
        newTask.currentInstanceId = instanceId;
        
        // Update the tasks state with the complete task including instance
        setTasks(prevTasks => {
          return prevTasks.map(t => 
            t.id === newTask.id ? { ...newTask } : t
          );
        });
      });
    }
    
    setTasks([...tasks, newTask]);
    toast({
      title: 'Task created',
      description: `Task "${newTask.name}" has been created successfully.`
    });
  };

  // Internal helper to create a task instance
  const createTaskInstanceInternal = async (baseTask: Task): Promise<string> => {
    const now = new Date().toISOString();
    const instanceId = `${baseTask.id}-${Date.now()}`;
    
    const { start, end } = calculatePeriodDates(baseTask.dueDate, baseTask.frequency);
    
    const newInstance: TaskInstance = {
      id: instanceId,
      baseTaskId: baseTask.id,
      instanceReference: generateInstanceReference(baseTask.id, new Date(baseTask.dueDate)),
      periodStart: start,
      periodEnd: end,
      status: 'pending',
      dueDate: baseTask.dueDate,
      comments: [],
      attachments: [],
      approvals: [],
      observationStatus: baseTask.observationStatus,
      createdAt: now,
      updatedAt: now,
    };
    
    setTaskInstances(prev => [...prev, newInstance]);
    return instanceId;
  };

  // Public method to create a task instance
  const createTaskInstance = async (baseTaskId: string): Promise<string> => {
    const baseTask = tasks.find(task => task.id === baseTaskId);
    if (!baseTask) {
      throw new Error("Base task not found");
    }
    
    const instanceId = await createTaskInstanceInternal(baseTask);
    
    toast({
      title: 'Instance created',
      description: `New instance of task "${baseTask.name}" has been created.`
    });
    
    return instanceId;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Ensure mandatory notification settings are preserved
        const updatedNotificationSettings = updates.notificationSettings ? {
          ...updates.notificationSettings,
          enablePostNotifications: true, // Always mandatory
          sendEmails: true, // Always mandatory
          notifyMaker: true, // Always mandatory
          notifyChecker1: true, // Always mandatory
          notifyChecker2: true, // Always mandatory
        } : task.notificationSettings;

        return {
          ...task,
          ...updates,
          notificationSettings: updatedNotificationSettings,
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
      
      // Also delete all instances if this was a recurring task
      if (taskToDelete.isRecurring) {
        setTaskInstances(prev => prev.filter(instance => instance.baseTaskId !== taskId));
      }
      
      toast({
        title: 'Task deleted',
        description: `Task "${taskToDelete.name}" has been deleted.`,
        variant: 'destructive'
      });
    }
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, comment?: string) => {
    const now = new Date().toISOString();
    
    // Check if this is a base task or an instance
    const baseTask = tasks.find(task => task.id === taskId);
    
    if (baseTask) {
      // If it has a current instance, update that instead
      if (baseTask.currentInstanceId) {
        updateTaskInstanceStatus(baseTask.currentInstanceId, status, comment);
        return;
      }
      
      // Otherwise update the base task directly (for non-recurring tasks)
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status,
            updatedAt: now
          };
          
          // Add submittedAt date when the task is submitted for review
          if (status === 'submitted') {
            updatedTask.submittedAt = now;
          }
          
          if (comment) {
            updatedTask.comments = [
              ...(task.comments || []),
              {
                id: Date.now().toString(),
                taskId,
                userId: user?.id || '1',
                content: comment,
                createdAt: now
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
        'checker1-approved': 'Task approved by Checker 1',
        'approved': 'Task fully approved',
        'rejected': 'Task rejected'
      };
      
      toast({
        title: statusMessages[status],
        description: `The task status has been updated to ${status}.`,
        variant: status === 'rejected' ? 'destructive' : 'default'
      });
    } else {
      // This might be an instance ID
      updateTaskInstanceStatus(taskId, status, comment);
    }
  };
  
  // Update status for a task instance
  const updateTaskInstanceStatus = (instanceId: string, status: TaskStatus, comment?: string) => {
    const now = new Date().toISOString();
    
    setTaskInstances(prev => prev.map(instance => {
      if (instance.id === instanceId) {
        const updatedInstance = {
          ...instance,
          status,
          updatedAt: now
        };
        
        // Add submittedAt date when the task is submitted for review
        if (status === 'submitted') {
          updatedInstance.submittedAt = now;
        }
        
        if (comment) {
          updatedInstance.comments = [
            ...instance.comments,
            {
              id: Date.now().toString(),
              taskId: instance.id,
              userId: user?.id || '1',
              content: comment,
              createdAt: now
            }
          ];
        }
        
        // Update base task status to match its current instance
        setTasks(tasks => tasks.map(task => {
          if (task.id === instance.baseTaskId && task.currentInstanceId === instanceId) {
            return {
              ...task,
              status, // Sync the status
              updatedAt: now
            };
          }
          return task;
        }));
        
        return updatedInstance;
      }
      return instance;
    }));
    
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
  };

  // Add an approval to a task instance
  const addTaskApproval = (instanceId: string, approval: Omit<TaskApproval, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString();
    
    setTaskInstances(prev => prev.map(instance => {
      if (instance.id === instanceId) {
        const newApproval: TaskApproval = {
          id: Date.now().toString(),
          timestamp: now,
          ...approval
        };
        
        return {
          ...instance,
          approvals: [...instance.approvals, newApproval],
          updatedAt: now
        };
      }
      return instance;
    }));
    
    toast({
      title: approval.status === 'approved' ? 'Task approved' : 'Task rejected',
      description: `The task has been ${approval.status} by ${approval.userRole}.`,
      variant: approval.status === 'approved' ? 'default' : 'destructive'
    });
  };

  // Mark a task instance as completed
  const completeTaskInstance = (instanceId: string) => {
    const now = new Date().toISOString();
    
    setTaskInstances(prev => prev.map(instance => {
      if (instance.id === instanceId) {
        return {
          ...instance,
          status: 'approved',
          completedAt: now,
          updatedAt: now
        };
      }
      return instance;
    }));
    
    // Find the base task
    const instance = taskInstances.find(i => i.id === instanceId);
    if (!instance) return;
    
    const baseTask = tasks.find(task => task.id === instance.baseTaskId);
    if (!baseTask || !baseTask.isRecurring) return;
    
    // Create the next instance if this is a recurring task
    rolloverRecurringTask(instance.baseTaskId);
  };

  // Create the next instance of a recurring task
  const rolloverRecurringTask = async (baseTaskId: string): Promise<string> => {
    const baseTask = tasks.find(task => task.id === baseTaskId);
    if (!baseTask || !baseTask.isRecurring) {
      throw new Error("Not a recurring task");
    }
    
    // Calculate the next due date
    const nextDueDate = calculateNextInstanceDate(baseTask.dueDate, baseTask.frequency);
    
    // Update the base task with the new due date
    const updatedBaseTask: Task = {
      ...baseTask,
      dueDate: nextDueDate,
      nextInstanceDate: calculateNextInstanceDate(nextDueDate, baseTask.frequency),
      updatedAt: new Date().toISOString()
    };
    
    // Create new instance
    const newInstanceId = await createTaskInstanceInternal(updatedBaseTask);
    
    // Update the base task with the new current instance ID
    setTasks(prev => prev.map(task => {
      if (task.id === baseTaskId) {
        return {
          ...updatedBaseTask,
          currentInstanceId: newInstanceId,
        };
      }
      return task;
    }));
    
    toast({
      title: 'Task rolled over',
      description: `New instance created for recurring task "${baseTask.name}".`
    });
    
    return newInstanceId;
  };

  const updateObservationStatus = (taskId: string, status: ObservationStatus, userId: string) => {
    // Check if this is a task instance first
    const instance = taskInstances.find(i => i.id === taskId);
    if (instance) {
      setTaskInstances(prev => prev.map(i => {
        if (i.id === taskId) {
          const previousStatus = i.observationStatus;
          return {
            ...i,
            observationStatus: status,
            updatedAt: new Date().toISOString()
          };
        }
        return i;
      }));
      
      // Also update base task if this is the current instance
      const baseTask = tasks.find(t => t.id === instance.baseTaskId);
      if (baseTask && baseTask.currentInstanceId === taskId) {
        setTasks(prev => prev.map(t => {
          if (t.id === instance.baseTaskId) {
            return {
              ...t,
              observationStatus: status,
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        }));
      }
    } else {
      // Try updating the task directly
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          // Store previous status for history tracking
          const previousStatus = task.observationStatus || null;
          
          return {
            ...task,
            observationStatus: status,
            // Add to history if there was a previous status
            observationHistory: previousStatus ? {
              previousStatus,
              changedAt: new Date().toISOString(),
              changedBy: userId
            } : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      }));
    }

    toast({
      title: 'Observation status updated',
      description: `Task observation status has been set to ${status === 'yes' ? 'Yes' : status === 'no' ? 'No' : 'Mixed'}.`
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
    
    // First check if this is a task instance ID
    const instance = taskInstances.find(i => i.id === taskId);
    if (instance) {
      setTaskInstances(prev => prev.map(i => {
        if (i.id === taskId) {
          return {
            ...i,
            attachments: [...i.attachments, attachment],
            updatedAt: new Date().toISOString()
          };
        }
        return i;
      }));
    } else {
      // Try adding to a base task
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
    }
    
    toast({
      title: 'File uploaded',
      description: `${attachmentData.fileName} has been attached to the task.`
    });
  };

  const removeTaskAttachment = (taskId: string, attachmentId: string) => {
    // First check if this is a task instance ID
    const instance = taskInstances.find(i => i.id === taskId);
    if (instance) {
      setTaskInstances(prev => prev.map(i => {
        if (i.id === taskId) {
          return {
            ...i,
            attachments: i.attachments.filter(att => att.id !== attachmentId),
            updatedAt: new Date().toISOString()
          };
        }
        return i;
      }));
    } else {
      // Try removing from a base task
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
    }
    
    toast({
      title: 'File removed',
      description: 'The attachment has been removed from the task.'
    });
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

  // Use the getUserById function from AuthContext
  const getUserById = (userId: string) => {
    return authGetUserById(userId);
  };

  // Persist tasks and instances to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('taskInstances', JSON.stringify(taskInstances));
  }, [tasks, taskInstances]);

  // Load tasks and instances from localStorage on init
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to parse saved tasks:', error);
      }
    }
    
    const savedInstances = localStorage.getItem('taskInstances');
    if (savedInstances) {
      try {
        setTaskInstances(JSON.parse(savedInstances));
      } catch (error) {
        console.error('Failed to parse saved task instances:', error);
      }
    }
  }, []);

  // New method to escalate a task
  const escalateTask = (taskId: string, priority: EscalationPriority, reason: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          escalation: {
            isEscalated: true,
            priority,
            reason,
            escalatedAt: new Date().toISOString(),
            escalatedBy: user?.id
          },
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
    
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
  };

  // Method to de-escalate a task
  const deescalateTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.escalation) {
        const { escalation, ...taskWithoutEscalation } = task;
        return {
          ...taskWithoutEscalation,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
    
    toast({
      title: 'Task De-escalated',
      description: 'The task has been de-escalated and returned to normal workflow.'
    });
  };

  // Method to get all escalated tasks
  const getEscalatedTasks = () => {
    return tasks.filter(task => task.escalation?.isEscalated);
  };

  return {
    tasks,
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
    // Escalation methods
    escalateTask,
    deescalateTask,
    getEscalatedTasks,
    // Observation status method
    updateObservationStatus,
    // Task instance methods
    createTaskInstance,
    getTaskInstanceById,
    getTaskInstances,
    addTaskApproval,
    completeTaskInstance,
    rolloverRecurringTask
  };
}
