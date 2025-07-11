
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Task } from "@/types";
import { TaskFormFields } from "./TaskFormFields";
import { TaskNotificationSection } from "./TaskNotificationSection";
import { TaskFormManager, taskFormSchema, TaskFormValues } from "@/utils/TaskFormManager";
import { useToast } from "@/hooks/use-toast";
import { ConcurrentActivityIndicator } from "@/components/ConcurrentActivityIndicator";

interface EditTaskDialogProps {
  task: Task;
  onUpdateTask: (data: TaskFormValues) => void;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ task, onUpdateTask }) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: TaskFormManager.getDefaultValues(),
    mode: "onChange",
  });
  
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (task) {
      TaskFormManager.populateFormFromTask(form, task);
    }
  }, [task, form]);
  
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
    
    // Ensure observationStatus is set
    if (!data.observationStatus) {
      data.observationStatus = "no";
    }
    
    onUpdateTask(data);
  };

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Edit Task</DialogTitle>
          <ConcurrentActivityIndicator taskId={task.id} />
        </div>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <TaskFormFields form={form} />
          <TaskNotificationSection form={form} />
          <DialogFooter>
            <Button type="submit">Update Task</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
