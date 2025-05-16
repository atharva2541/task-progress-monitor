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
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{ value: UserRole; label: string }[]>(userRoles);

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

  // Update available roles when primary role changes
  useEffect(() => {
    const primaryRole = form.watch('role');
    
    // If primary role is admin, only allow admin role
    if (primaryRole === 'admin') {
      form.setValue('roles', ['admin']);
    }
    
    // Update available roles for role selection
    setAvailableRoles(primaryRole === 'admin' 
      ? [{ value: 'admin', label: 'Administrator' }] 
      : userRoles.filter(role => role.value !== 'admin'));
    
  }, [form.watch('role')]);

  // Reset form when userToEdit changes
  useEffect(() => {
    if (userToEdit) {
      const isAdmin = userToEdit.role === 'admin';
      
      // Set available roles based on primary role
      setAvailableRoles(isAdmin 
        ? [{ value: 'admin', label: 'Administrator' }] 
        : userRoles.filter(role => role.value !== 'admin'));
      
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        roles: isAdmin ? ['admin'] : (userToEdit.roles || [userToEdit.role])
      });
      setIsDialogOpen(true);
    } else {
      setAvailableRoles(userRoles);
      form.reset({
        name: '',
        email: '',
        role: 'maker',
        roles: ['maker']
      });
    }
  }, [userToEdit, form]);

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    // Ensure admin users only have the admin role
    let processedData = {...data};
    if (data.role === 'admin') {
      processedData.roles = ['admin'];
    } else {
      // Ensure non-admin users don't have admin role
      processedData.roles = data.roles.filter(role => role !== 'admin');
      
      // Ensure primary role is included in roles array
      if (!processedData.roles.includes(data.role)) {
        processedData.roles = [data.role, ...processedData.roles];
      }
    }
    
    if (userToEdit) {
      // Update existing user
      updateUser(userToEdit.id, processedData);
      toast({
        title: 'User Updated',
        description: `${data.name} has been updated successfully.`,
      });
      setUserToEdit(null);
    } else {
      // Create new user
      addUser(processedData);
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

  // Function to toggle role in the roles array
  const toggleRole = (role: UserRole, selectedRoles: UserRole[]) => {
    const primaryRole = form.getValues('role');
    
    // If primary role is admin, only allow admin role
    if (primaryRole === 'admin') {
      return ['admin'];
    }
    
    // For non-admin users, handle regular role toggling
    if (selectedRoles.includes(role)) {
      return selectedRoles.filter(r => r !== role);
    } else {
      return [...selectedRoles, role];
    }
  };

  // Handle primary role change
  const handlePrimaryRoleChange = (value: string) => {
    const role = value as UserRole;
    
    // Update the primary role
    form.setValue('role', role);
    
    // If changing to admin, restrict to only admin role
    if (role === 'admin') {
      form.setValue('roles', ['admin']);
    } 
    // If changing from admin, set roles to just the new primary role
    else if (form.getValues('roles').includes('admin')) {
      form.setValue('roles', [role]);
    }
    // Otherwise just ensure the primary role is included
    else {
      const currentRoles = form.getValues('roles');
      if (!currentRoles.includes(role)) {
        form.setValue('roles', [...currentRoles, role]);
      }
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
                      onValueChange={(value) => handlePrimaryRoleChange(value)} 
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
                      {field.value === 'admin' 
                        ? 'Admin users cannot have other roles' 
                        : 'This is the user\'s primary role in the system'}
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
                        {form.watch('role') === 'admin' 
                          ? 'Admin users can only have the admin role' 
                          : 'Select all roles this user can have in the system'}
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {availableRoles.map((role) => (
                        <FormItem
                          key={role.value}
                          className={`flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border ${
                            form.watch('role') === 'admin' && role.value !== 'admin' ? 'opacity-50' : ''
                          }`}
                        >
                          <FormControl>
                            <Checkbox
                              checked={isRoleSelected(role.value, field.value)}
                              onCheckedChange={() => {
                                const updatedRoles = toggleRole(role.value, field.value);
                                field.onChange(updatedRoles);
                              }}
                              disabled={form.watch('role') === 'admin' && role.value !== 'admin'}
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
