
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppRoutes } from "@/routes";
import { ThemeProvider } from './contexts/ThemeContext';

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
                  <AppRoutes />
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
