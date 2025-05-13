
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

// Form schema for creating/editing users
const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.enum(['admin', 'maker', 'checker1', 'checker2']),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'maker',
    },
  });

  // Reset form when userToEdit changes
  React.useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'maker',
      });
    }
  }, [userToEdit, form]);

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    if (userToEdit) {
      // Update existing user
      updateUser(userToEdit.id, data);
      toast({
        title: 'User Updated',
        description: `${data.name} has been updated successfully.`,
      });
      setUserToEdit(null);
    } else {
      // Create new user
      addUser(data);
      toast({
        title: 'User Created',
        description: `${data.name} has been created successfully. An email has been sent with login instructions.`,
      });
    }
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Users size={16} />
              <span>Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="maker">Maker</SelectItem>
                          <SelectItem value="checker1">First Checker</SelectItem>
                          <SelectItem value="checker2">Second Checker</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This determines what permissions the user will have
                      </FormDescription>
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
                <TableHead>Role</TableHead>
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
