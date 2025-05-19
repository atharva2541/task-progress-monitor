
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TeamProductivityTable({ teamData }) {
  // Sort teams by completion rate
  const sortedTeamData = [...teamData].sort((a, b) => b.completionRate - a.completionRate);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Task Volume</TableHead>
          <TableHead>Completion Rate</TableHead>
          <TableHead>On-Time %</TableHead>
          <TableHead>Avg. Time (days)</TableHead>
          <TableHead>Rejection %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTeamData.map((user, index) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  {index + 1}
                </div>
                {user.name}
              </div>
            </TableCell>
            <TableCell>{user.taskVolume}</TableCell>
            <TableCell>{user.completionRate.toFixed(1)}%</TableCell>
            <TableCell>{user.onTimeRate.toFixed(1)}%</TableCell>
            <TableCell>{user.avgCompletionTime.toFixed(1)}</TableCell>
            <TableCell>{user.rejectionRate.toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
