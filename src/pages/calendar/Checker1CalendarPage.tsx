
import React from 'react';
import { useAuthorizedTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const Checker1CalendarPage = () => {
  const { tasks } = useAuthorizedTasks(); // Using authorized tasks
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get tasks assigned to this checker1 - ensuring we only get tasks where the user is checker1
  const checker1Tasks = tasks.filter(task => task.checker1 === user.id);
  
  return (
    <TaskCalendar
      tasks={checker1Tasks}
      title="Checker 1 Calendar"
      description="View and manage tasks requiring your first-level review"
    />
  );
};

export default Checker1CalendarPage;
