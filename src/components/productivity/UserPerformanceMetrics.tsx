
import { MetricCard } from './MetricCard';

export function UserPerformanceMetrics({ metrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard 
        title="Completion Rate" 
        value={`${metrics.completionRate.toFixed(1)}%`}
        description="Tasks completed vs assigned" 
        trend={metrics.completionRateTrend}
        icon="chart-bar"
      />
      <MetricCard 
        title="On-Time Percentage" 
        value={`${metrics.onTimeRate.toFixed(1)}%`}
        description="Tasks completed before deadline" 
        trend={metrics.onTimeRateTrend}
        icon="calendar"
      />
      <MetricCard 
        title="Avg. Completion Time" 
        value={`${metrics.avgCompletionTime.toFixed(1)} days`}
        description="Average days to complete tasks" 
        trend={metrics.avgCompletionTimeTrend}
        icon="chart-line"
      />
      <MetricCard 
        title="Rejection Rate" 
        value={`${metrics.rejectionRate.toFixed(1)}%`}
        description="Tasks rejected or requiring rework" 
        trend={metrics.rejectionRateTrend}
        icon="chart-bar"
      />
      <MetricCard 
        title="Escalation Rate" 
        value={`${metrics.escalationRate.toFixed(1)}%`}
        description="Tasks requiring escalation" 
        trend={metrics.escalationRateTrend}
        icon="arrow-up"
      />
      <MetricCard 
        title="Task Volume" 
        value={metrics.totalTasks}
        description="Total tasks in selected period" 
        trend={metrics.totalTasksTrend}
        icon="chart-bar"
      />
    </div>
  );
}
