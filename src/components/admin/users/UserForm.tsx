import React from 'react';
import { User, UserRole } from '@/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Button } from '@/components/ui/button';

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

interface UserFormProps {
  user: User | null; 
  emailError: string | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
}

const UserForm = ({ user, emailError, onSubmit, onCancel }: UserFormProps) => {
  // Initialize form with react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user ? user.name : '',
      email: user ? user.email : '',
      role: user ? user.role : 'maker',
      roles: user && user.roles ? user.roles : ['maker']
    },
  });

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
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
