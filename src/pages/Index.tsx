
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const Index = () => {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Checking user authentication state:", user ? "Authenticated" : "Not authenticated", "loading:", loading);
    
    // Wait for authentication state to be fully loaded before redirecting
    if (!loading) {
      if (user) {
        console.log("Index: User is authenticated, staying on dashboard");
        // Don't redirect if user is already authenticated and on the main page
      } else {
        console.log("Index: User is not authenticated, navigating to auth");
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  // Show a loading indicator while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, the useEffect will handle the redirect
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show a simple message or redirect will happen
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="space-y-4 text-center">
        <p className="text-lg">Welcome! Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
