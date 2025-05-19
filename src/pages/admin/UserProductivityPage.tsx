
import React, { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useReportService, ReportTimePeriod, UserProductivityMetrics } from '@/services/ReportService';
import { exportToExcel, exportToPdf, exportToCsv } from '@/utils/report-utils';
import { AlertCircle, Download, FileText, Users } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const UserProductivityPage = () => {
  const { tasks } = useTask();
  const { users } = useAuth();
  const reportService = useReportService();
  
  const [selectedUser, setSelectedUser] = useState<string>(users.length > 0 ? users[0].id : '');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportTimePeriod>('3months');
  const [productivityData, setProductivityData] = useState<UserProductivityMetrics | null>(null);
  
  // Calculate productivity data when user or period changes
  React.useEffect(() => {
    if (!selectedUser || !tasks.length) return;
    
    const user = users.find(u => u.id === selectedUser);
    if (!user) return;
    
    const metrics = reportService.calculateUserProductivity(
      tasks,
      selectedUser,
      user.name,
      selectedPeriod
    );
    
    setProductivityData(metrics);
  }, [selectedUser, selectedPeriod, tasks, users, reportService]);
  
  // Helper function to handle exports
  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    if (!productivityData) return;
    
    switch (format) {
      case 'excel':
        exportToExcel(productivityData, selectedPeriod);
        break;
      case 'pdf':
        exportToPdf(productivityData, selectedPeriod);
        break;
      case 'csv':
        exportToCsv(productivityData, selectedPeriod);
        break;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Productivity</h1>
          <p className="text-muted-foreground">
            Monitor individual user performance and productivity metrics
          </p>
        </div>
        
        {productivityData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>
            Select a user and time period to analyze productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select 
                value={selectedUser} 
                onValueChange={setSelectedUser}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select 
                value={selectedPeriod} 
                onValueChange={(value) => setSelectedPeriod(value as ReportTimePeriod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="inception">Since Inception</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {productivityData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Summary</CardTitle>
              <CardDescription>
                Overview of task assignments and completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tasks Assigned</span>
                    <span className="font-medium">{productivityData.tasksAssigned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tasks Completed</span>
                    <span className="font-medium">{productivityData.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tasks Pending</span>
                    <span className="font-medium">{productivityData.tasksPending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tasks Rejected</span>
                    <span className="font-medium">{productivityData.tasksRejected}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tasks Overdue</span>
                    <span className="font-medium">{productivityData.tasksOverdue}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key productivity indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-sm font-medium">{productivityData.completionRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={productivityData.completionRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">On-time Completion Rate</span>
                    <span className="text-sm font-medium">{productivityData.onTimeCompletionRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={productivityData.onTimeCompletionRate} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Completion Time</span>
                    <span className="text-sm font-medium">
                      {productivityData.averageCompletionDays.toFixed(1)} days
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Task Volume</CardTitle>
              <CardDescription>
                Number of tasks assigned per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productivityData.monthlyTaskVolume}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Tasks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No data available</h3>
              <p className="text-sm text-muted-foreground">
                Select a user and time period to view productivity metrics
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProductivityPage;
