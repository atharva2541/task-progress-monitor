
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { User, UserRole } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Mail, Shield, Key } from 'lucide-react';

// Available user roles
const userRoles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'maker', label: 'Maker' },
  { value: 'checker1', label: 'First Checker' },
  { value: 'checker2', label: 'Second Checker' }
];

// Form schema for creating/editing users
const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.enum(['admin', 'maker', 'checker1', 'checker2']),
  roles: z.array(z.enum(['admin', 'maker', 'checker1', 'checker2']))
    .refine(roles => roles.length > 0, {
      message: "User must have at least one role"
    })
    .refine(roles => {
      // Ensure that if 'admin' is in the roles, it's the only role
      if (roles.includes('admin')) {
        return roles.length === 1;
      }
      // Otherwise, ensure 'admin' is not in the roles
      return !roles.includes('admin');
    }, {
      message: "Admin role cannot be combined with other roles"
    })
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'maker',
      roles: ['maker']
    },
  });

  // Function to check if email already exists
  const checkEmailExists = (email: string, userId?: string): boolean => {
    return users.some(user => {
      // If editing a user, exclude the current user from the check
      if (userId && user.id === userId) return false;
      return user.email.toLowerCase() === email.toLowerCase();
    });
  };

  // Handle role selection changes
  const handleRoleChange = (role: string) => {
    const currentRole = role as UserRole;
    
    if (currentRole === 'admin') {
      // If admin is selected, clear all other roles
      form.setValue('roles', ['admin']);
    } else {
      // If any other role is selected, remove admin role if present
      const currentRoles = form.getValues('roles');
      const filteredRoles = currentRoles.filter(r => r !== 'admin');
      
      // Update the roles field
      form.setValue('roles', filteredRoles);
    }
    
    // Update the primary role
    form.setValue('role', currentRole);
  };
  
  // Handle role checkbox changes
  const handleRoleCheckboxChange = (checked: boolean, role: UserRole) => {
    const currentRoles = [...form.getValues('roles')];
    
    if (role === 'admin' && checked) {
      // If admin is checked, clear all other roles
      form.setValue('roles', ['admin']);
      form.setValue('role', 'admin');
      return;
    }
    
    if (currentRoles.includes('admin') && role !== 'admin') {
      // If trying to add a non-admin role when admin is present, remove admin
      const filteredRoles = currentRoles.filter(r => r !== 'admin');
      
      if (checked) {
        // Add the new role
        form.setValue('roles', [...filteredRoles, role]);
      } else {
        form.setValue('roles', filteredRoles);
      }
      
      // Ensure primary role is not admin
      if (form.getValues('role') === 'admin') {
        form.setValue('role', role);
      }
      return;
    }
    
    // Standard role handling
    if (checked && !currentRoles.includes(role)) {
      form.setValue('roles', [...currentRoles, role]);
    } else if (!checked && currentRoles.includes(role)) {
      const filteredRoles = currentRoles.filter(r => r !== role);
      form.setValue('roles', filteredRoles);
      
      // If primary role is being unchecked, set a new primary role
      if (form.getValues('role') === role && filteredRoles.length > 0) {
        form.setValue('role', filteredRoles[0]);
      }
    }
  };

  // Reset form when userToEdit changes
  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        roles: userToEdit.roles || [userToEdit.role]
      });
      setIsDialogOpen(true);
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'maker',
        roles: ['maker']
      });
    }
    setEmailError(null);
  }, [userToEdit, form]);

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
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
      updateUser(userToEdit.id, {
        name: data.name,
        email: data.email,
        role: finalRole,
        roles: finalRoles
      });
      toast({
        title: 'User Updated',
        description: `${data.name} has been updated successfully.`,
      });
      setUserToEdit(null);
    } else {
      // Create new user
      const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        role: finalRole,
        roles: finalRoles
      };
      
      addUser(newUser);
      toast({
        title: 'User Created',
        description: `${data.name} has been created successfully. An email has been sent with login instructions.`,
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  // Function to check if role is in the roles array
  const isRoleSelected = (role: UserRole, selectedRoles: UserRole[]) => {
    return selectedRoles.includes(role);
  };

  // Function to check if a role should be disabled
  const isRoleDisabled = (role: UserRole, selectedRoles: UserRole[]) => {
    // If admin is selected, disable all other roles
    if (selectedRoles.includes('admin') && role !== 'admin') {
      return true;
    }
    
    // If any other role is selected, disable admin
    if (role === 'admin' && selectedRoles.some(r => r !== 'admin')) {
      return true;
    }
    
    return false;
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
                        onClick={() => {
                          setUserToEdit(user);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setUserToDelete(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {users.length} total users
          </p>
        </CardFooter>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{userToEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {userToEdit 
                ? 'Update the user details below.' 
                : 'Fill in the details below to create a new user. A temporary password will be generated and sent to the email address.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    {emailError && (
                      <p className="text-sm font-medium text-destructive">{emailError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Role</FormLabel>
                    <Select 
                      onValueChange={(value) => handleRoleChange(value)} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This is the user's primary role in the system
                      {field.value === 'admin' && (
                        <span className="text-amber-600 block mt-1">
                          Note: Admin users cannot have additional roles
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Assigned Roles</FormLabel>
                      <FormDescription>
                        Select all roles this user can have in the system
                        {field.value.includes('admin') && (
                          <span className="text-amber-600 block mt-1">
                            Note: Admin role cannot be combined with other roles
                          </span>
                        )}
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {userRoles.map((role) => (
                        <FormItem
                          key={role.value}
                          className={`flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border ${
                            isRoleDisabled(role.value, field.value) 
                              ? 'opacity-50' 
                              : ''
                          }`}
                        >
                          <FormControl>
                            <Checkbox
                              checked={isRoleSelected(role.value, field.value)}
                              onCheckedChange={(checked) => {
                                handleRoleCheckboxChange(!!checked, role.value);
                              }}
                              disabled={isRoleDisabled(role.value, field.value)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {role.label}
                            </FormLabel>
                            <FormDescription>
                              Can act as {role.label.toLowerCase()}
                            </FormDescription>
                          </div>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setUserToEdit(null);
                    setIsDialogOpen(false);
                    setEmailError(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {userToEdit ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account for {userToDelete?.name} ({userToDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (userToDelete) {
                  deleteUser(userToDelete.id);
                  toast({
                    title: 'User Deleted',
                    description: `${userToDelete.name} has been deleted successfully.`,
                  });
                  setUserToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagementPage;
