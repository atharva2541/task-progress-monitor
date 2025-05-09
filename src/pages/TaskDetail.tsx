
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Tag,
  User,
  UserCheck,
  XCircle,
  MessageCircle,
  Play
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { getTaskById, updateTaskStatus } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!taskId || !user) {
    return null;
  }
  
  const task = getTaskById(taskId);
  
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">The task you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }
  
  const isMaker = user.role === 'maker' && task.assignedTo === user.id;
  const isReviewer = (user.role === 'checker1' && task.checker1 === user.id) || 
                     (user.role === 'checker2' && task.checker2 === user.id);
  const isAdmin = user.role === 'admin';
  
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
  
  const handleStartTask = () => {
    updateTaskStatus(task.id, 'in-progress');
  };
  
  const handleSubmitTask = () => {
    setIsSubmitting(true);
    updateTaskStatus(task.id, 'submitted', comment);
    setComment('');
    setIsSubmitting(false);
  };
  
  const handleApproveTask = () => {
    updateTaskStatus(task.id, 'approved', comment);
    setComment('');
  };
  
  const handleRejectTask = () => {
    updateTaskStatus(task.id, 'rejected', comment);
    setComment('');
  };
  
  const canStart = isMaker && task.status === 'pending';
  const canSubmit = isMaker && task.status === 'in-progress';
  const canReview = isReviewer && task.status === 'submitted';
  
  // Check if task is overdue
  const isOverdue = new Date(task.dueDate) < new Date() && 
                   (task.status === 'pending' || task.status === 'in-progress');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Task Details</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{task.name}</CardTitle>
                  <CardDescription>{task.category}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                  {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p>{task.description}</p>
                </div>
                
                <Tabs defaultValue="comments">
                  <TabsList>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comments" className="mt-4">
                    {task.comments && task.comments.length > 0 ? (
                      <div className="space-y-4">
                        {task.comments.map(comment => (
                          <div key={comment.id} className="bg-muted p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">User {comment.userId}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                                <p className="mt-1">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mb-2" />
                        <p>No comments yet</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2" />
                      <p>Task history will be available in future updates</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4 border-t pt-6">
              {(canReview || canSubmit) && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  {canSubmit && (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="default" 
                        onClick={handleSubmitTask}
                        disabled={isSubmitting}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submit for Review
                      </Button>
                    </div>
                  )}
                  {canReview && (
                    <div className="flex justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reject the task and send it back to the maker for revisions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRejectTask}>
                              Reject Task
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button 
                        onClick={handleApproveTask}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {canStart && (
                <div className="flex justify-end">
                  <Button 
                    variant="default" 
                    onClick={handleStartTask}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Task
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due Date</span>
                </div>
                <span className="font-medium">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Priority</span>
                </div>
                <span>{getPriorityBadge(task.priority)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Frequency</span>
                </div>
                <Badge variant="outline">{task.frequency}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <span>{task.category}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assigned Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Maker</span>
                </div>
                <span className="font-medium">User {task.assignedTo}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                  <span>Checker 1</span>
                </div>
                <span className="font-medium">User {task.checker1}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                  <span>Checker 2</span>
                </div>
                <span className="font-medium">User {task.checker2}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
