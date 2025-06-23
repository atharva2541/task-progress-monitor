
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  users: User[];
  
  // OTP and login methods (adapted for Supabase)
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<{success: boolean, passwordExpired: boolean, isFirstLogin: boolean}>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  checkPasswordStrength: (password: string) => 'weak' | 'medium' | 'strong';
  logout: () => void;
  isLoading: boolean;
  isPasswordExpired: boolean;
  isFirstLogin: boolean;
  
  // User management methods
  addUser: (newUser: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordExpired, setIsPasswordExpired] = useState<boolean>(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);

  // Function to check password strength
  const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    
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

  // Function to convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        roles: Array.isArray(profile.roles) ? profile.roles : JSON.parse(profile.roles),
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=8b5cf6&color=fff`,
        passwordExpiryDate: profile.password_expiry_date,
        isFirstLogin: profile.is_first_login
      };
    } catch (error) {
      console.error('Error converting Supabase user:', error);
      return null;
    }
  };

  // Function to request OTP (adapted for Supabase magic link)
  const requestOtp = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('OTP request error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }

      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${email}`,
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error in requestOtp:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Function to verify OTP (adapted for Supabase)
  const verifyOtp = async (email: string, otp: string): Promise<{success: boolean, passwordExpired: boolean, isFirstLogin: boolean}> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        console.error('OTP verification error:', error);
        setIsLoading(false);
        return { success: false, passwordExpired: false, isFirstLogin: false };
      }

      if (data.user) {
        const convertedUser = await convertSupabaseUser(data.user);
        if (convertedUser) {
          // Check password expiry and first login
          const passwordExpired = new Date(convertedUser.passwordExpiryDate) < new Date();
          const isFirstTimeLogin = convertedUser.isFirstLogin === true;
          
          if (!passwordExpired && !isFirstTimeLogin) {
            setUser(convertedUser);
            setIsFirstLogin(false);
            setIsPasswordExpired(false);
          } else if (isFirstTimeLogin) {
            setIsFirstLogin(true);
          } else {
            setIsPasswordExpired(true);
          }
          
          setIsLoading(false);
          return { success: true, passwordExpired, isFirstLogin: isFirstTimeLogin };
        }
      }
      
      setIsLoading(false);
      return { success: false, passwordExpired: false, isFirstLogin: false };
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      setIsLoading(false);
      return { success: false, passwordExpired: false, isFirstLogin: false };
    }
  };

  // Function to reset password
  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
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

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }

      // Update password expiry and first login status in profiles
      if (session?.user) {
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + 90);
        
        await supabase
          .from('profiles')
          .update({
            password_expiry_date: newExpiryDate.toISOString(),
            is_first_login: false
          })
          .eq('id', session.user.id);

        // Refresh user data
        const convertedUser = await convertSupabaseUser(session.user);
        if (convertedUser) {
          setUser(convertedUser);
          setIsPasswordExpired(false);
          setIsFirstLogin(false);
        }
      }

      toast({
        title: "Password Updated",
        description: `Your password has been successfully updated and will expire in 90 days.`,
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsPasswordExpired(false);
    setIsFirstLogin(false);
  };

  // Load all users (admin only)
  const loadUsers = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      const convertedUsers = profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        roles: Array.isArray(profile.roles) ? profile.roles : JSON.parse(profile.roles),
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=8b5cf6&color=fff`,
        passwordExpiryDate: profile.password_expiry_date,
        isFirstLogin: profile.is_first_login
      }));

      setUsers(convertedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can add new users",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: Math.random().toString(36).slice(-8) + 'A1!', // Temporary strong password
        email_confirm: true
      });

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        // Update profile with user details
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: newUser.name,
            role: newUser.role,
            roles: JSON.stringify(newUser.roles || [newUser.role]),
            is_first_login: true
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        await loadUsers();
        
        toast({
          title: "User Created",
          description: `User ${newUser.name} has been created successfully. They will need to reset their password on first login.`
        });
      }
    } catch (error) {
      console.error('Error in addUser:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can update users",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          role: userData.role,
          roles: userData.roles ? JSON.stringify(userData.roles) : undefined
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      await loadUsers();
      
      toast({
        title: "User Updated",
        description: "User information has been successfully updated"
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete users",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      await loadUsers();
      
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted"
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
    }
  };

  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          const convertedUser = await convertSupabaseUser(session.user);
          if (convertedUser) {
            setUser(convertedUser);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        convertSupabaseUser(session.user).then(convertedUser => {
          if (convertedUser) {
            setUser(convertedUser);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load users when user changes and is admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsers();
    }
  }, [user]);

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
