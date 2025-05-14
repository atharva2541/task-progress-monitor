
import { useState } from "react";
import { Task } from "@/types";
import { useTask } from "@/contexts/TaskContext";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { TaskFormManager, TaskFormValues } from "@/utils/TaskFormManager";

const AdminTasksPage = () => {
  const { tasks, addTask, updateTask } = useTask();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleEditDialogOpen = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleCreateTask = (data: TaskFormValues) => {
    const newTask = TaskFormManager.prepareTaskFromFormData(data);
    addTask(newTask);
    setIsCreateDialogOpen(false);
    toast({
      title: "Task Created",
      description: `Task "${data.name}" has been created successfully with all required notifications enabled.`
    });
  };

  const handleUpdateTask = (data: TaskFormValues) => {
    if (selectedTask) {
      const updatedTask = TaskFormManager.prepareTaskFromFormData(data, selectedTask.id);
      updateTask(selectedTask.id, {
        ...updatedTask,
        createdAt: selectedTask.createdAt,
      });
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task Updated",
        description: `Task "${data.name}" has been updated successfully with all required notifications enabled.`
      });
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsCreateDialogOpen(true)}>Create Task</Button>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <CreateTaskDialog onCreateTask={handleCreateTask} />
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedTask && (
          <EditTaskDialog task={selectedTask} onUpdateTask={handleUpdateTask} />
        )}
      </Dialog>
    </div>
  );
};

export default AdminTasksPage;
