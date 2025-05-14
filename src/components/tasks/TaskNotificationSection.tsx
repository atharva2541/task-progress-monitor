
import React, { useState } from "react";
import { Bell, Mail } from "lucide-react";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "@/utils/TaskFormManager";

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
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Notification Settings</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Pre-notification section with mandatory settings */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-primary">Pre-Submission Notifications</p>
              <p className="text-sm text-muted-foreground">
                Notifications are automatically sent before the task due date
              </p>
            </div>
            <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
              Always On
            </div>
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
              <p className="text-xs text-muted-foreground mt-2">
                These notification days are mandatory and automatically enabled
              </p>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <p className="font-medium mb-2">Additional Custom Notification Days (Optional)</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.watch("notifications.customDays") || []).map((day, index) => (
                  <div key={index} className="bg-gray-200 p-1 px-3 rounded-full flex items-center gap-2 text-sm">
                    <span>{day} {day === 1 ? 'day' : 'days'}</span>
                    <button 
                      type="button" 
                      onClick={() => removeCustomDay(day)}
                      className="text-gray-500 hover:text-red-500"
                      aria-label="Remove custom day"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(form.watch("notifications.customDays") || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No custom days added</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <FormControl>
                  <Input 
                    type="number"
                    value={newCustomDay}
                    onChange={(e) => setNewCustomDay(e.target.value)}
                    placeholder="Add days"
                    className="w-32"
                    min="1"
                  />
                </FormControl>
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
        
        {/* Mandatory notification settings displayed as static information */}
        <div className="space-y-4 rounded-lg border p-4 bg-secondary/10">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <p className="font-medium">Post-Due Date Notifications</p>
            </div>
            <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
              Always On
            </div>
          </div>
          <p className="text-sm">
            <span className="font-medium">Frequency:</span> Daily notifications
          </p>
          <p className="text-sm text-muted-foreground">
            Daily notifications are sent automatically if tasks are not completed by the due date
          </p>
          
          <div className="flex items-center justify-between pt-4 pb-2 border-t border-b">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <p className="font-medium">Email Notifications</p>
            </div>
            <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
              Always On
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Email notifications are synced with notification settings and sent for all task status changes
          </p>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between pb-2">
              <p className="font-medium">Recipients</p>
              <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                All Included
              </div>
            </div>
            <ul className="text-sm space-y-1 mt-2">
              <li className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>Maker</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>First Checker</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>Second Checker</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
