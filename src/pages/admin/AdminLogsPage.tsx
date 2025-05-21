
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LogsViewer from '@/components/admin/logs/LogsViewer';
import AdminLogsSettings from '@/components/admin/logs/AdminLogsSettings';

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
        <p className="text-muted-foreground">
          View and manage system-wide activity logs for all tasks and users
        </p>
      </div>
      
      <Tabs defaultValue="logs" className="w-full">
        <TabsList>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="settings">Log Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-6">
          <LogsViewer />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <AdminLogsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
