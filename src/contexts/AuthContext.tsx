
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { authApi } from '@/services/api-client';

interface AuthContextType {
  user: User | null;
  users: User[];
  
  // Email/password + OTP authentication
  login: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  verifyOtp: (email: string, otp: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  isLoading: boolean;
  isAwaitingOtp: boolean;
  currentEmail: string | null;
  
  // User management methods (admin only)
  addUser: (newUser: Omit<User, 'id'>) => Promise<{success: boolean, message?: string}>;
  updateUser: (id: string, userData: Partial<User>) => Promise<{success: boolean, message?: string}>;
  deleteUser: (id: string) => Promise<{success: boolean, message?: string}>;
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAwaitingOtp, setIsAwaitingOtp] = useState<boolean>(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  // Email/password login function
  const login = async (email: string, password: string): Promise<{success: boolean, message?: string}> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.data.success) {
        setCurrentEmail(email);
        setIsAwaitingOtp(true);
        setIsLoading(false);
        
        toast({
          title: "Login Successful",
          description: "Please check your email for the OTP verification code.",
        });
        
        return { success: true, message: "OTP sent to your email" };
      } else {
        setIsLoading(false);
        return { success: false, message: response.data.message || "Login failed" };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please check your credentials." 
      };
    }
  };

  // OTP verification function
  const verifyOtp = async (email: string, otp: string): Promise<{success: boolean, message?: string}> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.verifyOtp(email, otp);
      
      if (response.data.success) {
        // Store the JWT token
        localStorage.setItem('token', response.data.token);
        
        // Get user profile
        const profileResponse = await authApi.getProfile();
        const userData = profileResponse.data;
        
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setIsAwaitingOtp(false);
        setCurrentEmail(null);
        setIsLoading(false);
        
        toast({
          title: "Welcome!",
          description: `Successfully logged in as ${userData.name}`,
        });
        
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: response.data.message || "Invalid OTP" };
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || "OTP verification failed" 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAwaitingOtp(false);
    setCurrentEmail(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // User management functions (admin only)
  const addUser = async (newUser: Omit<User, 'id'>): Promise<{success: boolean, message?: string}> => {
    if (user?.role !== 'admin') {
      return { success: false, message: "Only administrators can add users" };
    }

    try {
      const response = await authApi.createUser(newUser);
      
      if (response.data.success) {
        // Refresh users list
        await loadUsers();
        return { success: true, message: "User created successfully" };
      } else {
        return { success: false, message: response.data.message || "Failed to create user" };
      }
    } catch (error: any) {
      console.error('Create user error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to create user" 
      };
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<{success: boolean, message?: string}> => {
    if (user?.role !== 'admin') {
      return { success: false, message: "Only administrators can update users" };
    }

    try {
      const response = await authApi.updateUser(id, userData);
      
      if (response.data.success) {
        // Refresh users list
        await loadUsers();
        return { success: true, message: "User updated successfully" };
      } else {
        return { success: false, message: response.data.message || "Failed to update user" };
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to update user" 
      };
    }
  };

  const deleteUser = async (id: string): Promise<{success: boolean, message?: string}> => {
    if (user?.role !== 'admin') {
      return { success: false, message: "Only administrators can delete users" };
    }

    try {
      const response = await authApi.deleteUser(id);
      
      if (response.data.success) {
        // Refresh users list
        await loadUsers();
        return { success: true, message: "User deleted successfully" };
      } else {
        return { success: false, message: response.data.message || "Failed to delete user" };
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to delete user" 
      };
    }
  };

  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  // Load users (admin only)
  const loadUsers = async () => {
    if (user?.role === 'admin') {
      try {
        const response = await authApi.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
  };

  // Check for saved user on initial load
  useEffect(() => {
    const checkAuthState = async () => {
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        try {
          // Verify token is still valid
          const response = await authApi.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuthState();
  }, []);

  // Load users when admin logs in
  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      login,
      verifyOtp,
      logout, 
      isLoading,
      isAwaitingOtp,
      currentEmail,
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
