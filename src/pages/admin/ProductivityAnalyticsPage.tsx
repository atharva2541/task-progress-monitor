
import { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProductivityDashboard } from '@/components/productivity/UserProductivityDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductivityOverview } from '@/components/productivity/ProductivityOverview';
import { TeamComparisonView } from '@/components/productivity/TeamComparisonView';
import { ReportGenerator } from '@/components/productivity/ReportGenerator';

export default function ProductivityAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { tasks } = useTask();
  const { users } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Productivity Analytics</h1>
        <p className="text-muted-foreground">Monitor user and team performance metrics</p>
      </div>
      
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-productivity">User Productivity</TabsTrigger>
          <TabsTrigger value="team-comparison">Team Comparison</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ProductivityOverview tasks={tasks} users={users} />
        </TabsContent>
        
        <TabsContent value="user-productivity" className="space-y-4">
          <UserProductivityDashboard tasks={tasks} users={users} />
        </TabsContent>
        
        <TabsContent value="team-comparison" className="space-y-4">
          <TeamComparisonView tasks={tasks} users={users} />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ReportGenerator tasks={tasks} users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
