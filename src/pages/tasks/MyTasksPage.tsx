
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuthorizedTasks } from '@/contexts/TaskContext';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateDaysOverdue } from '@/utils/date-utils';

const MyTasksPage = () => {
  // Fixed: Use the task context with authorized tasks
  const taskContext = useAuthorizedTasks();
  const { tasks } = taskContext;
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  // Get tasks assigned to this user as a maker
  const userRoles = user.roles || [user.role];
  const myTasks = tasks.filter(task => task.assignedTo === user.id);
  
  // Process due date notifications for tasks
  useEffect(() => {
    const today = new Date();
    
    myTasks.forEach(task => {
      if (!task.dueDate) return;
      
      const dueDate = new Date(task.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // For tasks due in 1, 3, or 7 days
      if (daysUntilDue === 1 || daysUntilDue === 3 || daysUntilDue === 7) {
        // Add in-app notification
        addNotification({
          userId: user.id,
          title: `Task Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          message: `Your task "${task.name}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
          type: 'warning',
          isRead: false, // Changed from read to isRead
          timestamp: new Date().toISOString() // Added timestamp
        });
        
        // In a real app, we would also send an email here
        console.log(`[MyTasksPage] Would send email reminder for task due in ${daysUntilDue} days`);
      }
      
      // For overdue tasks
      if (daysUntilDue < 0 && task.status !== 'submitted' && task.status !== 'approved') {
        // Add in-app notification
        addNotification({
          userId: user.id,
          title: 'Task Overdue',
          message: `Your task "${task.name}" is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}.`,
          type: 'error',
          isRead: false, // Changed from read to isRead
          timestamp: new Date().toISOString() // Added timestamp
        });
        
        // Check if we can access the correct checker users through the task context
        if (task.checker1) {
          addNotification({
            userId: task.checker1,
            title: 'Task Overdue',
            message: `A task "${task.name}" assigned to ${user.name} is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}.`,
            type: 'error',
            isRead: false, // Changed from read to isRead
            timestamp: new Date().toISOString() // Added timestamp
          });
          
          // After one day overdue, also notify checker2
          if (Math.abs(daysUntilDue) >= 1 && task.checker2) {
            addNotification({
              userId: task.checker2,
              title: 'Task Overdue',
              message: `A task "${task.name}" assigned to ${user.name} is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}.`,
              type: 'error',
              isRead: false, // Changed from read to isRead
              timestamp: new Date().toISOString() // Added timestamp
            });
          }
        }
      }
    });
  }, [myTasks, addNotification, user]);
  
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
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">
          Tasks where you are assigned as a Maker
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            View and manage your assigned tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {myTasks.length > 0 ? (
                  myTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {calculateDaysOverdue(task.dueDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
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
              {myTasks.length > 0 && (
                <TableCaption>
                  Showing {myTasks.length} tasks
                </TableCaption>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTasksPage;
