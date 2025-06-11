
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';

interface PriorityData {
  name: string;
  value: number;
  color: string;
}

interface TaskPriorityChartProps {
  priorityData: PriorityData[];
}

export function TaskPriorityChart({ priorityData }: TaskPriorityChartProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Task Priority</CardTitle>
        <CardDescription>
          Distribution of tasks by priority level
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={priorityData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Tasks" fill="#8884d8">
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
