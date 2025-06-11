
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserSelector } from './UserSelector';
import { Download, FileText } from 'lucide-react';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ReportPreview } from './ReportPreview';
import { generateReportPreviewData } from '@/utils/productivity-utils';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export function ReportGenerator({ tasks, users }) {
  const [selectedUser, setSelectedUser] = useState('all');
  const [timeRange, setTimeRange] = useState('3months');
  const [reportType, setReportType] = useState('performance');
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const reportPreviewData = generateReportPreviewData(tasks, users, selectedUser, reportType, timeRange);
  
  const handleExport = (format) => {
    console.log(`Exporting ${reportType} report for ${selectedUser} in ${format} format`);
    
    if (!reportPreviewData || !reportPreviewData.data || reportPreviewData.data.length === 0) {
      toast.error('No data available to export');
      return;
    }
    
    try {
      if (format === 'excel') {
        // Create a new workbook and worksheet
        const wb = XLSX.utils.book_new();
        
        // Convert the data to a format that XLSX can use
        const wsData = [
          // Headers
          reportPreviewData.columns.map(col => col.label),
          // Data rows
          ...reportPreviewData.data.map(row => 
            reportPreviewData.columns.map(col => {
              const value = row[col.key];
              if (value === undefined || value === null) return '';
              return value;
            })
          )
        ];
        
        // Create the worksheet and add it to the workbook
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        
        // Generate the file and trigger download
        XLSX.writeFile(wb, `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel report downloaded successfully');
      } else if (format === 'csv') {
        // Create CSV content
        const headers = reportPreviewData.columns.map(col => col.label).join(',');
        const rows = reportPreviewData.data.map(row => 
          reportPreviewData.columns.map(col => {
            const value = row[col.key];
            if (value === undefined || value === null) return '';
            // Handle quotes in CSV values
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(',')
        ).join('\n');
        
        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV report downloaded successfully');
      } else if (format === 'pdf') {
        // For PDF, we'll show a message since browser-based PDF generation requires additional libraries
        toast.info('PDF export functionality will be available soon');
        // In a real implementation, this would use a library like jsPDF or trigger a server-side PDF generation
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Create and download productivity reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">User</label>
                <UserSelector 
                  users={[{ id: 'all', name: 'All Users' }, ...users]}
                  value={selectedUser}
                  onChange={setSelectedUser}
                />
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Metrics</SelectItem>
                    <SelectItem value="completion">Task Completion</SelectItem>
                    <SelectItem value="trend">Productivity Trends</SelectItem>
                    <SelectItem value="task-details">Task Details Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">Time Period</label>
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <Button
                variant="outline"
                onClick={() => setPreviewVisible(!previewVisible)}
                className="flex items-center gap-2"
              >
                {previewVisible ? 'Hide Preview' : 'Show Preview'} 
                <svg 
                  className={`h-4 w-4 transition-transform ${previewVisible ? 'transform rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport('excel')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  onClick={() => handleExport('pdf')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {previewVisible && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Report Preview</CardTitle>
              <Badge variant="outline">{timeRange === 'custom' ? 'Custom Range' : 
                timeRange === 'alltime' ? 'All Time' : `Last ${timeRange}`}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ReportPreview reportData={reportPreviewData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
