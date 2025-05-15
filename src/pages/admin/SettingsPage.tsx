
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationSettings } from "@/components/settings/ApplicationSettings";
import { TaskSettings } from "@/components/settings/TaskSettings";
import { UserPreferences } from "@/components/settings/UserPreferences";
import { EmailTemplates } from "@/components/settings/EmailTemplates";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("application");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage application settings and preferences.</p>
      </div>

      <Tabs defaultValue="application" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="users">User Preferences</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="space-y-4">
          <ApplicationSettings />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserPreferences />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <EmailTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
