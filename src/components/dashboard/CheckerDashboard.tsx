import { useAuth } from '@/contexts/AuthContext';
import { useAuthorizedTasks } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  AlertCircle, 
  User,
  Users, 
  Search, 
  FilePenLine, 
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';

export function CheckerDashboard() {
  const { user } = useAuth();
  const { tasks } = useAuthorizedTasks(); // Using authorized tasks
  const navigate = useNavigate();
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);

  if (!user) return null;

  const isChecker2 = user.role === 'checker2';
  
  // Get tasks assigned to this checker - strict filtering by user role
  const checkerTasks = tasks.filter(task => 
    task.checker1 === user.id || task.checker2 === user.id
  );

  // Tasks that need review - only include tasks this user is assigned to review
  const reviewTasks = checkerTasks.filter(task => 
    (task.status === 'submitted' && task.checker1 === user.id) || 
    (task.status === 'checker1-approved' && task.checker2 === user.id)
  );
  
  // Get all unique makers assigned to this checker
  const assignedMakers = Array.from(
    new Set(checkerTasks.map(task => task.assignedTo))
  );
  
  // Filter tasks by selected maker (if any)
  const makerTasks = selectedMaker
    ? checkerTasks.filter(task => task.assignedTo === selectedMaker)
    : [];
  
  // Get overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueTasks = checkerTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime() && 
           (task.status === 'pending' || task.status === 'in-progress');
  });

  // Get escalated tasks (for checker2 only) - limited to tasks assigned to this checker2
  const escalatedTasks = isChecker2
    ? tasks.filter(task => 
        (task.checker2 === user.id) && (
          task.status === 'rejected' || 
          (new Date(task.dueDate) < new Date() && 
           (task.status === 'pending' || task.status === 'in-progress'))
        )
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isChecker2 ? 'Senior Checker Dashboard' : 'Checker Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isChecker2 
            ? 'Oversee team productivity and manage escalations' 
            : 'Monitor and review team task progress'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks to Review</CardTitle>
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Makers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedMakers.length}</div>
            <p className="text-xs text-muted-foreground">
              Team members you supervise
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkerTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Under your supervision
            </p>
          </CardContent>
        </Card>
        <Card className={overdueTasks.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className={`h-4 w-4 ${overdueTasks.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueTasks.length > 0 ? "text-red-600" : ""}`}>
              {overdueTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Tasks submitted for your review</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewTasks.length > 0 ? (
              <div className="space-y-4">
                {reviewTasks.map(task => (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs font-medium 
                          ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Submitted: {new Date(task.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <CheckSquare className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-muted-foreground">No tasks awaiting your review!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isChecker2 && escalatedTasks.length > 0 && (
        <div className="grid gap-4 grid-cols-1">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                Escalated Tasks
              </CardTitle>
              <CardDescription>Tasks that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escalatedTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-amber-200">
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {task.status === 'rejected' 
                          ? 'This task was rejected and requires review' 
                          : 'This task is overdue and needs attention'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {task.status === 'rejected' ? 'Rejected' : 'Overdue'}
                        </span>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all-tasks" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="by-maker">By Maker</TabsTrigger>
          </TabsList>
          
          {selectedMaker && (
            <div className="flex items-center">
              <Select
                value={selectedMaker}
                onValueChange={setSelectedMaker}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a maker" />
                </SelectTrigger>
                <SelectContent>
                  {assignedMakers.map((makerId) => (
                    <SelectItem key={makerId} value={makerId}>
                      Maker {makerId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <TabsContent value="all-tasks">
          <Card>
            <CardHeader>
              <CardTitle>All Supervised Tasks</CardTitle>
              <CardDescription>
                Overview of all tasks under your supervision
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkerTasks.length > 0 ? (
                <div className="space-y-4">
                  {checkerTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">{task.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Assigned to Maker {task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${task.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              task.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              task.status === 'submitted' ? 'bg-purple-100 text-purple-800' : 
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {task.status.replace('-', ' ')}
                          </span>
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}

                  {checkerTasks.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/tasks')}
                    >
                      View All Tasks
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <CheckSquare className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">No tasks found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-maker">
          <Card>
            <CardHeader className="flex justify-between">
              <div>
                <CardTitle>Tasks by Maker</CardTitle>
                <CardDescription>
                  Select a maker to view their tasks
                </CardDescription>
              </div>
              {!selectedMaker && (
                <Select
                  value={selectedMaker || ""}
                  onValueChange={setSelectedMaker}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a maker" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedMakers.map((makerId) => (
                      <SelectItem key={makerId} value={makerId}>
                        Maker {makerId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardHeader>
            <CardContent>
              {selectedMaker ? (
                makerTasks.length > 0 ? (
                  <div className="space-y-4">
                    {makerTasks.map(task => (
                      <div key={task.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span 
                              className={`px-2 py-0.5 rounded-full text-xs font-medium 
                              ${task.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                task.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                task.status === 'submitted' ? 'bg-purple-100 text-purple-800' : 
                                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}`}
                            >
                              {task.status.replace('-', ' ')}
                            </span>
                            <span 
                              className={`px-2 py-0.5 rounded-full text-xs font-medium 
                              ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <CheckSquare className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-muted-foreground">No tasks found for this maker</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <User className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">Select a maker to view their tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
