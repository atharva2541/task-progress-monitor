import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SupabaseProtectedRoute from "@/components/auth/SupabaseProtectedRoute";
import AuthPage from "@/components/auth/AuthPage";
import Index from "./pages/Index";
import "./App.css";
import AdminPage from "./pages/AdminPage";
import TaskDetailsPage from "./pages/TaskDetailsPage";
import TaskManagementPage from "./pages/TaskManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/*"
                  element={
                    <SupabaseProtectedRoute>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/tasks" element={<TaskManagementPage />} />
                        <Route path="/tasks/:id" element={<TaskDetailsPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/users" element={<UserManagementPage />} />
                        <Route path="/admin/settings" element={<SystemSettingsPage />} />
                      </Routes>
                    </SupabaseProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
