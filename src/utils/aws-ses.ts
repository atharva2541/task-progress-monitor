
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Check if we're in a server environment
const isServer = typeof window === 'undefined';

let sesClient: SESClient | null = null;
let currentConfig: any = null;

// Initialize SES client
const initializeSESClient = async () => {
  if (isServer) {
    // Server environment - read directly from environment variables
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      sesFromEmail: process.env.SES_FROM_EMAIL || '',
    };

    if (config.accessKeyId && config.secretAccessKey) {
      sesClient = new SESClient({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        }
      });
      currentConfig = config;
    }
  } else {
    // Frontend environment - import and use the existing aws-config
    const { getAwsSettings, getAwsCredentials } = await import('./aws-config');
    const settings = await getAwsSettings();
    const credentials = await getAwsCredentials();

    if (credentials.accessKeyId && credentials.secretAccessKey) {
      sesClient = new SESClient({
        region: settings.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        }
      });
      currentConfig = { ...settings, ...credentials };
    }
  }
};

// Get current SES client and config
const getSESClientAndConfig = async () => {
  if (!sesClient || !currentConfig) {
    await initializeSESClient();
  }
  return { sesClient, config: currentConfig };
};

// Send an email using SES
export const sendEmail = async (
  to: string | string[],
  subject: string,
  body: string,
  isHtml: boolean = false
): Promise<void> => {
  const { sesClient: client, config } = await getSESClientAndConfig();
  
  if (!client || !config?.sesFromEmail) {
    throw new Error('SES client not configured');
  }

  const destinations = Array.isArray(to) ? to : [to];

  const command = new SendEmailCommand({
    Source: config.sesFromEmail,
    Destination: {
      ToAddresses: destinations,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: isHtml
        ? {
            Html: {
              Data: body,
              Charset: 'UTF-8',
            },
          }
        : {
            Text: {
              Data: body,
              Charset: 'UTF-8',
            },
          },
    },
  });

  await client.send(command);
};

// Send an OTP email
export const sendOtpEmail = async (
  email: string,
  otp: string,
  userName?: string
): Promise<void> => {
  const subject = 'Your OTP for Task Progress Monitor';
  const body = `
    Hello ${userName || 'User'},
    
    Your One-Time Password (OTP) for Task Progress Monitor is: ${otp}
    
    This OTP will expire in 10 minutes.
    
    If you didn't request this OTP, please ignore this email.
    
    Best regards,
    Task Progress Monitor Team
  `;

  await sendEmail(email, subject, body);
};

// Check if SES is configured
export const isSESConfigured = async (): Promise<boolean> => {
  try {
    const { config } = await getSESClientAndConfig();
    return Boolean(config?.accessKeyId && config?.secretAccessKey && config?.sesFromEmail);
  } catch (error) {
    return false;
  }
};
