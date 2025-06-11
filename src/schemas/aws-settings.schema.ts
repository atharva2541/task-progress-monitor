
import * as z from "zod";

// Form schema for AWS settings
export const awsFormSchema = z.object({
  region: z.string().min(1, "Region is required"),
  accessKeyId: z.string().min(1, "Access Key ID is required"),
  secretAccessKey: z.string().min(1, "Secret Access Key is required"),
  s3BucketName: z.string().min(1, "S3 Bucket Name is required"),
  sesFromEmail: z.string().email("Must be a valid email"),
  enableS3Integration: z.boolean(),
  enableSesIntegration: z.boolean(),
});

// Type for AWS settings form values
export type AwsFormValues = z.infer<typeof awsFormSchema>;

// Default form values
export const defaultAwsFormValues: AwsFormValues = {
  region: "us-east-1",
  accessKeyId: "",
  secretAccessKey: "",
  s3BucketName: "",
  sesFromEmail: "",
  enableS3Integration: true,
  enableSesIntegration: true,
};
