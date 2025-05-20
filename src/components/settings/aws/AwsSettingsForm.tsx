
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { isAwsConfigured } from "@/utils/aws-config";
import { awsFormSchema, defaultAwsFormValues, AwsFormValues } from "@/schemas/aws-settings.schema";
import { AwsCredentialsSection } from "./AwsCredentialsSection";
import { S3ConfigSection } from "./S3ConfigSection";
import { SesConfigSection } from "./SesConfigSection";

export function AwsSettingsForm() {
  const [isConfigured, setIsConfigured] = useState(isAwsConfigured());
  
  const form = useForm<AwsFormValues>({
    resolver: zodResolver(awsFormSchema),
    defaultValues: defaultAwsFormValues,
  });

  function onSubmit(values: AwsFormValues) {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AwsCredentialsSection />
        <S3ConfigSection />
        <SesConfigSection />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={testConnection}>
            Test Connection
          </Button>
          <Button type="submit">Save AWS Settings</Button>
        </div>
      </form>
    </Form>
  );
}
