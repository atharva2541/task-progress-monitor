
import * as XLSX from 'xlsx';
import { Task, TaskInstance, User, TaskAttachment } from '@/types';

/**
 * Exports task history to Excel file
 * @param task The main task object
 * @param instances Array of task instances to export
 * @param filename Name of the output file
 * @param getUserById Function to get user information by ID
 */
export const exportTaskHistoryToExcel = (
  task: Task, 
  instances: TaskInstance[], 
  filename: string,
  getUserById: (id: string) => User | undefined
) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Add task summary sheet
  const taskSummary = [
    ['Task Summary'],
    [''],
    ['Name', task.name],
    ['Description', task.description],
    ['Category', task.category],
    ['Priority', task.priority],
    ['Frequency', task.frequency],
    ['Recurring', task.isRecurring ? 'Yes' : 'No'],
    ['Created At', new Date(task.createdAt).toLocaleDateString()],
    ['', ''],
    ['Assigned To', getUserById(task.assignedTo)?.name || task.assignedTo],
    ['First Checker', getUserById(task.checker1)?.name || task.checker1],
    ['Second Checker', getUserById(task.checker2)?.name || task.checker2],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(taskSummary);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Task Summary');
  
  // Create instances sheet data
  const instancesHeader = [
    'Reference', 'Period Start', 'Period End', 'Due Date', 'Status', 
    'Submitted Date', 'Completed Date'
  ];
  
  const instancesData = instances.map(instance => [
    instance.instanceReference,
    formatExcelDate(instance.periodStart),
    formatExcelDate(instance.periodEnd),
    formatExcelDate(instance.dueDate),
    instance.status,
    instance.submittedAt ? formatExcelDate(instance.submittedAt) : 'N/A',
    instance.completedAt ? formatExcelDate(instance.completedAt) : 'N/A'
  ]);
  
  const instancesSheet = XLSX.utils.aoa_to_sheet([instancesHeader, ...instancesData]);
  XLSX.utils.book_append_sheet(wb, instancesSheet, 'Instances');
  
  // Create comments sheet if there are any comments
  const allComments = instances.flatMap(instance => 
    instance.comments.map(comment => ({
      instanceRef: instance.instanceReference,
      ...comment,
      userName: getUserById(comment.userId)?.name || 'Unknown User'
    }))
  );
  
  if (allComments.length > 0) {
    const commentsHeader = ['Instance', 'User', 'Comment', 'Date'];
    const commentsData = allComments.map(comment => [
      comment.instanceRef,
      comment.userName,
      comment.content,
      formatExcelDate(comment.createdAt)
    ]);
    
    const commentsSheet = XLSX.utils.aoa_to_sheet([commentsHeader, ...commentsData]);
    XLSX.utils.book_append_sheet(wb, commentsSheet, 'Comments');
  }
  
  // Create approvals sheet if there are any approvals
  const allApprovals = instances.flatMap(instance => 
    instance.approvals.map(approval => ({
      instanceRef: instance.instanceReference,
      ...approval
    }))
  );
  
  if (allApprovals.length > 0) {
    const approvalsHeader = ['Instance', 'Role', 'Status', 'Comment', 'Date'];
    const approvalsData = allApprovals.map(approval => [
      approval.instanceRef,
      approval.userRole === 'checker1' ? 'First Checker' : 'Second Checker',
      approval.status,
      approval.comment || '',
      formatExcelDate(approval.timestamp)
    ]);
    
    const approvalsSheet = XLSX.utils.aoa_to_sheet([approvalsHeader, ...approvalsData]);
    XLSX.utils.book_append_sheet(wb, approvalsSheet, 'Approvals');
  }
  
  // Create attachments metadata sheet if there are any attachments
  const allAttachments = instances.flatMap(instance => 
    instance.attachments.map(attachment => ({
      instanceRef: instance.instanceReference,
      ...attachment,
      userName: getUserById(attachment.userId)?.name || 'Unknown User'
    }))
  );
  
  if (allAttachments.length > 0) {
    const attachmentsHeader = ['Instance', 'File Name', 'File Type', 'Size', 'Uploaded By', 'Uploaded Date', 'Download URL'];
    const attachmentsData = allAttachments.map(attachment => [
      attachment.instanceRef,
      attachment.fileName,
      attachment.fileType,
      // Use optional chaining for fileSize since it might not exist in older data
      formatFileSize(0), // Default to 0 bytes since fileSize is not available in the type
      attachment.userName,
      formatExcelDate(attachment.uploadedAt),
      attachment.fileUrl
    ]);
    
    const attachmentsSheet = XLSX.utils.aoa_to_sheet([attachmentsHeader, ...attachmentsData]);
    XLSX.utils.book_append_sheet(wb, attachmentsSheet, 'Attachments');
  }
  
  // Write the workbook and trigger download
  XLSX.writeFile(wb, filename);
};

// Helper to format date for Excel
const formatExcelDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
