
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProductivityMetrics, ReportTimePeriod } from '@/services/ReportService';

/**
 * Format date for file names
 */
const formatDate = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Get friendly name for time period
 */
const getTimePeriodName = (period: ReportTimePeriod): string => {
  switch(period) {
    case '3months': return 'Last 3 Months';
    case '6months': return 'Last 6 Months';
    case '12months': return 'Last 12 Months';
    case 'inception': return 'Since Inception';
    default: return 'Custom Period';
  }
};

/**
 * Export user productivity data to Excel
 */
export const exportToExcel = (userData: UserProductivityMetrics, period: ReportTimePeriod): void => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Prepare summary data
  const summaryData = [
    ['User Productivity Report', ''],
    ['User', userData.userName],
    ['Time Period', getTimePeriodName(period)],
    ['Report Date', new Date().toLocaleDateString()],
    ['', ''],
    ['Key Metrics', ''],
    ['Tasks Assigned', userData.tasksAssigned],
    ['Tasks Completed', userData.tasksCompleted],
    ['Tasks Pending', userData.tasksPending],
    ['Tasks Rejected', userData.tasksRejected],
    ['Tasks Overdue', userData.tasksOverdue],
    ['Completion Rate', `${userData.completionRate.toFixed(2)}%`],
    ['On-time Completion Rate', `${userData.onTimeCompletionRate.toFixed(2)}%`],
    ['Average Completion Time', `${userData.averageCompletionDays.toFixed(1)} days`],
  ];
  
  // Create summary worksheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');
  
  // Prepare monthly trend data
  const monthlyData = [
    ['Month', 'Task Count'],
    ...userData.monthlyTaskVolume.map(item => [item.month, item.count])
  ];
  
  // Create monthly trend worksheet
  const trendsWs = XLSX.utils.aoa_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(workbook, trendsWs, 'Monthly Trends');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(data, `user_productivity_${userData.userName.replace(/\s+/g, '_')}_${formatDate()}.xlsx`);
};

/**
 * Export user productivity data to PDF
 */
export const exportToPdf = (userData: UserProductivityMetrics, period: ReportTimePeriod): void => {
  // Create PDF document (A4 size)
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('User Productivity Report', 14, 22);
  
  // Add report metadata
  doc.setFontSize(12);
  doc.text(`User: ${userData.userName}`, 14, 32);
  doc.text(`Time Period: ${getTimePeriodName(period)}`, 14, 39);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 46);
  
  // Add key metrics table
  autoTable(doc, {
    startY: 55,
    head: [['Metric', 'Value']],
    body: [
      ['Tasks Assigned', userData.tasksAssigned],
      ['Tasks Completed', userData.tasksCompleted],
      ['Tasks Pending', userData.tasksPending],
      ['Tasks Rejected', userData.tasksRejected],
      ['Tasks Overdue', userData.tasksOverdue],
      ['Completion Rate', `${userData.completionRate.toFixed(2)}%`],
      ['On-time Completion Rate', `${userData.onTimeCompletionRate.toFixed(2)}%`],
      ['Average Completion Time', `${userData.averageCompletionDays.toFixed(1)} days`],
    ],
    headStyles: { fillColor: [139, 92, 246] }, // Purple color
  });
  
  // Add monthly trends title
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Monthly Task Volume', 14, finalY);
  
  // Add monthly trends table
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Month', 'Task Count']],
    body: userData.monthlyTaskVolume.map(item => [item.month, item.count]),
    headStyles: { fillColor: [139, 92, 246] }, // Purple color
  });
  
  // Save the PDF
  doc.save(`user_productivity_${userData.userName.replace(/\s+/g, '_')}_${formatDate()}.pdf`);
};

/**
 * Export user productivity data to CSV
 */
export const exportToCsv = (userData: UserProductivityMetrics, period: ReportTimePeriod): void => {
  // Prepare CSV content
  let csvContent = 'User Productivity Report\n';
  csvContent += `User,${userData.userName}\n`;
  csvContent += `Time Period,${getTimePeriodName(period)}\n`;
  csvContent += `Report Date,${new Date().toLocaleDateString()}\n\n`;
  
  // Add metrics
  csvContent += 'Metric,Value\n';
  csvContent += `Tasks Assigned,${userData.tasksAssigned}\n`;
  csvContent += `Tasks Completed,${userData.tasksCompleted}\n`;
  csvContent += `Tasks Pending,${userData.tasksPending}\n`;
  csvContent += `Tasks Rejected,${userData.tasksRejected}\n`;
  csvContent += `Tasks Overdue,${userData.tasksOverdue}\n`;
  csvContent += `Completion Rate,${userData.completionRate.toFixed(2)}%\n`;
  csvContent += `On-time Completion Rate,${userData.onTimeCompletionRate.toFixed(2)}%\n`;
  csvContent += `Average Completion Time,${userData.averageCompletionDays.toFixed(1)} days\n\n`;
  
  // Add monthly trends
  csvContent += 'Monthly Task Volume\n';
  csvContent += 'Month,Task Count\n';
  
  userData.monthlyTaskVolume.forEach(item => {
    csvContent += `${item.month},${item.count}\n`;
  });
  
  // Create blob and save
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `user_productivity_${userData.userName.replace(/\s+/g, '_')}_${formatDate()}.csv`);
};
