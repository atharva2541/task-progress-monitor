
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateReportPreviewData } from '@/utils/productivity-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ReportPreview({ tasks, users, selectedUserId, reportType, timeRange }) {
  const [previewData, setPreviewData] = useState({ title: '', data: [] });
  
  useEffect(() => {
    const data = generateReportPreviewData(tasks, users, selectedUserId, reportType, timeRange);
    setPreviewData(data);
  }, [tasks, users, selectedUserId, reportType, timeRange]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Report Preview</h3>
      
      <div className="border rounded-lg p-4 bg-card">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-center">{previewData.title}</h4>
            <p className="text-sm text-center text-muted-foreground">
              {getTimeRangeLabel(timeRange)} • {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {previewData.columns?.map(col => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.data?.map((row, i) => (
                  <TableRow key={i}>
                    {previewData.columns?.map(col => (
                      <TableCell key={col.key}>
                        {formatCellValue(row[col.key], col.format)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeRangeLabel(timeRange) {
  switch (timeRange) {
    case '3months': return 'Last 3 Months';
    case '6months': return 'Last 6 Months';
    case '12months': return 'Last 12 Months';
    case 'alltime': return 'All Time';
    default: return 'Custom Range';
  }
}

function formatCellValue(value, format) {
  if (value === undefined || value === null) return '';
  
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'date':
      return new Date(value).toLocaleDateString();
    default:
      return value;
  }
}
