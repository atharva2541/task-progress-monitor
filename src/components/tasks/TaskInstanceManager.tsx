
import React from 'react';
import { Task } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskHistoryExplorer } from './TaskHistoryExplorer';

interface TaskInstanceManagerProps {
  task: Task;
}

export const TaskInstanceManager: React.FC<TaskInstanceManagerProps> = ({ task }) => {
  const { getTaskInstanceById, rolloverRecurringTask } = useTask();
  const { toast } = useToast();
  
  if (!task.isRecurring) {
    return null;
  }
  
  // Get the current active instance if available
  const currentInstance = task.currentInstanceId 
    ? getTaskInstanceById(task.currentInstanceId)
    : undefined;
  
  const handleCreateNextInstance = async () => {
    try {
      await rolloverRecurringTask(task.id);
      toast({
        title: "Success",
        description: "New task instance created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new task instance",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recurring Task Management</span>
          <TaskHistoryExplorer task={task} />
        </CardTitle>
        <CardDescription>
          This is a recurring {task.frequency} task
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Instance</h4>
            <div className="border rounded-md p-4 bg-gray-50">
              {currentInstance ? (
                <>
                  <div className="text-sm font-semibold">
                    {currentInstance.instanceReference}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Due date: {format(new Date(currentInstance.dueDate), 'dd MMMM yyyy')}
                  </div>
                  <div className="mt-2 text-xs">
                    <span className={`inline-flex px-2 py-1 rounded-md ${
                      currentInstance.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : currentInstance.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {currentInstance.status.charAt(0).toUpperCase() + currentInstance.status.slice(1)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">No active instance available</div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Next Instance</h4>
            <div className="border rounded-md p-4 bg-gray-50">
              {task.nextInstanceDate ? (
                <>
                  <div className="text-sm">
                    Scheduled for: {format(new Date(task.nextInstanceDate), 'dd MMMM yyyy')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Will be created automatically when current instance is completed
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">
                  No next instance scheduled
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleCreateNextInstance}
          disabled={!task.isRecurring}
        >
          <History className="mr-2 h-4 w-4" />
          Create Next Instance Now
        </Button>
      </CardFooter>
    </Card>
  );
};
