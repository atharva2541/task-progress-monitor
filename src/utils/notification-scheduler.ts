
import { addDays, format, parseISO, differenceInDays, differenceInHours, isAfter } from "date-fns";
import { Task, TaskNotificationSettings } from "@/types";
import { sendEmail, sendTaskNotificationEmail } from "./aws-ses";

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
      if (maker) recipients.push({ ...maker, role: 'maker' });
    }
    
    if (notificationSettings.notifyChecker1 && task.checker1) {
      const checker1 = getUserById(task.checker1);
      if (checker1) recipients.push({ ...checker1, role: 'checker1' });
    }
    
    if (notificationSettings.notifyChecker2 && task.checker2) {
      const checker2 = getUserById(task.checker2);
      if (checker2) recipients.push({ ...checker2, role: 'checker2' });
    }
    
    console.log(`[Notification Scheduler] Recipients: ${recipients.map(r => `${r.name} (${r.role})`).join(', ')}`);
    
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
            // Different messaging for different roles
            let message = "";
            if (recipient.role === 'maker') {
              message = `Task "${task.name}" is due in ${daysBeforeDue} day${daysBeforeDue !== 1 ? 's' : ''}`;
            } else if (recipient.role === 'checker1' || recipient.role === 'checker2') {
              // Checker1 gets notifications about upcoming task due dates
              message = `Task "${task.name}" assigned to ${getUserById(task.assignedTo)?.name || 'a maker'} is due in ${daysBeforeDue} day${daysBeforeDue !== 1 ? 's' : ''} and will need your review`;
            }
            
            if (message) {
              scheduleNotificationForDate({
                date: notificationDate,
                task,
                recipient,
                message,
                type: 'warning',
                sendEmail: notificationSettings.sendEmails,
              });
            }
          }
        }
      }
    }
    
    // Schedule post-due date notifications if enabled
    if (notificationSettings.enablePostNotifications) {
      console.log(`[Notification Scheduler] Post-due date notifications enabled`);
      
      // Check if task is due and not submitted
      if (daysToDueDate <= 0 && task.status !== 'submitted' && task.status !== 'approved') {
        // Notification on due date for checker1 if task is not submitted
        const checker1 = recipients.find(r => r.role === 'checker1');
        if (checker1) {
          const makerName = getUserById(task.assignedTo)?.name || 'The assigned maker';
          
          // Send notification right after due date
          scheduleNotificationForDate({
            date: dueDate,
            task,
            recipient: checker1,
            message: `Task "${task.name}" is now due and has not been submitted by ${makerName}`,
            type: 'error',
            sendEmail: notificationSettings.sendEmails,
          });
          
          // Daily notifications starting from 1 day after due date - for both checkers
          const frequency = 1; // Daily notifications
          
          for (let i = 1; i <= 30; i++) { // Schedule for 30 days
            const notificationDate = addDays(dueDate, i);
            
            // After first day, notify both checker1 and checker2
            const notifyRecipients = i === 1 ? 
              recipients.filter(r => r.role === 'checker1') : 
              recipients.filter(r => r.role === 'checker1' || r.role === 'checker2');
            
            if (notifyRecipients.length === 0) continue;
            
            for (const recipient of notifyRecipients) {
              scheduleNotificationForDate({
                date: notificationDate,
                task,
                recipient,
                message: `URGENT: Task "${task.name}" is overdue by ${i} day${i !== 1 ? 's' : ''} and still not submitted by ${makerName}`,
                type: 'error',
                sendEmail: notificationSettings.sendEmails,
              });
            }
          }
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
  console.log(`[Notification Scheduler] - For ${recipient.name} (${recipient.role}): "${message}" on ${format(date, 'PPP')}`);
  
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
          ${recipient.role !== 'maker' ? `<p>Assigned To: ${getUserById(task.assignedTo)?.name || 'Unknown'}</p>` : ''}
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
export const checkTasksForNotifications = (
  tasks: Task[], 
  getUserById: (userId: string) => any
): void => {
  console.log("[Notification Scheduler] Checking tasks for notifications...");
  
  const now = new Date();
  
  tasks.forEach(task => {
    try {
      if (!task.dueDate) return;
      
      const dueDate = parseISO(task.dueDate);
      
      // Skip tasks that are already completed or approved
      if (task.status === 'approved') return;
      
      // Check if task is overdue and not submitted
      if (isAfter(now, dueDate) && task.status !== 'submitted') {
        const daysPastDue = differenceInDays(now, dueDate);
        
        // Notify checker1 immediately after due date
        if (daysPastDue === 0 && task.checker1) {
          sendOverdueNotification(task, 'checker1', getUserById);
        }
        
        // After 1 day, notify both checker1 and checker2
        if (daysPastDue >= 1 && (task.checker1 || task.checker2)) {
          if (task.checker1) sendOverdueNotification(task, 'checker1', getUserById);
          if (task.checker2) sendOverdueNotification(task, 'checker2', getUserById);
        }
      }
    } catch (error) {
      console.error(`[Notification Scheduler] Error processing task ${task.id}:`, error);
    }
  });
};

/**
 * Send an overdue notification to the specified checker
 */
const sendOverdueNotification = (
  task: Task,
  checkerRole: 'checker1' | 'checker2',
  getUserById: (userId: string) => any
): void => {
  const checkerId = checkerRole === 'checker1' ? task.checker1 : task.checker2;
  if (!checkerId) return;
  
  const checker = getUserById(checkerId);
  if (!checker) return;
  
  const maker = getUserById(task.assignedTo);
  const makerName = maker ? maker.name : 'The assigned maker';
  
  const dueDate = parseISO(task.dueDate);
  const daysPastDue = differenceInDays(new Date(), dueDate);
  
  const message = `Task "${task.name}" is overdue by ${daysPastDue} day${daysPastDue !== 1 ? 's' : ''} and has not been submitted by ${makerName}`;
  
  console.log(`[Notification Scheduler] Sending overdue notification to ${checker.name} (${checkerRole}): ${message}`);
  
  // In a real app, this would create an in-app notification
  // and potentially send an email
  
  // Example email call:
  // await sendTaskNotificationEmail(
  //   checker.email,
  //   task.name,
  //   message,
  //   task.dueDate
  // );
};
