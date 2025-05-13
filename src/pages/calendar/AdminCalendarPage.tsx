
import React, { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
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

const AdminCalendarPage = () => {
  const { tasks } = useTask();
  const { users } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  // Filter tasks based on selected user
  const filteredTasks = tasks.filter(task => {
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
      />
    </div>
  );
};

export default AdminCalendarPage;
