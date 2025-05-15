
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Trash } from "lucide-react";

// Form schema
const formSchema = z.object({
  defaultPriority: z.enum(["low", "medium", "high"]),
  defaultDueInDays: z.number().min(1).max(60),
  enableTaskComments: z.boolean(),
  enableTaskAttachments: z.boolean(),
  requireTaskApproval: z.boolean(),
  autoNotifyOnDue: z.boolean(),
});

export function TaskSettings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultPriority: "medium",
      defaultDueInDays: 7,
      enableTaskComments: true,
      enableTaskAttachments: true,
      requireTaskApproval: true,
      autoNotifyOnDue: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Task settings updated",
      description: "Task management settings have been updated successfully.",
    });
  }

  // Mock categories for the interface
  const [categories, setCategories] = useState([
    { id: "1", name: "Audit" },
    { id: "2", name: "Compliance" },
    { id: "3", name: "Review" },
    { id: "4", name: "Documentation" }
  ]);
  
  const [newCategory, setNewCategory] = useState("");
  
  const addCategory = () => {
    if (!newCategory.trim()) return;
    const id = (categories.length + 1).toString();
    setCategories([...categories, { id, name: newCategory }]);
    setNewCategory("");
    toast({
      title: "Category added",
      description: `New category "${newCategory}" has been added.`
    });
  };
  
  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    toast({
      title: "Category removed",
      description: "The category has been removed."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Configuration</CardTitle>
          <CardDescription>
            Default settings for tasks and task management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="defaultPriority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default priority for new tasks.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultDueInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Due Days</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormDescription>
                      Default number of days until task is due.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="enableTaskComments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Comments
                        </FormLabel>
                        <FormDescription>
                          Allow users to add comments to tasks.
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
                  name="enableTaskAttachments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Attachments
                        </FormLabel>
                        <FormDescription>
                          Allow users to attach files to tasks.
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
                  name="requireTaskApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Require Approval
                        </FormLabel>
                        <FormDescription>
                          Require checker approval for task completion.
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
                  name="autoNotifyOnDue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto Notifications
                        </FormLabel>
                        <FormDescription>
                          Automatically notify users when tasks are due.
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
              
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Categories</CardTitle>
          <CardDescription>
            Manage available task categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between rounded border p-3">
                  <span>{category.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCategory(category.id)}
                    aria-label={`Remove ${category.name} category`}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addCategory}>Add Category</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
