
import { useState, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { generateUserProductivityChartData } from '@/utils/productivity-utils';

export function UserProductivityChart({ tasks, timeRange }) {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const data = generateUserProductivityChartData(tasks, timeRange);
    setChartData(data);
  }, [tasks, timeRange]);

  const chartConfig = {
    completed: {
      label: "Completed Tasks",
      theme: { light: "#8B5CF6", dark: "#A78BFA" }
    },
    onTime: {
      label: "On-Time Completion",
      theme: { light: "#22C55E", dark: "#4ADE80" }
    }
  };
  
  return (
    <div className="w-full aspect-[3/2]">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--color-completed)" 
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
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
