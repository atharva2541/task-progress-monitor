
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { adminRoutes } from './adminRoutes';
import { taskRoutes } from './taskRoutes';

import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import TaskDetail from '@/pages/TaskDetail';
import TaskList from '@/pages/TaskList';
import CalendarPage from '@/pages/CalendarPage';
import UserSettingsPage from '@/pages/UserSettingsPage';
import MyTasksPage from '@/pages/tasks/MyTasksPage';
import TasksToReviewPage from '@/pages/tasks/TasksToReviewPage';
import TeamDashboardPage from '@/pages/dashboard/TeamDashboardPage';
import EscalationsPage from '@/pages/escalations/EscalationsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks" element={<TaskList />} />
      <Route path="/tasks/:id" element={<TaskDetail />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/user-settings" element={<UserSettingsPage />} />
      <Route path="/my-tasks" element={<MyTasksPage />} />
      <Route path="/tasks-to-review" element={<TasksToReviewPage />} />
      <Route path="/team-dashboard" element={<TeamDashboardPage />} />
      <Route path="/escalations" element={<EscalationsPage />} />
      
      {/* Admin routes */}
      {adminRoutes}
      
      {/* Task routes */}
      {taskRoutes}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
