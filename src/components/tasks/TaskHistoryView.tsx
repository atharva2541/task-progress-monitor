import React, { useState, useEffect } from 'react';
import { Task, TaskInstance } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { TaskAttachments } from './TaskAttachments';
import { History, FileText, Check, X, Download, Calendar, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { exportTaskHistoryToExcel } from '@/utils/excel-export';
import { toast } from '@/hooks/use-toast';

interface TaskHistoryViewProps {
  task: Task;
}

export const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({ task }) => {
  const { getTaskInstances, getUserById } = useTask();
  const instances = getTaskInstances(task.id);
  const [selectedInstance, setSelectedInstance] = useState<TaskInstance | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  
  // Sort instances by period end date (newest first)
  const sortedInstances = [...instances].sort((a, b) => 
    new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
  );

  // Apply filters
  const filteredInstances = sortedInstances.filter(instance => {
    // Filter by status
    if (statusFilter !== "all" && instance.status !== statusFilter) {
      return false;
    }
    
    // Filter by date range
    if (dateRangeFilter === "last30") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return isAfter(new Date(instance.periodEnd), thirtyDaysAgo);
    } else if (dateRangeFilter === "last90") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return isAfter(new Date(instance.periodEnd), ninetyDaysAgo);
    }
    
    return true;
  });
  
  // Set first instance as selected when component loads or when filtered list changes
  useEffect(() => {
    if (filteredInstances.length > 0 && !selectedInstance) {
      setSelectedInstance(filteredInstances[0]);
    }
  }, [filteredInstances, selectedInstance]);
  
  if (!task.isRecurring || instances.length === 0) {
    return (
      <div className="text-center py-20">
        <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-2xl font-medium text-gray-700">No History Available</h3>
        <p className="text-gray-500 mt-2">This task does not have any history records available.</p>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'submitted':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Function to handle exporting task history
  const handleExportHistory = () => {
    try {
      // If no instances match the filter, show a warning
      if (filteredInstances.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no task instances matching your current filters.",
          variant: "destructive"
        });
        return;
      }

      // Export the filtered instances to Excel
      const filename = `task_history_${task.id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportTaskHistoryToExcel(task, filteredInstances, filename, getUserById);
      
      toast({
        title: "Export successful",
        description: `Task history exported to ${filename}`
      });
    } catch (error) {
      console.error("Error exporting task history:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the task history.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task History</h2>
          <p className="text-gray-600">{task.name}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExportHistory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredInstances.length > 0 ? (
                  filteredInstances.map((instance) => (
                    <div 
                      key={instance.id}
                      onClick={() => setSelectedInstance(instance)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 
                        ${selectedInstance?.id === instance.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{instance.instanceReference}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(instance.periodStart)} - {formatDate(instance.periodEnd)}
                          </div>
                        </div>
                        <div>{getStatusBadge(instance.status)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No task instances match the selected filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedInstance ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Status</h3>
                          <div className="mt-1">{getStatusBadge(selectedInstance.status)}</div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                          <div className="mt-1">{formatDate(selectedInstance.dueDate)}</div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Period</h3>
                          <div className="mt-1">
                            {formatDate(selectedInstance.periodStart)} - {formatDate(selectedInstance.periodEnd)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Reference</h3>
                          <div className="mt-1">{selectedInstance.instanceReference}</div>
                        </div>
                        
                        {selectedInstance.submittedAt && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
                            <div className="mt-1">{formatDate(selectedInstance.submittedAt)}</div>
                          </div>
                        )}
                        
                        {selectedInstance.completedAt && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                            <div className="mt-1">{formatDate(selectedInstance.completedAt)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {selectedInstance.comments.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-4">Comments</h4>
                      <div className="space-y-3">
                        {selectedInstance.comments.map(comment => {
                          const commentUser = getUserById(comment.userId);
                          return (
                            <div key={comment.id} className="p-3 border rounded-md bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">{commentUser?.name || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(comment.createdAt), 'dd MMM yyyy, HH:mm')}
                                </div>
                              </div>
                              <p>{comment.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-6">Task Timeline</h4>
                    <div className="space-y-8">
                      {/* Timeline elements */}
                      <div className="relative pl-8 border-l-2 border-gray-200">
                        <div className="absolute -left-2 mt-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
                        <h5 className="font-medium">Task Created</h5>
                        <p className="text-sm text-gray-600">
                          {formatDate(task.createdAt)} - Initial task created
                        </p>
                      </div>
                      
                      {selectedInstance.submittedAt && (
                        <div className="relative pl-8 border-l-2 border-gray-200">
                          <div className="absolute -left-2 mt-1.5 w-4 h-4 rounded-full bg-purple-500"></div>
                          <h5 className="font-medium">Task Submitted</h5>
                          <p className="text-sm text-gray-600">
                            {formatDate(selectedInstance.submittedAt)} - Submitted for review
                          </p>
                        </div>
                      )}
                      
                      {/* Display approvals in timeline */}
                      {selectedInstance.approvals.map(approval => (
                        <div 
                          key={approval.id} 
                          className="relative pl-8 border-l-2 border-gray-200"
                        >
                          <div className={`absolute -left-2 mt-1.5 w-4 h-4 rounded-full 
                            ${approval.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <h5 className="font-medium">
                            {approval.userRole === 'checker1' ? 'First Approval' : 'Final Approval'}: {approval.status}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {format(new Date(approval.timestamp), 'dd MMM yyyy, HH:mm')}
                            {approval.comment && ` - "${approval.comment}"`}
                          </p>
                        </div>
                      ))}
                      
                      {selectedInstance.completedAt && (
                        <div className="relative pl-8 border-l-2 border-gray-200">
                          <div className="absolute -left-2 mt-1.5 w-4 h-4 rounded-full bg-green-500"></div>
                          <h5 className="font-medium">Task Completed</h5>
                          <p className="text-sm text-gray-600">
                            {formatDate(selectedInstance.completedAt)} - Final approval received
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                      <div className="space-y-4">
                        {selectedInstance.approvals.map(approval => (
                          <div key={approval.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">
                                {approval.userRole === 'checker1' ? 'First Checker' : 'Second Checker'}
                              </div>
                              <div>
                                {approval.status === 'approved' ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <Check className="w-3 h-3 mr-1" /> Approved
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                    <X className="w-3 h-3 mr-1" /> Rejected
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {approval.comment && (
                              <div className="mt-2 text-gray-600">{approval.comment}</div>
                            )}
                            <div className="text-sm text-gray-500 mt-2">
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
    </div>
  );
};
