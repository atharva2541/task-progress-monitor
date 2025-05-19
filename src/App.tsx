
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import TaskList from "@/pages/TaskList";
import TaskDetail from "@/pages/TaskDetail";
import AdminTasksPage from "@/pages/admin/AdminTasksPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import SystemSettingsPage from "@/pages/admin/SystemSettingsPage";
import CalendarPage from "@/pages/CalendarPage";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from './contexts/ThemeContext';
import UserSettingsPage from './pages/UserSettingsPage';
import MyTasksPage from './pages/tasks/MyTasksPage';
import TasksToReviewPage from './pages/tasks/TasksToReviewPage';
import TeamDashboardPage from './pages/dashboard/TeamDashboardPage';
import EscalationsPage from './pages/escalations/EscalationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <NotificationProvider>
              <TaskProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Root route that redirects based on auth status */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Dashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected routes */}
                    <Route
                      path="/tasks"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <TaskList />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/tasks/:taskId"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <TaskDetail />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/my-tasks"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <MyTasksPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/tasks-to-review"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <TasksToReviewPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/team-dashboard"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <TeamDashboardPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/escalations"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <EscalationsPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/admin/tasks"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <AdminTasksPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <UserManagementPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/admin/productivity"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <ProductivityAnalyticsPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <CalendarPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Settings routes */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <SettingsPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/system-settings"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <SystemSettingsPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                    
                    {/* User settings route */}
                    <Route path="/user-settings" element={<ProtectedRoute><AppLayout><UserSettingsPage /></AppLayout></ProtectedRoute>} />
                  </Routes>
                </BrowserRouter>
              </TaskProvider>
            </NotificationProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
