
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SES_FROM_EMAIL } from "./aws-config";

// Configure SES client
const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * Send an email using Amazon SES
 * @param to Recipient email
 * @param subject Email subject
 * @param htmlBody HTML content of the email
 * @returns Promise resolving to the SendEmailCommand result
 */
export const sendEmail = async (to: string, subject: string, htmlBody: string): Promise<any> => {
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
    Source: SES_FROM_EMAIL,
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
