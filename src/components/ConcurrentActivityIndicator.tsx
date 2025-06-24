
import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConcurrentActivityIndicatorProps {
  taskId?: string;
  showUserCount?: boolean;
  className?: string;
}

export const ConcurrentActivityIndicator = ({ 
  taskId, 
  showUserCount = true, 
  className = "" 
}: ConcurrentActivityIndicatorProps) => {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [hasConflicts, setHasConflicts] = useState(false);

  // Simulate tracking active users and conflicts
  useEffect(() => {
    // In a real implementation, this would connect to a real-time presence system
    const interval = setInterval(() => {
      // Simulate some activity
      setActiveUsers(Math.floor(Math.random() * 3));
      setLastActivity(new Date());
      setHasConflicts(Math.random() > 0.9); // 10% chance of conflicts
    }, 5000);

    return () =>clearInterval(interval);
  }, [taskId]);

  if (!showUserCount && activeUsers === 0 && !hasConflicts) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        {activeUsers > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activeUsers}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{activeUsers} user{activeUsers > 1 ? 's' : ''} currently viewing</p>
            </TooltipContent>
          </Tooltip>
        )}

        {lastActivity && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date().getTime() - lastActivity.getTime() < 30000 ? 'Now' : 'Recent'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last activity: {lastActivity.toLocaleTimeString()}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {hasConflicts && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Conflict
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Potential concurrent modification detected</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
