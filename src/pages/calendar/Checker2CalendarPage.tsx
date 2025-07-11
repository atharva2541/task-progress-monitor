
import React from 'react';
import { useSupabaseTasks } from '@/contexts/SupabaseTaskContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const Checker2CalendarPage = () => {
  const { tasks, isLoading: isCalendarLoading } = useSupabaseTasks();
  const { profile: user } = useSupabaseAuth();
  
  if (!user) return null;
  
  // Get tasks assigned to this checker2 - ensure we only get tasks where the user is checker2
  const checker2Tasks = tasks.filter(task => 
    task.checker2 === user.id && 
    (task.status === 'checker1-approved' || task.status === 'approved' || task.status === 'rejected')
  );
  
  return (
    <TaskCalendar
      tasks={checker2Tasks}
      title="Checker 2 Calendar"
      description="View and manage tasks requiring your final approval"
      isLoading={isCalendarLoading}
    />
  );
};

export default Checker2CalendarPage;
