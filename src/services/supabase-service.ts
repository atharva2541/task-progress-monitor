
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskComment, SystemSetting, Profile } from '@/types/supabase';

export class SupabaseService {
  // Task operations
  static async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:profiles!tasks_assigned_to_fkey(name, email),
        created_user:profiles!tasks_created_by_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createTask(task: Partial<Task>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Task comments operations
  static async getTaskComments(taskId: string) {
    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:profiles(name, email)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async addTaskComment(taskId: string, comment: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // System settings operations
  static async getSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');

    if (error) throw error;
    return data;
  }

  static async updateSystemSetting(key: string, value: string) {
    const { data, error } = await supabase
      .from('system_settings')
      .update({ setting_value: value })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // File upload operations
  static async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(path, file);

    if (error) throw error;
    return data;
  }

  static async getFileUrl(path: string) {
    const { data } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  static async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('task-attachments')
      .remove([path]);

    if (error) throw error;
  }

  // Profile operations
  static async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  static async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
