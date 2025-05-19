
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Download, FileExcel, FilePdf } from 'lucide-react';
import { UserSelector } from './UserSelector';
import { TimeRangeSelector } from './TimeRangeSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview } from './ReportPreview';
import { generateExcelReport, generatePdfReport, generateCsvReport } from '@/utils/report-utils';

export function ReportGenerator({ tasks, users }) {
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [reportType, setReportType] = useState('performance');
  const [reportFormat, setReportFormat] = useState('excel');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      let result;
      
      switch (reportFormat) {
        case 'excel':
          result = await generateExcelReport(tasks, users, selectedUserId, reportType, timeRange);
          break;
        case 'pdf':
          result = await generatePdfReport(tasks, users, selectedUserId, reportType, timeRange);
          break;
        case 'csv':
          result = await generateCsvReport(tasks, users, selectedUserId, reportType, timeRange);
          break;
      }
      
      console.log('Report generated:', result);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Create productivity reports in various formats for analysis and record-keeping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Metrics</SelectItem>
                    <SelectItem value="completion">Task Completion</SelectItem>
                    <SelectItem value="team">Team Comparison</SelectItem>
                    <SelectItem value="escalation">Escalation Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">User/Team</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user/team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Format</label>
                <Tabs value={reportFormat} onValueChange={setReportFormat}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="excel" className="flex items-center gap-2">
                      <FileExcel className="h-4 w-4" />
                      Excel
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="flex items-center gap-2">
                      <FilePdf className="h-4 w-4" />
                      PDF
                    </TabsTrigger>
                    <TabsTrigger value="csv" className="flex items-center gap-2">
                      <FileDown className="h-4 w-4" />
                      CSV
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating} 
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Download Report'}
              </Button>
            </div>
            
            <ReportPreview 
              tasks={tasks}
              users={users}
              selectedUserId={selectedUserId}
              reportType={reportType}
              timeRange={timeRange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
