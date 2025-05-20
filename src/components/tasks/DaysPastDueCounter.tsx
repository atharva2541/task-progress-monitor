
import { useEffect, useState } from 'react';
import { calculateDaysOverdue } from '@/utils/date-utils';
import { Badge } from '@/components/ui/badge';

interface DaysPastDueCounterProps {
  dueDate: string;
  status?: string; // Add optional status prop
  wasSubmittedLate?: boolean; // Add flag for late submission
}

export function DaysPastDueCounter({ dueDate, status, wasSubmittedLate }: DaysPastDueCounterProps) {
  const [daysFromDue, setDaysFromDue] = useState(calculateDaysOverdue(dueDate));
  
  // Recalculate days when due date changes
  useEffect(() => {
    // If task is approved, we don't show it as overdue anymore
    if (status === 'approved') {
      setDaysFromDue(0);
    } else {
      setDaysFromDue(calculateDaysOverdue(dueDate));
    }
  }, [dueDate, status]);

  // Update the counter daily at midnight
  useEffect(() => {
    const updateDaysCounter = () => {
      if (status === 'approved') {
        setDaysFromDue(0);
      } else {
        setDaysFromDue(calculateDaysOverdue(dueDate));
      }
    };

    // Calculate milliseconds until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set up the timeout to update at midnight
    const timeoutId = setTimeout(() => {
      updateDaysCounter();
      // Then set up a daily interval
      const intervalId = setInterval(updateDaysCounter, 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, [dueDate, status]);

  // Determine styling based on days value
  const getBadgeStyles = () => {
    if (status === 'approved') {
      // Approved tasks get a completed style
      return wasSubmittedLate 
        ? 'bg-green-100 text-green-800 border-green-200' // Green with a note that it was late
        : 'bg-green-100 text-green-800 border-green-200'; // Just green for on-time approvals
    } else if (daysFromDue > 0) {
      // Overdue
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (daysFromDue < 0) {
      // Upcoming
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      // Due today
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Format the display text
  const getDisplayText = () => {
    if (status === 'approved') {
      return wasSubmittedLate 
        ? 'Approved (submitted late)' 
        : 'Completed on time';
    } else if (daysFromDue > 0) {
      return `+${daysFromDue} day${daysFromDue !== 1 ? 's' : ''} overdue`;
    } else if (daysFromDue < 0) {
      const daysRemaining = Math.abs(daysFromDue);
      return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
    } else {
      return 'Due today';
    }
  };

  return (
    <Badge variant="outline" className={getBadgeStyles()}>
      {getDisplayText()}
    </Badge>
  );
}
