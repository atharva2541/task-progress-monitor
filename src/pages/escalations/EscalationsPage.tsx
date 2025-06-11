
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EscalationPriority, Task } from '@/types';
import { AlertCircle, Clock, ArrowUpCircle, CheckCircle2, Filter, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from 'date-fns';

const EscalationsPage = () => {
  const { user } = useAuth();
  const { tasks, escalateTask, deescalateTask } = useTask();
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState<EscalationPriority | 'all'>('all');

  if (!user || user.role !== 'checker2') {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-4">You do not have permission to view this page.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  // Calculate explicitly escalated tasks (those with the escalation field)
  const explicitlyEscalatedTasks = tasks.filter(task => task.escalation?.isEscalated);
  
  // Calculate automatically escalated tasks (overdue or rejected tasks without explicit escalation)
  const autoEscalatedTasks = tasks.filter(task => {
    // Skip if already explicitly escalated
    if (task.escalation?.isEscalated) return false;
    
    // Consider rejected tasks as escalated
    if (task.status === 'rejected') return true;
    
    // Consider overdue tasks as escalated
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && (task.status === 'pending' || task.status === 'in-progress');
  });

  // Combine both types of escalated tasks
  const allEscalatedTasks = [...explicitlyEscalatedTasks, ...autoEscalatedTasks];

  // Apply priority filter
  const filteredTasks = priorityFilter === 'all' 
    ? allEscalatedTasks 
    : allEscalatedTasks.filter(task => {
        // For explicitly escalated tasks, check the priority
        if (task.escalation?.priority) {
          return task.escalation.priority === priorityFilter;
        }
        // For auto-escalated tasks, infer priority based on status and overdue days
        if (task.status === 'rejected') {
          return priorityFilter === 'high';
        }
        // Calculate days overdue for pending/in-progress tasks
        const daysOverdue = differenceInDays(new Date(), new Date(task.dueDate));
        if (daysOverdue > 14) return priorityFilter === 'critical';
        if (daysOverdue > 7) return priorityFilter === 'high';
        if (daysOverdue > 3) return priorityFilter === 'medium';
        return priorityFilter === 'low';
    });

  // Function to determine task priority for automatic escalations
  const getTaskPriority = (task: Task): EscalationPriority => {
    // If task has explicit escalation, use that priority
    if (task.escalation?.priority) {
      return task.escalation.priority;
    }
    
    // For rejected tasks, consider them high priority
    if (task.status === 'rejected') {
      return 'high';
    }
    
    // For overdue tasks, calculate priority based on how many days overdue
    const daysOverdue = differenceInDays(new Date(), new Date(task.dueDate));
    if (daysOverdue > 14) return 'critical';
    if (daysOverdue > 7) return 'high';
    if (daysOverdue > 3) return 'medium';
    return 'low';
  };

  // Function to get color classes based on priority
  const getPriorityColorClasses = (priority: EscalationPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Function to get priority badge with appropriate color
  const getPriorityBadge = (task: Task) => {
    const priority = getTaskPriority(task);
    return (
      <Badge variant="outline" className={`${getPriorityColorClasses(priority)}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </Badge>
    );
  };

  // Function to get escalation reason
  const getEscalationReason = (task: Task) => {
    if (task.escalation?.reason) {
      return task.escalation.reason;
    }
    
    if (task.status === 'rejected') {
      return 'Task was rejected';
    }
    
    return 'Task is overdue';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            Escalations
          </h1>
          <p className="text-muted-foreground">Manage and resolve escalated tasks</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as EscalationPriority | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEscalatedTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allEscalatedTasks.filter(task => getTaskPriority(task) === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {allEscalatedTasks.filter(task => getTaskPriority(task) === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved this week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(task => !task.escalation?.isEscalated && task.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Escalations</TabsTrigger>
          <TabsTrigger value="explicit">Manually Escalated</TabsTrigger>
          <TabsTrigger value="automatic">Auto Escalated</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <Card key={task.id} className={`overflow-hidden ${
                getTaskPriority(task) === 'critical' ? 'border-red-300 shadow-sm shadow-red-100' : 
                getTaskPriority(task) === 'high' ? 'border-amber-300 shadow-sm shadow-amber-50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{task.name}</CardTitle>
                      <CardDescription className="mt-1">{task.description}</CardDescription>
                    </div>
                    {getPriorityBadge(task)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Assigned to: Maker {task.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          {new Date(task.dueDate) < new Date() && (
                            <span className="text-red-500 ml-1">
                              ({differenceInDays(new Date(), new Date(task.dueDate))} days overdue)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Escalation Reason:</strong> {getEscalationReason(task)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <strong>Status:</strong> {task.status.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    Review Task
                  </Button>
                  <div className="space-x-2">
                    {!task.escalation?.isEscalated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => escalateTask(task.id, getTaskPriority(task), getEscalationReason(task))}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Mark as Escalated
                      </Button>
                    )}
                    {task.escalation?.isEscalated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deescalateTask(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Resolve Escalation
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <CardHeader>
                <CardTitle>No escalated tasks found</CardTitle>
                <CardDescription>
                  {priorityFilter !== 'all' 
                    ? `No ${priorityFilter} priority escalations found.` 
                    : 'No escalated tasks need your attention right now.'}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="explicit" className="space-y-4 mt-4">
          {explicitlyEscalatedTasks.length > 0 ? (
            explicitlyEscalatedTasks
              .filter(task => priorityFilter === 'all' || task.escalation?.priority === priorityFilter)
              .map(task => (
                // Similar card structure as in "all" tab
                <Card key={task.id} className={`overflow-hidden ${
                  task.escalation?.priority === 'critical' ? 'border-red-300 shadow-sm shadow-red-100' : 
                  task.escalation?.priority === 'high' ? 'border-amber-300 shadow-sm shadow-amber-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{task.name}</CardTitle>
                        <CardDescription className="mt-1">{task.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className={`${getPriorityColorClasses(task.escalation?.priority || 'low')}`}>
                        {task.escalation?.priority.charAt(0).toUpperCase() + task.escalation?.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Assigned to: Maker {task.assignedTo}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            {new Date(task.dueDate) < new Date() && (
                              <span className="text-red-500 ml-1">
                                ({differenceInDays(new Date(), new Date(task.dueDate))} days overdue)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Escalation Reason:</strong> {task.escalation?.reason}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Status:</strong> {task.status.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Review Task
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deescalateTask(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Resolve Escalation
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
          ) : (
            <Card className="p-8 text-center">
              <CardHeader>
                <CardTitle>No manually escalated tasks</CardTitle>
                <CardDescription>
                  No tasks have been explicitly marked as escalated.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="automatic" className="space-y-4 mt-4">
          {autoEscalatedTasks.length > 0 ? (
            autoEscalatedTasks
              .filter(task => {
                const priority = getTaskPriority(task);
                return priorityFilter === 'all' || priority === priorityFilter;
              })
              .map(task => (
                // Similar card structure as in other tabs
                <Card key={task.id} className={`overflow-hidden ${
                  getTaskPriority(task) === 'critical' ? 'border-red-300 shadow-sm shadow-red-100' : 
                  getTaskPriority(task) === 'high' ? 'border-amber-300 shadow-sm shadow-amber-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{task.name}</CardTitle>
                        <CardDescription className="mt-1">{task.description}</CardDescription>
                      </div>
                      {getPriorityBadge(task)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Assigned to: Maker {task.assignedTo}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            {new Date(task.dueDate) < new Date() && (
                              <span className="text-red-500 ml-1">
                                ({differenceInDays(new Date(), new Date(task.dueDate))} days overdue)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Escalation Reason:</strong> {getEscalationReason(task)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Status:</strong> {task.status.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Review Task
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => escalateTask(task.id, getTaskPriority(task), getEscalationReason(task))}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Mark as Escalated
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
          ) : (
            <Card className="p-8 text-center">
              <CardHeader>
                <CardTitle>No automatically escalated tasks</CardTitle>
                <CardDescription>
                  There are no overdue or rejected tasks that require escalation.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EscalationsPage;
