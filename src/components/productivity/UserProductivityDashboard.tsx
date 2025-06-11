
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRangeSelector } from './TimeRangeSelector';
import { UserSelector } from './UserSelector';
import { UserPerformanceMetrics } from './UserPerformanceMetrics';
import { UserProductivityChart } from './UserProductivityChart';
import { TaskCompletionTable } from './TaskCompletionTable';
import { getUserProductivityData } from '@/utils/productivity-utils';

export function UserProductivityDashboard({ tasks, users }) {
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userMetrics, setUserMetrics] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  
  // Select first user by default
  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);
  
  useEffect(() => {
    if (selectedUserId) {
      const { metrics, filteredTasks } = getUserProductivityData(tasks, selectedUserId, timeRange);
      setUserMetrics(metrics);
      setUserTasks(filteredTasks);
    }
  }, [tasks, selectedUserId, timeRange]);
  
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">User Productivity</h2>
          <UserSelector users={users} value={selectedUserId} onChange={setSelectedUserId} />
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      
      {selectedUser && userMetrics && (
        <>
          <Card className="bg-muted/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">Role: {selectedUser.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <UserPerformanceMetrics metrics={userMetrics} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <UserProductivityChart tasks={userTasks} timeRange={timeRange} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskCompletionTable tasks={userTasks.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
