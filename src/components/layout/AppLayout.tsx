
import { ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopNavigation } from './TopNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useSupabaseAuth();

  if (!user) {
    return <>{children}</>; // Return content without layout for unauthenticated users
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full">
          <TopNavigation />
          <main className="flex-1 p-6 overflow-auto">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
          <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Audit Tracker. All rights reserved.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
