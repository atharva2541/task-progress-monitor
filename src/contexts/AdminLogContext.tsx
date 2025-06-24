import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ActivityLog, ActivityLogActionType } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Initial mock activity logs
const initialLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'login',
    userId: '1',
    details: 'Admin user logged in',
    category: 'user',
    level: 'info'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    action: 'create_task',
    userId: '1',
    taskId: '123',
    taskName: 'Monthly Financial Report',
    details: 'Created task "Monthly Financial Report"',
    category: 'task',
    level: 'info'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    action: 'system',
    userId: 'system',
    details: 'System backup completed successfully',
    category: 'system',
    level: 'info'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    action: 'delete_task',
    userId: '1',
    taskId: '456',
    taskName: 'Outdated Task',
    details: 'Deleted task "Outdated Task"',
    category: 'task',
    level: 'warning'
  }
];

interface AdminLogContextProps {
  logs: ActivityLog[];
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  refreshLogs: () => void;
}

const AdminLogContext = createContext<AdminLogContextProps | undefined>(undefined);

export const AdminLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load logs from API on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/logs');
      if (response.data && Array.isArray(response.data)) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Keep using mock logs on error
    }
  };

  const addLog = (newLog: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const log: ActivityLog = {
      ...newLog,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setLogs((prevLogs) => [log, ...prevLogs]);

    // For certain important logs, also show a toast notification
    if (
      newLog.level === 'error' ||
      newLog.action === 'escalate_task' ||
      newLog.action === 'user_deleted'
    ) {
      toast({
        title: `${newLog.level === 'error' ? 'Error' : 'Alert'}: ${formatActionType(newLog.action)}`,
        description: newLog.details,
        variant: newLog.level === 'error' ? 'destructive' : 'default',
      });
    }

    // In a real app, we would also send this to the server
    try {
      axios.post('/api/logs', log);
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  // Helper function to format action types for display
  const formatActionType = (actionType: ActivityLogActionType): string => {
    switch (actionType) {
      case 'login':
        return 'User Login';
      case 'logout':
        return 'User Logout';
      case 'create_task':
        return 'Task Created';
      case 'update_task':
        return 'Task Updated';
      case 'delete_task':
        return 'Task Deleted';
      case 'submit_task':
        return 'Task Submitted';
      case 'approve_task':
        return 'Task Approved';
      case 'reject_task':
        return 'Task Rejected';
      case 'escalate_task':
        return 'Task Escalated';
      case 'user_created':
        return 'User Created';
      case 'user_updated':
        return 'User Updated';
      case 'user_deleted':
        return 'User Deleted';
      case 'system':
        return 'System Event';
      default:
        return actionType;
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const refreshLogs = () => {
    fetchLogs();
    toast({
      title: 'Logs Refreshed',
      description: 'The activity logs have been refreshed.',
    });
  };

  return (
    <AdminLogContext.Provider value={{ logs, addLog, clearLogs, refreshLogs }}>
      {children}
    </AdminLogContext.Provider>
  );
};

export const useAdminLog = () => {
  const context = useContext(AdminLogContext);
  if (context === undefined) {
    throw new Error('useAdminLog must be used within an AdminLogProvider');
  }
  return context;
};
