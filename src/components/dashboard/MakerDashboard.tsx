import { useAuth } from '@/contexts/AuthContext';
import { useAuthorizedTasks } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, 
  AlertCircle, 
  Check, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MakerDashboard() {
  const { user } = useAuth();
  const { tasks } = useAuthorizedTasks(); // Using authorized tasks
  const navigate = useNavigate();

  if (!user) return null;

  // Only get tasks where this user is the maker
  const userTasks = tasks.filter(task => task.assignedTo === user.id);
  
  // Calculate task metrics
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
  const submittedTasks = userTasks.filter(task => task.status === 'submitted');
  const approvedTasks = userTasks.filter(task => task.status === 'approved');
  const rejectedTasks = userTasks.filter(task => task.status === 'rejected');
  
  // Calculate due tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueTodayTasks = userTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && 
           (task.status === 'pending' || task.status === 'in-progress');
  });
  
  const overdueTasksCount = userTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime() && 
           (task.status === 'pending' || task.status === 'in-progress');
  }).length;
  
  // Calculate completion rates
  const totalCompleted = approvedTasks.length;
  const totalAssigned = userTasks.length;
  const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Your task dashboard and updates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks awaiting action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks currently in work
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card className={overdueTasksCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className={`h-4 w-4 ${overdueTasksCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueTasksCount > 0 ? "text-red-600" : ""}`}>
              {overdueTasksCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks past their due date
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Due Today</CardTitle>
            <CardDescription>Tasks that need your attention today</CardDescription>
          </CardHeader>
          <CardContent>
            {dueTodayTasks.length > 0 ? (
              <div className="space-y-4">
                {dueTodayTasks.map(task => (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs font-medium 
                          ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Start Task
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-muted-foreground">No tasks due today!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recently updated tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...submittedTasks, ...approvedTasks, ...rejectedTasks]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        {task.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {task.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                        {task.status === 'submitted' && <ClipboardCheck className="h-5 w-5 text-purple-500" />}
                        <h4 className="font-medium">{task.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.status === 'approved' 
                          ? 'Your task was approved!' 
                          : task.status === 'rejected'
                          ? 'Your task was sent back for changes.'
                          : 'Awaiting review by checker.'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(task.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <span 
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${task.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        task.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-purple-100 text-purple-800'}`}
                    >
                      {task.status}
                    </span>
                  </div>
              ))}
              
              {[...submittedTasks, ...approvedTasks, ...rejectedTasks].length === 0 && (
                <div className="flex flex-col items-center justify-center h-40">
                  <Clock className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
