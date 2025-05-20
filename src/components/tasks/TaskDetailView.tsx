
import React from 'react';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskAttachments } from './TaskAttachments';
import { TaskInstanceManager } from './TaskInstanceManager';
import { TaskDetailsHeader } from './TaskDetailsHeader';

interface TaskDetailViewProps {
  task: Task;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task }) => {
  const { getUserById } = useTask();
  const { user } = useAuth();
  
  const maker = getUserById(task.assignedTo);
  const checker1 = getUserById(task.checker1);
  const checker2 = getUserById(task.checker2);
  
  // Determine if the current user can upload attachments (maker or admin)
  const canUpload = user && (user.id === task.assignedTo || user.role === 'admin');
  
  // Determine if the current user can delete attachments (only admin)
  const canDelete = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      <TaskDetailsHeader task={task} />
      
      {/* For recurring tasks, show the instance manager */}
      {task.isRecurring && (
        <TaskInstanceManager task={task} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <TaskAttachments 
                taskId={task.id} 
                attachments={task.attachments || []} 
                canUpload={canUpload}
                canDelete={canDelete}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Task Assignment</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Maker</div>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                      {maker?.name.charAt(0)}
                    </div>
                    <span className="ml-2">{maker?.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">First Checker</div>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-medium">
                      {checker1?.name.charAt(0)}
                    </div>
                    <span className="ml-2">{checker1?.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Second Checker</div>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-medium">
                      {checker2?.name.charAt(0)}
                    </div>
                    <span className="ml-2">{checker2?.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {task.comments && task.comments.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Comments</h3>
                <div className="space-y-3">
                  {task.comments.map((comment) => {
                    const commentUser = getUserById(comment.userId);
                    return (
                      <div key={comment.id} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                            {commentUser?.name.charAt(0)}
                          </div>
                          <span className="ml-2 text-sm font-medium">{commentUser?.name}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
