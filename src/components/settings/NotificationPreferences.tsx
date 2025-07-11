
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import type { NotificationPreferences as NotificationPreferencesType } from '@/types';

const formSchema = z.object({
  emailEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  taskAssignment: z.boolean(),
  taskUpdates: z.boolean(),
  dueDateReminders: z.boolean(),
  systemNotifications: z.boolean(),
  digestFrequency: z.enum(['immediate', 'daily', 'weekly']),
  quietHoursStart: z.string().nullable(),
  quietHoursEnd: z.string().nullable(),
});

export function NotificationPreferences() {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailEnabled: true,
      inAppEnabled: true,
      taskAssignment: true,
      taskUpdates: true,
      dueDateReminders: true,
      systemNotifications: true,
      digestFrequency: 'immediate',
      quietHoursStart: null,
      quietHoursEnd: null,
    },
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }

        if (data) {
          form.reset({
            emailEnabled: data.email_enabled,
            inAppEnabled: data.in_app_enabled,
            taskAssignment: data.task_assignment,
            taskUpdates: data.task_updates,
            dueDateReminders: data.due_date_reminders,
            systemNotifications: data.system_notifications,
            digestFrequency: data.digest_frequency,
            quietHoursStart: data.quiet_hours_start || null,
            quietHoursEnd: data.quiet_hours_end || null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Check if preferences exist
      const { data: existingData } = await supabase
        .from('user_notification_preferences')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      const preferenceData = {
        user_id: user.id,
        email_enabled: values.emailEnabled,
        in_app_enabled: values.inAppEnabled,
        task_assignment: values.taskAssignment,
        task_updates: values.taskUpdates,
        due_date_reminders: values.dueDateReminders,
        system_notifications: values.systemNotifications,
        digest_frequency: values.digestFrequency,
        quiet_hours_start: values.quietHoursStart,
        quiet_hours_end: values.quietHoursEnd,
      };

      let error;
      if (existingData) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from('user_notification_preferences')
          .update(preferenceData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Create new preferences
        const { error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert(preferenceData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableQuietHours = (enabled: boolean) => {
    if (!enabled) {
      form.setValue('quietHoursStart', null);
      form.setValue('quietHoursEnd', null);
    } else if (!form.getValues().quietHoursStart) {
      form.setValue('quietHoursStart', '22:00');
      form.setValue('quietHoursEnd', '07:00');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Customize how and when you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Channels</h3>
              
              <FormField
                control={form.control}
                name="emailEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inAppEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In-App Notifications</FormLabel>
                      <FormDescription>
                        Show notifications within the application
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Types</h3>

              <FormField
                control={form.control}
                name="taskAssignment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Task Assignments</FormLabel>
                      <FormDescription>
                        When you are assigned to a task
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Task Updates</FormLabel>
                      <FormDescription>
                        When tasks you're involved with are updated
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDateReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Due Date Reminders</FormLabel>
                      <FormDescription>
                        Reminders about upcoming task deadlines
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="systemNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">System Notifications</FormLabel>
                      <FormDescription>
                        Important system updates and announcements
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Delivery Settings</h3>

              <FormField
                control={form.control}
                name="digestFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How frequently you want to receive notification summaries
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="quiet-hours"
                    checked={!!form.watch('quietHoursStart')}
                    onCheckedChange={handleEnableQuietHours}
                  />
                  <label
                    htmlFor="quiet-hours"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable Quiet Hours
                  </label>
                </div>

                {form.watch('quietHoursStart') && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="quietHoursStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <TimePickerInput
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quietHoursEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <TimePickerInput
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
