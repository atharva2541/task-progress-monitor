
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export function TeamComparisonChart({ teamData, metric = 'completionRate' }) {
  // Format data for chart display
  const chartData = teamData.map(user => ({
    name: user.name,
    [metric]: getMetricValue(user, metric)
  }));
  
  // Get appropriate label for the selected metric
  const metricLabel = getMetricLabel(metric);
  
  const chartConfig = {
    [metric]: {
      label: metricLabel,
      theme: { light: "#8B5CF6", dark: "#A78BFA" }
    }
  };
  
  return (
    <div className="w-full aspect-[3/2]">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey={metric} 
              fill={`var(--color-${metric})`} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

function getMetricValue(user, metric) {
  switch (metric) {
    case 'completionRate': return user.completionRate;
    case 'onTimeRate': return user.onTimeRate;
    case 'avgCompletionTime': return user.avgCompletionTime;
    case 'rejectionRate': return user.rejectionRate;
    default: return user[metric] || 0;
  }
}

function getMetricLabel(metric) {
  switch (metric) {
    case 'completionRate': return "Completion Rate (%)";
    case 'onTimeRate': return "On-Time Rate (%)";
    case 'avgCompletionTime': return "Avg. Completion Time (days)";
    case 'rejectionRate': return "Rejection Rate (%)";
    default: return metric;
  }
}
