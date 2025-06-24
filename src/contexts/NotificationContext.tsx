
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Notification, NotificationPreferences } from '@/types';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

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
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get('/api/notifications');
      
      // Transform DB notifications to our frontend format
      const transformedNotifications: Notification[] = response.data.map((notif: any) => ({
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoadingPreferences(true);
      const response = await axios.get('/api/notifications/preferences');
      
      // Transform from snake_case to camelCase
      const transformedPreferences: NotificationPreferences = {
        userId: response.data.user_id,
        emailEnabled: response.data.email_enabled,
        inAppEnabled: response.data.in_app_enabled,
        taskAssignment: response.data.task_assignment,
        taskUpdates: response.data.task_updates,
        dueDateReminders: response.data.due_date_reminders,
        systemNotifications: response.data.system_notifications,
        digestFrequency: response.data.digest_frequency,
        quietHoursStart: response.data.quiet_hours_start,
        quietHoursEnd: response.data.quiet_hours_end
      };
      
      setPreferences(transformedPreferences);
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
    // This would typically be done by the server
    // In a real application, we'd receive notifications via WebSocket or polling
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    setNotifications([newNotification, ...notifications]);
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      
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
    try {
      await axios.put('/api/notifications/mark-all-read');
      
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
      await axios.delete(`/api/notifications/${id}`);
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

  // Refresh notifications periodically (every 2 minutes)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
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
