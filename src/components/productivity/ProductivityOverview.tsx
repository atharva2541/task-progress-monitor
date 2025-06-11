
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRangeSelector } from './TimeRangeSelector';
import { MetricCard } from './MetricCard';
import { ProductivityTrends } from './ProductivityTrends';
import { calculateProductivityMetrics } from '@/utils/productivity-utils';

export function ProductivityOverview({ tasks, users }) {
  const [timeRange, setTimeRange] = useState('3months');
  const [metrics, setMetrics] = useState({
    completionRate: 0,
    onTimeRate: 0,
    avgCompletionTime: 0,
    rejectionRate: 0,
    escalationRate: 0,
    totalTasks: 0
  });
  
  useEffect(() => {
    // Calculate metrics based on selected time range
    const calculatedMetrics = calculateProductivityMetrics(tasks, users, timeRange);
    setMetrics(calculatedMetrics);
  }, [tasks, users, timeRange]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Productivity Overview</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Task Completion Rate" 
          value={`${metrics.completionRate.toFixed(1)}%`}
          description="Tasks completed vs. assigned" 
          trend={5.2}
          trendLabel="vs. previous period"
          icon="chart-bar"
        />
        <MetricCard 
          title="On-Time Performance" 
          value={`${metrics.onTimeRate.toFixed(1)}%`}
          description="Tasks completed before deadline" 
          trend={-2.1}
          trendLabel="vs. previous period"
          icon="calendar"
        />
        <MetricCard 
          title="Avg. Completion Time" 
          value={`${metrics.avgCompletionTime.toFixed(1)} days`}
          description="Average days to complete tasks" 
          trend={-1.5}
          trendLabel="vs. previous period"
          icon="chart-line"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Rejection Rate" 
          value={`${metrics.rejectionRate.toFixed(1)}%`}
          description="Tasks rejected or requiring rework" 
          trend={-0.5}
          trendLabel="vs. previous period"
          icon="chart-bar"
        />
        <MetricCard 
          title="Escalation Rate" 
          value={`${metrics.escalationRate.toFixed(1)}%`}
          description="Tasks requiring escalation" 
          trend={-1.2}
          trendLabel="vs. previous period"
          icon="arrow-up"
        />
        <MetricCard 
          title="Task Volume" 
          value={metrics.totalTasks}
          description="Total tasks in selected period" 
          trend={12}
          trendLabel="vs. previous period"
          icon="chart-bar"
        />
        <MetricCard 
          title="Active Users" 
          value={users.length}
          description="Users with task activity" 
          trend={2}
          trendLabel="vs. previous period"
          icon="users"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductivityTrends tasks={tasks} timeRange={timeRange} />
        </CardContent>
      </Card>
    </div>
  );
}
