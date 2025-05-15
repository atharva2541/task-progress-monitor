
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";

// Form schema
const notificationSchema = z.object({
  enableTaskReminders: z.boolean(),
  defaultReminderDays: z.array(z.number()),
  enableOverdueNotifications: z.boolean(),
  overdueReminderFrequency: z.enum(["daily", "weekly", "never"]),
  enableEmailNotifications: z.boolean(),
  enableInAppNotifications: z.boolean(),
  notifyAdminOnRejection: z.boolean(),
  notifyAdminOnExpiration: z.boolean(),
});

export function NotificationSettings() {
  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      enableTaskReminders: true,
      defaultReminderDays: [1, 3, 7],
      enableOverdueNotifications: true,
      overdueReminderFrequency: "daily",
      enableEmailNotifications: true,
      enableInAppNotifications: true,
      notifyAdminOnRejection: true,
      notifyAdminOnExpiration: false,
    },
  });

  function onSubmit(values: z.infer<typeof notificationSchema>) {
    console.log(values);
    toast({
      title: "Notification settings updated",
      description: "System notification settings have been saved.",
    });
  }

  // Helper to handle reminder days input
  const handleReminderDaysChange = (event) => {
    const value = event.target.value;
    try {
      // Parse the comma-separated string to an array of numbers
      const days = value.split(",").map(day => {
        const num = parseInt(day.trim());
        if (isNaN(num)) throw new Error();
        return num;
      });
      form.setValue("defaultReminderDays", days);
    } catch (error) {
      // Handle invalid input
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Notifications</CardTitle>
        <CardDescription>
          Configure how and when notifications are sent to users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enableTaskReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Task Reminders
                      </FormLabel>
                      <FormDescription>
                        Send reminders before tasks are due.
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

              {form.watch("enableTaskReminders") && (
                <div className="ml-6 border-l-2 pl-4 space-y-4">
                  <FormItem>
                    <FormLabel>Default Reminder Days</FormLabel>
                    <FormControl>
                      <Input
                        value={form.watch("defaultReminderDays").join(", ")}
                        onChange={handleReminderDaysChange}
                        placeholder="1, 3, 7"
                      />
                    </FormControl>
                    <FormDescription>
                      Days before due date to send reminders (comma separated).
                    </FormDescription>
                  </FormItem>
                </div>
              )}

              <FormField
                control={form.control}
                name="enableOverdueNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Overdue Notifications
                      </FormLabel>
                      <FormDescription>
                        Notify users about overdue tasks.
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

              {form.watch("enableOverdueNotifications") && (
                <div className="ml-6 border-l-2 pl-4">
                  <FormField
                    control={form.control}
                    name="overdueReminderFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overdue Reminder Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often to remind about overdue tasks.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Notification Channels</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableEmailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Email Notifications
                        </FormLabel>
                        <FormDescription>
                          Send notifications via email.
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
                  name="enableInAppNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          In-App Notifications
                        </FormLabel>
                        <FormDescription>
                          Show notifications within the application.
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
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Admin Notifications</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifyAdminOnRejection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Rejection Alerts
                        </FormLabel>
                        <FormDescription>
                          Notify administrators when a task is rejected.
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
                  name="notifyAdminOnExpiration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Expiration Alerts
                        </FormLabel>
                        <FormDescription>
                          Notify administrators when tasks expire without completion.
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
            </div>

            <Button type="submit">Save Notification Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
