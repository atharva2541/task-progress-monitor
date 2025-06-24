
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Users } from 'lucide-react';
import UserList from '@/components/admin/users/UserList';
import UserFormDialog, { UserFormValues } from '@/components/admin/users/UserFormDialog';
import DeleteUserDialog from '@/components/admin/users/DeleteUserDialog';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'maker' | 'checker1' | 'checker2';
  roles: string[];
  avatar?: string;
  password_expiry_date: string;
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
}

const UserManagementPage = () => {
  const { getAllProfiles, createProfile, updateUserProfile, deleteProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [userToEdit, setUserToEdit] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const profiles = await getAllProfiles();
        setUsers(profiles);
      } catch (error) {
        console.error('Failed to load users:', error);
        toast({
          title: "Error loading users",
          description: "Failed to load user profiles",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [getAllProfiles, toast]);

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
    
    try {
      if (userToEdit) {
        // Update existing user
        const { error } = await updateUserProfile(userToEdit.id, {
          name: data.name,
          email: data.email,
          role: finalRole,
          roles: finalRoles
        });

        if (error) throw error;

        toast({
          title: 'User Updated',
          description: `${data.name} has been updated successfully.`,
        });
        setUserToEdit(null);
      } else {
        // Create new user
        const { error } = await createProfile({
          name: data.name,
          email: data.email,
          role: finalRole,
          roles: finalRoles,
          password_expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          is_first_login: true
        });

        if (error) throw error;

        toast({
          title: 'User Created',
          description: `${data.name} has been created successfully. An email has been sent with login instructions.`,
        });
      }

      // Refresh user list
      const profiles = await getAllProfiles();
      setUsers(profiles);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving the user',
        variant: 'destructive'
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        const { error } = await deleteProfile(userToDelete.id);
        
        if (error) throw error;

        toast({
          title: 'User Deleted',
          description: `${userToDelete.name} has been deleted successfully.`,
        });

        // Refresh user list
        const profiles = await getAllProfiles();
        setUsers(profiles);
        setUserToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete user',
          variant: 'destructive'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList
            users={users}
            onEditUser={(user: Profile) => {
              setUserToEdit(user);
              setIsDialogOpen(true);
              setEmailError(null);
            }}
            onDeleteUser={(user: Profile) => {
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
