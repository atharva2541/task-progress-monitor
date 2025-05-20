
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

export const TaskFormFields = ({ form }) => {
  const { users } = useAuth();
  const [showMakerCheckerWarning, setShowMakerCheckerWarning] = useState(false);

  // Selected values for real-time validation
  const selectedMakerId = form.watch("assignedTo");
  const selectedChecker1Id = form.watch("checker1");

  // Check for maker-checker1 conflict
  useEffect(() => {
    if (selectedMakerId && selectedChecker1Id && selectedMakerId === selectedChecker1Id) {
      setShowMakerCheckerWarning(true);
    } else {
      setShowMakerCheckerWarning(false);
    }
  }, [selectedMakerId, selectedChecker1Id]);

  return (
    <div className="space-y-4">
      {showMakerCheckerWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Maker and First Checker cannot be the same user. Please select different users.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Task Name field */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter task name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe the task details" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category and Due Date fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Finance, IT, Compliance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority and Frequency fields */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Recurring Task toggle */}
      <FormField
        control={form.control}
        name="isRecurring"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Recurring Task</FormLabel>
              <FormDescription>Will this task repeat based on the frequency?</FormDescription>
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

      {/* User assignments section */}
      <div className="grid grid-cols-3 gap-4">
        {/* Maker selection */}
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To (Maker)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checker1 selection with validation */}
        <FormField
          control={form.control}
          name="checker1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Checker</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className={selectedMakerId === field.value ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select first checker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem 
                      key={user.id} 
                      value={user.id}
                      disabled={user.id === selectedMakerId}
                      className={user.id === selectedMakerId ? "text-gray-400 line-through" : ""}
                    >
                      {user.name} {user.id === selectedMakerId ? "(Cannot be Maker)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs text-red-500">
                {selectedMakerId === field.value && "First Checker cannot be the same as Maker"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checker2 selection */}
        <FormField
          control={form.control}
          name="checker2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Second Checker</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second checker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

// Remove the duplicate FormDescription component since we're now importing it
// from @/components/ui/form at the top of the file
