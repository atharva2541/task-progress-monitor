
import { v4 as uuidv4 } from 'uuid';
import { AdminLog, AdminLogFilter, User } from '@/types';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'audit-tracker-admin-logs';
const MAX_LOCAL_STORAGE_LOGS = 1000;

class AdminLogService {
  private logs: AdminLog[] = [];

  constructor() {
    this.loadLogsFromStorage();
  }

  private loadLogsFromStorage(): void {
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
    }
  }

  private saveLogsToStorage(): void {
    try {
      // Only store the most recent logs to avoid storage limits
      const logsToStore = this.logs.slice(-MAX_LOCAL_STORAGE_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToStore));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  public addLog(
    user: User | null,
    action: AdminLog['action'],
    entityType: AdminLog['entityType'],
    details: string,
    entityId?: string,
    beforeState?: any,
    afterState?: any
  ): AdminLog {
    const log: AdminLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action,
      entityType,
      entityId,
      details,
      beforeState: beforeState ? JSON.stringify(beforeState) : undefined,
      afterState: afterState ? JSON.stringify(afterState) : undefined
    };

    this.logs.push(log);
    this.saveLogsToStorage();
    return log;
  }

  public getLogs(): AdminLog[] {
    return [...this.logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getFilteredLogs(filter: AdminLogFilter): AdminLog[] {
    return this.getLogs().filter(log => {
      // Date range filter
      if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) {
        return false;
      }
      if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) {
        return false;
      }

      // User filter
      if (filter.userId && log.userId !== filter.userId) {
        return false;
      }

      // Action type filter
      if (filter.action && log.action !== filter.action) {
        return false;
      }

      // Entity type filter
      if (filter.entityType && log.entityType !== filter.entityType) {
        return false;
      }

      // Search query filter (search in details)
      if (filter.searchQuery && 
          !log.details.toLowerCase().includes(filter.searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  public exportToExcel(logs: AdminLog[] = this.getLogs()): void {
    const data = logs.map(log => ({
      'Timestamp': new Date(log.timestamp).toLocaleString(),
      'User': log.userName,
      'Action': log.action,
      'Entity Type': log.entityType,
      'Entity ID': log.entityId || '',
      'Details': log.details
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Logs');

    // Auto-size columns
    const maxWidth = data.reduce((acc, row) => {
      Object.keys(row).forEach(key => {
        const length = row[key].toString().length;
        acc[key] = Math.max(acc[key] || 0, length);
      });
      return acc;
    }, {});

    worksheet['!cols'] = Object.keys(maxWidth).map(key => ({ wch: maxWidth[key] }));

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `audit-tracker-logs-${date}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }
}

// Create a singleton instance
const adminLogService = new AdminLogService();
export default adminLogService;
