
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from 'axios';
import { NotificationPreferences } from '@/types';

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
  const { user } = useAuth();
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
        const response = await axios.get<NotificationPreferences>('/api/notifications/preferences');
        
        form.reset({
          emailEnabled: response.data.emailEnabled,
          inAppEnabled: response.data.inAppEnabled,
          taskAssignment: response.data.taskAssignment,
          taskUpdates: response.data.taskUpdates,
          dueDateReminders: response.data.dueDateReminders,
          systemNotifications: response.data.systemNotifications,
          digestFrequency: response.data.digestFrequency,
          quietHoursStart: response.data.quietHoursStart || null,
          quietHoursEnd: response.data.quietHoursEnd || null,
        });
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
    try {
      setIsLoading(true);
      await axios.put('/api/notifications/preferences', {
        email_enabled: values.emailEnabled,
        in_app_enabled: values.inAppEnabled,
        task_assignment: values.taskAssignment,
        task_updates: values.taskUpdates,
        due_date_reminders: values.dueDateReminders,
        system_notifications: values.systemNotifications,
        digest_frequency: values.digestFrequency,
        quiet_hours_start: values.quietHoursStart,
        quiet_hours_end: values.quietHoursEnd,
      });

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
