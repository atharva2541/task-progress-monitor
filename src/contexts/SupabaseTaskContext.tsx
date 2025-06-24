
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { toast } from '@/hooks/use-toast';
import { Task, TaskStatus, TaskInstance, TaskAttachment, TaskComment } from '@/types';

interface SupabaseTaskContextType {
  tasks: Task[];
  calendarTasks: Task[];
  isLoading: boolean;
  isCalendarLoading: boolean;
  refreshTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ error: any }>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ error: any }>;
  deleteTask: (id: string) => Promise<{ error: any }>;
  updateTaskStatus: (taskId: string, status: TaskStatus, comment?: string) => Promise<{ error: any }>;
  getTaskById: (id: string) => Task | undefined;
  getUserAccessibleTasks: (userId: string, userRole: string) => Task[];
  uploadTaskAttachment: (taskId: string, file: File) => Promise<{ error: any }>;
  deleteTaskAttachment: (taskId: string, attachmentId: string) => Promise<{ error: any }>;
  addTaskComment: (taskId: string, comment: string) => Promise<{ error: any }>;
}

const SupabaseTaskContext = createContext<SupabaseTaskContextType | undefined>(undefined);

export const SupabaseTaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const { user, profile } = useSupabaseAuth();

  const refreshTasks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(name),
          checker1_profile:profiles!tasks_checker1_fkey(name),
          checker2_profile:profiles!tasks_checker2_fkey(name),
          task_attachments(*),
          task_comments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        name: task.name || task.title,
        description: task.description,
        category: task.category,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        submittedAt: task.submitted_at,
        completedAt: task.completed_at,
        frequency: task.frequency,
        isRecurring: task.is_recurring,
        assignedTo: task.assigned_to,
        checker1: task.checker1,
        checker2: task.checker2,
        createdBy: task.created_by,
        observationStatus: task.observation_status,
        isEscalated: task.is_escalated,
        escalationPriority: task.escalation_priority,
        escalationReason: task.escalation_reason,
        escalatedAt: task.escalated_at,
        escalatedBy: task.escalated_by,
        isTemplate: task.is_template,
        currentInstanceId: task.current_instance_id,
        nextInstanceDate: task.next_instance_date,
        attachments: task.task_attachments?.map((att: any) => ({
          id: att.id,
          taskId: att.task_id,
          userId: att.user_id,
          fileName: att.file_name,
          fileType: att.file_type,
          fileUrl: att.file_url,
          fileSize: att.file_size,
          uploadedAt: att.uploaded_at
        })) || [],
        comments: task.task_comments?.map((comment: any) => ({
          id: comment.id,
          taskId: comment.task_id,
          userId: comment.user_id,
          content: comment.comment,
          createdAt: comment.created_at
        })) || []
      }));

      setTasks(formattedTasks);
    } catch (error: any) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('tasks')
      .insert({
        name: taskData.name,
        description: taskData.description,
        category: taskData.category,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        frequency: taskData.frequency,
        is_recurring: taskData.isRecurring,
        assigned_to: taskData.assignedTo,
        checker1: taskData.checker1,
        checker2: taskData.checker2,
        created_by: user.id,
        observation_status: taskData.observationStatus,
        is_template: taskData.isTemplate
      });

    if (!error) {
      await refreshTasks();
      toast({
        title: "Task created",
        description: `Task "${taskData.name}" has been created successfully.`
      });
    }

    return { error };
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        status: updates.status,
        priority: updates.priority,
        due_date: updates.dueDate,
        frequency: updates.frequency,
        is_recurring: updates.isRecurring,
        assigned_to: updates.assignedTo,
        checker1: updates.checker1,
        checker2: updates.checker2,
        observation_status: updates.observationStatus,
        is_escalated: updates.isEscalated,
        escalation_priority: updates.escalationPriority,
        escalation_reason: updates.escalationReason,
        submitted_at: updates.status === 'submitted' ? new Date().toISOString() : undefined
      })
      .eq('id', id);

    if (!error) {
      await refreshTasks();
      toast({
        title: "Task updated",
        description: "Task has been updated successfully."
      });
    }

    return { error };
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) {
      await refreshTasks();
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
        variant: "destructive"
      });
    }

    return { error };
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus, comment?: string) => {
    const updateData: any = { status };
    
    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);

    if (!error && comment) {
      await addTaskComment(taskId, comment);
    }

    if (!error) {
      await refreshTasks();
      const statusMessages = {
        'pending': 'Task marked as pending',
        'in-progress': 'Task started',
        'submitted': 'Task submitted for review',
        'approved': 'Task approved',
        'rejected': 'Task rejected'
      };
      
      toast({
        title: statusMessages[status] || 'Task status updated',
        description: `The task status has been updated to ${status}.`,
        variant: status === 'rejected' ? 'destructive' : 'default'
      });
    }

    return { error };
  };

  const uploadTaskAttachment = async (taskId: string, file: File) => {
    if (!user) return { error: 'Not authenticated' };

    // Get max file size from system settings
    const { data: settingsData } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'max_file_size')
      .single();

    const maxSize = settingsData ? parseInt(settingsData.setting_value) : 5120; // Default 5KB

    if (file.size > maxSize) {
      return { error: `File size exceeds maximum allowed size of ${maxSize} bytes` };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${taskId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file);

    if (uploadError) return { error: uploadError };

    const { data: urlData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_url: urlData.publicUrl,
        file_size: file.size,
        storage_path: fileName
      });

    if (!dbError) {
      await refreshTasks();
    }

    return { error: dbError };
  };

  const deleteTaskAttachment = async (taskId: string, attachmentId: string) => {
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single();

    if (attachment?.storage_path) {
      await supabase.storage
        .from('task-attachments')
        .remove([attachment.storage_path]);
    }

    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId);

    if (!error) {
      await refreshTasks();
    }

    return { error };
  };

  const addTaskComment = async (taskId: string, comment: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        comment
      });

    return { error };
  };

  const getTaskById = (id: string) => tasks.find(task => task.id === id);

  const getUserAccessibleTasks = (userId: string, userRole: string) => {
    if (userRole === 'admin') return tasks;
    
    return tasks.filter(task => 
      task.assignedTo === userId || 
      task.checker1 === userId || 
      task.checker2 === userId ||
      task.createdBy === userId
    );
  };

  useEffect(() => {
    if (user) {
      refreshTasks();
    }
  }, [user]);

  return (
    <SupabaseTaskContext.Provider value={{
      tasks,
      calendarTasks,
      isLoading,
      isCalendarLoading,
      refreshTasks,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      getTaskById,
      getUserAccessibleTasks,
      uploadTaskAttachment,
      deleteTaskAttachment,
      addTaskComment
    }}>
      {children}
    </SupabaseTaskContext.Provider>
  );
};

export const useSupabaseTasks = () => {
  const context = useContext(SupabaseTaskContext);
  if (context === undefined) {
    throw new Error('useSupabaseTasks must be used within a SupabaseTaskProvider');
  }
  return context;
};
