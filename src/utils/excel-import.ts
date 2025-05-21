
import * as XLSX from 'xlsx';
import { Task, TaskFrequency, TaskPriority, ObservationStatus } from '@/types';

// Define the structure of Excel data rows
export interface TaskExcelRow {
  name: string;
  description: string;
  category: string;
  assignedTo: string;
  checker1: string;
  checker2: string;
  priority: string;
  frequency: string;
  isRecurring: string;
  dueDate: string;
  observationStatus: string;
  enablePreNotifications?: string;
  preDays?: string;
  enablePostNotifications?: string;
  postNotificationFrequency?: string;
}

// Get a sample task row for template generation
export const getSampleTaskRow = (): TaskExcelRow => {
  return {
    name: "Sample Task Name",
    description: "Sample task description",
    category: "Compliance",
    assignedTo: "maker1", // User ID
    checker1: "checker1", // User ID
    checker2: "checker2", // User ID
    priority: "medium", // low, medium, high
    frequency: "monthly", // daily, weekly, fortnightly, monthly, quarterly, annually, one-time
    isRecurring: "yes", // yes, no
    dueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    observationStatus: "no", // yes, no, mixed
    enablePreNotifications: "yes", // yes, no
    preDays: "1,3,7", // comma separated days before due date
    enablePostNotifications: "yes", // yes, no
    postNotificationFrequency: "daily", // daily, weekly
  };
};

// Convert a priority string to TaskPriority type
const parsePriority = (value: string): TaskPriority => {
  const normalizedValue = value.toLowerCase().trim();
  if (['low', 'medium', 'high'].includes(normalizedValue)) {
    return normalizedValue as TaskPriority;
  }
  return 'medium'; // Default
};

// Convert a frequency string to TaskFrequency type
const parseFrequency = (value: string): TaskFrequency => {
  const normalizedValue = value.toLowerCase().trim();
  if (['daily', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'annually', 'one-time'].includes(normalizedValue)) {
    return normalizedValue as TaskFrequency;
  }
  return 'one-time'; // Default
};

// Convert a boolean string to boolean
const parseBoolean = (value: string): boolean => {
  const normalizedValue = value.toLowerCase().trim();
  return normalizedValue === 'yes' || normalizedValue === 'true' || normalizedValue === '1';
};

// Convert a string to ObservationStatus type
const parseObservationStatus = (value: string): ObservationStatus => {
  const normalizedValue = value.toLowerCase().trim();
  if (['yes', 'no', 'mixed'].includes(normalizedValue)) {
    return normalizedValue as ObservationStatus;
  }
  return 'no'; // Default
};

// Parse a comma-separated string of numbers to array
const parseNumberArray = (value: string): number[] => {
  return value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
};

// Parse date string to ISO format
const parseDateToISO = (value: string): string => {
  try {
    // Try to parse the date value
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      // If invalid, use current date
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    // If parsing fails, use current date
    return new Date().toISOString();
  }
};

// Validate a task row
export const validateTaskRow = (row: TaskExcelRow, rowIndex: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!row.name) errors.push(`Row ${rowIndex}: Task name is required`);
  if (!row.description) errors.push(`Row ${rowIndex}: Description is required`);
  if (!row.category) errors.push(`Row ${rowIndex}: Category is required`);
  if (!row.assignedTo) errors.push(`Row ${rowIndex}: Assigned To (User ID) is required`);
  if (!row.checker1) errors.push(`Row ${rowIndex}: Checker 1 (User ID) is required`);
  if (!row.checker2) errors.push(`Row ${rowIndex}: Checker 2 (User ID) is required`);
  if (!row.priority) errors.push(`Row ${rowIndex}: Priority is required (low, medium, high)`);
  if (!row.frequency) errors.push(`Row ${rowIndex}: Frequency is required (daily, weekly, fortnightly, monthly, quarterly, annually, one-time)`);
  if (!row.isRecurring) errors.push(`Row ${rowIndex}: Is Recurring is required (yes, no)`);
  if (!row.dueDate) errors.push(`Row ${rowIndex}: Due Date is required (YYYY-MM-DD)`);
  
  return { 
    valid: errors.length === 0,
    errors 
  };
};

