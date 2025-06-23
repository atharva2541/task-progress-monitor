
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Settings, Calendar, BarChart3, AlertTriangle, Plus } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Checking user authentication state:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    if (!isLoading) {
      if (user) {
        console.log("Index: User is authenticated, showing dashboard");
      } else {
        console.log("Index: User is not authenticated, navigating to auth");
        navigate('/auth');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Audit Tracker</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Admin Dashboard - Full system access' : 'User Dashboard - Your tasks and activities'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/tasks')}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Task Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create, assign, and track tasks through their complete lifecycle
            </CardDescription>
            <Button variant="outline" size="sm" className="mt-3">
              <Plus className="h-4 w-4 mr-2" />
              Manage Tasks
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/users')}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">User Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add, edit, and manage user accounts and permissions
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-3">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/calendar')}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Calendar View</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              View tasks and deadlines in calendar format
            </CardDescription>
            <Button variant="outline" size="sm" className="mt-3">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin')}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Admin Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analytics, reporting, and system overview
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-3">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/settings')}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">System Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure system settings and preferences
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-3">
                <Settings className="h-4 w-4 mr-2" />
                Configure System
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/escalations')}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Escalations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              View and manage escalated tasks requiring attention
            </CardDescription>
            <Button variant="outline" size="sm" className="mt-3">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Escalations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
          <CardDescription>
            Access your most frequently used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/my-tasks')}>
              My Tasks
            </Button>
            <Button variant="outline" onClick={() => navigate('/tasks-to-review')}>
              Tasks to Review
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => navigate('/admin/tasks')}>
                  All Tasks
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/productivity')}>
                  Productivity Analytics
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
