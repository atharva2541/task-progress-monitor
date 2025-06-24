
import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import AdminCalendarPage from '@/pages/calendar/AdminCalendarPage';
import MakerCalendarPage from '@/pages/calendar/MakerCalendarPage';
import Checker1CalendarPage from '@/pages/calendar/Checker1CalendarPage';
import Checker2CalendarPage from '@/pages/calendar/Checker2CalendarPage';
import { useSupabaseTasks } from '@/contexts/SupabaseTaskContext';
import { Card, CardContent } from '@/components/ui/card';

const CalendarPage = () => {
  const { profile: user } = useSupabaseAuth();
  const { loading: isCalendarLoading } = useSupabaseTasks();

  if (!user) return null;

  // Show loading indicator while loading calendar tasks
  if (isCalendarLoading) {
    return (
      <Card className="my-8">
        <CardContent className="flex items-center justify-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" 
          role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render the appropriate calendar based on user role
  switch (user.role) {
    case 'admin':
      return <AdminCalendarPage />;
    case 'maker':
      return <MakerCalendarPage />;
    case 'checker1':
      return <Checker1CalendarPage />;
    case 'checker2':
      return <Checker2CalendarPage />;
    default:
      return <div>Calendar not available for your role.</div>;
  }
};

export default CalendarPage;
