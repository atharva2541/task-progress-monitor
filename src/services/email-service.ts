
import { supabase } from '@/integrations/supabase/client';

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string, from?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html,
          from
        }
      });

      if (error) {
        console.error('Email service error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  static async sendTaskAssignmentEmail(to: string, taskTitle: string, assignedBy: string) {
    const subject = 'New Task Assignment - Audit Tracker';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Audit Tracker - New Task Assignment</h2>
        <p>You have been assigned a new task:</p>
        <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="margin: 0; color: #333;">${taskTitle}</h3>
          <p style="margin: 5px 0 0 0;">Assigned by: ${assignedBy}</p>
        </div>
        <p>Please log in to your Audit Tracker account to view the task details and get started.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  static async sendTaskStatusUpdateEmail(to: string, taskTitle: string, newStatus: string, updatedBy: string) {
    const subject = 'Task Status Update - Audit Tracker';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Audit Tracker - Task Status Update</h2>
        <p>The status of your task has been updated:</p>
        <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="margin: 0; color: #333;">${taskTitle}</h3>
          <p style="margin: 5px 0 0 0;"><strong>New Status:</strong> ${newStatus}</p>
          <p style="margin: 5px 0 0 0;">Updated by: ${updatedBy}</p>
        </div>
        <p>Please log in to your Audit Tracker account to view the updated task details.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  static async sendTaskDueReminderEmail(to: string, taskTitle: string, dueDate: string) {
    const subject = 'Task Due Reminder - Audit Tracker';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Audit Tracker - Task Due Reminder</h2>
        <p>Your task is due soon:</p>
        <div style="background-color: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0; color: #333;">${taskTitle}</h3>
          <p style="margin: 5px 0 0 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        <p>Please log in to your Audit Tracker account to complete the task before the deadline.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  static async sendWelcomeEmail(to: string, name: string, tempPassword?: string) {
    const subject = 'Welcome to Audit Tracker';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Welcome to Audit Tracker!</h2>
        <p>Hello ${name},</p>
        <p>Your account has been created successfully. You can now access the Audit Tracker system.</p>
        ${tempPassword ? `
          <div style="background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #dee2e6;">
            <p><strong>Your temporary login credentials:</strong></p>
            <p>Email: ${to}</p>
            <p>Password: <code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code></p>
            <p style="color: #dc3545; margin-top: 10px;"><strong>Important:</strong> Please change your password after your first login.</p>
          </div>
        ` : ''}
        <p>You can access the system at your organization's Audit Tracker portal.</p>
        <p>If you have any questions, please contact your system administrator.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}
