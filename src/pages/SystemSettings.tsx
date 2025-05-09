
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProgressCard } from '@/components/dashboard/UserProgressCard';

const SystemSettings = () => {
  const { user: currentUser } = useAuth();
  const { tasks } = useTask();
  const [selectedUserId, setSelectedUserId] = useState<string>('2'); // Default to first maker

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Mock users data - in a real app you would fetch this from your user context
  const users = [
    { id: '2', name: 'Maker User', role: 'maker' },
    { id: '3', name: 'Checker One', role: 'checker1' },
    { id: '4', name: 'Checker Two', role: 'checker2' },
  ];

  // Get tasks for selected user
  const userTasks = tasks.filter(task => 
    task.assignedTo === selectedUserId || 
    task.checker1 === selectedUserId || 
    task.checker2 === selectedUserId
  );

  // Calculate statistics
  const totalUserTasks = userTasks.length;
  const completedTasks = userTasks.filter(task => 
    task.status === 'approved'
  ).length;
  const pendingTasks = userTasks.filter(task => 
    task.status === 'pending' || task.status === 'in-progress'
  ).length;
  const reviewTasks = userTasks.filter(task => 
    task.status === 'submitted'
  ).length;
  const rejectedTasks = userTasks.filter(task => 
    task.status === 'rejected'
  ).length;

  // Prepare chart data
  const userData = [
    { name: 'Completed', value: completedTasks, fill: '#22c55e' },
    { name: 'Pending', value: pendingTasks, fill: '#3b82f6' },
    { name: 'In Review', value: reviewTasks, fill: '#8b5cf6' },
    { name: 'Rejected', value: rejectedTasks, fill: '#ef4444' }
  ];

  // Weekly performance data (mock data for demonstration)
  const weeklyData = [
    { name: 'Week 1', completed: 5, pending: 2 },
    { name: 'Week 2', completed: 7, pending: 1 },
    { name: 'Week 3', completed: 4, pending: 3 },
    { name: 'Week 4', completed: 8, pending: 0 },
  ];

  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system settings and view user performance</p>
      </div>
      
      <Tabs defaultValue="user-management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="system-config">System Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Performance</CardTitle>
              <CardDescription>View and analyze user task performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Select User</label>
                <Select 
                  value={selectedUserId} 
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedUser && (
                <div className="space-y-6">
                  <UserProgressCard 
                    userId={selectedUserId}
                    userName={selectedUser.name}
                    totalTasks={totalUserTasks}
                    completedTasks={completedTasks}
                    pendingTasks={pendingTasks}
                    reviewTasks={reviewTasks}
                    rejectedTasks={rejectedTasks}
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Task Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Tasks" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                              <Bar dataKey="pending" name="Pending" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system-config">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">
                  System configuration options will be available in future updates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
