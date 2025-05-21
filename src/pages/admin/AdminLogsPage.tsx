
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogsViewer } from "@/components/admin/logs/LogsViewer";
import { AdminLogProvider } from "@/contexts/AdminLogContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLogsSettings } from "@/components/admin/logs/AdminLogsSettings";
import { useState } from "react";
import { FileText, Settings } from "lucide-react";

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<string>("logs");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Logs</h1>
        <p className="text-muted-foreground">View and export system activity logs</p>
      </div>

      <AdminLogProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Log Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <LogsViewer />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AdminLogsSettings />
          </TabsContent>
        </Tabs>
      </AdminLogProvider>
    </div>
  );
}
