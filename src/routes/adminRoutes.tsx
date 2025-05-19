
import React from 'react';
import { Route } from 'react-router-dom';
import AdminTasksPage from '@/pages/admin/AdminTasksPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import SystemSettingsPage from '@/pages/admin/SystemSettingsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import UserProductivityPage from '@/pages/admin/UserProductivityPage';

export const adminRoutes = (
  <>
    <Route path="/admin/tasks" element={<AdminTasksPage />} />
    <Route path="/admin/users" element={<UserManagementPage />} />
    <Route path="/admin/system" element={<SystemSettingsPage />} />
    <Route path="/admin/settings" element={<SettingsPage />} />
    <Route path="/admin/user-productivity" element={<UserProductivityPage />} />
  </>
);
