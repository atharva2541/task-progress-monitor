
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TaskNavigationLinksProps {
  className?: string;
}

export function TaskNavigationLinks({ className }: TaskNavigationLinksProps) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Check if the user has any checker roles
  const userRoles = user.roles || [user.role];
  const hasCheckerRole = userRoles.includes('checker1') || userRoles.includes('checker2');
  
  return (
    <div className={cn("space-y-1", className)}>
      <NavLink
        to="/my-tasks"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )
        }
      >
        <FileText className="h-4 w-4" />
        <span>My Tasks</span>
      </NavLink>
      
      {hasCheckerRole && (
        <NavLink
          to="/tasks-to-review"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <CheckSquare className="h-4 w-4" />
          <span>Tasks to Review</span>
        </NavLink>
      )}
    </div>
  );
}
