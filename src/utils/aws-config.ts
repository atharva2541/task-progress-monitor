
// AWS Configuration
// These values will be loaded from environment variables

// Define default values for local development only
const defaultRegion = "us-east-1";

// Export configured values with fallbacks for development
export const AWS_REGION = process.env.AWS_REGION || defaultRegion;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || "";

// Helper function to check if credentials are properly configured
export const isAwsConfigured = (): boolean => {
  return Boolean(
    AWS_ACCESS_KEY_ID &&
    AWS_SECRET_ACCESS_KEY &&
    S3_BUCKET_NAME &&
    SES_FROM_EMAIL
  );
};
