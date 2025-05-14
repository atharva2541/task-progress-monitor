
import { addDays, format, parseISO, differenceInDays } from "date-fns";
import { Task, TaskNotificationSettings } from "@/types";
import { sendEmail } from "./aws-ses";

// Type definitions for notification settings are now imported from @/types
// to ensure consistency across the application

/**
 * Schedule notifications for a task based on notification settings
 */
export const scheduleNotifications = async ({
  task,
  notificationSettings,
  getUserById,
}: {
  task: Task;
  notificationSettings: TaskNotificationSettings;
  getUserById: (userId: string) => any;
}): Promise<void> => {
  // In a real application, this would connect to a scheduling service
  // For now, we'll just log the scheduled notifications and create a structure
  // that represents when notifications would be sent
  
  if (!task || !task.dueDate) {
    console.error("[Notification Scheduler] Task or due date is missing", task);
    return;
  }
  
  try {
    const dueDate = parseISO(task.dueDate);
    const today = new Date();
    const daysToDueDate = differenceInDays(dueDate, today);
    
    console.log(`[Notification Scheduler] Scheduling notifications for task: ${task.name} (ID: ${task.id})`);
    console.log(`[Notification Scheduler] Due date: ${format(dueDate, 'PPP')}, Days to due: ${daysToDueDate}`);
    
    // Get notification recipients
    const recipients = [];
    
    if (notificationSettings.notifyMaker && task.assignedTo) {
      const maker = getUserById(task.assignedTo);
      if (maker) recipients.push(maker);
    }
    
    if (notificationSettings.notifyChecker1 && task.checker1) {
      const checker1 = getUserById(task.checker1);
      if (checker1) recipients.push(checker1);
    }
    
    if (notificationSettings.notifyChecker2 && task.checker2) {
      const checker2 = getUserById(task.checker2);
      if (checker2) recipients.push(checker2);
    }
    
    console.log(`[Notification Scheduler] Recipients: ${recipients.map(r => r.name).join(', ')}`);
    
    // Schedule pre-submission notifications
    if (notificationSettings.enablePreNotifications) {
      console.log(`[Notification Scheduler] Pre-submission notifications enabled`);
      console.log(`[Notification Scheduler] Notification days: ${notificationSettings.preDays.join(', ')}`);
      
      for (const daysBeforeDue of notificationSettings.preDays) {
        if (daysToDueDate >= daysBeforeDue) {
          const notificationDate = addDays(today, daysToDueDate - daysBeforeDue);
          console.log(`[Notification Scheduler] Scheduling pre-submission notification for ${format(notificationDate, 'PPP')} (${daysBeforeDue} days before due)`);
          
          // Schedule the notification for each recipient
          for (const recipient of recipients) {
            scheduleNotificationForDate({
              date: notificationDate,
              task,
              recipient,
              message: `Task "${task.name}" is due in ${daysBeforeDue} day${daysBeforeDue !== 1 ? 's' : ''}`,
              type: 'warning',
              sendEmail: notificationSettings.sendEmails,
            });
          }
        }
      }
    }
    
    // Schedule post-due date notifications if enabled
    if (notificationSettings.enablePostNotifications) {
      console.log(`[Notification Scheduler] Post-due date notifications enabled`);
      console.log(`[Notification Scheduler] Frequency: ${notificationSettings.postNotificationFrequency}`);
      
      // For simulation, we'll schedule the first 10 post-due notifications
      const frequency = notificationSettings.postNotificationFrequency === 'daily' ? 1 : 7; // Days between notifications
      
      for (let i = 1; i <= 10; i++) {
        const notificationDate = addDays(dueDate, i * frequency);
        console.log(`[Notification Scheduler] Scheduling post-due notification for ${format(notificationDate, 'PPP')} (${i * frequency} days after due)`);
        
        // Schedule the notification for each recipient
        for (const recipient of recipients) {
          scheduleNotificationForDate({
            date: notificationDate,
            task,
            recipient,
            message: `Task "${task.name}" is overdue by ${i * frequency} day${i * frequency !== 1 ? 's' : ''} and needs attention`,
            type: 'error',
            sendEmail: notificationSettings.sendEmails,
          });
        }
      }
    }
  } catch (error) {
    console.error("[Notification Scheduler] Error scheduling notifications:", error);
  }
};

interface ScheduleNotificationForDateProps {
  date: Date;
  task: Task;
  recipient: any;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  sendEmail: boolean;
}

/**
 * Schedule a specific notification for a date
 * In a real app, this would integrate with a scheduling service
 * For now, it just logs the intent to schedule
 */
const scheduleNotificationForDate = ({
  date,
  task,
  recipient,
  message,
  type,
  sendEmail,
}: ScheduleNotificationForDateProps): void => {
  console.log(`[Notification Scheduler] - For ${recipient.name} (${recipient.email}): "${message}" on ${format(date, 'PPP')}`);
  
  // For demonstration, we'll show how emails would be sent
  // In a production environment, this would be handled by a scheduled job
  if (sendEmail) {
    const emailSubject = `Task Reminder: ${task.name}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Audit Tracker - Task Reminder</h2>
        <p>Hello ${recipient.name},</p>
        <p>${message}</p>
        <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <p><strong>Task Details:</strong></p>
          <p>Name: ${task.name}</p>
          <p>Due Date: ${format(parseISO(task.dueDate), 'PPP')}</p>
          <p>Priority: ${task.priority}</p>
        </div>
        <p>Please login to the Audit Tracker system to view and manage this task.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>
    `;
    
    console.log(`[Notification Scheduler] - Would send email to ${recipient.email} with subject: "${emailSubject}"`);
    
    // In a real application with scheduled jobs, this would be:
    // await sendEmail(recipient.email, emailSubject, emailBody);
  }
};

/**
 * Create a notification handler for integration with the task lifecycle
 * This would be used to check if tasks are overdue and send notifications accordingly
 */
export const checkTasksForNotifications = (): void => {
  // This would be called by a scheduled job to check tasks and send notifications
  console.log("[Notification Scheduler] Checking tasks for notifications...");
  
  // Implementation would:
  // 1. Get all active tasks
  // 2. Check due dates against current date
  // 3. Send notifications for approaching due dates and overdue tasks
  
  // For now, this is just a placeholder for the actual implementation
};
