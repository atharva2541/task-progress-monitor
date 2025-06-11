
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

// Helper function to format cell values based on their type
const formatCellValue = (value, format) => {
  if (value === undefined || value === null) return '-';
  
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(1);
    case 'date':
      try {
        return typeof value === 'string' && value !== '-' ? 
          format(new Date(value), 'MMM d, yyyy') : value;
      } catch (e) {
        return value;
      }
    default:
      return value;
  }
};

export function ReportPreview({ reportData }) {
  if (!reportData || !reportData.data || reportData.data.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No data available for the selected criteria</div>;
  }
  
  // Use default columns if none are provided
  const columns = reportData.columns || Object.keys(reportData.data[0]).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    format: 'text'
  }));
  
  // Generate summary for task details report
  const renderTaskDetailsSummary = () => {
    if (reportData.title !== 'Task Details Report') return null;
    
    // Calculate statistics
    const totalTasks = reportData.data.length;
    const approvedTasks = reportData.data.filter(task => 
      task.status === 'Approved'
    ).length;
    const pendingTasks = reportData.data.filter(task => 
      task.status === 'Pending'
    ).length;
    const rejectedTasks = reportData.data.filter(task => 
      task.status === 'Rejected'
    ).length;
    
    // Calculate average days overdue for tasks that are overdue
    const overdueTasks = reportData.data.filter(task => 
      task.daysOverdue !== 'N/A' && typeof task.daysOverdue === 'number' && task.daysOverdue > 0
    );
    
    const avgDaysOverdue = overdueTasks.length > 0 
      ? overdueTasks.reduce((acc, task) => acc + task.daysOverdue, 0) / overdueTasks.length 
      : 0;
    
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{approvedTasks}</div>
            <p className="text-xs text-muted-foreground">Approved Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Pending Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgDaysOverdue.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Avg. Days Overdue</p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{reportData.title}</h3>
      
      {renderTaskDetailsSummary()}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {formatCellValue(row[column.key], column.format)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {reportData.data.length > 5 && (
        <div className="text-sm text-center text-muted-foreground">
          Showing 5 of {reportData.data.length} entries
        </div>
      )}
    </div>
  );
}