// Convert Excel row to task object
export const convertRowToTask = (row: TaskExcelRow): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => {
  const isRecurring = parseBoolean(row.isRecurring);
  
  return {
    name: row.name,
    description: row.description,
    category: row.category,
    assignedTo: row.assignedTo,
    checker1: row.checker1,
    checker2: row.checker2,
    priority: parsePriority(row.priority),
    frequency: parseFrequency(row.frequency),
    isRecurring: isRecurring,
    dueDate: parseDateToISO(row.dueDate),
    status: 'pending',
    observationStatus: parseObservationStatus(row.observationStatus),
    notificationSettings: {
      enablePreNotifications: row.enablePreNotifications ? parseBoolean(row.enablePreNotifications) : true,
      preDays: row.preDays ? parseNumberArray(row.preDays) : [1, 3, 7],
      enablePostNotifications: true, // Always mandatory
      postNotificationFrequency: (row.postNotificationFrequency?.toLowerCase().trim() === 'weekly') ? 'weekly' : 'daily',
      sendEmails: true, // Always mandatory
      notifyMaker: true, // Always mandatory
      notifyChecker1: true, // Always mandatory
      notifyChecker2: true, // Always mandatory
    }
  };
};

// Parse Excel file
export const parseExcelFile = (file: File): Promise<{
  data: TaskExcelRow[];
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        // Parse workbook
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const rows = XLSX.utils.sheet_to_json<TaskExcelRow>(firstSheet, { header: "A" });
        
        // Get header row and remove it from rows
        const headerRow = rows[0];
        const dataRows = rows.slice(1);
        
        // Map header keys to our expected format
        const mappedData: TaskExcelRow[] = dataRows.map((row: any) => {
          const mappedRow: any = {};
          
          Object.keys(row).forEach(key => {
            const headerValue = (headerRow as any)[key];
            if (headerValue) {
              const normalizedHeader = headerValue.toLowerCase().trim();
              
              // Map headers to our expected properties
              if (normalizedHeader === 'name' || normalizedHeader === 'task name') mappedRow.name = row[key];
              else if (normalizedHeader === 'description' || normalizedHeader === 'task description') mappedRow.description = row[key];
              else if (normalizedHeader === 'category') mappedRow.category = row[key];
              else if (normalizedHeader === 'assignedto' || normalizedHeader === 'assigned to' || normalizedHeader === 'maker') mappedRow.assignedTo = row[key];
              else if (normalizedHeader === 'checker1' || normalizedHeader === 'first checker') mappedRow.checker1 = row[key];
              else if (normalizedHeader === 'checker2' || normalizedHeader === 'second checker') mappedRow.checker2 = row[key];
              else if (normalizedHeader === 'priority') mappedRow.priority = row[key];
              else if (normalizedHeader === 'frequency') mappedRow.frequency = row[key];
              else if (normalizedHeader === 'isrecurring' || normalizedHeader === 'is recurring' || normalizedHeader === 'recurring') mappedRow.isRecurring = row[key];
              else if (normalizedHeader === 'duedate' || normalizedHeader === 'due date') mappedRow.dueDate = row[key];
              else if (normalizedHeader === 'observationstatus' || normalizedHeader === 'observation status') mappedRow.observationStatus = row[key];
              else if (normalizedHeader === 'enableprenotifications' || normalizedHeader === 'enable pre notifications') mappedRow.enablePreNotifications = row[key];
              else if (normalizedHeader === 'predays' || normalizedHeader === 'pre days') mappedRow.preDays = row[key];
              else if (normalizedHeader === 'enablepostnotifications' || normalizedHeader === 'enable post notifications') mappedRow.enablePostNotifications = row[key];
              else if (normalizedHeader === 'postnotificationfrequency' || normalizedHeader === 'post notification frequency') mappedRow.postNotificationFrequency = row[key];
            }
          });
          
          return mappedRow as TaskExcelRow;
        });
        
        // Validate rows
        const errors: string[] = [];
        mappedData.forEach((row, index) => {
          const validation = validateTaskRow(row, index + 2); // +2 because index is 0-based and we skipped header row
          if (!validation.valid) {
            errors.push(...validation.errors);
          }
        });
        
        resolve({
          data: mappedData,
          errors
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

// Generate an Excel template file
export const generateExcelTemplate = (): Blob => {
  const sampleRow = getSampleTaskRow();
  
  // Create headers
  const headers = [
    'Name', 'Description', 'Category', 'AssignedTo', 'Checker1', 'Checker2',
    'Priority', 'Frequency', 'IsRecurring', 'DueDate', 'ObservationStatus',
    'EnablePreNotifications', 'PreDays', 'EnablePostNotifications', 'PostNotificationFrequency'
  ];
  
  // Create sample data
  const sampleData = [
    sampleRow.name, sampleRow.description, sampleRow.category, sampleRow.assignedTo,
    sampleRow.checker1, sampleRow.checker2, sampleRow.priority, sampleRow.frequency,
    sampleRow.isRecurring, sampleRow.dueDate, sampleRow.observationStatus,
    sampleRow.enablePreNotifications, sampleRow.preDays, sampleRow.enablePostNotifications,
    sampleRow.postNotificationFrequency
  ];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tasks Template");
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
  
  // Convert binary string to blob
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF;
  }
  
  return new Blob([buf], { type: 'application/octet-stream' });
};
