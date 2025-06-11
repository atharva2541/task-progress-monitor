
import React, { useState } from 'react';
import { useTask, useAuthorizedTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
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
  // Use regular tasks for admin, authorized tasks for non-admin
  const { user } = useAuth();
  const { calendarTasks, isCalendarLoading } = user?.role === 'admin' ? useTask() : useAuthorizedTasks();
  const { users } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  // Only admins should have full visibility
  const isAdmin = user?.role === 'admin';
  
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
  const filteredTasks = calendarTasks.filter(task => {
    // Filter by selected user if not "all"
    if (selectedUserId !== 'all' && 
        task.assignedTo !== selectedUserId && 
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
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name} ({user.role})</SelectItem>
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
            : `Viewing tasks for ${users.find(u => u.id === selectedUserId)?.name || 'selected user'}`
        }
        isLoading={isCalendarLoading}
      />
    </div>
  );
};

export default AdminCalendarPage;
