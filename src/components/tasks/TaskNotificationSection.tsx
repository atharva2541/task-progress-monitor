
import React from "react";
import { Bell } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "@/utils/TaskFormManager";

interface TaskNotificationSectionProps {
  form: UseFormReturn<TaskFormValues>;
}

export const TaskNotificationSection: React.FC<TaskNotificationSectionProps> = ({ form }) => {
  return (
    <div className="border rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 p-4 border-b">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Notification Settings</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="notifications.enablePreNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Pre-Submission Notifications</FormLabel>
                  <FormDescription>
                    Send notifications before the task due date
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
          {form.watch("notifications.enablePreNotifications") && (
            <div className="ml-6 space-y-4 p-4 border rounded-md">
              <div>
                <FormLabel>Notify Days Before Due Date</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch("notifications.preDays").map((day, index) => (
                    <span key={index} className="bg-gray-200 p-1 rounded">{day} days</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2 rounded-lg border bg-secondary/10">
          <p className="font-medium">Mandatory Notification Settings</p>
          <p className="text-sm text-muted-foreground">
            The following notification settings are mandatory and always enabled:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
            <li>Post-due date notifications will be sent daily if tasks are not completed on time</li>
            <li>Email notifications will be sent for all task status changes</li>
            <li>All assigned users (Maker, First Checker, and Second Checker) will receive notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
