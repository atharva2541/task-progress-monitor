
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  SES_FROM_EMAIL,
  getAwsSettings,
  getAwsCredentials
} from "./aws-config";

// Initialize SES client with empty credentials (will be updated before use)
let sesClient = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
});

// Function to initialize/update the SES client with the latest credentials
const initializeSesClient = async () => {
  try {
    // Get latest settings and credentials
    const settings = await getAwsSettings();
    const credentials = await getAwsCredentials();
    
    // Update SES client with the latest credentials
    sesClient = new SESClient({
      region: settings.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      }
    });
  } catch (error) {
    console.error("Error initializing SES client:", error);
  }
};

/**
 * Send an email using Amazon SES
 * @param to Recipient email
 * @param subject Email subject
 * @param htmlBody HTML content of the email
 * @returns Promise resolving to the SendEmailCommand result
 */
export const sendEmail = async (to: string, subject: string, htmlBody: string): Promise<any> => {
  // Initialize SES client with latest credentials
  await initializeSesClient();
  
  // Get the latest FROM email address
  const settings = await getAwsSettings();
  const fromEmail = settings.sesFromEmail || SES_FROM_EMAIL;
  
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Data: htmlBody,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: fromEmail,
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send OTP email to user
 * @param to Recipient email
 * @param otp One-time password
 * @param name Recipient name
 * @returns Promise resolving to the SendEmailCommand result
 */
export const sendOtpEmail = async (to: string, otp: string, name: string): Promise<any> => {
  const subject = "Your Verification Code";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Audit Tracker - Verification Code</h2>
      <p>Hello ${name},</p>
      <p>Your verification code is:</p>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        <strong>${otp}</strong>
      </div>
      <p>Please enter this code to complete your verification process.</p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>
  `;

  return sendEmail(to, subject, htmlBody);
};

/**
 * Send a task notification email
 * @param to Recipient email
 * @param taskName Name of the task
 * @param message Notification message
 * @param dueDate Due date of the task (ISO string)
 * @returns Promise resolving to the SendEmailCommand result
 */
export const sendTaskNotificationEmail = async (
  to: string, 
  taskName: string, 
  message: string, 
  dueDate: string
): Promise<any> => {
  const subject = `Task Notification: ${taskName}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Audit Tracker - Task Notification</h2>
      <p>${message}</p>
      <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <p><strong>Task:</strong> ${taskName}</p>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <p>Please login to the Audit Tracker system to view and manage this task.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>
  `;

  return sendEmail(to, subject, htmlBody);
};

/**
 * Send a general notification email
 * @param to Recipient email
 * @param subject Email subject
 * @param message Notification message
 * @returns Promise resolving to the SendEmailCommand result
 */
export const sendNotificationEmail = async (
  to: string,
  subject: string,
  message: string
): Promise<any> => {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Audit Tracker - Notification</h2>
      <p>${message}</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>
  `;

  return sendEmail(to, subject, htmlBody);
};
