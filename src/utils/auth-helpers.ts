
import { sendEmail } from './aws-ses';

/**
 * Generate a strong random password
 * @returns A strong random password
 */
export const generateStrongPassword = (): string => {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
  const numberChars = '23456789';
  const specialChars = '!@#$%^&*()_+=-';

  // Generate at least one of each type of character
  const getRandomChar = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length));
  
  const password = [
    getRandomChar(uppercaseChars),
    getRandomChar(lowercaseChars),
    getRandomChar(numberChars),
    getRandomChar(specialChars),
  ];

  // Add 6 more random characters for a total length of 10
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = 0; i < 6; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the array
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
};

/**
 * Send welcome email to newly created user
 * @param to Email address of the recipient
 * @param name Name of the recipient
 * @param password Temporary password
 * @returns Promise resolving to the email sending result
 */
export const sendWelcomeEmail = async (to: string, name: string, password: string): Promise<any> => {
  const subject = "Welcome to Audit Tracker - Your Account Information";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Welcome to Audit Tracker</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created in Audit Tracker. Here are your login details:</p>
      <ul>
        <li><strong>Email:</strong> ${to}</li>
        <li><strong>Temporary Password:</strong> ${password}</li>
      </ul>
      <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p><strong>Important:</strong> For security reasons, you will be required to change your password on your first login.</p>
        <p>Your new password must include:</p>
        <ul>
          <li>At least 8 characters</li>
          <li>At least one uppercase letter</li>
          <li>At least one lowercase letter</li>
          <li>At least one number</li>
          <li>At least one special character</li>
        </ul>
      </div>
      <p>If you have any questions, please contact your administrator.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>
  `;

  return sendEmail(to, subject, htmlBody);
};

/**
 * Send password reset email with OTP code
 * @param to Email address of the recipient
 * @param name Name of the recipient
 * @param otp One-time password for verification
 * @returns Promise resolving to the email sending result
 */
export const sendPasswordResetEmail = async (to: string, name: string, otp: string): Promise<any> => {
  const subject = "Audit Tracker - Password Reset Request";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your Audit Tracker account. Please use the verification code below to reset your password:</p>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        <strong>${otp}</strong>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email or contact your administrator.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>
  `;

  return sendEmail(to, subject, htmlBody);
};

