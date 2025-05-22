
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogsViewer } from '@/components/admin/logs/LogsViewer';
import { AdminLogsSettings } from '@/components/admin/logs/AdminLogsSettings';
import { ActivityLog } from '@/types';

// Sample logs for demonstration
const mockLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    actionType: 'task-created',
    userId: '1',
    userRole: 'admin',
    taskId: '1',
    details: {
      taskName: 'Monthly Financial Report',
      taskCategory: 'Finance',
      maker: '2',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    }
  },
  {
    id: '2',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
    actionType: 'task-updated',
    userId: '2',
    userRole: 'maker',
    taskId: '1',
    details: {
      taskName: 'Monthly Financial Report',
      taskCategory: 'Finance',
      oldValue: 'Due in 3 days',
      newValue: 'Due in 5 days',
    }
  },
  {
    id: '3',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString(),
    actionType: 'task-submitted',
    userId: '2',
    userRole: 'maker',
    taskId: '3',
    details: {
      taskName: 'Quarterly Compliance Audit',
      taskCategory: 'Compliance',
      comment: 'All sections completed as required',
    }
  },
  {
    id: '4',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    actionType: 'task-approved',
    userId: '3',
    userRole: 'checker1',
    taskId: '4',
    details: {
      taskName: 'Weekly Team Report',
      taskCategory: 'HR',
      comment: 'Approved with minor comments',
    }
  },
  {
    id: '5',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    actionType: 'task-escalated',
    userId: '4',
    userRole: 'checker2',
    taskId: '5',
    details: {
      taskName: 'System Security Review',
      taskCategory: 'Security',
      comment: 'Critical vulnerabilities need immediate attention',
    }
  }
];

const AdminLogsPage: React.FC = () => {
  const { users } = useAuth();
  const [filters, setFilters] = useState({
    actionType: 'all',
    userId: 'all',
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">System Logs</h1>
      
      <AdminLogsSettings 
        users={users || []} 
        onFilterChange={handleFilterChange} 
      />
      
      <LogsViewer 
        logs={mockLogs} 
        filterOptions={filters}
      />
    </div>
  );
};

export default AdminLogsPage;
