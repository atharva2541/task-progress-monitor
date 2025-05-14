
import { z } from "zod";
import { Task, TaskNotificationSettings } from "@/types";
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
    enablePreNotifications: z.boolean().default(true),
    preDays: z.array(z.number()).default([1, 3, 7]),
    customDays: z.array(z.number()).optional(),
    // We no longer need these in the form schema as they are mandatory
  }).default({
    enablePreNotifications: true,
    preDays: [1, 3, 7],
    customDays: [],
  }),
});

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
        enablePreNotifications: true,
        preDays: [1, 3, 7],
        customDays: [],
      }
    };
  }

  static prepareTaskFromFormData(data: TaskFormValues, taskId?: string): Task {
    // Always set the mandatory notification settings regardless of form input
    const notificationSettings: TaskNotificationSettings = {
      enablePreNotifications: true, // Always mandatory now
      preDays: [...data.notifications.preDays, ...(data.notifications.customDays || [])], // Combine mandatory and custom days
      enablePostNotifications: true, // Always mandatory
      postNotificationFrequency: "daily", // Always daily
      sendEmails: true, // Always mandatory
      notifyMaker: true, // Always mandatory
      notifyChecker1: true, // Always mandatory
      notifyChecker2: true, // Always mandatory
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [],
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
        enablePreNotifications: true,
        preDays: [1, 3, 7],
        customDays: task.notificationSettings?.preDays?.filter(day => ![1, 3, 7].includes(day)) || [],
      }
    };
    form.reset(formData);
  }
}
