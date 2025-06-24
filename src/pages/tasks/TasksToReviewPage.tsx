
import React, { useState } from 'react';
import { useSupabaseTasks } from '@/contexts/SupabaseTaskContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoCheckerRoleMessage } from '@/components/tasks/review/NoCheckerRoleMessage';
import { TaskTabContent } from '@/components/tasks/review/TaskTabContent';

const TasksToReviewPage = () => {
  const { tasks } = useSupabaseTasks();
  const { profile: user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<'checker1' | 'checker2'>('checker1');
  
  if (!user) return null;
  
  // Check if user has checker roles (primary or additional roles)
  const userRoles = user.roles || [user.role];
  const hasChecker1Role = userRoles.includes('checker1');
  const hasChecker2Role = userRoles.includes('checker2');
  
  // Get tasks where user is checker1 - strictly only tasks where this user is checker1
  const checker1Tasks = hasChecker1Role ? 
    tasks.filter(task => task.checker1 === user.id) : [];
  
  // Get tasks where user is checker2 - strictly only tasks where this user is checker2
  const checker2Tasks = hasChecker2Role ? 
    tasks.filter(task => 
      task.checker2 === user.id && 
      (task.status === 'checker1-approved' || task.status === 'approved' || task.status === 'rejected')
    ) : [];
  
  // If user doesn't have any checker roles, show a message
  if (!hasChecker1Role && !hasChecker2Role) {
    return <NoCheckerRoleMessage />;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks to Review</h1>
        <p className="text-muted-foreground">
          Tasks where you are assigned as a Checker
        </p>
      </div>
      
      <Tabs 
        defaultValue={hasChecker1Role ? "checker1" : "checker2"} 
        className="w-full" 
        onValueChange={(val) => setActiveTab(val as 'checker1' | 'checker2')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checker1" disabled={!hasChecker1Role}>Checker 1 Tasks</TabsTrigger>
          <TabsTrigger value="checker2" disabled={!hasChecker2Role}>Checker 2 Tasks</TabsTrigger>
        </TabsList>
        
        {hasChecker1Role && (
          <TabsContent value="checker1">
            <TaskTabContent 
              title="Checker 1 Tasks"
              description="Tasks requiring your first-level review"
              tasks={checker1Tasks}
            />
          </TabsContent>
        )}
        
        {hasChecker2Role && (
          <TabsContent value="checker2">
            <TaskTabContent 
              title="Checker 2 Tasks"
              description="Tasks requiring your final approval"
              tasks={checker2Tasks}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TasksToReviewPage;
