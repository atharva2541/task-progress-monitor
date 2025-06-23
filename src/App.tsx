import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/SupabaseAuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminLogProvider } from "./contexts/AdminLogContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskList = lazy(() => import('./pages/tasks/TaskList'));
const TaskDetail = lazy(() => import('./pages/tasks/TaskDetail'));
const MyTasksPage = lazy(() => import('./pages/tasks/MyTasksPage'));
const TasksToReviewPage = lazy(() => import('./pages/tasks/TasksToReviewPage'));
const TaskHistoryPage = lazy(() => import('./pages/tasks/TaskHistoryPage'));
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const AdminCalendarPage = lazy(() => import('./pages/calendar/AdminCalendarPage'));
const MakerCalendarPage = lazy(() => import('./pages/calendar/MakerCalendarPage'));
const Checker1CalendarPage = lazy(() => import('./pages/calendar/Checker1CalendarPage'));
const Checker2CalendarPage = lazy(() => import('./pages/calendar/Checker2CalendarPage'));
const EscalationsPage = lazy(() => import('./pages/escalations/EscalationsPage'));
const TeamDashboardPage = lazy(() => import('./pages/team/TeamDashboardPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AdminTasksPage = lazy(() => import('./pages/admin/AdminTasksPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'));
const ProductivityAnalyticsPage = lazy(() => import('./pages/admin/ProductivityAnalyticsPage'));
const UserSettingsPage = lazy(() => import('./pages/UserSettingsPage'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <AdminLogProvider>
              <TaskProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
                    <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading...</div>}>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
                        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
                        <Route path="/tasks/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
                        <Route path="/tasks/review" element={<ProtectedRoute><TasksToReviewPage /></ProtectedRoute>} />
                        <Route path="/tasks/history" element={<ProtectedRoute><TaskHistoryPage /></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                        <Route path="/calendar/admin" element={<ProtectedRoute><AdminCalendarPage /></ProtectedRoute>} />
                        <Route path="/calendar/maker" element={<ProtectedRoute><MakerCalendarPage /></ProtectedRoute>} />
                        <Route path="/calendar/checker1" element={<ProtectedRoute><Checker1CalendarPage /></ProtectedRoute>} />
                        <Route path="/calendar/checker2" element={<ProtectedRoute><Checker2CalendarPage /></ProtectedRoute>} />
                        <Route path="/escalations" element={<ProtectedRoute><EscalationsPage /></ProtectedRoute>} />
                        <Route path="/dashboard/team" element={<ProtectedRoute><TeamDashboardPage /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
                        <Route path="/admin/tasks" element={<ProtectedRoute><AdminTasksPage /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                        <Route path="/admin/system-settings" element={<ProtectedRoute><SystemSettingsPage /></ProtectedRoute>} />
                        <Route path="/admin/logs" element={<ProtectedRoute><AdminLogsPage /></ProtectedRoute>} />
                        <Route path="/admin/analytics" element={<ProtectedRoute><ProductivityAnalyticsPage /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <Toaster />
                    <Sonner />
                  </div>
                </BrowserRouter>
              </TaskProvider>
            </AdminLogProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
