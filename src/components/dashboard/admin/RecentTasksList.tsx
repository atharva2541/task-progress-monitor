
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { calculateDaysOverdue } from '@/utils/date-utils';

interface RecentTasksListProps {
  tasks: Task[];
}

export function RecentTasksList({ tasks }: RecentTasksListProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
          <Button variant="outline" size="sm">
            View All
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">{task.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Days Overdue: {calculateDaysOverdue(task.dueDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'}`}
                >
                  {task.priority}
                </span>
                <span 
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${task.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    task.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                    task.status === 'submitted' ? 'bg-purple-100 text-purple-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
