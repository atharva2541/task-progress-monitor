
import { useState } from "react";
import { Task } from "@/types";
import { useTask } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
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
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { TaskFormManager, TaskFormValues } from "@/utils/TaskFormManager";
import { cn } from "@/lib/utils";

const AdminTasksPage = () => {
  const { tasks, addTask, updateTask, getUserById } = useTask();
  const { users } = useAuth();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      case 'checker1-approved':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Checker1 Approved</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getApproverInfo = (task: Task) => {
    if (task.status === 'approved') {
      // In a real app, you'd have a field that tracks who approved the task
      // For now we're just showing checker2 as the final approver
      const approver = getUserById(task.checker2);
      return approver ? approver.name : 'Unknown';
    } else if (task.status === 'checker1-approved') {
      const approver = getUserById(task.checker1);
      return approver ? approver.name : 'Unknown';
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          New Task
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const assignee = getUserById(task.assignedTo);
                return (
                  <TableRow key={task.id} className={cn(
                    "hover:bg-muted/50",
                    task.status === 'approved' ? 'bg-green-50' : '',
                    task.status === 'rejected' ? 'bg-red-50' : ''
                  )}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{assignee ? assignee.name : 'Unassigned'}</TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getApproverInfo(task)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDialogOpen(task)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {tasks.length > 0 && (
            <TableCaption>A list of all tasks in the system.</TableCaption>
          )}
        </Table>
      </div>
      
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
