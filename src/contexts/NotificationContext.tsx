
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Notification } from '@/types';

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2', // For Maker
    title: 'Task Due Today',
    message: 'The "Daily System Check" task is due today.',
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '3', // For Checker1
    title: 'New Task Submitted',
    message: 'A task "Quarterly Compliance Audit" has been submitted for your review.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    userId: '4', // For Checker2
    title: 'Task Escalation',
    message: 'The task "System Security Review" was rejected and needs your attention.',
    type: 'error',
    read: false,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString()
  }
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: (userId: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setNotifications([newNotification, ...notifications]);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    }));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getUserNotifications = (userId: string) => {
    return notifications.filter(notification => notification.userId === userId);
  };

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Load notifications from localStorage on init
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getUserNotifications
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
