import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/types';
import { Users, Mail } from 'lucide-react';
import UserList from '@/components/admin/users/UserList';
import UserFormDialog, { UserFormValues } from '@/components/admin/users/UserFormDialog';
import DeleteUserDialog from '@/components/admin/users/DeleteUserDialog';

const UserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Function to check if email already exists
  const checkEmailExists = (email: string, userId?: string): boolean => {
    return users.some(user => {
      // If editing a user, exclude the current user from the check
      if (userId && user.id === userId) return false;
      return user.email.toLowerCase() === email.toLowerCase();
    });
  };

  // Handle form submission
  const handleSubmit = async (data: UserFormValues) => {
    // Reset previous email error
    setEmailError(null);
    
    // Check if email already exists
    const emailExists = checkEmailExists(data.email, userToEdit?.id);
    
    if (emailExists) {
      setEmailError(`A user with the email ${data.email} already exists`);
      return;
    }
    
    // Ensure that if admin role is selected, it's the only role
    let finalRoles = [...data.roles];
    let finalRole = data.role;
    
    if (data.roles.includes('admin')) {
      finalRoles = ['admin'];
      finalRole = 'admin';
    } else if (data.role === 'admin') {
      // If primary role is admin but not in roles
      finalRoles = ['admin'];
    }
    
    if (userToEdit) {
      // Update existing user
      const result = await updateUser(userToEdit.id, {
        name: data.name,
        email: data.email,
        role: finalRole,
        roles: finalRoles
      });
      
      if (result.success) {
        toast({
          title: 'User Updated',
          description: `${data.name} has been updated successfully.`,
        });
        setUserToEdit(null);
        setIsDialogOpen(false);
      } else {
        setEmailError(result.message || 'Failed to update user');
        return;
      }
    } else {
      // Create new user
      const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        role: finalRole,
        roles: finalRoles
      };
      
      const result = await addUser(newUser);
      
      if (result.success) {
        toast({
          title: 'User Created Successfully',
          description: `${data.name} has been created and a welcome email with login instructions has been sent to ${data.email}.`,
        });
        setIsDialogOpen(false);
      } else {
        setEmailError(result.message || 'Failed to create user');
        return;
      }
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const result = await deleteUser(userToDelete.id);
      
      if (result.success) {
        toast({
          title: 'User Deleted',
          description: `${userToDelete.name} has been deleted successfully.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete user',
          variant: 'destructive',
        });
      }
      
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => {
            setUserToEdit(null);
            setIsDialogOpen(true);
            setEmailError(null);
          }}
        >
          <Users size={16} />
          <span>Add User</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            View and manage all users in the system. New users will receive welcome emails with login instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList
            users={users}
            onEditUser={(user) => {
              setUserToEdit(user);
              setIsDialogOpen(true);
              setEmailError(null);
            }}
            onDeleteUser={(user) => {
              setUserToDelete(user);
              setIsDeleteDialogOpen(true);
            }}
          />
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {users.length} total users
          </p>
        </CardFooter>
      </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        user={userToEdit}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        emailError={emailError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        user={userToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default UserManagementPage;
