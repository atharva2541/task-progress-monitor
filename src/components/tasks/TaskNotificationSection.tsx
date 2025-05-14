
import React from "react";
import { Bell, Mail } from "lucide-react";
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
        
        {/* Mandatory notification settings displayed as static information */}
        <div className="space-y-4 rounded-lg border p-4 bg-secondary/10">
          <div className="flex items-center space-x-2 border-b pb-2">
            <Bell className="h-5 w-5 text-primary" />
            <p className="font-medium">Mandatory Post-Due Date Notifications</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Daily notifications will be sent automatically if tasks are not completed by the due date
          </p>
          
          <div className="flex items-center space-x-2 border-b pb-2 pt-2">
            <Mail className="h-5 w-5 text-primary" />
            <p className="font-medium">Email Notifications</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Email notifications will be sent for all task status changes to all assigned users
          </p>
          
          <div className="pt-2">
            <p className="font-medium mb-2">Recipients</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              <li>Maker</li>
              <li>First Checker</li>
              <li>Second Checker</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
