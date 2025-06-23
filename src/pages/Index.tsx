
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const Index = () => {
  const { user, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Checking user authentication state:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    // Wait for authentication state to be fully loaded before redirecting
    if (!isLoading) {
      if (user) {
        console.log("Index: User is authenticated, staying on main page");
        // User is authenticated, stay on the main page - no redirect needed
      } else {
        console.log("Index: User is not authenticated, navigating to auth");
        navigate('/auth');
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

  // If user is not authenticated, don't render anything as we're redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, show the main dashboard/home content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Audit Tracker</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Tasks Overview</h2>
          <p className="text-gray-600">Manage and track your tasks efficiently.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
          <p className="text-gray-600">View your recent activities and updates.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
          <p className="text-gray-600">Access frequently used features quickly.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
