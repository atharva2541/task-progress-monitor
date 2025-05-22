
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
  getAwsSettings,
  getAwsCredentials
} from "./aws-config";

// Initialize S3 client with empty credentials (will be updated before use)
let s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
});

// Function to initialize/update the S3 client with the latest credentials
const initializeS3Client = async () => {
  try {
    // Get latest settings and credentials
    const settings = await getAwsSettings();
    const credentials = await getAwsCredentials();
    
    // Update S3 client with the latest credentials
    s3Client = new S3Client({
      region: settings.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      }
    });
  } catch (error) {
    console.error("Error initializing S3 client:", error);
  }
};

/**
 * Upload a file to S3
 * @param file The file to upload
 * @param key The S3 object key (path)
 * @returns Promise with the uploaded object URL
 */
export const uploadFileToS3 = async (file: File, key: string): Promise<string> => {
  // Initialize S3 client with latest credentials
  await initializeS3Client();
  
  let fileBuffer: ArrayBuffer;
  
  try {
    fileBuffer = await file.arrayBuffer();
  } catch (error) {
    console.error("Error converting file to buffer:", error);
    throw error;
  }
  
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
    ACL: "private", // Keep files private and use signed URLs
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Generate a signed URL for temporary access
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    
    // URL expires in 1 week (adjust as needed)
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });
    return signedUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

/**
 * Get a signed URL for a file in S3
 * @param key The S3 object key (path)
 * @returns Promise with the signed URL
 */
export const getSignedFileUrl = async (key: string): Promise<string> => {
  // Initialize S3 client with latest credentials
  await initializeS3Client();
  
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    // URL expires in 1 hour (adjust as needed)
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param key The S3 object key (path) to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  // Initialize S3 client with latest credentials
  await initializeS3Client();
  
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log(`File deleted successfully: ${key}`);
  } catch (error) {
    console.error(`Error deleting file from S3: ${key}`, error);
    throw error;
  }
};

/**
 * List all files in a specific folder/prefix
 * @param prefix The folder prefix to list
 * @returns Promise with array of object keys
 */
export const listFilesInS3 = async (prefix: string): Promise<string[]> => {
  // Initialize S3 client with latest credentials
  await initializeS3Client();
  
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME,
    Prefix: prefix,
  });

  try {
    const response = await s3Client.send(command);
    if (!response.Contents) return [];
    return response.Contents.map(item => item.Key || "").filter(key => key !== "");
  } catch (error) {
    console.error("Error listing files from S3:", error);
    throw error;
  }
};
