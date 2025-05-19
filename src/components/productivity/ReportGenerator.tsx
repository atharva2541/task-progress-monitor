
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserSelector } from './UserSelector';
import { Download, FileText, ChevronDown } from 'lucide-react';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ReportPreview } from './ReportPreview';
import { generateReportPreviewData } from '@/utils/productivity-utils';
import { Badge } from '@/components/ui/badge';

export function ReportGenerator({ tasks, users }) {
  const [selectedUser, setSelectedUser] = useState('all');
  const [timeRange, setTimeRange] = useState('3months');
  const [reportType, setReportType] = useState('performance');
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const reportPreviewData = generateReportPreviewData(tasks, users, selectedUser, reportType, timeRange);
  
  const handleExport = (format) => {
    // In a real app, this would generate and download the report in the specified format
    console.log(`Exporting ${reportType} report for ${selectedUser} in ${format} format`);
    // Add actual export logic here
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
                <ChevronDown className={`h-4 w-4 transition-transform ${previewVisible ? 'transform rotate-180' : ''}`} />
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
