
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Notification, NotificationPreferences } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  preferences: NotificationPreferences | null;
  loadingPreferences: boolean;
  fetchNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Transform DB notifications to our frontend format
      const transformedNotifications: Notification[] = (data || []).map((notif: any) => ({
        id: notif.id,
        userId: notif.user_id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        isRead: notif.is_read,
        createdAt: notif.created_at,
        timestamp: notif.timestamp,
        link: notif.link,
        taskId: notif.task_id,
        notificationType: notif.notification_type,
        referenceId: notif.reference_id,
        priority: notif.priority,
        deliveryStatus: notif.delivery_status,
        actionUrl: notif.action_url
      }));
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notification preferences from Supabase
  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoadingPreferences(true);
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }

      if (data) {
        // Transform from snake_case to camelCase
        const transformedPreferences: NotificationPreferences = {
          userId: data.user_id,
          emailEnabled: data.email_enabled,
          inAppEnabled: data.in_app_enabled,
          taskAssignment: data.task_assignment,
          taskUpdates: data.task_updates,
          dueDateReminders: data.due_date_reminders,
          systemNotifications: data.system_notifications,
          digestFrequency: data.digest_frequency,
          quietHoursStart: data.quiet_hours_start,
          quietHoursEnd: data.quiet_hours_end
        };
        
        setPreferences(transformedPreferences);
      } else {
        // Create default preferences if none exist
        const defaultPreferences = {
          userId: user.id,
          emailEnabled: true,
          inAppEnabled: true,
          taskAssignment: true,
          taskUpdates: true,
          dueDateReminders: true,
          systemNotifications: true,
          digestFrequency: 'immediate' as const,
          quietHoursStart: null,
          quietHoursEnd: null
        };

        const { error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: user.id,
            email_enabled: defaultPreferences.emailEnabled,
            in_app_enabled: defaultPreferences.inAppEnabled,
            task_assignment: defaultPreferences.taskAssignment,
            task_updates: defaultPreferences.taskUpdates,
            due_date_reminders: defaultPreferences.dueDateReminders,
            system_notifications: defaultPreferences.systemNotifications,
            digest_frequency: defaultPreferences.digestFrequency,
            quiet_hours_start: defaultPreferences.quietHoursStart,
            quiet_hours_end: defaultPreferences.quietHoursEnd
          });

        if (!insertError) {
          setPreferences(defaultPreferences);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  // Initial fetch of notifications and preferences
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user]);

  // Add a new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          task_id: notification.taskId,
          notification_type: notification.notificationType,
          reference_id: notification.referenceId,
          priority: notification.priority,
          action_url: notification.actionUrl,
          link: notification.link
        });

      if (error) throw error;

      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(notifications.map(notification => {
        if (notification.id === id) {
          return { ...notification, isRead: true };
        }
        return notification;
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    }
  };

  // Get notifications for a specific user
  const getUserNotifications = (userId: string) => {
    return notifications.filter(notification => notification.userId === userId);
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getUserNotifications,
      preferences,
      loadingPreferences,
      fetchNotifications,
      isLoading
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
