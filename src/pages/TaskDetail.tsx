import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TaskAttachments } from '@/components/tasks/TaskAttachments';
import { ObservationStatusDropdown } from '@/components/tasks/ObservationStatusDropdown';
import { DaysPastDueCounter } from '@/components/tasks/DaysPastDueCounter';
import { ArrowLeft, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getTaskById, updateTaskStatus, getUserById } = useTask();
  const { user } = useAuth();

  const [comment, setComment] = useState('');
  const [showObservationWarning, setShowObservationWarning] = useState(false);
  const task = taskId ? getTaskById(taskId) : undefined;

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">The task you are looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
      </div>
    );
  }

  const maker = getUserById(task.assignedTo);
  const checker1 = getUserById(task.checker1);
  const checker2 = getUserById(task.checker2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const isMaker = user?.id === task.assignedTo;
  const isChecker1 = user?.id === task.checker1;
  const isChecker2 = user?.id === task.checker2;
  const isAdmin = user?.role === 'admin';

  // Determine if current user can submit this task
  const canSubmit = isMaker && (task.status === 'pending' || task.status === 'in-progress' || task.status === 'rejected');
  
  // Determine if checker1 can approve or reject - only if status is submitted
  const canChecker1Action = isChecker1 && task.status === 'submitted';
  
  // Determine if checker2 can approve or reject - only if checker1 has approved
  const canChecker2Action = isChecker2 && task.status === 'checker1-approved';

  // Can edit observation status (maker, checker1, checker2, or admin)
  const canEditObservationStatus = isMaker || isChecker1 || isChecker2 || isAdmin;

  // Can upload attachments (maker)
  const canUploadAttachments = isMaker && ['pending', 'in-progress', 'rejected'].includes(task.status);
  
  // Can delete attachments (maker or admin)
  const canDeleteAttachments = isMaker || isAdmin;

  const handleTaskAction = (newStatus: 'in-progress' | 'submitted' | 'checker1-approved' | 'approved' | 'rejected') => {
    // For task submission, check if observation status is set
    if (newStatus === 'submitted') {
      if (!task.observationStatus) {
        setShowObservationWarning(true);
        toast({
          title: "Observation Status Required",
          description: "Please specify if observations were found before submitting the task.",
          variant: "destructive"
        });
        return;
      }
      setShowObservationWarning(false);
    }

    // If checker1 is approving, change status to 'checker1-approved'
    if (isChecker1 && newStatus === 'approved') {
      updateTaskStatus(task.id, 'checker1-approved', comment);
      toast({
        title: "Task approved by Checker 1",
        description: "The task has been approved and forwarded to Checker 2 for final approval."
      });
    } else {
      updateTaskStatus(task.id, newStatus, comment);
    }
    setComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/tasks')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <h1 className="text-2xl font-bold">{task.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Created on {formatDate(task.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{task.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    {task.status === 'checker1-approved' ? 
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        Awaiting Final Approval
                      </Badge> : 
                      getStatusBadge(task.status)
                    }
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <div className="mt-1">{getPriorityBadge(task.priority)}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1">{task.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
                  <p className="mt-1">{task.frequency} {task.isRecurring && '(Recurring)'}</p>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                    <p className="mt-1">{formatDate(task.dueDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1">{formatDate(task.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* Days Past Due Counter */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Days Past Due</h3>
                <DaysPastDueCounter dueDate={task.dueDate} />
              </div>
              
              {/* Observation Status Dropdown with Required indicator */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Observations Found? <span className="text-red-500">*</span>
                </h3>
                
                {showObservationWarning && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      You must specify if observations were found before submitting the task.
                    </AlertDescription>
                  </Alert>
                )}
                
                {canEditObservationStatus && (
                  <ObservationStatusDropdown 
                    taskId={task.id} 
                    currentStatus={task.observationStatus || null} 
                    required={true}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Task Attachments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Files and attachments for this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskAttachments 
                taskId={task.id}
                attachments={task.attachments || []}
                canUpload={canUploadAttachments}
                canDelete={canDeleteAttachments}
              />
            </CardContent>
          </Card>
          
          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => {
                    const commentUser = getUserById(comment.userId);
                    return (
                      <div key={comment.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{commentUser?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No comments yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approvers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To (Maker)</h3>
                <p className="mt-1">{maker?.name || 'Unknown'}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-500">First Checker</h3>
                <p className="mt-1">{checker1?.name || 'Unknown'}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Final Approver</h3>
                <p className="mt-1">{checker2?.name || 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
          
          {(canSubmit || canChecker1Action || canChecker2Action) && (
            <Card>
              <CardHeader>
                <CardTitle>Task Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {canSubmit && (
                      <>
                        {task.status !== 'in-progress' && (
                          <Button 
                            onClick={() => handleTaskAction('in-progress')}
                            variant="outline"
                          >
                            Start Task
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => handleTaskAction('submitted')}
                          disabled={!task.observationStatus}
                          title={!task.observationStatus ? "Set 'Observations Found?' before submitting" : ""}
                        >
                          Submit for Review
                        </Button>
                      </>
                    )}
                    
                    {canChecker1Action && (
                      <>
                        <Button 
                          onClick={() => handleTaskAction('approved')}
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve & Forward to Checker 2
                        </Button>
                        
                        <Button 
                          onClick={() => handleTaskAction('rejected')}
                          variant="outline"
                          className="bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {canChecker2Action && (
                      <>
                        <Button 
                          onClick={() => handleTaskAction('approved')}
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Final Approval
                        </Button>
                        
                        <Button 
                          onClick={() => handleTaskAction('rejected')}
                          variant="outline"
                          className="bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
