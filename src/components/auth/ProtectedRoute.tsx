
import { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Debug information to help understand why redirects might be happening
  useEffect(() => {
    console.log('ProtectedRoute - Current path:', location.pathname);
    console.log('ProtectedRoute - User authenticated:', !!user);
    console.log('ProtectedRoute - isLoading:', isLoading);
  }, [location.pathname, user, isLoading]);

  // Don't redirect during loading state to prevent redirect flashes
  if (isLoading) {
    console.log('ProtectedRoute - Still loading authentication state, showing loading...');
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
    console.log('ProtectedRoute - Redirecting to login because user is not authenticated');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If we have a user, render the children or the Outlet
  console.log('ProtectedRoute - User authenticated, rendering content');
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
