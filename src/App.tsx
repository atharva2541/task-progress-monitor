
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
                  <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/tasks" element={<AppLayout><TasksPage /></AppLayout>} />
                  <Route path="/tasks-to-review" element={<AppLayout><TasksToReviewPage /></AppLayout>} />
                  <Route path="/calendar" element={<AppLayout><CalendarPage /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                  <Route path="/admin/users" element={<AppLayout><UserManagementPage /></AppLayout>} />
                  <Route path="/admin/tasks" element={<AppLayout><AdminTasksPage /></AppLayout>} />
                  <Route path="/admin/productivity" element={<AppLayout><ProductivityAnalyticsPage /></AppLayout>} />
                  <Route path="/admin/logs" element={<AppLayout><AdminLogsPage /></AppLayout>} />
                  <Route path="/system-settings" element={<AppLayout><SystemSettingsPage /></AppLayout>} />
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
