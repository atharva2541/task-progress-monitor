
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
 * Send welcome email to newly created user with temporary password
 * @param to Email address of the recipient
 * @param name Name of the recipient
 * @param temporaryPassword Temporary password for first login
 * @returns Promise resolving to the email sending result
 */
export const sendWelcomeEmail = async (to: string, name: string, temporaryPassword: string): Promise<any> => {
  const subject = "Welcome to Audit Tracker - Your Account Information";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Welcome to Audit Tracker</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created in Audit Tracker. Here are your login details:</p>
      
      <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Temporary Password:</strong> <code style="background-color: #e9e9e9; padding: 2px 6px; border-radius: 3px; font-size: 14px;">${temporaryPassword}</code></p>
      </div>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3 style="color: #856404; margin-top: 0;">🔒 Important Security Information</h3>
        <p style="color: #856404; margin-bottom: 10px;"><strong>This is a temporary password that expires in 7 days.</strong></p>
        <p style="color: #856404; margin-bottom: 0;">You will be required to change your password on your first login for security reasons.</p>
      </div>
      
      <h3>Login Steps:</h3>
      <ol>
        <li>Go to the Audit Tracker login page</li>
        <li>Enter your email and temporary password</li>
        <li>Check your email for a verification code (OTP)</li>
        <li>Enter the verification code</li>
        <li>Create a new secure password</li>
        <li>Start using Audit Tracker!</li>
      </ol>
      
      <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p><strong>Your new password must include:</strong></p>
        <ul>
          <li>At least 8 characters</li>
          <li>At least one uppercase letter (A-Z)</li>
          <li>At least one lowercase letter (a-z)</li>
          <li>At least one number (0-9)</li>
          <li>At least one special character (@$!%*?&)</li>
        </ul>
      </div>
      
      <p>If you have any questions or need assistance, please contact your administrator.</p>
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
  const subject = "Audit Tracker - Login Verification Code";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #5a3FFF;">Login Verification Code</h2>
      <p>Hello ${name},</p>
      <p>Please use the verification code below to complete your login:</p>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        <strong>${otp}</strong>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not attempt to log in, please ignore this email or contact your administrator.</p>
      <p>Thank you,<br/>Audit Tracker Team</p>
    </div>
  `;

  return sendEmail(to, subject, htmlBody);
};
