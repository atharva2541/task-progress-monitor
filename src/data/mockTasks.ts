
import { Task, TaskNotificationSettings } from '@/types';

// Mock tasks for demonstration
export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Monthly Financial Report',
    description: 'Prepare the monthly financial report with all transaction details.',
    category: 'Finance',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'high',
    status: 'pending',
    frequency: 'monthly',
    isRecurring: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [], // Initialize empty attachments array
    observationStatus: 'no',
    isEscalated: false, // Added required field
    isTemplate: true,  // Added required field
    notificationSettings: {
      taskId: '1',
      remindBefore: 2,
      escalateAfter: 1,
      notifyCheckers: true,
      enablePreNotifications: true,
      preDays: [1, 3, 7],
      enablePostNotifications: true,
      postNotificationFrequency: 'daily',
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    }
  },
  {
    id: '2',
    name: 'Daily System Check',
    description: 'Perform daily system health check and report any issues.',
    category: 'IT',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'medium',
    status: 'in-progress',
    frequency: 'daily',
    isRecurring: true,
    dueDate: new Date().toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [], 
    observationStatus: 'no',
    isEscalated: false, // Added required field
    isTemplate: true,  // Added required field
    notificationSettings: {
      taskId: '2',
      notifyCheckers: true,
      enablePreNotifications: true,
      preDays: [1],
      enablePostNotifications: false,
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    }
  },
  {
    id: '3',
    name: 'Quarterly Compliance Audit',
    description: 'Complete the quarterly compliance audit for regulatory requirements.',
    category: 'Compliance',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'high',
    status: 'submitted',
    frequency: 'quarterly',
    isRecurring: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [],
    observationStatus: 'yes',
    isEscalated: false, // Added required field
    isTemplate: true,  // Added required field
    notificationSettings: {
      taskId: '3',
      notifyCheckers: true,
      enablePreNotifications: true,
      preDays: [1, 7, 14],
      enablePostNotifications: true,
      postNotificationFrequency: 'daily',
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    }
  },
  {
    id: '4',
    name: 'Weekly Team Report',
    description: 'Compile weekly team performance metrics and highlights.',
    category: 'HR',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'low',
    status: 'approved',
    frequency: 'weekly',
    isRecurring: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: [],
    observationStatus: 'no',
    isEscalated: false, // Added required field
    isTemplate: true,  // Added required field
    notificationSettings: {
      taskId: '4',
      notifyCheckers: true,
      enablePreNotifications: true,
      preDays: [1],
      enablePostNotifications: false,
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    }
  },
  {
    id: '5',
    name: 'System Security Review',
    description: 'Conduct security review of all systems and document findings.',
    category: 'Security',
    assignedTo: '2', // Maker user
    checker1: '3', // Checker 1 user
    checker2: '4', // Checker 2 user
    priority: 'high',
    status: 'rejected',
    frequency: 'monthly',
    isRecurring: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [
      {
        id: '1',
        taskId: '5',
        userId: '3',
        content: 'Please include more details about the security vulnerabilities found.',
        createdAt: new Date().toISOString()
      }
    ],
    attachments: [],
    observationStatus: 'mixed',
    isEscalated: false, // Added required field
    isTemplate: false,  // Added required field
    notificationSettings: {
      taskId: '5',
      notifyCheckers: true,
      enablePreNotifications: true,
      preDays: [1, 3],
      enablePostNotifications: true,
      postNotificationFrequency: 'daily',
      sendEmails: true,
      notifyMaker: true,
      notifyChecker1: true,
      notifyChecker2: true
    }
  }
];
