
import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog';
import { TaskTable } from '@/components/tasks/review/TaskTable';
import { Task, TaskFrequency } from '@/types';
import { TaskFormValues } from '@/utils/TaskFormManager';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const handleCreateTask = (formData: TaskFormValues) => {
    try {
      // Only admin can create tasks (this already exists)
      addTask({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        assignedTo: formData.assignedTo,
        checker1: formData.checker1,
        checker2: formData.checker2,
        priority: formData.priority,
        frequency: formData.frequency as TaskFrequency, // Cast to proper TaskFrequency
        isRecurring: formData.isRecurring,
        dueDate: formData.dueDate,
        status: 'pending', // Set the default status to 'pending'
        observationStatus: formData.observationStatus, // Ensure observationStatus is set
        attachments: [], // Initialize empty attachments array
        comments: [], // Initialize empty comments array
        isEscalated: false, // Added required field
        isTemplate: formData.isRecurring, // Added required field
      });
      
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = (formData: TaskFormValues) => {
    if (!selectedTask || !isAdmin) return; // Ensure only admin can edit
    try {
      // Cast frequency to proper TaskFrequency type
      const updatedTask = {
        ...formData,
        frequency: formData.frequency as TaskFrequency
      };
      
      updateTask(selectedTask.id, updatedTask);
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!isAdmin) return; // Ensure only admin can delete
    try {
      deleteTask(taskId);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      console.error("Error deleting task:", error);
    }
  };

  // Function to handle edit task request - only proceed if admin
  const handleEditRequest = (task: Task) => {
    if (isAdmin) {
      setSelectedTask(task);
      setIsEditDialogOpen(true);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Task</Button>
            </DialogTrigger>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <CreateTaskDialog onCreateTask={handleCreateTask} />
          </Dialog>
        )}
      </div>

      {/* Task List */}
      <TaskTable 
        tasks={tasks} 
        onEditTask={isAdmin ? handleEditRequest : undefined} 
        onDeleteTask={isAdmin ? handleDeleteTask : undefined}
      />

      {/* Edit Dialog - only accessible to admins */}
      {isAdmin && selectedTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <EditTaskDialog 
            task={selectedTask} 
            onUpdateTask={handleEditTask}
          />
        </Dialog>
      )}
    </div>
  );
};

export default TaskList;
