
import React, { useState } from "react";
import { Bell, Mail } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "@/utils/TaskFormManager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskNotificationSectionProps {
  form: UseFormReturn<TaskFormValues>;
}

export const TaskNotificationSection: React.FC<TaskNotificationSectionProps> = ({ form }) => {
  const [newCustomDay, setNewCustomDay] = useState<string>("");
  
  const addCustomDay = () => {
    const day = parseInt(newCustomDay);
    if (!isNaN(day) && day > 0) {
      const currentCustomDays = form.getValues("notifications.customDays") || [];
      if (!currentCustomDays.includes(day)) {
        form.setValue("notifications.customDays", [...currentCustomDays, day]);
        setNewCustomDay("");
      }
    }
  };

  const removeCustomDay = (dayToRemove: number) => {
    const currentCustomDays = form.getValues("notifications.customDays") || [];
    form.setValue(
      "notifications.customDays", 
      currentCustomDays.filter(day => day !== dayToRemove)
    );
  };

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 p-4 border-b">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Notification Settings</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          {/* Pre-notification section with mandatory settings */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Pre-Submission Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Notifications will be sent before the task due date
                </p>
              </div>
              <Switch checked={true} disabled className="opacity-70" />
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Mandatory Notification Days</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[1, 3, 7].map((day) => (
                    <span key={day} className="bg-primary/10 text-primary p-1 px-3 rounded-full text-sm">
                      {day} {day === 1 ? 'day' : 'days'}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Custom Notification Days (Optional)</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.watch("notifications.customDays") || []).map((day, index) => (
                    <div key={index} className="bg-gray-200 p-1 px-3 rounded-full flex items-center gap-2 text-sm">
                      <span>{day} {day === 1 ? 'day' : 'days'}</span>
                      <button 
                        type="button" 
                        onClick={() => removeCustomDay(day)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Input 
                    type="number"
                    value={newCustomDay}
                    onChange={(e) => setNewCustomDay(e.target.value)}
                    placeholder="Add days"
                    className="w-32"
                    min="1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addCustomDay}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
