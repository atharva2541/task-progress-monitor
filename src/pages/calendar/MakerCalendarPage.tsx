
import React from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const MakerCalendarPage = () => {
  const { tasks } = useTask();
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get tasks assigned to this maker
  const makerTasks = tasks.filter(task => task.assignedTo === user.id);
  
  return (
    <TaskCalendar
      tasks={makerTasks}
      title="My Task Calendar"
      description="View and manage your upcoming and submitted tasks"
    />
  );
};

export default MakerCalendarPage;
