
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types for user profiles and authentication
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'maker' | 'checker1' | 'checker2';
  department?: string;
  isFirstLogin: boolean;
  passwordExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely convert Json to string
  const jsonToString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value && typeof value === 'object') return JSON.stringify(value);
    return '';
  };

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          name: jsonToString(data.name),
          email: jsonToString(data.email),
          role: data.role as 'admin' | 'maker' | 'checker1' | 'checker2',
          department: data.department ? jsonToString(data.department) : undefined,
          isFirstLogin: Boolean(data.is_first_login),
          passwordExpiryDate: data.password_expiry_date ? jsonToString(data.password_expiry_date) : undefined,
          createdAt: jsonToString(data.created_at),
          updatedAt: jsonToString(data.updated_at),
        };
      }
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('SupabaseAuthContext: Initializing auth state');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SupabaseAuthContext: Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile after a short delay to avoid callback conflicts
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setIsLoading(false);
          }, 100);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SupabaseAuthContext: Initial session check:', session?.user?.id);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('SupabaseAuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('SupabaseAuthContext: Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SupabaseAuthContext: Login error:', error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SupabaseAuthContext: Login successful:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('SupabaseAuthContext: Login exception:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      console.log('SupabaseAuthContext: Attempting signup for:', email);

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData.name || '',
            role: userData.role || 'maker',
            department: userData.department || '',
          }
        }
      });

      if (error) {
        console.error('SupabaseAuthContext: Signup error:', error.message);
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SupabaseAuthContext: Signup successful:', data.user?.id);
      
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error) {
      console.error('SupabaseAuthContext: Signup exception:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('SupabaseAuthContext: Logging out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SupabaseAuthContext: Logout error:', error.message);
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('SupabaseAuthContext: Logout successful');
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      }
    } catch (error) {
      console.error('SupabaseAuthContext: Logout exception:', error);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      console.log('SupabaseAuthContext: Updating password');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('SupabaseAuthContext: Password update error:', error.message);
        toast({
          title: "Password Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Update first login status and password expiry
      if (user) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months from now

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_first_login: false,
            password_expiry_date: expiryDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('SupabaseAuthContext: Profile update error:', profileError.message);
        } else {
          // Update local user state
          setUser(prev => prev ? {
            ...prev,
            isFirstLogin: false,
            passwordExpiryDate: expiryDate.toISOString(),
            updatedAt: new Date().toISOString(),
          } : null);
        }
      }

      console.log('SupabaseAuthContext: Password updated successfully');
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error('SupabaseAuthContext: Password update exception:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      console.log('SupabaseAuthContext: Updating profile');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          department: updates.department,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('SupabaseAuthContext: Profile update error:', error.message);
        toast({
          title: "Profile Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      } : null);

      console.log('SupabaseAuthContext: Profile updated successfully');
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error('SupabaseAuthContext: Profile update exception:', error);
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signUp,
    updatePassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
