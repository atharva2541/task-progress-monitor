
import { AdminLog } from "@/types";

export type AdminLogActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import';
export type AdminLogEntityType = 'user' | 'task' | 'system' | 'file' | 'setting' | 'report' | 'auth';

export interface AdminLogFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: AdminLogActionType;
  entityType?: AdminLogEntityType;
  searchQuery?: string;
}

export interface LogRetentionSettings {
  retentionPeriod: number; // days
  autoDeleteOldLogs: boolean;
  exportBeforeDelete: boolean;
}
