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
import { Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  // Function to refresh users list
  const refreshUsers = async () => {
    try {
      console.log('Refreshing users list...');
      const profiles = await getAllProfiles();
      console.log('Updated profiles:', profiles);
      setUsers(profiles);
    } catch (error) {
      console.error('Failed to refresh users:', error);
    }
  };

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
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setEmailError(null);
    setShowAuthAlert(false);
    
    // Check if email already exists
    const emailExists = checkEmailExists(data.email, userToEdit?.id);
    
    if (emailExists) {
      setEmailError(`A user with the email ${data.email} already exists`);
      setIsSubmitting(false);
      return;
    }
    
    // Ensure that if admin role is selected, it's the only role
    let finalRoles = [...data.roles];
    let finalRole = data.role;
    
    if (data.roles.includes('admin')) {
      finalRoles = ['admin'];
      finalRole = 'admin';
    } else if (data.role === 'admin') {
      finalRoles = ['admin'];
    }
    
    try {
      if (userToEdit) {
        // Update existing user
        console.log('Updating user with data:', { id: userToEdit.id, finalRole, finalRoles });
        
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
        
        // Refresh the users list to show the updated data
        await refreshUsers();
        
        setUserToEdit(null);
      } else {
        // Create new user
        console.log('Creating new user with data:', { finalRole, finalRoles });
        
        const { error } = await createProfile({
          name: data.name,
          email: data.email,
          role: finalRole,
          roles: finalRoles,
          password_expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          is_first_login: true
        });

        if (error) {
          console.error('Create profile error:', error);
          
          // Handle specific error cases with better user messaging
          if (error.message?.includes('Email signup may be disabled')) {
            setShowAuthAlert(true);
            toast({
              title: 'Authentication Configuration Required',
              description: 'Email signup may be disabled in Supabase settings. Please check the authentication configuration.',
              variant: 'destructive'
            });
            setIsSubmitting(false);
            return;
          }
          
          if (error.message?.includes('email sending failed')) {
            toast({
              title: 'User Created - Email Issue',
              description: `${data.name} has been created but the password reset email could not be sent. Please check your email configuration in Supabase.`,
              variant: 'destructive'
            });
            await refreshUsers();
            setIsDialogOpen(false);
            setIsSubmitting(false);
            return;
          }
          
          throw error;
        }

        toast({
          title: 'User Created Successfully',
          description: `${data.name} has been created. A password reset email has been sent to ${data.email} to set up their account.`,
        });
        
        // Refresh the users list to show the new user
        await refreshUsers();
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('User operation error:', error);
      let errorMessage = 'An error occurred while saving the user';
      
      if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
        errorMessage = 'A user with this email already exists';
        setEmailError(errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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

        // Refresh the users list to show the deletion
        await refreshUsers();
        
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
            setShowAuthAlert(false);
          }}
          disabled={isSubmitting}
        >
          <Users size={16} />
          <span>Add User</span>
        </Button>
      </div>

      {/* Authentication Configuration Alert */}
      {showAuthAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>User creation failed due to authentication configuration issues.</p>
              <p>Please check the following in your Supabase dashboard:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Go to Authentication → Settings</li>
                <li>Ensure "Enable email signup" is turned ON</li>
                <li>Check if "Enable email confirmations" is set appropriately</li>
                <li>Verify your Site URL and Redirect URLs are correct</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
              setShowAuthAlert(false);
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
