
import React from 'react';
import { useAuthorizedTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const MakerCalendarPage = () => {
  const { calendarTasks, isCalendarLoading } = useAuthorizedTasks(); // Using authorized tasks
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get tasks assigned to this maker - ensuring we only get tasks where the user is the maker
  const makerTasks = calendarTasks.filter(task => task.assignedTo === user.id);
  
  return (
    <TaskCalendar
      tasks={makerTasks}
      title="My Task Calendar"
      description="View and manage your upcoming and submitted tasks"
      isLoading={isCalendarLoading}
    />
  );
};

export default MakerCalendarPage;
