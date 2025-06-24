
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { MakerDashboard } from '@/components/dashboard/MakerDashboard';
import { CheckerDashboard } from '@/components/dashboard/CheckerDashboard';

const Dashboard = () => {
  const { profile } = useSupabaseAuth();

  if (!profile) return null;

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
      return <div>Unknown user role</div>;
  }
};

export default Dashboard;
