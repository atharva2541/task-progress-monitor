import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task, TaskNotificationSettings } from "@/types";
import { useTask } from "@/contexts/TaskContext";
import { Button, Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const taskFormSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  assignedTo: z.string().min(1, "Please select a maker"),
  checker1: z.string().min(1, "Please select a first checker"),
  checker2: z.string().min(1, "Please select a second checker"),
  priority: z.enum(["low", "medium", "high"]),
  frequency: z.enum(["daily", "weekly", "fortnightly", "monthly", "quarterly", "annually", "one-time"]),
  isRecurring: z.boolean().default(false),
  dueDate: z.string().min(1, "Due date is required"),
  notifications: z.object({
    enablePreNotifications: z.boolean().default(false),
    preDays: z.array(z.number()).default([1, 3, 7]),
    postNotificationFrequency: z.enum(["daily", "weekly"]).default("daily"),
  }).default({
    enablePreNotifications: false,
    preDays: [1, 3, 7],
    postNotificationFrequency: "daily",
  }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const AdminTasksPage = () => {
  const { tasks, addTask, updateTask } = useTask();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const createForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      assignedTo: "",
      checker1: "",
      checker2: "",
      priority: "medium",
      frequency: "monthly",
      isRecurring: false,
      dueDate: new Date().toISOString().split('T')[0],
      notifications: {
        enablePreNotifications: false,
        preDays: [1, 3, 7],
        postNotificationFrequency: "daily",
      }
    },
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      assignedTo: "",
      checker1: "",
      checker2: "",
      priority: "medium",
      frequency: "monthly",
      isRecurring: false,
      dueDate: new Date().toISOString().split('T')[0],
      notifications: {
        enablePreNotifications: false,
        preDays: [1, 3, 7],
        postNotificationFrequency: "daily",
      }
    },
  });

  const handleEditDialogOpen = (task: Task) => {
    setSelectedTask(task);
    const formData = {
      name: task.name,
      description: task.description,
      category: task.category,
      assignedTo: task.assignedTo,
      checker1: task.checker1,
      checker2: task.checker2,
      priority: task.priority,
      frequency: task.frequency,
      isRecurring: task.isRecurring || false,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      notifications: {
        enablePreNotifications: task.notificationSettings?.enablePreNotifications || false,
        preDays: task.notificationSettings?.preDays || [1, 3, 7],
        postNotificationFrequency: task.notificationSettings?.postNotificationFrequency || "daily",
      }
    };
    editForm.reset(formData);
    setIsEditDialogOpen(true);
  };

  const handleCreateTask = (data: TaskFormValues) => {
    const notificationSettings: TaskNotificationSettings = {
      enablePreNotifications: data.notifications.enablePreNotifications,
      preDays: data.notifications.preDays,
      enablePostNotifications: true,
      postNotificationFrequency: data.notifications.postNotificationFrequency,
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true,
    };
    
    const newTask: Task = {
      ...data,
      notificationSettings,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [],
    };

    addTask(newTask);
    createForm.reset();
    setIsCreateDialogOpen(false);
    toast({
      title: "Task Created",
      description: `The task "${data.name}" has been created successfully with notifications`
    });
  };

  const handleUpdateTask = (data: TaskFormValues) => {
    if (selectedTask) {
      const notificationSettings: TaskNotificationSettings = {
        enablePreNotifications: data.notifications.enablePreNotifications,
        preDays: data.notifications.preDays,
        enablePostNotifications: true,
        postNotificationFrequency: data.notifications.postNotificationFrequency,
        sendEmails: true,
        notifyMaker: true,
        notifyChecker1: true,
        notifyChecker2: true,
      };
      
      const updatedTask: Task = {
        ...selectedTask,
        ...data,
        notificationSettings,
        updatedAt: new Date().toISOString(),
      };

      updateTask(selectedTask.id, updatedTask);
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task Updated",
        description: `The task "${data.name}" has been updated successfully with notifications`
      });
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsCreateDialogOpen(true)}>Create Task</Button>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateTask)} className="space-y-4">
              <FormField control={createForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Enter the name of the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea {...field} />
                  </FormControl>
                  <FormDescription>Provide a detailed description of the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select a category for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="assignedTo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select the maker for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="checker1" render={({ field }) => (
                <FormItem>
                  <FormLabel>Checker 1</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select the first checker for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="checker2" render={({ field }) => (
                <FormItem>
                  <FormLabel>Checker 2</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select the second checker for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <select {...field}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </FormControl>
                  <FormDescription>Select the priority of the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="frequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <select {...field}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </FormControl>
                  <FormDescription>Select how often the task should repeat.</FormDescription>
                </FormItem>
              )} />
              <FormField control={createForm.control} name="dueDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the due date for the task.</FormDescription>
                </FormItem>
              )} />
              <div className="border rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 p-4 border-b">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={createForm.control}
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
                    {createForm.watch("notifications.enablePreNotifications") && (
                      <div className="ml-6 space-y-4 p-4 border rounded-md">
                        <div>
                          <FormLabel>Notify Days Before Due Date</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {createForm.watch("notifications.preDays").map((day, index) => (
                              <span key={index} className="bg-gray-200 p-1 rounded">{day} days</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/30">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4" />
                          <p className="font-medium">Post-Due Date Notifications</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Daily notifications will be sent if task is not submitted after due date
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/30">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <p className="font-medium">Email Notifications</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Email notifications will be sent in addition to in-app notifications
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border p-3 rounded-lg bg-secondary/30">
                    <div className="font-medium mb-2">Recipients</div>
                    <p className="text-sm text-muted-foreground">All assigned users (Maker, First Checker, and Second Checker) will receive notifications</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateTask)} className="space-y-4">
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Enter the name of the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea {...field} />
                  </FormControl>
                  <FormDescription>Provide a detailed description of the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select a category for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="assignedTo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select the maker for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="checker1" render={({ field }) => (
                <FormItem>
                  <FormLabel>Checker 1</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select the first checker for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="checker2" render={({ field }) => (
                <FormItem>
                  <FormLabel>Checker 2</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormDescription>Select the second checker for the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <select {...field}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </FormControl>
                  <FormDescription>Select the priority of the task.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="frequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <select {...field}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </FormControl>
                  <FormDescription>Select how often the task should repeat.</FormDescription>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="dueDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the due date for the task.</FormDescription>
                </FormItem>
              )} />
              <div className="border rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 p-4 border-b">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={editForm.control}
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
                    {editForm.watch("notifications.enablePreNotifications") && (
                      <div className="ml-6 space-y-4 p-4 border rounded-md">
                        <div>
                          <FormLabel>Notify Days Before Due Date</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editForm.watch("notifications.preDays").map((day, index) => (
                              <span key={index} className="bg-gray-200 p-1 rounded">{day} days</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/30">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4" />
                          <p className="font-medium">Post-Due Date Notifications</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Daily notifications will be sent if task is not submitted after due date
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/30">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <p className="font-medium">Email Notifications</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Email notifications will be sent in addition to in-app notifications
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border p-3 rounded-lg bg-secondary/30">
                    <div className="font-medium mb-2">Recipients</div>
                    <p className="text-sm text-muted-foreground">All assigned users (Maker, First Checker, and Second Checker) will receive notifications</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasksPage;
