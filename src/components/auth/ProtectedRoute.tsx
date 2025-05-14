
import { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Debug information to help understand why redirects might be happening
  useEffect(() => {
    console.log('ProtectedRoute - Current path:', location.pathname);
    console.log('ProtectedRoute - User authenticated:', !!user);
  }, [location.pathname, user]);

  if (!user) {
    console.log('ProtectedRoute - Redirecting to login because user is not authenticated');
    return <Navigate to="/login" replace />;
  }

  // If we have a user, render the children or the Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
