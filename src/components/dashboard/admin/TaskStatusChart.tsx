
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

interface TaskStatusChartProps {
  statusData: TaskStatusData[];
}

export function TaskStatusChart({ statusData }: TaskStatusChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Task Status Distribution</CardTitle>
        <CardDescription>
          Overview of tasks by their current status
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
