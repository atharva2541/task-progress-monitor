
import React from 'react';
import { useSupabaseTasks } from '@/contexts/SupabaseTaskContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const MakerCalendarPage = () => {
  const { tasks, loading: isCalendarLoading } = useSupabaseTasks();
  const { profile: user } = useSupabaseAuth();
  
  if (!user) return null;
  
  // Get tasks assigned to this maker - ensuring we only get tasks where the user is the maker
  const makerTasks = tasks.filter(task => task.assigned_to === user.id);
  
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
