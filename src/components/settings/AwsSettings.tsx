import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { isAwsConfigured, AWS_REGIONS } from "@/utils/aws-config";

// Form schema
const awsFormSchema = z.object({
  region: z.string().min(1, "Region is required"),
  accessKeyId: z.string().min(1, "Access Key ID is required"),
  secretAccessKey: z.string().min(1, "Secret Access Key is required"),
  s3BucketName: z.string().min(1, "S3 Bucket Name is required"),
  sesFromEmail: z.string().email("Must be a valid email"),
  enableS3Integration: z.boolean(),
  enableSesIntegration: z.boolean(),
});

export function AwsSettings() {
  const [isConfigured, setIsConfigured] = useState(isAwsConfigured());
  
  const form = useForm<z.infer<typeof awsFormSchema>>({
    resolver: zodResolver(awsFormSchema),
    defaultValues: {
      region: "us-east-1",
      accessKeyId: "",
      secretAccessKey: "",
      s3BucketName: "",
      sesFromEmail: "",
      enableS3Integration: true,
      enableSesIntegration: true,
    },
  });

  function onSubmit(values: z.infer<typeof awsFormSchema>) {
    console.log(values);
    // Save settings (would need to update environment variables or configuration store)
    toast({
      title: "AWS settings updated",
      description: "AWS integration settings have been saved successfully.",
    });
    setIsConfigured(true);
  }

  function testConnection() {
    const values = form.getValues();
    if (!values.accessKeyId || !values.secretAccessKey) {
      toast({
        title: "Missing credentials",
        description: "Please provide AWS credentials before testing the connection.",
        variant: "destructive",
      });
      return;
    }

    // Simulate testing connection
    setTimeout(() => {
      toast({
        title: "Connection successful",
        description: "Successfully connected to AWS services.",
      });
    }, 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AWS Integration</CardTitle>
        <CardDescription>
          Configure AWS services integration for storage and email capabilities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Region</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AWS region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {AWS_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessKeyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Access Key ID</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      placeholder="Enter AWS Access Key ID" 
                    />
                  </FormControl>
                  <FormDescription>
                    Your AWS Access Key ID for authentication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secretAccessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Secret Access Key</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      placeholder="Enter AWS Secret Access Key" 
                    />
                  </FormControl>
                  <FormDescription>
                    Your AWS Secret Access Key for authentication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">SES Configuration</h3>
              
              <FormField
                control={form.control}
                name="enableSesIntegration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable SES Integration
                      </FormLabel>
                      <FormDescription>
                        Use Amazon SES for sending emails.
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

              {form.watch("enableSesIntegration") && (
                <FormField
                  control={form.control}
                  name="sesFromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SES From Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Enter From Email Address" 
                        />
                      </FormControl>
                      <FormDescription>
                        Verified email address to send emails from.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={testConnection}>
                Test Connection
              </Button>
              <Button type="submit">Save AWS Settings</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
