
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { calculateDaysOverdue } from '@/utils/date-utils';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // Add import for auth context

type TaskTableProps = {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void; // Add delete handler prop
};

export const TaskTable = ({ tasks, onEditTask, onDeleteTask }: TaskTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user to check role
  const isAdmin = user?.role === 'admin'; // Check if user is admin

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Days Overdue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                <TableCell><StatusBadge status={task.status} /></TableCell>
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {calculateDaysOverdue(task.dueDate)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Only show edit button to admin users */}
                    {isAdmin && onEditTask && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEditTask(task)}
                      >
                        Edit
                      </Button>
                    )}
                    {/* Only show delete button to admin users */}
                    {isAdmin && onDeleteTask && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {tasks.length > 0 && (
          <TableCaption>
            Showing {tasks.length} tasks
          </TableCaption>
        )}
      </Table>
    </div>
  );
};
