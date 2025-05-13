
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminCalendarPage from '@/pages/calendar/AdminCalendarPage';
import MakerCalendarPage from '@/pages/calendar/MakerCalendarPage';
import Checker1CalendarPage from '@/pages/calendar/Checker1CalendarPage';
import Checker2CalendarPage from '@/pages/calendar/Checker2CalendarPage';

const CalendarPage = () => {
  const { user } = useAuth();

  if (!user) return null;

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
