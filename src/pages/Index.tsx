
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Checking user authentication state:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    // Wait for authentication state to be fully loaded before redirecting
    if (!isLoading) {
      if (user) {
        console.log("Index: User is authenticated, navigating to dashboard");
        navigate('/');
      } else {
        console.log("Index: User is not authenticated, navigating to login");
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  // Show a loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return null;
};

export default Index;
