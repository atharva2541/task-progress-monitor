import * as XLSX from 'xlsx';
import { Task, TaskFrequency } from '@/types';
import { z } from 'zod';

// Schema for validating imported task data
const taskImportSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  assignedTo: z.string().min(1, "Assigned To is required"),
  checker1: z.string().min(1, "Checker 1 is required"),
  checker2: z.string().min(1, "Checker 2 is required"),
  priority: z.enum(["low", "medium", "high"]),
  frequency: z.enum(["once", "daily", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"]),
  isRecurring: z.boolean(),
  dueDate: z.string().min(1, "Due date is required"),
  observationStatus: z.enum(["yes", "no", "mixed"]).default("no"),
});

export type TaskImportData = z.infer<typeof taskImportSchema>;

// Define the TaskExcelRow type to match what TaskExcelUploader expects
export interface TaskExcelRow {
  name: string;
  description: string;
  category: string;
  assignedTo: string;
  checker1: string;
  checker2: string;
  priority: "low" | "medium" | "high";
  frequency: TaskFrequency;
  isRecurring: boolean;
  dueDate: string;
  observationStatus: "yes" | "no" | "mixed";
}

// Helper function to parse date from Excel serial number or string
const parseExcelDate = (excelDate: any): string => {
  // If it's already a date string in ISO format, return as is
  if (typeof excelDate === 'string' && excelDate.match(/^\d{4}-\d{2}-\d{2}/)) {
    return excelDate;
  }
  
  // If it's a number (Excel serial date)
  if (typeof excelDate === 'number') {
    // Excel dates are number of days since 1900-01-01
    // Excel has a leap year bug where it thinks 1900 was a leap year
    const date = new Date(Math.round((excelDate - (excelDate > 59 ? 1 : 0) - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  
  // If it's a date object
  if (excelDate instanceof Date) {
    return excelDate.toISOString().split('T')[0];
  }
  
  // If it's a string in another format, try to parse it
  try {
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Invalid date format
  }
  
  // Return today's date as fallback
  return new Date().toISOString().split('T')[0];
};

// Helper to convert recurring string to boolean
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowerVal = value.toLowerCase();
    return lowerVal === 'yes' || lowerVal === 'true' || lowerVal === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
};

// Helper to normalize priority
const normalizePriority = (value: any): "low" | "medium" | "high" => {
  if (!value) return "medium";
  
  const strValue = String(value).toLowerCase();
  
  if (strValue.includes('high') || strValue.includes('critical') || strValue === '3') {
    return "high";
  }
  
  if (strValue.includes('low') || strValue === '1') {
    return "low";
  }
  
  return "medium";
};

// Helper to normalize frequency
const normalizeFrequency = (value: any): TaskFrequency => {
  if (!value) return "monthly";
  
  const strValue = String(value).toLowerCase();
  
  if (strValue.includes('daily')) return "daily";
  if (strValue.includes('weekly') && !strValue.includes('bi')) return "weekly";
  if (strValue.includes('bi-weekly') || strValue.includes('biweekly') || strValue.includes('fortnight')) return "bi-weekly";
  if (strValue.includes('month')) return "monthly";
  if (strValue.includes('quarter')) return "quarterly";
  if (strValue.includes('year') || strValue.includes('annual')) return "yearly";
  if (strValue.includes('once') || strValue.includes('one time') || strValue.includes('one-time')) return "once";
  
  // Default to monthly if no match
  return "monthly";
};

// Helper to normalize observation status
const normalizeObservationStatus = (value: any): "yes" | "no" | "mixed" => {
  if (!value) return "no";
  
  const strValue = String(value).toLowerCase();
  
  if (strValue.includes('yes') || strValue.includes('true') || strValue === '1') {
    return "yes";
  }
  
  if (strValue.includes('mixed') || strValue.includes('partial')) {
    return "mixed";
  }
  
  return "no";
};

// Map Excel column names to our task properties
const columnMap = {
  "Task Name": "name",
  "Description": "description",
  "Category": "category",
  "Assigned To": "assignedTo",
  "Checker 1": "checker1",
  "Checker 2": "checker2",
  "Priority": "priority",
  "Frequency": "frequency",
  "Recurring": "isRecurring",
  "Due Date": "dueDate",
  "Observation Status": "observationStatus",
  // Add other mappings as needed
};

/**
 * Parse Excel file and return task data
 */
export const parseExcelFile = async (file: File, users: any[] = []): Promise<{ data: TaskExcelRow[], errors: string[] }> => {
  try {
    const tasks = await parseExcelTasks(file);
    
    // Filter out invalid tasks and collect errors
    const errors: string[] = [];
    const validTasks: TaskExcelRow[] = [];
    
    tasks.forEach((task, index) => {
      // Validate user exists if we have user data
      if (users.length > 0) {
        const assignedUserExists = users.some(user => 
          user.email.toLowerCase() === task.assignedTo.toLowerCase() || user.id === task.assignedTo
        );
        const checker1Exists = users.some(user => 
          user.email.toLowerCase() === task.checker1.toLowerCase() || user.id === task.checker1
        );
        const checker2Exists = users.some(user => 
          user.email.toLowerCase() === task.checker2.toLowerCase() || user.id === task.checker2
        );
        
        if (!assignedUserExists) {
          errors.push(`Row ${index + 2}: Assigned user "${task.assignedTo}" not found`);
        }
        if (!checker1Exists) {
          errors.push(`Row ${index + 2}: Checker 1 "${task.checker1}" not found`);
        }
        if (!checker2Exists) {
          errors.push(`Row ${index + 2}: Checker 2 "${task.checker2}" not found`);
        }
        
        // Only add task if it passes user validation
        if (assignedUserExists && checker1Exists && checker2Exists) {
          validTasks.push(task);
        }
      } else {
        // If no user validation is required, add all tasks
        validTasks.push(task);
      }
    });
    
    return { data: validTasks, errors };
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return { 
      data: [], 
      errors: [(error instanceof Error) ? error.message : 'Unknown error parsing Excel file'] 
    };
  }
};

/**
 * Generate an Excel template file for task imports
 */
export const generateExcelTemplate = (users: any[] = []): Blob => {
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([
    // Header row
    ["Task Name", "Description", "Category", "Assigned To", "Checker 1", "Checker 2", 
     "Priority", "Frequency", "Recurring", "Due Date", "Observation Status"],
    
    // Example row
    ["Monthly Financial Report", "Complete the monthly financial report including all transactions", 
     "Finance", users[0]?.email || "user@example.com", users[1]?.email || "checker1@example.com", 
     users[2]?.email || "checker2@example.com", "high", "monthly", "yes", 
     new Date().toISOString().split('T')[0], "no"]
  ]);
  
  // Create a new workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  
  // Add a second sheet with available users if provided
  if (users.length > 0) {
    const usersWorksheet = XLSX.utils.aoa_to_sheet([
      ["User Name", "Email", "Role"],
      ...users.map(user => [user.name, user.email, user.role])
    ]);
    XLSX.utils.book_append_sheet(workbook, usersWorksheet, "Available Users");
  }
  
  // Generate and return Excel file as blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Convert TaskExcelRow to Task object
 */
export const convertRowToTask = (row: TaskExcelRow, users: any[] = []): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => {
  // Find user IDs from emails if users provided
  const getUserId = (emailOrId: string): string => {
    const user = users.find(u => u.email.toLowerCase() === emailOrId.toLowerCase());
    return user?.id || emailOrId;
  };
  
  return {
    name: row.name,
    description: row.description,
    category: row.category,
    assignedTo: getUserId(row.assignedTo),
    checker1: getUserId(row.checker1),
    checker2: getUserId(row.checker2),
    priority: row.priority,
    frequency: row.frequency,
    isRecurring: row.isRecurring,
    dueDate: row.dueDate,
    status: 'pending',
    observationStatus: row.observationStatus,
    comments: [],
    attachments: [],
    isEscalated: false,
    isTemplate: row.isRecurring,
    notificationSettings: {
      taskId: 'temp-id', // Will be replaced with actual ID when task is created
      notifyCheckers: true,
      enablePreNotifications: true,
      preDays: [1, 3, 7],
      enablePostNotifications: true,
      postNotificationFrequency: "daily",
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    },
    escalation: null
  };
};

export const parseExcelTasks = (file: File): Promise<TaskImportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header row as keys
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawRows.length < 2) {
          throw new Error("Excel file must contain a header row and at least one data row");
        }
        
        // First row is header
        const headers = rawRows[0] as string[];
        
        // Process each data row
        const parsedTasks: TaskImportData[] = [];
        
        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i] as any[];
          
          // Skip empty rows
          if (!row || row.length === 0 || row.every(cell => !cell)) continue;
          
          const taskData: Record<string, any> = {};
          
          // Map Excel columns to task properties
          headers.forEach((header, index) => {
            const propertyName = columnMap[header] || header.toLowerCase().replace(/\s+/g, '');
            
            if (index < row.length) {
              const value = row[index];
              
              // Special handling for certain fields
              if (propertyName === 'dueDate') {
                taskData[propertyName] = parseExcelDate(value);
              }
              else if (propertyName === 'isRecurring') {
                taskData[propertyName] = parseBoolean(value);
              }
              else if (propertyName === 'priority') {
                taskData[propertyName] = normalizePriority(value);
              }
              else if (propertyName === 'frequency') {
                taskData[propertyName] = normalizeFrequency(value);
              }
              else if (propertyName === 'observationStatus') {
                taskData[propertyName] = normalizeObservationStatus(value);
              }
              else {
                taskData[propertyName] = value;
              }
            }
          });
          
          // Add default values for missing fields
          if (!taskData.isRecurring) taskData.isRecurring = false;
          if (!taskData.priority) taskData.priority = "medium";
          if (!taskData.frequency) taskData.frequency = "monthly";
          if (!taskData.observationStatus) taskData.observationStatus = "no";
          
          // Validate using Zod schema
          try {
            const validTask = taskImportSchema.parse(taskData);
            parsedTasks.push(validTask);
          } catch (validationError) {
            console.error(`Row ${i+1} validation error:`, validationError);
            // Continue with other rows, could also choose to reject here
          }
        }
        
        resolve(parsedTasks);
      } catch (error) {
        console.error("Excel parsing error:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const createTasksFromImport = (importedTasks: TaskImportData[], userIdMap: Record<string, string>): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] => {
  return importedTasks.map(task => {
    // Map user emails to IDs if provided
    const assignedTo = userIdMap[task.assignedTo] || task.assignedTo;
    const checker1 = userIdMap[task.checker1] || task.checker1;
    const checker2 = userIdMap[task.checker2] || task.checker2;
    
    return {
      name: task.name,
      description: task.description,
      category: task.category,
      assignedTo,
      checker1,
      checker2,
      priority: task.priority,
      frequency: task.frequency,
      isRecurring: task.isRecurring,
      dueDate: task.dueDate,
      status: 'pending',
      observationStatus: task.observationStatus,
      comments: [],
      attachments: [],
      isEscalated: false,
      isTemplate: task.isRecurring,
      notificationSettings: {
        taskId: 'temp-id', // Will be replaced with actual ID when task is created
        notifyCheckers: true,
        enablePreNotifications: true,
        preDays: [1, 3, 7],
        enablePostNotifications: true,
        postNotificationFrequency: "daily",
        sendEmails: true,
        notifyMaker: true,
        notifyChecker1: true,
        notifyChecker2: true
      }
    };
  });
};
