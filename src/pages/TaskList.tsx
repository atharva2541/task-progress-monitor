import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog';
import { TaskTable } from '@/components/tasks/review/TaskTable';
import { Task, TaskFormValues } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';

const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleCreateTask = (formData: TaskFormValues) => {
    try {
      // Add observationStatus to the task
      addTask({
        ...formData,
        observationStatus: formData.observationStatus || 'no', // Ensure observationStatus is set
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
    if (!selectedTask) return;
    try {
      updateTask(selectedTask.id, formData);
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Task</Button>
          </DialogTrigger>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <CreateTaskDialog onCreateTask={handleCreateTask} />
        </Dialog>
      </div>

      {/* Task List */}
      <TaskTable tasks={tasks} onEditTask={(task) => {
        setSelectedTask(task);
        setIsEditDialogOpen(true);
      }} />

      {/* Edit Dialog */}
      {selectedTask && (
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
