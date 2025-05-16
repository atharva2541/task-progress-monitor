
import React from 'react';
import { User, UserRole } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserList = ({ users, onEditUser, onDeleteUser }: UserListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Primary Role</TableHead>
          <TableHead>All Roles</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-audit-purple-100 flex items-center justify-center text-audit-purple-600">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Shield size={16} />
                )}
              </div>
              <span>{user.name}</span>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <span className="capitalize">{user.role}</span>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {user.roles ? user.roles.map((role) => (
                  <span 
                    key={role} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-audit-purple-100 text-audit-purple-800"
                  >
                    {role.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                )) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-audit-purple-100 text-audit-purple-800">
                    {user.role.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUser(user)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDeleteUser(user)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserList;
