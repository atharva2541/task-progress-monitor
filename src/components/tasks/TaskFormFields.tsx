
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { TaskFormValues } from "@/utils/TaskFormManager";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFormFieldsProps {
  form: UseFormReturn<TaskFormValues>;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({ form }) => {
  // Mock user data - in a real app, this would come from a context or API
  const users = [
    { id: "user1", name: "John Doe" },
    { id: "user2", name: "Jane Smith" },
    { id: "user3", name: "Alex Brown" },
    { id: "user4", name: "Sarah Wilson" },
  ];

  return (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>Task Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Enter the name of the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormDescription>Provide a detailed description of the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="category" render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Select a category for the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="assignedTo" render={({ field }) => (
        <FormItem>
          <FormLabel>Assigned To</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select maker" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Select the maker for the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="checker1" render={({ field }) => (
        <FormItem>
          <FormLabel>Checker 1</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select first checker" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Select the first checker for the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="checker2" render={({ field }) => (
        <FormItem>
          <FormLabel>Checker 2</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select second checker" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Select the second checker for the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="priority" render={({ field }) => (
        <FormItem>
          <FormLabel>Priority</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Select the priority of the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="frequency" render={({ field }) => (
        <FormItem>
          <FormLabel>Frequency</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Select how often the task should repeat.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
      
      <FormField control={form.control} name="dueDate" render={({ field }) => (
        <FormItem>
          <FormLabel>Due Date</FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormDescription>Select the due date for the task.</FormDescription>
          <FormMessage />
        </FormItem>
      )} />
    </>
  );
};
