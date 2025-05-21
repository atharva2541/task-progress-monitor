
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TaskHistoryView } from '@/components/tasks/TaskHistoryView';

const TaskHistoryPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getTaskById } = useTask();
  const [task, setTask] = useState(taskId ? getTaskById(taskId) : undefined);

  // If the task ID changes, update the task
  useEffect(() => {
    if (taskId) {
      setTask(getTaskById(taskId));
    }
  }, [taskId, getTaskById]);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">The task you are looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
      </div>
    );
  }

  // If the task is not recurring, redirect to task detail page
  if (!task.isRecurring) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-2">Not a Recurring Task</h2>
        <p className="text-muted-foreground mb-6">History is only available for recurring tasks.</p>
        <Button onClick={() => navigate(`/tasks/${taskId}`)}>Back to Task Details</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/tasks/${taskId}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Task Details
        </Button>
        <h1 className="text-2xl font-bold">Task History</h1>
      </div>
      
      <TaskHistoryView task={task} />
    </div>
  );
};

export default TaskHistoryPage;
