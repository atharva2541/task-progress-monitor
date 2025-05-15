
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

// Form schema for password policy
const passwordPolicySchema = z.object({
  minLength: z.number().min(6).max(20),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecial: z.boolean(),
  passwordExpiresDays: z.number().min(0).max(365),
  preventPasswordReuse: z.boolean(),
});

// Form schema for account policy
const accountPolicySchema = z.object({
  maxLoginAttempts: z.number().min(1).max(10),
  lockoutDurationMinutes: z.number().min(5).max(1440),
  inactivityLogout: z.number().min(5).max(120),
  defaultNotifications: z.enum(["all", "important", "none"]),
});

export function UserPreferences() {
  const passwordForm = useForm<z.infer<typeof passwordPolicySchema>>({
    resolver: zodResolver(passwordPolicySchema),
    defaultValues: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
      passwordExpiresDays: 90,
      preventPasswordReuse: true,
    },
  });

  const accountForm = useForm<z.infer<typeof accountPolicySchema>>({
    resolver: zodResolver(accountPolicySchema),
    defaultValues: {
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      inactivityLogout: 30,
      defaultNotifications: "important",
    },
  });

  function onPasswordPolicySubmit(values: z.infer<typeof passwordPolicySchema>) {
    console.log(values);
    toast({
      title: "Password policy updated",
      description: "Password policy settings have been saved.",
    });
  }

  function onAccountPolicySubmit(values: z.infer<typeof accountPolicySchema>) {
    console.log(values);
    toast({
      title: "Account policy updated",
      description: "Account policy settings have been saved.",
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Set requirements for user passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordPolicySubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="minLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Password Length</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={passwordForm.control}
                  name="requireUppercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Require uppercase letter
                        </FormLabel>
                        <FormDescription>
                          Password must contain at least one uppercase letter.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="requireLowercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Require lowercase letter
                        </FormLabel>
                        <FormDescription>
                          Password must contain at least one lowercase letter.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="requireNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Require number
                        </FormLabel>
                        <FormDescription>
                          Password must contain at least one number.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="requireSpecial"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Require special character
                        </FormLabel>
                        <FormDescription>
                          Password must contain at least one special character (e.g., !@#$%).
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={passwordForm.control}
                name="passwordExpiresDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Expiration (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormDescription>
                      Days before passwords expire (0 = never expires).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="preventPasswordReuse"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Prevent Password Reuse
                      </FormLabel>
                      <FormDescription>
                        Prevent users from reusing previous passwords.
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

              <Button type="submit">Save Password Policy</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Policy</CardTitle>
          <CardDescription>
            Configure account security and session settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(onAccountPolicySubmit)} className="space-y-4">
              <FormField
                control={accountForm.control}
                name="maxLoginAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Login Attempts</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormDescription>
                      Number of failed login attempts before account lockout.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name="lockoutDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Lockout Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormDescription>
                      Duration of account lockout after exceeding login attempts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name="inactivityLogout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inactivity Logout (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormDescription>
                      Automatically log out users after this period of inactivity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name="defaultNotifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Notification Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Notifications</SelectItem>
                        <SelectItem value="important">Important Only</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default notification setting for new users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Save Account Policy</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
