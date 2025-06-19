
import { supabase } from '@/integrations/supabase/client';

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        html
      }
    });

    if (error) throw error;
    return data;
  }

  static async sendTaskAssignmentEmail(to: string, taskTitle: string, assignedBy: string) {
    const html = `
      <h2>New Task Assignment</h2>
      <p>You have been assigned a new task:</p>
      <h3>${taskTitle}</h3>
      <p>Assigned by: ${assignedBy}</p>
      <p>Please log in to your Audit Tracker account to view the task details.</p>
    `;

    return this.sendEmail(to, 'New Task Assignment', html);
  }

  static async sendTaskStatusUpdateEmail(to: string, taskTitle: string, newStatus: string, updatedBy: string) {
    const html = `
      <h2>Task Status Update</h2>
      <p>The status of your task has been updated:</p>
      <h3>${taskTitle}</h3>
      <p>New Status: <strong>${newStatus}</strong></p>
      <p>Updated by: ${updatedBy}</p>
      <p>Please log in to your Audit Tracker account to view the task details.</p>
    `;

    return this.sendEmail(to, 'Task Status Update', html);
  }

  static async sendTaskDueReminderEmail(to: string, taskTitle: string, dueDate: string) {
    const html = `
      <h2>Task Due Reminder</h2>
      <p>Your task is due soon:</p>
      <h3>${taskTitle}</h3>
      <p>Due Date: <strong>${dueDate}</strong></p>
      <p>Please log in to your Audit Tracker account to complete the task.</p>
    `;

    return this.sendEmail(to, 'Task Due Reminder', html);
  }
}
