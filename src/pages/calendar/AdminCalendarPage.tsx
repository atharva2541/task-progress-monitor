
import React, { useState } from 'react';
import { useSupabaseTasks } from '@/contexts/SupabaseTaskContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const AdminCalendarPage = () => {
  const { profile: user, getAllProfiles } = useSupabaseAuth();
  const { tasks, loading: isCalendarLoading } = useSupabaseTasks();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Only admins should have full visibility
  const isAdmin = user?.role === 'admin';
  
  React.useEffect(() => {
    if (isAdmin) {
      getAllProfiles().then(setProfiles);
    }
  }, [isAdmin, getAllProfiles]);
  
  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="my-8">
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access the admin calendar.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Filter tasks based on selected user
  const filteredTasks = tasks.filter(task => {
    // Filter by selected user if not "all"
    if (selectedUserId !== 'all' && 
        task.assigned_to !== selectedUserId && 
        task.checker1 !== selectedUserId && 
        task.checker2 !== selectedUserId) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Filter by User</label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <TaskCalendar
        tasks={filteredTasks}
        title="Task Calendar"
        description={
          selectedUserId === 'all'
            ? 'Viewing all tasks across the organization'
            : `Viewing tasks for ${profiles.find(u => u.id === selectedUserId)?.name || 'selected user'}`
        }
        isLoading={isCalendarLoading}
      />
    </div>
  );
};

export default AdminCalendarPage;
