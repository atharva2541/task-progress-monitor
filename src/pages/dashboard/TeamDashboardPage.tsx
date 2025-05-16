
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';

const TeamDashboardPage = () => {
  const { user } = useAuth();
  const { tasks, getUserById } = useTask();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  if (!user) return null;

  const isChecker2 = user.role === 'checker2';
  
  // Get all makers (by filtering unique assignedTo IDs)
  const makerIds = Array.from(new Set(tasks.map(task => task.assignedTo)));
  
  // Filter tasks based on checker's role
  const teamTasks = isChecker2 
    ? tasks.filter(task => task.checker2 === user.id)
    : tasks.filter(task => task.checker1 === user.id);
  
  // Calculate KPIs
  const totalTasks = teamTasks.length;
  const completedTasks = teamTasks.filter(task => task.status === 'approved').length;
  const overdueCompletedTasks = teamTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const completionDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
    return task.status === 'approved' && completionDate > dueDate;
  }).length;
  
  const pendingTasks = teamTasks.filter(task => 
    task.status === 'pending' || task.status === 'in-progress').length;
  const submittedTasks = teamTasks.filter(task => task.status === 'submitted').length;
  const rejectedTasks = teamTasks.filter(task => task.status === 'rejected').length;
  
  const overdueTasks = teamTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < new Date() && 
      (task.status === 'pending' || task.status === 'in-progress');
  }).length;
  
  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate on-time completion rate
  const onTimeCompletionRate = completedTasks > 0 
    ? Math.round(((completedTasks - overdueCompletedTasks) / completedTasks) * 100) 
    : 0;
  
  // Calculate average review time (in days)
  const reviewTimes = teamTasks
    .filter(task => task.status === 'approved' || task.status === 'rejected')
    .map(task => {
      const submittedDate = task.submittedAt ? new Date(task.submittedAt) : new Date();
      const reviewedDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
      return differenceInDays(reviewedDate, submittedDate);
    });
  
  const averageReviewTime = reviewTimes.length > 0
    ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
    : 0;
  
  // Prepare data for charts
  // Task status distribution chart
  const statusData = [
    { name: 'Pending', value: pendingTasks },
    { name: 'In Progress', value: teamTasks.filter(task => task.status === 'in-progress').length },
    { name: 'Submitted', value: submittedTasks },
    { name: 'Approved', value: completedTasks },
    { name: 'Rejected', value: rejectedTasks }
  ];
  
  // Maker performance data
  const makerPerformanceData = makerIds.map(makerId => {
    const makerTasks = teamTasks.filter(task => task.assignedTo === makerId);
    const makerCompletedTasks = makerTasks.filter(task => task.status === 'approved').length;
    const makerRejectedTasks = makerTasks.filter(task => task.status === 'rejected').length;
    const makerOverdueTasks = makerTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && 
        (task.status === 'pending' || task.status === 'in-progress');
    }).length;
    
    const maker = getUserById(makerId);
    return {
      name: maker ? maker.name : `Maker ${makerId}`,
      completed: makerCompletedTasks,
      rejected: makerRejectedTasks,
      overdue: makerOverdueTasks,
      onTime: makerCompletedTasks - makerTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const completionDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
        return task.status === 'approved' && completionDate > dueDate;
      }).length
    };
  });
  
  // Priority distribution chart
  const priorityData = [
    { 
      name: 'High', 
      value: teamTasks.filter(task => task.priority === 'high').length 
    },
    { 
      name: 'Medium', 
      value: teamTasks.filter(task => task.priority === 'medium').length 
    },
    { 
      name: 'Low', 
      value: teamTasks.filter(task => task.priority === 'low').length 
    }
  ];
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a569bd'];
  const PRIORITY_COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isChecker2 ? 'Senior Checker Team Dashboard' : 'Team Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Monitor your team's performance and task management metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} out of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-time Completion</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTimeCompletionRate}%</div>
            <Progress value={onTimeCompletionRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks - overdueCompletedTasks} tasks completed on time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageReviewTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to review submitted tasks
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{makerIds.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active team members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Pending</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks not started or in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks submitted for review
            </p>
          </CardContent>
        </Card>
        
        <Card className={overdueTasks > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${overdueTasks > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueTasks > 0 ? "text-red-600" : ""}`}>
              {overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks past their due date
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="task-status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="task-status">Task Status</TabsTrigger>
          <TabsTrigger value="maker-performance">Maker Performance</TabsTrigger>
          <TabsTrigger value="priority-distribution">Priority Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="task-status">
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of tasks by current status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maker-performance">
          <Card>
            <CardHeader>
              <CardTitle>Maker Performance</CardTitle>
              <CardDescription>
                Task completion statistics by team member
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={makerPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" name="On-time" stackId="a" fill="#10b981" />
                    <Bar dataKey="completed" name="Completed Late" stackId="a" fill="#6366f1" />
                    <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" />
                    <Bar dataKey="overdue" name="Overdue" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="priority-distribution">
          <Card>
            <CardHeader>
              <CardTitle>Task Priority Distribution</CardTitle>
              <CardDescription>
                Breakdown of tasks by priority level
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={PRIORITY_COLORS[entry.name.toLowerCase() as keyof typeof PRIORITY_COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Summary</CardTitle>
          <CardDescription>
            Key metrics for team task management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Maker</th>
                  <th className="py-3 text-center">Tasks Assigned</th>
                  <th className="py-3 text-center">Completed</th>
                  <th className="py-3 text-center">Rejected</th>
                  <th className="py-3 text-center">On-time %</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {makerPerformanceData.map((maker, index) => {
                  const totalMakerTasks = maker.completed + maker.rejected + maker.overdue;
                  const onTimePercentage = maker.completed > 0 
                    ? Math.round((maker.onTime / maker.completed) * 100) 
                    : 0;
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3 font-medium">{maker.name}</td>
                      <td className="py-3 text-center">{totalMakerTasks}</td>
                      <td className="py-3 text-center">{maker.completed}</td>
                      <td className="py-3 text-center">{maker.rejected}</td>
                      <td className="py-3 text-center">{onTimePercentage}%</td>
                      <td className="py-3 text-center">
                        <Badge
                          variant="outline"
                          className={
                            onTimePercentage > 80 ? "bg-green-100 text-green-800 border-green-200" :
                            onTimePercentage > 50 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                            "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {onTimePercentage > 80 ? "Good" : onTimePercentage > 50 ? "Average" : "Needs Improvement"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDashboardPage;
