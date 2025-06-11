
import React, { useState } from 'react';
import { Task, TaskInstance } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { TaskAttachments } from './TaskAttachments';
import { History, FileText, Check, X } from 'lucide-react';

interface TaskHistoryExplorerProps {
  task: Task;
}

export const TaskHistoryExplorer: React.FC<TaskHistoryExplorerProps> = ({ task }) => {
  const [open, setOpen] = useState(false);
  const { getTaskInstances } = useTask();
  const instances = getTaskInstances(task.id);
  const [selectedInstance, setSelectedInstance] = useState<TaskInstance | null>(null);
  
  // Sort instances by period end date (newest first)
  const sortedInstances = [...instances].sort((a, b) => 
    new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
  );
  
  if (!task.isRecurring || instances.length === 0) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };
  
  const handleInstanceSelect = (instance: TaskInstance) => {
    setSelectedInstance(instance);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium"><Check className="w-3 h-3 mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-medium"><X className="w-3 h-3 mr-1" /> Rejected</span>;
      case 'submitted':
        return <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-medium">Submitted</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <History className="mr-1 h-4 w-4" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task History: {task.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-sm font-medium">Past Instances</h3>
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                {sortedInstances.map((instance) => (
                  <div 
                    key={instance.id}
                    onClick={() => handleInstanceSelect(instance)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedInstance?.id === instance.id ? 'bg-blue-50' : ''}`}
                  >
                    <div>
                      <div className="font-medium text-sm">{instance.instanceReference}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(instance.periodStart)} - {formatDate(instance.periodEnd)}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(instance.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedInstance ? (
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="approvals">Approvals</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium">Status</div>
                          <div>{getStatusBadge(selectedInstance.status)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Due Date</div>
                          <div>{formatDate(selectedInstance.dueDate)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Period</div>
                          <div>{formatDate(selectedInstance.periodStart)} - {formatDate(selectedInstance.periodEnd)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Reference</div>
                          <div>{selectedInstance.instanceReference}</div>
                        </div>
                        {selectedInstance.submittedAt && (
                          <div>
                            <div className="text-sm font-medium">Submitted</div>
                            <div>{formatDate(selectedInstance.submittedAt)}</div>
                          </div>
                        )}
                        {selectedInstance.completedAt && (
                          <div>
                            <div className="text-sm font-medium">Completed</div>
                            <div>{formatDate(selectedInstance.completedAt)}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {selectedInstance.comments.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Comments</h4>
                        <div className="space-y-2">
                          {selectedInstance.comments.map(comment => (
                            <div key={comment.id} className="p-3 border rounded-md bg-gray-50">
                              <div className="text-sm">{comment.content}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="attachments">
                  <Card>
                    <CardContent className="pt-6">
                      <TaskAttachments 
                        taskId={selectedInstance.id}
                        attachments={selectedInstance.attachments}
                        canUpload={false}
                        canDelete={false}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="approvals">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-4">Approval History</h4>
                      
                      {selectedInstance.approvals.length > 0 ? (
                        <div className="space-y-3">
                          {selectedInstance.approvals.map(approval => (
                            <div key={approval.id} className="border rounded-md p-3">
                              <div className="flex justify-between items-center">
                                <div className="font-medium">
                                  {approval.userRole === 'checker1' ? 'First Checker' : 'Second Checker'}
                                </div>
                                <div>
                                  {approval.status === 'approved' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                                      <Check className="w-3 h-3 mr-1" /> Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-medium">
                                      <X className="w-3 h-3 mr-1" /> Rejected
                                    </span>
                                  )}
                                </div>
                              </div>
                              {approval.comment && (
                                <div className="mt-2 text-sm text-gray-600">{approval.comment}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {format(new Date(approval.timestamp), 'dd MMM yyyy, HH:mm')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No approval records found for this instance.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-md p-8">
                <div className="text-center text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">Select an instance</p>
                  <p className="text-sm">Click on an instance from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
