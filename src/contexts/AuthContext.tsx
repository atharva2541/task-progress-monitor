
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { sendOtpEmail } from '@/utils/aws-ses';

// Extended user type with password expiry date
interface ExtendedUser extends User {
  passwordExpiryDate: string; // ISO string date
  lastOtp?: string; // For demo purposes only, in real app this would be stored server-side
}

// Mock users for demonstration
const mockUsers: ExtendedUser[] = [
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
  verifyOtp: (email: string, otp: string) => Promise<{success: boolean, passwordExpired: boolean}>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isPasswordExpired: boolean;
  
  // Direct login method for testing
  directLogin: (email: string) => Promise<boolean>;
  
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPasswordExpired, setIsPasswordExpired] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to request OTP
  const requestOtp = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // In a real app, this would be hashed and stored in a database
        console.log(`OTP for ${email}: ${otp}`);
        
        // Update the user with the new OTP (only for demo purposes)
        setUsers(users.map(u => 
          u.id === foundUser.id ? { ...u, lastOtp: otp } : u
        ));
        
        // Send email with Amazon SES
        try {
          await sendOtpEmail(email, otp, foundUser.name);
          
          toast({
            title: "OTP Sent",
            description: `A verification code has been sent to ${email}`,
          });
          setIsLoading(false);
          return true;
        } catch (emailError) {
          console.error('Email Error:', emailError);
          
          // For demo purposes, we'll consider it successful even if email fails
          // In production, you'd want to handle this error appropriately
          toast({
            title: "OTP Generated",
            description: `For demo purposes, check the console for the OTP code.`,
          });
          setIsLoading(false);
          return true;
        }
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
  const verifyOtp = async (email: string, otp: string): Promise<{success: boolean, passwordExpired: boolean}> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email && u.lastOtp === otp);
    
    if (foundUser) {
      // Check if password has expired
      const passwordExpired = new Date(foundUser.passwordExpiryDate) < new Date();
      
      if (!passwordExpired) {
        // If not expired, log the user in
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
      } else {
        // Flag that password reset is needed
        setIsPasswordExpired(true);
      }
      
      setIsLoading(false);
      return { success: true, passwordExpired };
    }
    
    setIsLoading(false);
    return { success: false, passwordExpired: false };
  };
  
  // Function for direct login (bypass OTP for testing)
  const directLogin = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Find user by email
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      // Check if password has expired
      const passwordExpired = new Date(foundUser.passwordExpiryDate) < new Date();
      
      if (!passwordExpired) {
        // If not expired, log the user in
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${foundUser.name}! (Testing mode)`,
        });
        
        setIsLoading(false);
        return true;
      } else {
        // For testing, reset the password expiry date
        const updatedUser = {
          ...foundUser,
          passwordExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Update user in state
        setUsers(users.map(u => 
          u.id === foundUser.id ? updatedUser : u
        ));
        
        // Log in with updated user
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${foundUser.name}! (Testing mode)`,
        });
        
        setIsLoading(false);
        return true;
      }
    }
    
    toast({
      title: "Login Failed",
      description: "User not found",
      variant: "destructive"
    });
    
    setIsLoading(false);
    return false;
  };

  // Function to reset password
  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      // Set new password expiry date to 30 days from now
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
      
      const updatedUser = { 
        ...foundUser, 
        passwordExpiryDate: newExpiryDate.toISOString() 
      };
      
      // Update user in state
      setUsers(users.map(u => 
        u.id === foundUser.id ? updatedUser : u
      ));
      
      // Log in the user
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setIsPasswordExpired(false);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email);
    
    // Simple mock authentication - in a real app would validate password too
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsPasswordExpired(false);
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
    
    const createdUser: ExtendedUser = {
      ...newUser,
      id,
      roles: [newUser.role],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=8b5cf6&color=fff`,
      passwordExpiryDate: newExpiryDate.toISOString()
    };

    setUsers([...users, createdUser]);
    toast({
      title: "User Created",
      description: `User ${newUser.name} has been successfully created`
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
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as ExtendedUser;
        
        // Check if password has expired
        if (new Date(parsedUser.passwordExpiryDate) < new Date()) {
          // Password expired, remove from localStorage and don't set user
          localStorage.removeItem('currentUser');
          setIsPasswordExpired(true);
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
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
      logout, 
      isLoading,
      isPasswordExpired,
      directLogin,
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
