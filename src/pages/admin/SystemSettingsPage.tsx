
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwsSettings } from "@/components/settings/AwsSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DataManagementSettings } from "@/components/settings/DataManagementSettings";
import { SystemMonitoringSettings } from "@/components/settings/SystemMonitoringSettings";

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("aws");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and integrations.</p>
      </div>

      <Tabs defaultValue="aws" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="aws">AWS Integration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="aws" className="space-y-4">
          <AwsSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataManagementSettings />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <SystemMonitoringSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsPage;
