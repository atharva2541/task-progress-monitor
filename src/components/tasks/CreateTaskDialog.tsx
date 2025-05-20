
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TaskFormFields } from "./TaskFormFields";
import { TaskNotificationSection } from "./TaskNotificationSection";
import { TaskFormManager, taskFormSchema, TaskFormValues } from "@/utils/TaskFormManager";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskDialogProps {
  onCreateTask: (task: TaskFormValues) => void;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ onCreateTask }) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: TaskFormManager.getDefaultValues(),
    mode: "onChange", // Add immediate validation
  });
  
  const { toast } = useToast();
  
  // Validate that Maker, Checker1, and Checker2 are not the same on submit
  const handleSubmit = (data: TaskFormValues) => {
    if (data.assignedTo === data.checker1) {
      toast({
        title: "Validation Error",
        description: "Maker and First Checker cannot be the same user",
        variant: "destructive"
      });
      form.setError("checker1", {
        type: "manual", 
        message: "Maker and First Checker cannot be the same user"
      });
      return;
    }
    
    if (data.assignedTo === data.checker2) {
      toast({
        title: "Validation Error",
        description: "Maker and Second Checker cannot be the same user",
        variant: "destructive"
      });
      form.setError("checker2", {
        type: "manual", 
        message: "Maker and Second Checker cannot be the same user"
      });
      return;
    }
    
    if (data.checker1 === data.checker2) {
      toast({
        title: "Validation Error",
        description: "First Checker and Second Checker cannot be the same user",
        variant: "destructive"
      });
      form.setError("checker2", {
        type: "manual", 
        message: "First Checker and Second Checker cannot be the same user"
      });
      return;
    }
    
    // Ensure observationStatus is set (should be defaulted to "no", but double-check)
    if (!data.observationStatus) {
      data.observationStatus = "no";
    }
    
    onCreateTask(data);
  };

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <TaskFormFields form={form} />
          <TaskNotificationSection form={form} />
          <DialogFooter>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
