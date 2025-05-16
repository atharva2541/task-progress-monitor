import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDaysOverdue } from '@/utils/date-utils';

const TasksToReviewPage = () => {
  const { tasks } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'checker1' | 'checker2'>('checker1');
  
  if (!user) return null;
  
  // Check if user has checker roles (primary or additional roles)
  const userRoles = user.roles || [user.role];
  const hasChecker1Role = userRoles.includes('checker1');
  const hasChecker2Role = userRoles.includes('checker2');
  
  // Get tasks where user is checker1
  const checker1Tasks = hasChecker1Role ? 
    tasks.filter(task => task.checker1 === user.id) : [];
  
  // Get tasks where user is checker2
  const checker2Tasks = hasChecker2Role ? 
    tasks.filter(task => 
      task.checker2 === user.id && 
      (task.status === 'checker1-approved' || task.status === 'approved' || task.status === 'rejected')
    ) : [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      case 'checker1-approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Checker1 Approved</Badge>;
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
            <TableHead>Days Overdue</TableHead>
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
        {taskList.length > 0 && (
          <TableCaption>
            Showing {taskList.length} tasks
          </TableCaption>
        )}
      </Table>
    </div>
  );
  
  // If user doesn't have any checker roles, show a message
  if (!hasChecker1Role && !hasChecker2Role) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8">
              You don't have any checker roles assigned. Contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks to Review</h1>
        <p className="text-muted-foreground">
          Tasks where you are assigned as a Checker
        </p>
      </div>
      
      <Tabs defaultValue={hasChecker1Role ? "checker1" : "checker2"} className="w-full" onValueChange={(val) => setActiveTab(val as 'checker1' | 'checker2')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checker1" disabled={!hasChecker1Role}>Checker 1 Tasks</TabsTrigger>
          <TabsTrigger value="checker2" disabled={!hasChecker2Role}>Checker 2 Tasks</TabsTrigger>
        </TabsList>
        
        {hasChecker1Role && (
          <TabsContent value="checker1">
            <Card>
              <CardHeader>
                <CardTitle>Checker 1 Tasks</CardTitle>
                <CardDescription>
                  Tasks requiring your first-level review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTaskTable(checker1Tasks)}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {hasChecker2Role && (
          <TabsContent value="checker2">
            <Card>
              <CardHeader>
                <CardTitle>Checker 2 Tasks</CardTitle>
                <CardDescription>
                  Tasks requiring your final approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTaskTable(checker2Tasks)}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TasksToReviewPage;
