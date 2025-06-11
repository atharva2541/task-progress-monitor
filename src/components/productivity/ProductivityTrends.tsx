
import { useState, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { generateProductivityTrendData } from '@/utils/productivity-utils';

export function ProductivityTrends({ tasks, timeRange }) {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    // Generate chart data based on tasks and selected time range
    const data = generateProductivityTrendData(tasks, timeRange);
    setChartData(data);
  }, [tasks, timeRange]);

  const chartConfig = {
    completion: {
      label: "Task Completion",
      theme: { light: "#8B5CF6", dark: "#A78BFA" }
    },
    onTime: {
      label: "On-Time Rate",
      theme: { light: "#22C55E", dark: "#4ADE80" }
    },
    rejection: {
      label: "Rejection Rate",
      theme: { light: "#EF4444", dark: "#F87171" }
    }
  };
  
  return (
    <div className="w-full aspect-[3/2] sm:aspect-[4/2]">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="completion" 
              stroke="var(--color-completion)" 
              activeDot={{ r: 6 }} 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="onTime" 
              stroke="var(--color-onTime)" 
              activeDot={{ r: 6 }} 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="rejection" 
              stroke="var(--color-rejection)" 
              activeDot={{ r: 6 }} 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
