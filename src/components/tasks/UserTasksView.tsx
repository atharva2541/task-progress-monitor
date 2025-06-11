import { useState } from 'react';
import { useAuthorizedTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowLeft, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserTasksViewProps {
  userId: string;
  onBack: () => void;
}

export function UserTasksView({ userId, onBack }: UserTasksViewProps) {
  const { tasks } = useAuthorizedTasks(); // Using authorized tasks
  const navigate = useNavigate();
  const { users, user: currentUser } = useAuth();
  const user = users.find(u => u.id === userId);
  
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'to-review'>('my-tasks');
  
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>User not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Task List
        </Button>
      </div>
    );
  }

  // Only admins can see other users' tasks, or users can see their own tasks
  const canViewUserTasks = currentUser?.role === 'admin' || currentUser?.id === userId;
  
  if (!canViewUserTasks) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Access Denied</p>
        <p className="mt-2">You don't have permission to view this user's tasks.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  // Get tasks assigned to this user (maker role)
  const myTasks = tasks.filter(task => task.assignedTo === userId);
  
  // Get tasks where user is checker1 or checker2
  const tasksToReview = tasks.filter(
    task => task.checker1 === userId || task.checker2 === userId
  );

  // Get stats based on active tab
  const getTaskStats = (taskList: any[]) => ({
    pending: taskList.filter(task => task.status === 'pending').length,
    inProgress: taskList.filter(task => task.status === 'in-progress').length,
    submitted: taskList.filter(task => task.status === 'submitted').length,
    approved: taskList.filter(task => task.status === 'approved').length,
    rejected: taskList.filter(task => task.status === 'rejected').length,
    total: taskList.length
  });
  
  const myTasksStats = getTaskStats(myTasks);
  const reviewTasksStats = getTaskStats(tasksToReview);
  
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

  // Helper to render task table
  const renderTaskTable = (taskList: any[]) => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taskList.length > 0 ? (
            taskList.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString()}
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
              <TableCell colSpan={5} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {taskList.length > 0 && (
          <TableCaption>
            Showing {taskList.length} tasks
          </TableCaption>
        )}
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button onClick={onBack} variant="outline" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Task List
          </Button>
          <div className="flex items-center gap-3">
            <UserRound className="h-6 w-6" />
            <h1 className="text-3xl font-bold">{user.name}</h1>
          </div>
          <p className="text-muted-foreground">User Performance Dashboard</p>
        </div>
      </div>

      <Tabs defaultValue="my-tasks" className="w-full" onValueChange={(val) => setActiveTab(val as 'my-tasks' | 'to-review')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="to-review">Tasks to Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-tasks">
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTasksStats.total}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTasksStats.pending}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTasksStats.inProgress}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTasksStats.submitted}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTasksStats.approved}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTasksStats.rejected}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                Tasks where you are the assignee (Maker)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTaskTable(myTasks)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="to-review">
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewTasksStats.total}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewTasksStats.pending}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewTasksStats.inProgress}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewTasksStats.submitted}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewTasksStats.approved}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewTasksStats.rejected}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Tasks to Review</CardTitle>
              <CardDescription>
                Tasks where you are Checker 1 or Checker 2
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTaskTable(tasksToReview)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
