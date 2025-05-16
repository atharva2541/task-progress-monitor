import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskComment, TaskAttachment, EscalationPriority } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mockTasks } from '@/data/mockTasks';

export function useTaskService() {
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
      notificationSettings: {
        enablePreNotifications: task.notificationSettings?.enablePreNotifications ?? true,
        preDays: task.notificationSettings?.preDays ?? [1, 3, 7],
        enablePostNotifications: true, // Always mandatory
        postNotificationFrequency: task.notificationSettings?.postNotificationFrequency ?? 'daily',
        sendEmails: true, // Always mandatory
        notifyMaker: true, // Always mandatory
        notifyChecker1: true, // Always mandatory
        notifyChecker2: true // Always mandatory
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
        
        // Add submittedAt date when the task is submitted for review
        if (status === 'submitted') {
          updatedTask.submittedAt = new Date().toISOString();
        }
        
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
    // New escalation methods
    escalateTask,
    deescalateTask,
    getEscalatedTasks
  };
}
