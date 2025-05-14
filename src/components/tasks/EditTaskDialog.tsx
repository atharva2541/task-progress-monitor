
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Task } from "@/types";
import { TaskFormFields } from "./TaskFormFields";
import { TaskNotificationSection } from "./TaskNotificationSection";
import { TaskFormManager, taskFormSchema, TaskFormValues } from "@/utils/TaskFormManager";

interface EditTaskDialogProps {
  task: Task;
  onUpdateTask: (data: TaskFormValues) => void;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ task, onUpdateTask }) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: TaskFormManager.getDefaultValues(),
  });

  React.useEffect(() => {
    if (task) {
      TaskFormManager.populateFormFromTask(form, task);
    }
  }, [task, form]);

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onUpdateTask)} className="space-y-4">
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
