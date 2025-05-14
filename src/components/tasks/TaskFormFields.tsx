
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { TaskFormValues } from "@/utils/TaskFormManager";

interface TaskFormFieldsProps {
  form: UseFormReturn<TaskFormValues>;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>Task Name</FormLabel>
          <FormControl>
            <input {...field} />
          </FormControl>
          <FormDescription>Enter the name of the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <textarea {...field} />
          </FormControl>
          <FormDescription>Provide a detailed description of the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="category" render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <input {...field} />
          </FormControl>
          <FormDescription>Select a category for the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="assignedTo" render={({ field }) => (
        <FormItem>
          <FormLabel>Assigned To</FormLabel>
          <FormControl>
            <input {...field} />
          </FormControl>
          <FormDescription>Select the maker for the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="checker1" render={({ field }) => (
        <FormItem>
          <FormLabel>Checker 1</FormLabel>
          <FormControl>
            <input {...field} />
          </FormControl>
          <FormDescription>Select the first checker for the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="checker2" render={({ field }) => (
        <FormItem>
          <FormLabel>Checker 2</FormLabel>
          <FormControl>
            <input {...field} />
          </FormControl>
          <FormDescription>Select the second checker for the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="priority" render={({ field }) => (
        <FormItem>
          <FormLabel>Priority</FormLabel>
          <FormControl>
            <select {...field}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormControl>
          <FormDescription>Select the priority of the task.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="frequency" render={({ field }) => (
        <FormItem>
          <FormLabel>Frequency</FormLabel>
          <FormControl>
            <select {...field}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
              <option value="one-time">One-time</option>
            </select>
          </FormControl>
          <FormDescription>Select how often the task should repeat.</FormDescription>
        </FormItem>
      )} />
      
      <FormField control={form.control} name="dueDate" render={({ field }) => (
        <FormItem>
          <FormLabel>Due Date</FormLabel>
          <FormControl>
            <input type="date" {...field} />
          </FormControl>
          <FormDescription>Select the due date for the task.</FormDescription>
        </FormItem>
      )} />
    </>
  );
};
