
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

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
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{reportData.title}</h3>
      
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
