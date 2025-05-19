
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function TaskCompletionTable({ tasks }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task Name</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Completion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.name}</TableCell>
            <TableCell>{format(new Date(task.dueDate), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <StatusBadge status={task.status} />
            </TableCell>
            <TableCell>
              {task.submittedAt ? 
                wasCompletedOnTime(task) ? 
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">On Time</Badge> : 
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Delayed</Badge>
                : 
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusBadge({ status }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', className: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'in-progress':
        return { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'submitted':
        return { label: 'Submitted', className: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'approved':
        return { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'rejected':
        return { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function wasCompletedOnTime(task) {
  if (!task.submittedAt) return false;
  const submittedDate = new Date(task.submittedAt);
  const dueDate = new Date(task.dueDate);
  return submittedDate <= dueDate;
}
