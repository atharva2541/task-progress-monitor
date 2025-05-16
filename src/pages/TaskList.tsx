import { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FilterX,
  Plus,
  Search,
  Pencil,
  Trash2,
  Bell,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { UserTasksView } from '@/components/tasks/UserTasksView';
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Task, TaskFrequency, TaskPriority, TaskStatus, TaskNotificationSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { scheduleNotifications } from '@/utils/notification-scheduler';

// Task form schema for validation
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
    enablePostNotifications: z.boolean().default(false),
    postNotificationFrequency: z.enum(["daily", "weekly"]).default("daily"),
    sendEmails: z.boolean().default(false),
    notifyMaker: z.boolean().default(true),
    notifyChecker1: z.boolean().default(true),
    notifyChecker2: z.boolean().default(true),
  }).default({
    enablePreNotifications: false,
    preDays: [1, 3, 7],
    enablePostNotifications: false,
    postNotificationFrequency: "daily",
    sendEmails: false,
    notifyMaker: true,
    notifyChecker1: true,
    notifyChecker2: true,
  }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const TaskList = () => {
  const { tasks, getUserById, addTask, updateTask, deleteTask } = useTask();
  const { user, users } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  
  // State for custom days input
  const [customPreDay, setCustomPreDay] = useState<string>("");
  const [isAddingPreDay, setIsAddingPreDay] = useState<boolean>(false);
  
  // Create task form
  const createForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      assignedTo: user?.id || "",
      checker1: "",
      checker2: "",
      priority: "medium",
      frequency: "monthly",
      isRecurring: false,
      dueDate: new Date().toISOString().split('T')[0],
      notifications: {
        enablePreNotifications: false,
        preDays: [1, 3, 7],
        enablePostNotifications: false,
        postNotificationFrequency: "daily",
        sendEmails: false,
        notifyMaker: true,
        notifyChecker1: true,
        notifyChecker2: true,
      }
    },
  });
  
  // Edit task form
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
        enablePostNotifications: false,
        postNotificationFrequency: "daily",
        sendEmails: false,
        notifyMaker: true,
        notifyChecker1: true,
        notifyChecker2: true,
      }
    },
  });
  
  // Handle task creation
  const handleCreateTask = (data: TaskFormValues) => {
    const notificationSettings: TaskNotificationSettings = {
      enablePreNotifications: data.notifications.enablePreNotifications,
      preDays: data.notifications.preDays,
      enablePostNotifications: data.notifications.enablePostNotifications,
      postNotificationFrequency: data.notifications.postNotificationFrequency,
      sendEmails: data.notifications.sendEmails,
      notifyMaker: data.notifications.notifyMaker,
      notifyChecker1: data.notifications.notifyChecker1,
      notifyChecker2: data.notifications.notifyChecker2,
    };
    
    const newTask = {
      name: data.name,
      description: data.description,
      category: data.category,
      assignedTo: data.assignedTo,
      checker1: data.checker1,
      checker2: data.checker2,
      priority: data.priority as TaskPriority,
      status: 'pending' as TaskStatus,
      frequency: data.frequency as TaskFrequency,
      isRecurring: data.isRecurring,
      dueDate: data.dueDate,
      notificationSettings: notificationSettings
    };
    
    // Add the task
    addTask(newTask);
    
    // If notifications are enabled, schedule them
    if (data.notifications.enablePreNotifications || data.notifications.enablePostNotifications) {
      // Get the last task (the one we just created)
      const addedTask = tasks[tasks.length - 1];
      
      console.log("Scheduling notifications for task:", addedTask);
      
      // Schedule notifications
      scheduleNotifications({
        task: addedTask,
        notificationSettings: notificationSettings,
        getUserById,
      });
    }
    
    createForm.reset();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Task Created",
      description: `The task "${data.name}" has been created successfully${data.notifications.enablePreNotifications || data.notifications.enablePostNotifications ? ' with notifications' : ''}`
    });
  };
  
  // Handle opening edit dialog
  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    
    // Initialize form with task data, including notification settings
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
      notifications: task.notificationSettings || {
        enablePreNotifications: false,
        preDays: [1, 3, 7],
        enablePostNotifications: false,
        postNotificationFrequency: "daily",
        sendEmails: false,
        notifyMaker: true,
        notifyChecker1: true,
        notifyChecker2: true,
      }
    };
    
    console.log("Setting edit form data:", formData);
    editForm.reset(formData);
    setIsEditDialogOpen(true);
  };
  
  // Handle task update
  const handleUpdateTask = (data: TaskFormValues) => {
    if (!selectedTask) return;
    
    const notificationSettings: TaskNotificationSettings = {
      enablePreNotifications: data.notifications.enablePreNotifications,
      preDays: data.notifications.preDays,
      enablePostNotifications: data.notifications.enablePostNotifications,
      postNotificationFrequency: data.notifications.postNotificationFrequency,
      sendEmails: data.notifications.sendEmails,
      notifyMaker: data.notifications.notifyMaker,
      notifyChecker1: data.notifications.notifyChecker1,
      notifyChecker2: data.notifications.notifyChecker2,
    };
    
    const updatedTask = {
      name: data.name,
      description: data.description,
      category: data.category,
      assignedTo: data.assignedTo,
      checker1: data.checker1,
      checker2: data.checker2,
      priority: data.priority as TaskPriority,
      frequency: data.frequency as TaskFrequency,
      isRecurring: data.isRecurring,
      dueDate: data.dueDate,
      notificationSettings: notificationSettings
    };
    
    updateTask(selectedTask.id, updatedTask);
    
    // If notifications are enabled, reschedule them
    if (data.notifications.enablePreNotifications || data.notifications.enablePostNotifications) {
      const task = { ...selectedTask, ...updatedTask };
      scheduleNotifications({
        task,
        notificationSettings,
        getUserById,
      });
    }
    
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    
    toast({
      title: "Task Updated",
      description: `The task "${data.name}" has been updated successfully${data.notifications.enablePreNotifications || data.notifications.enablePostNotifications ? ' with notifications' : ''}`
    });
  };
  
  // Add a custom pre-notification day
  const handleAddPreDay = (form: any) => {
    const dayValue = parseInt(customPreDay);
    
    if (isNaN(dayValue) || dayValue <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a positive number of days",
        variant: "destructive"
      });
      return;
    }
    
    // Get current pre-days
    const currentPreDays = form.getValues("notifications.preDays") || [];
    
    // Add new day if it doesn't already exist
    if (!currentPreDays.includes(dayValue)) {
      form.setValue("notifications.preDays", [...currentPreDays, dayValue].sort((a, b) => a - b));
    }
    
    setCustomPreDay("");
    setIsAddingPreDay(false);
  };

  // Remove a pre-notification day
  const handleRemovePreDay = (day: number, form: any) => {
    const currentPreDays = form.getValues("notifications.preDays") || [];
    form.setValue(
      "notifications.preDays", 
      currentPreDays.filter((d: number) => d !== day)
    );
  };
  
  // Handle opening delete confirmation
  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteAlertOpen(true);
  };
  
  // Handle task deletion
  const handleConfirmDelete = () => {
    if (!selectedTask) return;
    
    deleteTask(selectedTask.id);
    setIsDeleteAlertOpen(false);
    setSelectedTask(null);
  };
  
  if (!user) return null;
  
  // If admin has selected a user, show their tasks view
  if (user.role === 'admin' && selectedUserId) {
    return (
      <UserTasksView 
        userId={selectedUserId} 
        onBack={() => setSelectedUserId(null)} 
      />
    );
  }
  
  // Filter tasks based on user role
  let filteredTasks = [...tasks];
  
  if (user.role === 'maker') {
    filteredTasks = filteredTasks.filter(task => task.assignedTo === user.id);
  } else if (user.role === 'checker1') {
    filteredTasks = filteredTasks.filter(task => task.checker1 === user.id);
  } else if (user.role === 'checker2') {
    filteredTasks = filteredTasks.filter(task => task.checker2 === user.id);
  }
  
  // Apply search and filters
  if (searchTerm) {
    filteredTasks = filteredTasks.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (statusFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
  }
  
  if (priorityFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
  }
  
  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        
        {user.role === 'admin' && (
          <div className="flex gap-4">
            <Select
              value={selectedUserId || ''}
              onValueChange={(value) => value && setSelectedUserId(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="View User Tasks" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to the system. Fill in all required fields.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateTask)} className="space-y-4">
                    <FormField
                      control={createForm.control}
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
                    
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the task details" 
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Finance, IT, Compliance" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
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
                        control={createForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
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
                    
                    <FormField
                      control={createForm.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Recurring Task</FormLabel>
                            <FormDescription>
                              Will this task repeat based on the frequency?
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
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={createForm.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To (Maker)</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select maker" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users
                                  .filter(user => user.role === 'maker' || user.roles?.includes('maker'))
                                  .map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="checker1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Checker</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select checker 1" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users
                                  .filter(user => user.role === 'checker1' || user.roles?.includes('checker1'))
                                  .map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="checker2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Checker</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select checker 2" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users
                                  .filter(user => user.role === 'checker2' || user.roles?.includes('checker2'))
                                  .map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Notification Settings Section */}
                    <div className="border rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2 p-4 border-b">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Notification Settings</h3>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* Pre-Submission Notifications */}
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
                                <Label>Notify Days Before Due Date</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {createForm.watch("notifications.preDays")?.map((day: number) => (
                                    <div 
                                      key={day} 
                                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                                    >
                                      <span>{day} day{day !== 1 ? 's' : ''}</span>
                                      <button
                                        type="button"
                                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                                        onClick={() => handleRemovePreDay(day, createForm)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {isAddingPreDay ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        placeholder="Days"
                                        className="w-20"
                                        value={customPreDay}
                                        onChange={(e) => setCustomPreDay(e.target.value)}
                                        min="1"
                                      />
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={() => handleAddPreDay(createForm)}
                                      >
                                        Add
                                      </Button>
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => {
                                          setIsAddingPreDay(false);
                                          setCustomPreDay("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setIsAddingPreDay(true)}
                                    >
                                      Add Days
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Post-Submission Notifications */}
                        <div className="space-y-2">
                          <FormField
                            control={createForm.control}
                            name="notifications.enablePostNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Post-Due Date Notifications</FormLabel>
                                  <FormDescription>
                                    Send notifications if task not submitted after due date
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
                          
                          {createForm.watch("notifications.enablePostNotifications") && (
                            <div className="ml-6 space-y-4 p-4 border rounded-md">
                              <FormField
                                control={createForm.control}
                                name="notifications.postNotificationFrequency"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reminder Frequency</FormLabel>
                                    <Select 
                                      value={field.value} 
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      How frequently to send reminders after the due date passes
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Email Notifications */}
                        <FormField
                          control={createForm.control}
                          name="notifications.sendEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <FormLabel>Email Notifications</FormLabel>
                                </div>
                                <FormDescription>
                                  Also send email notifications in addition to in-app notifications
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
                        
                        {/* Recipients */}
                        <div className="space-y-2 border p-3 rounded-lg">
                          <div className="font-medium mb-2">Recipients</div>
                          <FormField
                            control={createForm.control}
                            name="notifications.notifyMaker"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Notify Maker</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="notifications.notifyChecker1"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Notify First Checker</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="notifications.notifyChecker2"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Notify Second Checker</FormLabel>
                              </FormItem>
                            )}
                          />
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
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            View and manage all {user.role === 'maker' ? 'your' : 'assigned'} tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={clearFilters}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.length > 0 ? (
                  currentTasks.map((task) => {
                    const assignedUser = getUserById(task.assignedTo);
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{assignedUser?.name || 'Unknown'}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            
                            {(user.role === 'admin') && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditClick(task)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteClick(task)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {filteredTasks.length > 0 && (
                <TableCaption>
                  Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
                </TableCaption>
              )}
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-end items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Edit Task Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update task details. Fill in all required fields.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleUpdateTask)} className="space-y-4">
                  <FormField
                    control={editForm.control}
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
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the task details" 
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Finance, IT, Compliance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
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
                      control={editForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
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
                  
                  <FormField
                    control={editForm.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Recurring Task</FormLabel>
                          <FormDescription>
                            Will this task repeat based on the frequency?
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
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To (Maker)</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select maker" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users
                                .filter(user => user.role === 'maker' || user.roles?.includes('maker'))
                                .map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="checker1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Checker</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select checker 1" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users
                                .filter(user => user.role === 'checker1' || user.roles?.includes('checker1'))
                                .map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="checker2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Second Checker</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select checker 2" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users
                                .filter(user => user.role === 'checker2' || user.roles?.includes('checker2'))
                                .map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Notification Settings Section */}
                  <div className="border rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2 p-4 border-b">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Notification Settings</h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* Pre-Submission Notifications */}
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
                              <Label>Notify Days Before Due Date</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {editForm.watch("notifications.preDays")?.map((day: number) => (
                                  <div 
                                    key={day} 
                                    className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                                  >
                                    <span>{day} day{day !== 1 ? 's' : ''}</span>
                                    <button
                                      type="button"
                                      className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                                      onClick={() => handleRemovePreDay(day, editForm)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                    </button>
                                  </div>
                                ))}
                                
                                {isAddingPreDay ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Days"
                                      className="w-20"
                                      value={customPreDay}
                                      onChange={(e) => setCustomPreDay(e.target.value)}
                                      min="1"
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="secondary"
                                      onClick={() => handleAddPreDay(editForm)}
                                    >
                                      Add
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setIsAddingPreDay(false);
                                        setCustomPreDay("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setIsAddingPreDay(true)}
                                  >
                                    Add Days
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Post-Submission Notifications */}
                      <div className="space-y-2">
                        <FormField
                          control={editForm.control}
                          name="notifications.enablePostNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Post-Due Date Notifications</FormLabel>
                                <FormDescription>
                                  Send notifications if task not submitted after due date
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
                        
                        {editForm.watch("notifications.enablePostNotifications") && (
                          <div className="ml-6 space-y-4 p-4 border rounded-md">
                            <FormField
                              control={editForm.control}
                              name="notifications.postNotificationFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reminder Frequency</FormLabel>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    How frequently to send reminders after the due date passes
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Email Notifications */}
                      <FormField
                        control={editForm.control}
                        name="notifications.sendEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <FormLabel>Email Notifications</FormLabel>
                              </div>
                              <FormDescription>
                                Also send email notifications in addition to in-app notifications
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
                      
                      {/* Recipients */}
                      <div className="space-y-2 border p-3 rounded-lg">
                        <div className="font-medium mb-2">Recipients</div>
                        <FormField
                          control={editForm.control}
                          name="notifications.notifyMaker"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Notify Maker</FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name="notifications.notifyChecker1"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Notify First Checker</FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name="notifications.notifyChecker2"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Notify Second Checker</FormLabel>
                            </FormItem>
                          )}
                        />
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
          
          {/* Delete Task Confirmation */}
          <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the task "{selectedTask?.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskList;
