import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { sendOtpEmail } from '@/utils/aws-ses';
import { generateStrongPassword, sendWelcomeEmail, sendPasswordResetEmail } from '@/utils/auth-helpers';

// Extended user type with password expiry and first login flag
interface ExtendedUser extends User {
  passwordExpiryDate: string; // ISO string date
  lastOtp?: string; // For demo purposes only, in real app this would be stored server-side
  isFirstLogin?: boolean; // Track if this is the user's first login
  passwordStrength?: 'weak' | 'medium' | 'strong';
}

// Mock users for demonstration including a test admin with constant OTP
const mockUsers: ExtendedUser[] = [
  {
    id: 'test-admin',
    name: 'Test Admin',
    email: 'testadmin@example.com',
    role: 'admin',
    roles: ['admin'],
    avatar: 'https://ui-avatars.com/api/?name=Test+Admin&background=8b5cf6&color=fff',
    passwordExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    lastOtp: '123456', // Constant OTP for testing
  },
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    roles: ['admin'],
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff',
    passwordExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  },
  {
    id: '2',
    name: 'Maker User',
    email: 'maker@example.com',
    role: 'maker',
    roles: ['maker', 'checker1'],
    avatar: 'https://ui-avatars.com/api/?name=Maker+User&background=8b5cf6&color=fff',
    passwordExpiryDate: new Date(Date.now() - 1000).toISOString(), // Expired password
  },
  {
    id: '3',
    name: 'Checker One',
    email: 'checker1@example.com',
    role: 'checker1',
    roles: ['checker1'],
    avatar: 'https://ui-avatars.com/api/?name=Checker+One&background=8b5cf6&color=fff',
    passwordExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Checker Two',
    email: 'checker2@example.com',
    role: 'checker2',
    roles: ['checker2', 'maker'],
    avatar: 'https://ui-avatars.com/api/?name=Checker+Two&background=8b5cf6&color=fff',
    passwordExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface AuthContextType {
  user: User | null;
  users: User[];
  
  // OTP and login methods
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<{success: boolean, passwordExpired: boolean, isFirstLogin: boolean}>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  checkPasswordStrength: (password: string) => 'weak' | 'medium' | 'strong';
  logout: () => void;
  isLoading: boolean;
  isPasswordExpired: boolean;
  isFirstLogin: boolean;
  
  // User management methods
  addUser: (newUser: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [users, setUsers] = useState<ExtendedUser[]>(mockUsers);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as loading until we check localStorage
  const [isPasswordExpired, setIsPasswordExpired] = useState<boolean>(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  
  // Don't use the useToast hook here, just use the toast function directly

  // Function to check password strength
  const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    // Check for at least 8 characters
    if (password.length < 8) return 'weak';
    
    // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (hasUppercase && hasLowercase && hasNumber && hasSpecial) {
      return 'strong';
    } else if ((hasUppercase || hasLowercase) && hasNumber) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  // Function to request OTP
  const requestOtp = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      try {
        let otp: string;
        
        // For the test admin user, use constant OTP
        if (foundUser.email === 'testadmin@example.com') {
          otp = '123456';
          console.log(`Test Admin OTP (constant): ${otp}`);
        } else {
          // Generate a 6-digit OTP for other users
          otp = Math.floor(100000 + Math.random() * 900000).toString();
          console.log(`OTP for ${email}: ${otp}`);
        }
        
        // Update the user with the new OTP (only for demo purposes)
        setUsers(users.map(u => 
          u.id === foundUser.id ? { ...u, lastOtp: otp } : u
        ));
        
        // Send email with OTP (skip for test admin to avoid email errors)
        if (foundUser.email !== 'testadmin@example.com') {
          try {
            // Try to send password reset email if context suggests it's for password reset
            await sendPasswordResetEmail(email, foundUser.name, otp);
            
            toast({
              title: "OTP Sent",
              description: `A verification code has been sent to ${email}`,
            });
          } catch (emailError) {
            console.error('Email Error:', emailError);
            
            // Fall back to standard OTP email if password reset email fails
            try {
              await sendOtpEmail(email, otp, foundUser.name);
              toast({
                title: "OTP Sent",
                description: `A verification code has been sent to ${email}`,
              });
            } catch (standardEmailError) {
              console.error('Standard Email Error:', standardEmailError);
              
              // For demo purposes, we'll consider it successful even if email fails
              toast({
                title: "OTP Generated",
                description: `For demo purposes, check the console for the OTP code.`,
              });
            }
          }
        } else {
          // For test admin, just show success message
          toast({
            title: "Test Admin OTP",
            description: `Test admin OTP is always: 123456`,
          });
        }
        
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error('Error in requestOtp:', error);
        setIsLoading(false);
        return false;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  // Function to verify OTP
  const verifyOtp = async (email: string, otp: string): Promise<{success: boolean, passwordExpired: boolean, isFirstLogin: boolean}> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email && u.lastOtp === otp);
    
    if (foundUser) {
      // Check if password has expired or if it's first login
      const passwordExpired = new Date(foundUser.passwordExpiryDate) < new Date();
      const isFirstTimeLogin = foundUser.isFirstLogin === true;
      
      if (!passwordExpired && !isFirstTimeLogin) {
        // If not expired and not first login, log the user in
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        setIsFirstLogin(false);
      } else if (isFirstTimeLogin) {
        // If it's first login, set flag for mandatory password change
        setIsFirstLogin(true);
      } else {
        // If password expired, flag that password reset is needed
        setIsPasswordExpired(true);
      }
      
      setIsLoading(false);
      return { success: true, passwordExpired, isFirstLogin: isFirstTimeLogin };
    }
    
    setIsLoading(false);
    return { success: false, passwordExpired: false, isFirstLogin: false };
  };

  // Function to reset password with strong password validation
  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Check password strength
    const strength = checkPasswordStrength(newPassword);
    
    if (strength === 'weak') {
      toast({
        title: "Password Too Weak",
        description: "Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      // Set new password expiry date to 30 days from now
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
      
      const updatedUser = { 
        ...foundUser, 
        passwordExpiryDate: newExpiryDate.toISOString(),
        isFirstLogin: false,
        passwordStrength: strength
      };
      
      // Update user in state
      setUsers(users.map(u => 
        u.id === foundUser.id ? updatedUser : u
      ));
      
      // If this was initiated from forgot password flow, don't log in the user
      if (isPasswordExpired || isFirstLogin) {
        // Log in the user
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setIsPasswordExpired(false);
        setIsFirstLogin(false);
      }
      
      setIsLoading(false);
      
      toast({
        title: "Password Updated",
        description: `Your password has been successfully updated and will expire in 30 days.`,
      });
      
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsPasswordExpired(false);
    setIsFirstLogin(false);
    localStorage.removeItem('currentUser');
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    // Only admin can add users
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can add new users",
        variant: "destructive"
      });
      return;
    }

    const id = Date.now().toString();
    // Set new password expiry date to 30 days from now
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    
    const tempPassword = generateStrongPassword();
    
    // Ensure roles array is properly set
    const userRoles = newUser.roles || [newUser.role];
    
    const createdUser: ExtendedUser = {
      ...newUser,
      id,
      roles: userRoles, // Use the roles provided or fallback to array with primary role
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=8b5cf6&color=fff`,
      passwordExpiryDate: newExpiryDate.toISOString(),
      isFirstLogin: true, // Mark as first login to force password change
    };

    // Send welcome email with temporary password
    try {
      sendWelcomeEmail(createdUser.email, createdUser.name, tempPassword);
      console.log(`Temporary password for ${createdUser.email}: ${tempPassword}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // For demo, we'll still show the password in console
      console.log(`Temporary password for ${createdUser.email}: ${tempPassword}`);
    }

    setUsers([...users, createdUser]);
    toast({
      title: "User Created",
      description: `User ${newUser.name} has been created successfully. An email has been sent with login information.`
    });
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    // Only admin can update users
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can update users",
        variant: "destructive"
      });
      return;
    }

    setUsers(users.map(u => {
      if (u.id === id) {
        // If updating roles, make sure primary role is included
        let updatedRoles = userData.roles || u.roles;
        if (userData.role && !updatedRoles.includes(userData.role)) {
          updatedRoles = [userData.role, ...updatedRoles];
        }

        return { 
          ...u, 
          ...userData,
          roles: updatedRoles
        };
      }
      return u;
    }));

    toast({
      title: "User Updated",
      description: "User information has been successfully updated"
    });
  };

  const deleteUser = (id: string) => {
    // Only admin can delete users
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete users",
        variant: "destructive"
      });
      return;
    }

    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    setUsers(users.filter(u => u.id !== id));
    toast({
      title: "User Deleted",
      description: `User ${userToDelete.name} has been successfully deleted`
    });
  };

  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  // Check for saved user on initial load and verify password expiry
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    console.log('Checking for saved user on load:', savedUser ? 'Found' : 'Not found');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as ExtendedUser;
        
        // Check if password has expired or if it's first login
        const isExpired = new Date(parsedUser.passwordExpiryDate) < new Date();
        console.log(`Saved user password expired: ${isExpired}, First login: ${parsedUser.isFirstLogin}`);
        
        if (isExpired) {
          // Password expired, remove from localStorage and don't set user
          console.log('Password expired, removing saved user');
          localStorage.removeItem('currentUser');
          setIsPasswordExpired(true);
        } else if (parsedUser.isFirstLogin) {
          // First login, needs password change
          console.log('First login, removing saved user');
          localStorage.removeItem('currentUser');
          setIsFirstLogin(true);
        } else {
          console.log('Setting user from localStorage:', parsedUser.name);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    // End loading state after we've checked localStorage
    setIsLoading(false);
  }, []);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Load users from localStorage on init
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error('Failed to parse saved users:', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      requestOtp,
      verifyOtp,
      resetPassword,
      checkPasswordStrength,
      logout, 
      isLoading,
      isPasswordExpired,
      isFirstLogin,
      addUser,
      updateUser,
      deleteUser,
      getUserById
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
