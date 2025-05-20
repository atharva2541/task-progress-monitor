
import { z } from "zod";
import { Task, TaskNotificationSettings, ObservationStatus } from "@/types";
import { UseFormReturn } from "react-hook-form";

export const taskFormSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  assignedTo: z.string().min(1, "Please select a maker"),
  checker1: z.string().min(1, "Please select a first checker"),
  checker2: z.string().min(1, "Please select a second checker"),
  priority: z.enum(["low", "medium", "high"]),
  frequency: z.enum(["daily", "weekly", "fortnightly", "monthly", "quarterly", "annually", "one-time"]),
  isRecurring: z.boolean().default(false),
  dueDate: z.string().min(1, "Due date is required"),
  notifications: z.object({
    // Pre-notification days are now always required with defaults
    preDays: z.array(z.number()).default([1, 3, 7]),
    // Optional custom days
    customDays: z.array(z.number()).default([]),
  }).default({
    preDays: [1, 3, 7],
    customDays: [],
  }),
  // Making observation status required
  observationStatus: z.enum(["yes", "no", "mixed"]).default("no"),
})
// Add refinements for validation
.refine(
  (data) => data.assignedTo !== data.checker1, 
  {
    message: "Maker and First Checker cannot be the same user",
    path: ["checker1"], // This ensures the error is associated with the checker1 field
  }
)
.refine(
  (data) => data.assignedTo !== data.checker2,
  {
    message: "Maker and Second Checker cannot be the same user",
    path: ["checker2"], // This ensures the error is associated with the checker2 field
  }
)
.refine(
  (data) => data.checker1 !== data.checker2,
  {
    message: "First Checker and Second Checker cannot be the same user",
    path: ["checker2"], // This ensures the error is associated with the checker2 field
  }
);

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export class TaskFormManager {
  static getDefaultValues(): TaskFormValues {
    return {
      name: "",
      description: "",
      category: "",
      assignedTo: "",
      checker1: "",
      checker2: "",
      priority: "medium",
      frequency: "monthly",
      isRecurring: false,
      dueDate: new Date().toISOString().split('T')[0],
      notifications: {
        preDays: [1, 3, 7], // Default mandatory days
        customDays: [], // Optional custom days
      },
      observationStatus: "no", // Set default value instead of undefined
    };
  }

  static prepareTaskFromFormData(data: TaskFormValues, taskId?: string): Task {
    const now = new Date().toISOString();
    
    // Create full notification settings with all mandatory settings enabled
    const notificationSettings: TaskNotificationSettings = {
      // Pre-notifications settings
      enablePreNotifications: true, // Always enabled
      preDays: [...data.notifications.preDays, ...(data.notifications.customDays || [])], // Combine mandatory and custom days
      
      // Post-notifications settings
      enablePostNotifications: true, // Always enabled 
      postNotificationFrequency: "daily", // Always daily
      
      // Email settings
      sendEmails: true, // Always enabled
      
      // Recipients settings
      notifyMaker: true, // Always enabled
      notifyChecker1: true, // Always enabled
      notifyChecker2: true, // Always enabled
    };
    
    return {
      id: taskId || Date.now().toString(),
      name: data.name,
      description: data.description,
      category: data.category,
      assignedTo: data.assignedTo,
      checker1: data.checker1,
      checker2: data.checker2,
      priority: data.priority,
      frequency: data.frequency,
      isRecurring: data.isRecurring,
      dueDate: data.dueDate,
      status: 'pending',
      notificationSettings,
      createdAt: now,
      updatedAt: now,
      comments: [],
      attachments: [],
      // Always include observation status with default value if not provided
      observationStatus: data.observationStatus || 'no',
      // For recurring tasks, add additional fields
      isTemplate: data.isRecurring,
      instances: [],
    };
  }

  static populateFormFromTask(form: UseFormReturn<TaskFormValues>, task: Task): void {
    const formData = {
      name: task.name,
      description: task.description,
      category: task.category,
      assignedTo: task.assignedTo,
      checker1: task.checker1,
      checker2: task.checker2,
      priority: task.priority,
      frequency: task.frequency,
      isRecurring: task.isRecurring || false,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      notifications: {
        preDays: [1, 3, 7], // Always set mandatory days
        customDays: task.notificationSettings?.preDays?.filter(day => ![1, 3, 7].includes(day)) || [],
      },
      observationStatus: task.observationStatus, // Include observation status
    };
    form.reset(formData);
  }
}
