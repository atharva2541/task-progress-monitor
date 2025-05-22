
import { awsApi } from '../services/api-client';

// Define default values for local development only
const defaultRegion = "us-east-1";

// AWS regions list - comprehensive list of all AWS regions
export const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "af-south-1", label: "Africa (Cape Town)" },
  { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
  { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
  { value: "ca-central-1", label: "Canada (Central)" },
  { value: "cn-north-1", label: "China (Beijing)" },
  { value: "cn-northwest-1", label: "China (Ningxia)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-west-3", label: "Europe (Paris)" },
  { value: "eu-north-1", label: "Europe (Stockholm)" },
  { value: "eu-south-1", label: "Europe (Milan)" },
  { value: "me-south-1", label: "Middle East (Bahrain)" },
  { value: "me-central-1", label: "Middle East (UAE)" },
  { value: "sa-east-1", label: "South America (São Paulo)" },
  { value: "us-gov-east-1", label: "AWS GovCloud (US-East)" },
  { value: "us-gov-west-1", label: "AWS GovCloud (US-West)" },
];

// Current AWS configuration - these will be updated with values from the backend
export let AWS_REGION = defaultRegion;
export let AWS_ACCESS_KEY_ID = "";
export let AWS_SECRET_ACCESS_KEY = "";
export let S3_BUCKET_NAME = "";
export let SES_FROM_EMAIL = "";

// Cached credentials to avoid unnecessary API calls
let cachedCredentials: {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  s3BucketName: string;
  sesFromEmail: string;
  timestamp: number;
} | null = null;

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Function to get AWS settings from the API
export const getAwsSettings = async () => {
  try {
    // Check if we have cached settings that aren't expired
    if (
      cachedCredentials &&
      Date.now() - cachedCredentials.timestamp < CACHE_EXPIRATION
    ) {
      return {
        region: cachedCredentials.region,
        s3BucketName: cachedCredentials.s3BucketName,
        sesFromEmail: cachedCredentials.sesFromEmail,
      };
    }

    // Fetch settings from API
    const response = await awsApi.getSettings();
    
    if (response.data) {
      // Update cache with settings (not credentials yet)
      cachedCredentials = {
        ...cachedCredentials,
        region: response.data.region || defaultRegion,
        s3BucketName: response.data.s3BucketName || "",
        sesFromEmail: response.data.sesFromEmail || "",
        timestamp: Date.now(),
      };

      // Update exported variables
      AWS_REGION = response.data.region || defaultRegion;
      S3_BUCKET_NAME = response.data.s3BucketName || "";
      SES_FROM_EMAIL = response.data.sesFromEmail || "";

      return {
        region: cachedCredentials.region,
        s3BucketName: cachedCredentials.s3BucketName,
        sesFromEmail: cachedCredentials.sesFromEmail,
      };
    }
  } catch (error) {
    console.error('Failed to get AWS settings:', error);
  }

  // Return defaults if API request fails
  return {
    region: defaultRegion,
    s3BucketName: "",
    sesFromEmail: "",
  };
};

// Function to get AWS credentials from the API
export const getAwsCredentials = async () => {
  try {
    // Check if we have cached credentials that aren't expired
    if (
      cachedCredentials &&
      cachedCredentials.accessKeyId && 
      cachedCredentials.secretAccessKey &&
      Date.now() - cachedCredentials.timestamp < CACHE_EXPIRATION
    ) {
      return {
        accessKeyId: cachedCredentials.accessKeyId,
        secretAccessKey: cachedCredentials.secretAccessKey,
      };
    }

    // Fetch credentials from API
    const response = await awsApi.testConnection({
      // This is a workaround since getCredentials is not yet implemented
      // In a real implementation, we would use a dedicated endpoint
      region: AWS_REGION,
      accessKeyId: "",
      secretAccessKey: ""
    });
    
    if (response.data && response.data.credentials) {
      // Update cache with credentials
      cachedCredentials = {
        ...cachedCredentials,
        accessKeyId: response.data.credentials.accessKeyId || "",
        secretAccessKey: response.data.credentials.secretAccessKey || "",
        timestamp: Date.now(),
      };

      // Update exported variables
      AWS_ACCESS_KEY_ID = response.data.credentials.accessKeyId || "";
      AWS_SECRET_ACCESS_KEY = response.data.credentials.secretAccessKey || "";

      return {
        accessKeyId: cachedCredentials.accessKeyId,
        secretAccessKey: cachedCredentials.secretAccessKey,
      };
    }
  } catch (error) {
    console.error('Failed to get AWS credentials:', error);
  }

  // Return empty credentials if API request fails
  return {
    accessKeyId: "",
    secretAccessKey: "",
  };
};

// Helper function to check if credentials are properly configured
export const isAwsConfigured = async (): Promise<boolean> => {
  try {
    const settings = await getAwsSettings();
    const credentials = await getAwsCredentials();
    
    return Boolean(
      credentials.accessKeyId &&
      credentials.secretAccessKey &&
      settings.s3BucketName &&
      settings.sesFromEmail
    );
  } catch (error) {
    console.error('Error checking AWS configuration:', error);
    return false;
  }
};
