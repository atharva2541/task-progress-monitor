
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
import { UserRole } from '@/types';

const AdminCalendarPage = () => {
  const { tasks } = useTask();
  const { users } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  
  // Filter tasks based on selected user and role
  const filteredTasks = tasks.filter(task => {
    // Filter by selected user if not "all"
    if (selectedUserId !== 'all' && 
        task.assignedTo !== selectedUserId && 
        task.checker1 !== selectedUserId && 
        task.checker2 !== selectedUserId) {
      return false;
    }
    
    // Filter by role if not "all"
    if (roleFilter !== 'all') {
      const user = users.find(u => u.id === selectedUserId);
      if (!user) return false;
      
      if (roleFilter === 'maker' && task.assignedTo !== selectedUserId) return false;
      if (roleFilter === 'checker1' && task.checker1 !== selectedUserId) return false;
      if (roleFilter === 'checker2' && task.checker2 !== selectedUserId) return false;
    }
    
    return true;
  });

  // Filter users by role
  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter(user => user.role === roleFilter);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Filter by Role</label>
              <Select
                value={roleFilter}
                onValueChange={(value: UserRole | 'all') => {
                  setRoleFilter(value);
                  setSelectedUserId('all'); // Reset user selection when role changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="maker">Makers</SelectItem>
                  <SelectItem value="checker1">First Checkers</SelectItem>
                  <SelectItem value="checker2">Second Checkers</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  {filteredUsers.map(user => (
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
