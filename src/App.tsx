
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
import CalendarPage from "@/pages/CalendarPage";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TaskProvider>
          <NotificationProvider>
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
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <CalendarPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </TaskProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
