
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SupabaseTaskProvider } from "@/contexts/SupabaseTaskContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import TasksToReviewPage from "./pages/tasks/TasksToReviewPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import ProductivityAnalyticsPage from "./pages/admin/ProductivityAnalyticsPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <SupabaseTaskProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks-to-review" element={<TasksToReviewPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/admin/users" element={<UserManagementPage />} />
                    <Route path="/admin/tasks" element={<AdminTasksPage />} />
                    <Route path="/admin/productivity" element={<ProductivityAnalyticsPage />} />
                    <Route path="/admin/logs" element={<AdminLogsPage />} />
                    <Route path="/system-settings" element={<SystemSettingsPage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </SupabaseTaskProvider>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
