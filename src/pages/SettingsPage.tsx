
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPreferences } from '@/components/settings/UserPreferences';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { SystemSettingsFileSize } from '@/components/admin/SystemSettingsFileSize';
import { AwsSettings } from '@/components/settings/AwsSettings';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const SettingsPage = () => {
  const { profile } = useSupabaseAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and system settings</p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">User Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {profile?.role === 'admin' && (
            <>
              <TabsTrigger value="system">System Settings</TabsTrigger>
              <TabsTrigger value="aws">AWS Integration</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="preferences">
          <UserPreferences />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPreferences />
        </TabsContent>

        {profile?.role === 'admin' && (
          <>
            <TabsContent value="system">
              <SystemSettingsFileSize />
            </TabsContent>
            <TabsContent value="aws">
              <AwsSettings />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
