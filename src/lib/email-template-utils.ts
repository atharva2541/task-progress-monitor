
/**
 * Format template key to display name
 * @param key The template key to format
 * @returns Formatted display name
 */
export function formatTemplateKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Available placeholders for each template type
 */
export const availablePlaceholders = {
  welcome: ["{{name}}", "{{email}}", "{{password}}"],
  taskAssignment: ["{{name}}", "{{taskName}}", "{{dueDate}}", "{{priority}}"],
  taskReminder: ["{{name}}", "{{taskName}}", "{{dueDate}}", "{{daysRemaining}}"],
  taskOverdue: ["{{name}}", "{{taskName}}", "{{dueDate}}", "{{daysOverdue}}"],
};

/**
 * Default email templates data
 */
export const defaultTemplates = {
  welcome: {
    subject: "Welcome to Audit Tracker",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Welcome to Audit Tracker</h2>
      <p>Hello {{name}},</p>
      <p>Your account has been created in Audit Tracker. Here are your login details:</p>
      <ul>
        <li><strong>Email:</strong> {{email}}</li>
        <li><strong>Temporary Password:</strong> {{password}}</li>
      </ul>
      <p>For security reasons, you will be required to change your password on your first login.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>`,
    enabled: true
  },
  taskAssignment: {
    subject: "New Task Assignment: {{taskName}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">New Task Assigned</h2>
      <p>Hello {{name}},</p>
      <p>A new task has been assigned to you:</p>
      <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <p><strong>Task:</strong> {{taskName}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Priority:</strong> {{priority}}</p>
      </div>
      <p>Please login to the Audit Tracker system to view and manage this task.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>`,
    enabled: true
  },
  taskReminder: {
    subject: "Task Reminder: {{taskName}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Task Reminder</h2>
      <p>Hello {{name}},</p>
      <p>This is a reminder about your upcoming task:</p>
      <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <p><strong>Task:</strong> {{taskName}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Days Remaining:</strong> {{daysRemaining}}</p>
      </div>
      <p>Please login to the Audit Tracker system to complete this task.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>`,
    enabled: true
  },
  taskOverdue: {
    subject: "OVERDUE: {{taskName}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #FF3A33;">Task Overdue</h2>
      <p>Hello {{name}},</p>
      <p>The following task is now overdue:</p>
      <div style="background-color: #fff1f0; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #FF3A33;">
        <p><strong>Task:</strong> {{taskName}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Days Overdue:</strong> {{daysOverdue}}</p>
      </div>
      <p>Please login to the Audit Tracker system to complete this task as soon as possible.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>`,
    enabled: true
  },
};
