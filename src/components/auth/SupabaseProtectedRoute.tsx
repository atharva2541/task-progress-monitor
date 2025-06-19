
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const SupabaseProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default SupabaseProtectedRoute;
