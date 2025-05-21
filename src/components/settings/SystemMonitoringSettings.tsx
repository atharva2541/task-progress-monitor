
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

// Form schema
const monitoringSchema = z.object({
  enableSystemMonitoring: z.boolean(),
  logLevel: z.enum(["error", "warn", "info", "debug"]),
  logRetentionDays: z.number().min(1).max(365),
  monitorCpu: z.boolean(),
  monitorMemory: z.boolean(),
  monitorDiskSpace: z.boolean(),
  monitorApiRequests: z.boolean(),
  alertThresholdCpu: z.number().min(50).max(99),
  alertThresholdMemory: z.number().min(50).max(99),
  alertThresholdDisk: z.number().min(50).max(99),
  notifyAdminOnErrors: z.boolean(),
  enablePerformanceAlerts: z.boolean(),
});

export function SystemMonitoringSettings() {
  const form = useForm<z.infer<typeof monitoringSchema>>({
    resolver: zodResolver(monitoringSchema),
    defaultValues: {
      enableSystemMonitoring: true,
      logLevel: "info",
      logRetentionDays: 30,
      monitorCpu: true,
      monitorMemory: true,
      monitorDiskSpace: true,
      monitorApiRequests: true,
      alertThresholdCpu: 80,
      alertThresholdMemory: 80,
      alertThresholdDisk: 85,
      notifyAdminOnErrors: true,
      enablePerformanceAlerts: true,
    },
  });

  function onSubmit(values: z.infer<typeof monitoringSchema>) {
    console.log(values);
    toast({
      title: "Monitoring settings updated",
      description: "System monitoring settings have been saved successfully.",
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Monitoring</CardTitle>
          <CardDescription>
            Configure system monitoring and alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="enableSystemMonitoring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable System Monitoring
                      </FormLabel>
                      <FormDescription>
                        Monitor system health and performance.
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

              {form.watch("enableSystemMonitoring") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Log Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select log level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Minimum level of events to log.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logRetentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Log Retention (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)} 
                            />
                          </FormControl>
                          <FormDescription>
                            Number of days to keep logs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Monitoring Metrics</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="monitorCpu"
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
                                CPU Usage
                              </FormLabel>
                              <FormDescription>
                                Monitor CPU utilization.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="monitorMemory"
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
                                Memory Usage
                              </FormLabel>
                              <FormDescription>
                                Monitor memory utilization.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="monitorDiskSpace"
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
                                Disk Space
                              </FormLabel>
                              <FormDescription>
                                Monitor disk space utilization.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="monitorApiRequests"
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
                                API Requests
                              </FormLabel>
                              <FormDescription>
                                Monitor API request volume and performance.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Alert Thresholds</h3>
                    <div className="space-y-4">
                      {form.watch("monitorCpu") && (
                        <FormField
                          control={form.control}
                          name="alertThresholdCpu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPU Alert Threshold (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 80)} 
                                />
                              </FormControl>
                              <FormDescription>
                                Alert when CPU usage exceeds this percentage.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {form.watch("monitorMemory") && (
                        <FormField
                          control={form.control}
                          name="alertThresholdMemory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Memory Alert Threshold (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 80)} 
                                />
                              </FormControl>
                              <FormDescription>
                                Alert when memory usage exceeds this percentage.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {form.watch("monitorDiskSpace") && (
                        <FormField
                          control={form.control}
                          name="alertThresholdDisk"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Disk Space Alert Threshold (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 85)} 
                                />
                              </FormControl>
                              <FormDescription>
                                Alert when disk usage exceeds this percentage.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Alert Settings</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="notifyAdminOnErrors"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Error Notifications
                              </FormLabel>
                              <FormDescription>
                                Notify administrators about system errors.
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

                      <FormField
                        control={form.control}
                        name="enablePerformanceAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Performance Alerts
                              </FormLabel>
                              <FormDescription>
                                Notify administrators about performance issues.
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
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit">Save Monitoring Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
