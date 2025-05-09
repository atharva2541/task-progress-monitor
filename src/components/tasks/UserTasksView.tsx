
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

interface UserTasksViewProps {
  userId: string;
  onBack: () => void;
}

export function UserTasksView({ userId, onBack }: UserTasksViewProps) {
  const { tasks, getTasksByAssignee, getTasksByChecker, getUserById } = useTask();
  const navigate = useNavigate();
  const { users } = useAuth();
  const user = users.find(u => u.id === userId);
  
  const [activeTab, setActiveTab] = useState<'maker' | 'checker1' | 'checker2'>('maker');
  
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

  // Get tasks based on active tab
  let filteredTasks = [];
  if (activeTab === 'maker') {
    filteredTasks = getTasksByAssignee(userId);
  } else if (activeTab === 'checker1') {
    filteredTasks = tasks.filter(task => task.checker1 === userId);
  } else if (activeTab === 'checker2') {
    filteredTasks = tasks.filter(task => task.checker2 === userId);
  }

  const taskStats = {
    pending: filteredTasks.filter(task => task.status === 'pending').length,
    inProgress: filteredTasks.filter(task => task.status === 'in-progress').length,
    submitted: filteredTasks.filter(task => task.status === 'submitted').length,
    approved: filteredTasks.filter(task => task.status === 'approved').length,
    rejected: filteredTasks.filter(task => task.status === 'rejected').length,
    total: filteredTasks.length
  };
  
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
      
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.pending}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.submitted}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.approved}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.rejected}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'maker' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('maker')}
        >
          Maker Tasks
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'checker1' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('checker1')}
        >
          Checker 1 Tasks
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'checker2' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('checker2')}
        >
          Checker 2 Tasks
        </button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{activeTab === 'maker' ? 'Maker' : activeTab === 'checker1' ? 'Checker 1' : 'Checker 2'} Tasks</CardTitle>
          <CardDescription>
            Tasks where user is acting as {activeTab === 'maker' ? 'a Maker' : activeTab === 'checker1' ? 'Checker 1' : 'Checker 2'}
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
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
              {filteredTasks.length > 0 && (
                <TableCaption>
                  Showing {filteredTasks.length} tasks
                </TableCaption>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
