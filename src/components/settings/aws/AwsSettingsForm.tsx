
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { awsApi } from "@/services/api-client";
import { awsFormSchema, defaultAwsFormValues, AwsFormValues } from "@/schemas/aws-settings.schema";
import { AwsCredentialsSection } from "./AwsCredentialsSection";
import { S3ConfigSection } from "./S3ConfigSection";
import { SesConfigSection } from "./SesConfigSection";
import { getAwsSettings } from "@/utils/aws-config";

export function AwsSettingsForm() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AwsFormValues>({
    resolver: zodResolver(awsFormSchema),
    defaultValues: defaultAwsFormValues,
  });

  // Load existing AWS settings from API
  useEffect(() => {
    const fetchAwsSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getAwsSettings();
        
        if (settings.region || settings.s3BucketName || settings.sesFromEmail) {
          form.setValue('region', settings.region || defaultAwsFormValues.region);
          form.setValue('s3BucketName', settings.s3BucketName || '');
          form.setValue('sesFromEmail', settings.sesFromEmail || '');
          setIsConfigured(true);
        }
      } catch (error) {
        console.error('Error loading AWS settings:', error);
        toast({
          title: "Error loading settings",
          description: "Failed to load AWS settings from the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAwsSettings();
  }, [form]);

  async function onSubmit(values: AwsFormValues) {
    try {
      setIsLoading(true);
      
      // Save settings to API
      await awsApi.updateSettings({
        region: values.region,
        s3BucketName: values.s3BucketName,
        sesFromEmail: values.sesFromEmail,
        accessKeyId: values.accessKeyId,
        secretAccessKey: values.secretAccessKey,
      });
      
      toast({
        title: "AWS settings updated",
        description: "AWS integration settings have been saved successfully.",
      });
      
      setIsConfigured(true);
    } catch (error) {
      console.error('Error saving AWS settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save AWS settings to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function testConnection() {
    const values = form.getValues();
    
    if (!values.accessKeyId || !values.secretAccessKey) {
      toast({
        title: "Missing credentials",
        description: "Please provide AWS credentials before testing the connection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Test connection using API
      await awsApi.testConnection({
        region: values.region,
        accessKeyId: values.accessKeyId,
        secretAccessKey: values.secretAccessKey,
        s3BucketName: values.s3BucketName,
        sesFromEmail: values.sesFromEmail,
      });
      
      toast({
        title: "Connection successful",
        description: "Successfully connected to AWS services.",
      });
    } catch (error) {
      console.error('Error testing AWS connection:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to AWS services. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AwsCredentialsSection />
        <S3ConfigSection />
        <SesConfigSection />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={testConnection} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save AWS Settings'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
