import React, { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskTypeIndicator } from '@/components/tasks/TaskTypeIndicator';
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FilterX,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Edit,
  Calendar,
  Repeat,
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
import { Task, TaskStatus, TaskFrequency, TaskPriority } from '@/types';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Task form schema for validation
const taskFormSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  assignedTo: z.string().min(1, "Please select a maker"),
  checker1: z.string().min(1, "Please select a first checker"),
  checker2: z.string().min(1, "Please select a second checker"),
  priority: z.enum(["low", "medium", "high"]),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually", "one-time"]),
  isRecurring: z.boolean().default(false),
  dueDate: z.string().min(1, "Due date is required"),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const AdminTasksPage = () => {
  const { tasks, addTask, updateTask, deleteTask, getUserById } = useTask();
  const { users } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Task filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);

  // Selected task for editing or reassigning
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  
  // Create task form
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
    },
  });

  // Reassign task form
  const [newAssignee, setNewAssignee] = useState("");
  
  // Unique categories from tasks
  const categories = Array.from(new Set(tasks.map(task => task.category)));
  
  // Filter tasks based on various criteria
  let filteredTasks = [...tasks];
  
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
  
  if (categoryFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
  }
  
  if (assigneeFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.assignedTo === assigneeFilter);
  }
  
  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Handle new task creation
  const handleCreateTask = (data: TaskFormValues) => {
    addTask({
      ...data,
      status: 'pending',
      checker1: data.checker1, // Ensure checker1 is explicitly passed
      checker2: data.checker2, // Ensure checker2 is explicitly passed
    });
    
    createForm.reset();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Task Created",
      description: "The task has been created successfully"
    });
  };

  // Open edit dialog and populate form
  const handleEditDialogOpen = (task: Task) => {
    setSelectedTask(task);
    editForm.reset({
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
    });
    setIsEditDialogOpen(true);
  };

  // Handle task update
  const handleUpdateTask = (data: TaskFormValues) => {
    if (selectedTask) {
      updateTask(selectedTask.id, {
        ...data,
      });
      
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      
      toast({
        title: "Task Updated",
        description: "The task has been updated successfully"
      });
    }
  };

  // Open reassign dialog
  const handleReassignDialogOpen = (task: Task) => {
    setSelectedTask(task);
    setNewAssignee(task.assignedTo);
    setIsReassignDialogOpen(true);
  };

  // Handle task reassignment
  const handleReassignTask = () => {
    if (selectedTask && newAssignee) {
      updateTask(selectedTask.id, {
        assignedTo: newAssignee,
      });
      
      setIsReassignDialogOpen(false);
      setSelectedTask(null);
      
      toast({
        title: "Task Reassigned",
        description: "The task has been reassigned successfully"
      });
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = (taskId: string, taskName: string) => {
    if (window.confirm(`Are you sure you want to delete task "${taskName}"?`)) {
      deleteTask(taskId);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setAssigneeFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Create and manage tasks across the organization</p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            Comprehensive view of all tasks in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
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
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={assigneeFilter}
              onValueChange={setAssigneeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={clearFilters}
              title="Clear all filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Recurring</TableHead>
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
                        <TableCell>{task.category}</TableCell>
                        <TableCell>{assignedUser?.name || 'Unknown'}</TableCell>
                        <TableCell>{task.frequency}</TableCell>
                        <TableCell>{task.isRecurring ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <TaskTypeIndicator type="priority" value={task.priority} />
                        </TableCell>
                        <TableCell>
                          <TaskTypeIndicator type="status" value={task.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/tasks/${task.id}`)}
                              title="View details"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditDialogOpen(task)}
                              title="Edit task"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReassignDialogOpen(task)}
                              title="Reassign task"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteTask(task.id, task.name)}
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
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
        </CardContent>
      </Card>
      
      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                            .filter(user => user.roles?.includes('maker'))
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
                            .filter(user => user.roles?.includes('checker1'))
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
                            .filter(user => user.roles?.includes('checker2'))
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
              
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                            .filter(user => user.roles?.includes('maker'))
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
                            .filter(user => user.roles?.includes('checker1'))
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
                            .filter(user => user.roles?.includes('checker2'))
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
              
              <DialogFooter>
                <Button type="submit">Update Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Reassign Task Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>
              Select a new user to assign this task to.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="py-4">
              <h4 className="text-sm font-medium mb-2">Task: {selectedTask.name}</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-assignee">New Assignee</Label>
                  <Select value={newAssignee} onValueChange={setNewAssignee}>
                    <SelectTrigger id="new-assignee">
                      <SelectValue placeholder="Select maker" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => user.roles?.includes('maker'))
                        .map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleReassignTask}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasksPage;
