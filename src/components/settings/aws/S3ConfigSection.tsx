
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { AwsFormValues } from "@/schemas/aws-settings.schema";

export function S3ConfigSection() {
  const form = useFormContext<AwsFormValues>();
  
  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-medium mb-3">S3 Configuration</h3>
      
      <FormField
        control={form.control}
        name="enableS3Integration"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Enable S3 Integration
              </FormLabel>
              <FormDescription>
                Use Amazon S3 for file storage and attachments.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {form.watch("enableS3Integration") && (
        <FormField
          control={form.control}
          name="s3BucketName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>S3 Bucket Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter S3 Bucket Name" 
                />
              </FormControl>
              <FormDescription>
                The name of your S3 bucket for file storage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
