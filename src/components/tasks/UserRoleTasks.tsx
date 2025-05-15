
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
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
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types';

export function UserRoleTasks() {
  const { tasks } = useTask();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'maker' | 'reviewer'>('maker');
  
  if (!currentUser) return null;

  // Get tasks where user is the maker (assignee)
  const makerTasks = tasks.filter(task => task.assignedTo === currentUser.id);
  
  // Get tasks where user is checker1 or checker2
  const reviewerTasks = tasks.filter(task => 
    task.checker1 === currentUser.id || task.checker2 === currentUser.id
  );
  
  // Only show the tabs if user has multiple roles
  const hasMultipleRoles = makerTasks.length > 0 && reviewerTasks.length > 0;
  
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

  const renderTaskTable = (taskList: Task[]) => (
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

  if (!hasMultipleRoles) {
    // If user only has one role, just show the appropriate table
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {makerTasks.length > 0 ? 'My Tasks' : 'Tasks Under Review'}
          </CardTitle>
          <CardDescription>
            {makerTasks.length > 0 
              ? 'Tasks assigned to you as a Maker' 
              : 'Tasks waiting for your review'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTaskTable(makerTasks.length > 0 ? makerTasks : reviewerTasks)}
        </CardContent>
      </Card>
    );
  }

  // User has multiple roles, show tabs
  return (
    <Tabs 
      defaultValue="maker" 
      className="w-full"
      onValueChange={(value) => setActiveTab(value as 'maker' | 'reviewer')}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="maker">My Tasks</TabsTrigger>
        <TabsTrigger value="reviewer">Tasks Under Review</TabsTrigger>
      </TabsList>
      <TabsContent value="maker" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you as a Maker</CardDescription>
          </CardHeader>
          <CardContent>
            {renderTaskTable(makerTasks)}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reviewer" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Under Review</CardTitle>
            <CardDescription>Tasks waiting for your review as a Checker</CardDescription>
          </CardHeader>
          <CardContent>
            {renderTaskTable(reviewerTasks)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
