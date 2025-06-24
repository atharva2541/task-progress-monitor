
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { MakerDashboard } from '@/components/dashboard/MakerDashboard';
import { CheckerDashboard } from '@/components/dashboard/CheckerDashboard';

const Dashboard = () => {
  const { profile, user, loading } = useSupabaseAuth();

  console.log('Dashboard render:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileRole: profile?.role 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Dashboard: No user, this should not happen in protected route');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <p className="text-xl">Authentication required</p>
          <p className="text-sm text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('Dashboard: User exists but no profile loaded yet');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xl">Loading Profile...</p>
          <p className="text-sm text-muted-foreground">Setting up your dashboard</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering dashboard for role:', profile.role);

  // Render the appropriate dashboard based on user role
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'maker':
      return <MakerDashboard />;
    case 'checker1':
    case 'checker2':
      return <CheckerDashboard />;
    default:
      console.log('Dashboard: Unknown role:', profile.role);
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="space-y-4 text-center">
            <p className="text-xl">Unknown user role: {profile.role}</p>
            <p className="text-sm text-muted-foreground">Please contact your administrator</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
