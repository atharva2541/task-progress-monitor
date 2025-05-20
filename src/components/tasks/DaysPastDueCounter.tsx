
import { useEffect, useState } from 'react';
import { calculateDaysOverdue } from '@/utils/date-utils';
import { Badge } from '@/components/ui/badge';

interface DaysPastDueCounterProps {
  dueDate: string;
}

export function DaysPastDueCounter({ dueDate }: DaysPastDueCounterProps) {
  const [daysFromDue, setDaysFromDue] = useState(calculateDaysOverdue(dueDate));
  
  // Recalculate days when due date changes
  useEffect(() => {
    setDaysFromDue(calculateDaysOverdue(dueDate));
  }, [dueDate]);

  // Update the counter daily at midnight
  useEffect(() => {
    const updateDaysCounter = () => {
      setDaysFromDue(calculateDaysOverdue(dueDate));
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
  }, [dueDate]);

  // Determine styling based on days value
  const getBadgeStyles = () => {
    if (daysFromDue > 0) {
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
    if (daysFromDue > 0) {
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
