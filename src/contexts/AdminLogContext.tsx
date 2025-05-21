
import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { AdminLog, AdminLogFilter, User } from '@/types';
import adminLogService from '@/services/AdminLogService';
import { useAuth } from './AuthContext';

interface AdminLogContextProps {
  logs: AdminLog[];
  filteredLogs: AdminLog[];
  filter: AdminLogFilter;
  setFilter: (filter: AdminLogFilter) => void;
  addLog: (
    action: AdminLog['action'],
    entityType: AdminLog['entityType'],
    details: string,
    entityId?: string,
    beforeState?: any,
    afterState?: any
  ) => void;
  clearLogs: () => void;
  exportLogs: () => void;
  exportFilteredLogs: () => void;
}

const AdminLogContext = createContext<AdminLogContextProps | undefined>(undefined);

export function AdminLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>(adminLogService.getLogs());
  const [filter, setFilter] = useState<AdminLogFilter>({});
  const [filteredLogs, setFilteredLogs] = useState<AdminLog[]>(logs);

  // Update filtered logs whenever filter or logs change
  const updateFilteredLogs = useCallback(() => {
    setFilteredLogs(adminLogService.getFilteredLogs(filter));
  }, [filter]);

  // Update logs and filtered logs
  const refreshLogs = useCallback(() => {
    const allLogs = adminLogService.getLogs();
    setLogs(allLogs);
    setFilteredLogs(adminLogService.getFilteredLogs(filter));
  }, [filter]);

  // Add a new log entry
  const addLog = useCallback(
    (
      action: AdminLog['action'],
      entityType: AdminLog['entityType'],
      details: string,
      entityId?: string,
      beforeState?: any,
      afterState?: any
    ) => {
      adminLogService.addLog(
        user,
        action,
        entityType,
        details,
        entityId,
        beforeState,
        afterState
      );
      refreshLogs();
    },
    [user, refreshLogs]
  );

  // Clear all logs
  const clearLogs = useCallback(() => {
    adminLogService.clearLogs();
    refreshLogs();
  }, [refreshLogs]);

  // Export all logs to Excel
  const exportLogs = useCallback(() => {
    adminLogService.exportToExcel();
  }, []);

  // Export filtered logs to Excel
  const exportFilteredLogs = useCallback(() => {
    adminLogService.exportToExcel(filteredLogs);
  }, [filteredLogs]);

  // Fix: Change useState to useEffect to run the effect after render
  useEffect(() => {
    updateFilteredLogs();
  }, [filter, logs, updateFilteredLogs]);

  return (
    <AdminLogContext.Provider
      value={{
        logs,
        filteredLogs,
        filter,
        setFilter,
        addLog,
        clearLogs,
        exportLogs,
        exportFilteredLogs
      }}
    >
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
