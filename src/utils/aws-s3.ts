
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Check if we're in a server environment
const isServer = typeof window === 'undefined';

let s3Client: S3Client | null = null;
let currentConfig: any = null;

// Initialize S3 client
const initializeS3Client = async () => {
  if (isServer) {
    // Server environment - read directly from environment variables
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      s3BucketName: process.env.S3_BUCKET_NAME || '',
    };

    if (config.accessKeyId && config.secretAccessKey) {
      s3Client = new S3Client({
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
      s3Client = new S3Client({
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

// Get current S3 client and config
const getS3ClientAndConfig = async () => {
  if (!s3Client || !currentConfig) {
    await initializeS3Client();
  }
  return { s3Client, config: currentConfig };
};

// Upload a file to S3
export const uploadFileToS3 = async (
  file: File | Buffer,
  key: string,
  contentType?: string
): Promise<string> => {
  const { s3Client: client, config } = await getS3ClientAndConfig();
  
  if (!client || !config?.s3BucketName) {
    throw new Error('S3 client not configured');
  }

  const command = new PutObjectCommand({
    Bucket: config.s3BucketName,
    Key: key,
    Body: file,
    ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
  });

  await client.send(command);
  return `https://${config.s3BucketName}.s3.${config.region}.amazonaws.com/${key}`;
};

// Get a presigned URL for file upload
export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> => {
  const { s3Client: client, config } = await getS3ClientAndConfig();
  
  if (!client || !config?.s3BucketName) {
    throw new Error('S3 client not configured');
  }

  const command = new PutObjectCommand({
    Bucket: config.s3BucketName,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(client, command, { expiresIn });
};

// Get a presigned URL for file download
export const getPresignedDownloadUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const { s3Client: client, config } = await getS3ClientAndConfig();
  
  if (!client || !config?.s3BucketName) {
    throw new Error('S3 client not configured');
  }

  const command = new GetObjectCommand({
    Bucket: config.s3BucketName,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
};

// Delete a file from S3
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const { s3Client: client, config } = await getS3ClientAndConfig();
  
  if (!client || !config?.s3BucketName) {
    throw new Error('S3 client not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: config.s3BucketName,
    Key: key,
  });

  await client.send(command);
};

// Check if S3 is configured
export const isS3Configured = async (): Promise<boolean> => {
  try {
    const { config } = await getS3ClientAndConfig();
    return Boolean(config?.accessKeyId && config?.secretAccessKey && config?.s3BucketName);
  } catch (error) {
    return false;
  }
};
