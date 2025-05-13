
// AWS Configuration
// These should ideally come from environment variables in production
export const AWS_REGION = "us-east-1"; // Change to your preferred AWS region
export const AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID"; // Replace with your actual AWS access key
export const AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY"; // Replace with your actual AWS secret key
export const S3_BUCKET_NAME = "your-s3-bucket-name"; // Replace with your S3 bucket name
export const SES_FROM_EMAIL = "your-verified-email@example.com"; // Replace with your verified SES email

// In a production app, you would use environment variables like:
// export const AWS_REGION = import.meta.env.VITE_AWS_REGION;
