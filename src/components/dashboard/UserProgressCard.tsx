
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UserProgressCardProps {
  userId: string;
  userName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  reviewTasks: number;
  rejectedTasks: number;
}

export function UserProgressCard({
  userId,
  userName,
  totalTasks,
  completedTasks,
  pendingTasks,
  reviewTasks,
  rejectedTasks
}: UserProgressCardProps) {
  // Calculate percentages
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingRate = totalTasks ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const reviewRate = totalTasks ? Math.round((reviewTasks / totalTasks) * 100) : 0;
  const rejectionRate = totalTasks ? Math.round((rejectedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">{userName}'s Performance</h3>
        <p className="text-sm text-muted-foreground">
          Task completion statistics for selected user
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Completion Rate</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>In Progress/Pending</span>
            <span className="font-medium">{pendingRate}%</span>
          </div>
          <Progress value={pendingRate} className="h-2 bg-gray-100">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pendingRate}%` }} />
          </Progress>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>In Review</span>
            <span className="font-medium">{reviewRate}%</span>
          </div>
          <Progress value={reviewRate} className="h-2 bg-gray-100">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${reviewRate}%` }} />
          </Progress>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Rejection Rate</span>
            <span className="font-medium">{rejectionRate}%</span>
          </div>
          <Progress value={rejectionRate} className="h-2 bg-gray-100">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${rejectionRate}%` }} />
          </Progress>
        </div>
      </div>
    </div>
  );
}
