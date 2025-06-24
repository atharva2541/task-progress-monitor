
import React, { useState } from 'react';
import { useSupabaseTasks } from '@/contexts/SupabaseTaskContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSummaryCards } from './DashboardSummaryCards';
import { TaskStatusChart } from './TaskStatusChart';
import { TaskPriorityChart } from './TaskPriorityChart';
import { RecentTasksList } from './RecentTasksList';
import { TeamPerformanceChart } from './TeamPerformanceChart';

export function AdminDashboard() {
  const { tasks } = useSupabaseTasks();
  const { getAllProfiles } = useSupabaseAuth();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Load profiles for user count
  React.useEffect(() => {
    getAllProfiles().then(setProfiles);
  }, [getAllProfiles]);
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const submittedTasks = tasks.filter(task => task.status === 'submitted').length;
  const approvedTasks = tasks.filter(task => task.status === 'approved').length;
  const rejectedTasks = tasks.filter(task => task.status === 'rejected').length;
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
  
  // Data for pie chart (task status)
  const statusData = [
    { name: 'Pending', value: pendingTasks, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
    { name: 'Submitted', value: submittedTasks, color: '#8b5cf6' },
    { name: 'Approved', value: approvedTasks, color: '#22c55e' },
    { name: 'Rejected', value: rejectedTasks, color: '#ef4444' }
  ];
  
  // Data for bar chart (task priority)
  const priorityData = [
    { name: 'High', value: highPriorityTasks, color: '#ef4444' },
    { name: 'Medium', value: mediumPriorityTasks, color: '#f59e0b' },
    { name: 'Low', value: lowPriorityTasks, color: '#22c55e' }
  ];
  
  // Mock data for team performance chart
  const teamData = [
    { name: 'Team A', completed: 20, inProgress: 5, rejected: 2 },
    { name: 'Team B', completed: 15, inProgress: 8, rejected: 1 },
    { name: 'Team C', completed: 12, inProgress: 4, rejected: 3 },
    { name: 'Team D', completed: 18, inProgress: 6, rejected: 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of system performance and metrics</p>
      </div>

      <DashboardSummaryCards 
        totalTasks={totalTasks}
        usersLength={profiles.length}
        approvedTasks={approvedTasks}
        totalTasks2={totalTasks}
      />

      <Tabs 
        defaultValue="overview" 
        className="space-y-4" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
      >
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <TaskStatusChart statusData={statusData} />
            <TaskPriorityChart priorityData={priorityData} />
          </div>
          
          <div className="grid gap-4 grid-cols-1">
            <RecentTasksList tasks={tasks} />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <TeamPerformanceChart teamData={teamData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
