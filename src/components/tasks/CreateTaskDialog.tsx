
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TaskFormFields } from "./TaskFormFields";
import { TaskNotificationSection } from "./TaskNotificationSection";
import { TaskFormManager, taskFormSchema, TaskFormValues } from "@/utils/TaskFormManager";

interface CreateTaskDialogProps {
  onCreateTask: (task: TaskFormValues) => void;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ onCreateTask }) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: TaskFormManager.getDefaultValues(),
  });

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateTask)} className="space-y-4">
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
