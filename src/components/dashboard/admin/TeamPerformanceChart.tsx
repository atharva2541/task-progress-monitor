
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TeamData {
  name: string;
  completed: number;
  inProgress: number;
  rejected: number;
}

interface TeamPerformanceChartProps {
  teamData: TeamData[];
}

export function TeamPerformanceChart({ teamData }: TeamPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>
          Task completion metrics by team
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={teamData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="#22c55e" />
            <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" />
            <Bar dataKey="rejected" name="Rejected" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
