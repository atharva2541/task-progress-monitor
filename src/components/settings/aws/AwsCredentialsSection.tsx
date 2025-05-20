
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AWS_REGIONS } from "@/utils/aws-config";
import { AwsFormValues } from "@/schemas/aws-settings.schema";

export function AwsCredentialsSection() {
  const form = useFormContext<AwsFormValues>();
  
  return (
    <>
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
                <ScrollArea className="h-[300px]">
                  {AWS_REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
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
    </>
  );
}
