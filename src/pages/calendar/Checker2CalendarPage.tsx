
import React from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const Checker2CalendarPage = () => {
  const { tasks } = useTask();
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get tasks assigned to this checker2
  const checker2Tasks = tasks.filter(task => task.checker2 === user.id);
  
  return (
    <TaskCalendar
      tasks={checker2Tasks}
      title="Checker 2 Calendar"
      description="View and manage tasks requiring your final approval"
    />
  );
};

export default Checker2CalendarPage;
