
import React from 'react';
import { User, UserRole } from '@/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserForm from './UserForm';

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

export type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
  emailError: string | null;
}

const UserFormDialog = ({ 
  user, 
  open, 
  onOpenChange, 
  onSubmit, 
  emailError 
}: UserFormDialogProps) => {
  // Initialize the form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'maker',
      roles: user?.roles || ['maker']
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user 
              ? 'Update the user details below.' 
              : 'Fill in the details below to create a new user. A temporary password will be generated and sent to the email address.'}
          </DialogDescription>
        </DialogHeader>
        
        <UserForm 
          form={form}
          user={user} 
          emailError={emailError}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
