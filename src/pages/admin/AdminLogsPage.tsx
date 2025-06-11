
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminLog } from '@/contexts/AdminLogContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, Filter, RefreshCw } from 'lucide-react';

const AdminLogsPage = () => {
  const { logs, clearLogs, refreshLogs } = useAdminLog();
  const [activeTab, setActiveTab] = useState('all');
  
  // Get logs for the active tab
  const getFilteredLogs = () => {
    switch (activeTab) {
      case 'system':
        return logs.filter(log => log.category === 'system');
      case 'user':
        return logs.filter(log => log.category === 'user');
      case 'task':
        return logs.filter(log => log.category === 'task');
      case 'error':
        return logs.filter(log => log.level === 'error');
      default:
        return logs;
    }
  };
  
  const filteredLogs = getFilteredLogs();
  
  // Download logs as JSON
  const handleDownloadLogs = () => {
    const jsonString = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = `admin-logs-${activeTab}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="task">Task</TabsTrigger>
          <TabsTrigger value="error">Errors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <LogsTable logs={filteredLogs} />
        </TabsContent>
        <TabsContent value="system" className="mt-0">
          <LogsTable logs={filteredLogs} />
        </TabsContent>
        <TabsContent value="user" className="mt-0">
          <LogsTable logs={filteredLogs} />
        </TabsContent>
        <TabsContent value="task" className="mt-0">
          <LogsTable logs={filteredLogs} />
        </TabsContent>
        <TabsContent value="error" className="mt-0">
          <LogsTable logs={filteredLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Logs Table Component
const LogsTable = ({ logs }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Log Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Level</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Message</th>
                  <th className="p-2">User</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="p-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' : 
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="p-2 text-sm">{log.category}</td>
                    <td className="p-2 text-sm">{log.details || log.message}</td>
                    <td className="p-2 text-sm">{log.user || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No logs found matching the current filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLogsPage;
