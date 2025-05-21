
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActivityLog, ActivityLogActionType, User, Task } from '@/types';
import { useAuth } from './AuthContext';

interface AdminLogContextType {
  logs: ActivityLog[];
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getLogsByUserId: (userId: string) => ActivityLog[];
  getLogsByTaskId: (taskId: string) => ActivityLog[];
  getLogsByDate: (startDate: string, endDate: string) => ActivityLog[];
  getLogsByType: (actionType: ActivityLogActionType) => ActivityLog[];
  getFilteredLogs: (filters: AdminLogFilter) => ActivityLog[];
  exportLogs: (logs: ActivityLog[]) => void;
  logRetentionDays: number;
  setLogRetentionDays: (days: number) => void;
}

export interface AdminLogFilter {
  dateRange?: { start: Date; end: Date };
  userId?: string;
  actionType?: ActivityLogActionType | string;
  taskId?: string;
  searchQuery?: string;
}

const AdminLogContext = createContext<AdminLogContextType | undefined>(undefined);

export function AdminLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logRetentionDays, setLogRetentionDays] = useState<number>(90); // Default 90 days
  const { user } = useAuth();
  
  // Load logs from localStorage on init
  useEffect(() => {
    const savedLogs = localStorage.getItem('adminLogs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (error) {
        console.error('Failed to parse saved logs:', error);
      }
    }
    
    const savedRetention = localStorage.getItem('logRetentionDays');
    if (savedRetention) {
      setLogRetentionDays(parseInt(savedRetention, 10));
    }
  }, []);
  
  // Save logs to localStorage on change
  useEffect(() => {
    localStorage.setItem('adminLogs', JSON.stringify(logs));
  }, [logs]);
  
  // Save retention setting to localStorage
  useEffect(() => {
    localStorage.setItem('logRetentionDays', logRetentionDays.toString());
  }, [logRetentionDays]);
  
  // Clean up old logs based on retention period
  useEffect(() => {
    const cleanUpLogs = () => {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - logRetentionDays);
      
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= retentionDate;
      });
      
      if (filteredLogs.length !== logs.length) {
        setLogs(filteredLogs);
        console.log(`Cleaned up ${logs.length - filteredLogs.length} logs older than ${logRetentionDays} days`);
      }
    };
    
    cleanUpLogs();
    // Run cleanup daily
    const interval = setInterval(cleanUpLogs, 86400000);
    return () => clearInterval(interval);
  }, [logs, logRetentionDays]);
  
  const addLog = (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setLogs(currentLogs => [newLog, ...currentLogs]);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  const getLogsByUserId = (userId: string) => {
    return logs.filter(log => log.userId === userId);
  };
  
  const getLogsByTaskId = (taskId: string) => {
    return logs.filter(log => log.taskId === taskId);
  };
  
  const getLogsByDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  };
  
  const getLogsByType = (actionType: ActivityLogActionType) => {
    return logs.filter(log => log.actionType === actionType);
  };
  
  const getFilteredLogs = (filters: AdminLogFilter) => {
    return logs.filter(log => {
      // Filter by date range
      if (filters.dateRange) {
        const logDate = new Date(log.timestamp);
        if (logDate < filters.dateRange.start || logDate > filters.dateRange.end) {
          return false;
        }
      }
      
      // Filter by user
      if (filters.userId && filters.userId !== 'none' && log.userId !== filters.userId) {
        return false;
      }
      
      // Filter by action type
      if (filters.actionType && filters.actionType !== 'none' && log.actionType !== filters.actionType) {
        return false;
      }
      
      // Filter by task
      if (filters.taskId && log.taskId !== filters.taskId) {
        return false;
      }
      
      // Search query (search in task name, user name, and details)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTaskName = log.details.taskName.toLowerCase().includes(query);
        const matchesComment = log.details.comment?.toLowerCase().includes(query) || false;
        
        if (!matchesTaskName && !matchesComment) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const exportLogs = (logsToExport: ActivityLog[]) => {
    // Implementation for exporting logs to CSV/Excel will go here
    console.log('Exporting logs:', logsToExport);
    alert('Export functionality will be implemented in a future update.');
  };
  
  return (
    <AdminLogContext.Provider value={{
      logs,
      addLog,
      clearLogs,
      getLogsByUserId,
      getLogsByTaskId,
      getLogsByDate,
      getLogsByType,
      getFilteredLogs,
      exportLogs,
      logRetentionDays,
      setLogRetentionDays
    }}>
      {children}
    </AdminLogContext.Provider>
  );
}

export function useAdminLog() {
  const context = useContext(AdminLogContext);
  if (context === undefined) {
    throw new Error('useAdminLog must be used within an AdminLogProvider');
  }
  return context;
}
