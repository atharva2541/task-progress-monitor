
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { AwsFormValues } from "@/schemas/aws-settings.schema";

export function SesConfigSection() {
  const form = useFormContext<AwsFormValues>();
  
  return (
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
  );
}
