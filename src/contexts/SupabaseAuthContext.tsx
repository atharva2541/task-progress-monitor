import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ConcurrencyManager, RealtimeManager } from '@/utils/concurrency-manager';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'maker' | 'checker1' | 'checker2';
  roles: string[];
  avatar?: string;
  password_expiry_date: string;
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseAuthContextType {
  user: User | null;
  profile: Profile | null;
  profiles: Profile[];
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  
  // Admin functions
  getAllProfiles: () => Promise<Profile[]>;
  createProfile: (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateUserProfile: (id: string, updates: Partial<Profile>) => Promise<{ error: any }>;
  deleteProfile: (id: string) => Promise<{ error: any }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('SupabaseAuthProvider render - loading:', loading, 'user:', !!user, 'session:', !!session);

  // Fetch all profiles for admin functions
  const fetchProfiles = async () => {
    const profilesData = await getAllProfiles();
    setProfiles(profilesData);
  };

  useEffect(() => {
    console.log('Auth initialization starting...');
    let mounted = true;

    const handleAuthStateChange = (event: string, session: Session | null) => {
      console.log('Auth state change event:', event, 'session exists:', !!session, 'user exists:', !!session?.user);
      
      if (!mounted) {
        console.log('Component unmounted, ignoring auth state change');
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User authenticated, fetching profile...');
        // Fetch profile in background
        setTimeout(async () => {
          if (!mounted) return;
          
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileData && !profileError && mounted) {
              console.log('Profile loaded:', profileData);
              setProfile(profileData);
              
              // If user is admin, fetch all profiles
              if (profileData.role === 'admin') {
                fetchProfiles();
              }
            } else {
              console.log('Profile fetch failed or no profile found:', profileError);
            }
          } catch (err) {
            console.log('Profile fetch error:', err);
          }
        }, 100);
      } else {
        console.log('No user, clearing profile');
        setProfile(null);
        setProfiles([]);
      }
      
      // Always set loading to false after processing auth state
      if (mounted) {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Then get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session retrieved:', !!initialSession);
          // The auth state change handler will be called automatically
          // But if no session exists, we need to set loading to false manually
          if (!initialSession && mounted) {
            console.log('No initial session, setting loading to false');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log('Auth context cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user) return;

    const handleProfileChange = (payload: any) => {
      console.log('Profile updated:', payload);
      if (payload.new && payload.new.id === user.id) {
        setProfile(payload.new);
      }
      // Refresh profiles list if admin
      if (profile?.role === 'admin') {
        fetchProfiles();
      }
    };

    const channel = RealtimeManager.subscribeToTable(
      'profiles', 
      handleProfileChange,
      { column: 'id', value: user.id }
    );

    return () => {
      RealtimeManager.unsubscribeFromTable('profiles', { column: 'id', value: user.id });
    };
  }, [user, profile]);

  const signUp = async (email: string, password: string, userData?: any) => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?mode=reset`,
          data: userData
        }
      });
      return { error };
    }, 2);
  };

  const signIn = async (email: string, password: string) => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    }, 2);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      return { error };
    }, 2);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    return await ConcurrencyManager.retryOperation(async () => {
      // Check for concurrent modifications
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('updated_at')
        .eq('id', user.id)
        .single();

      if (fetchError) return { error: fetchError };

      if (profile && currentProfile.updated_at !== profile.updated_at) {
        const conflictError = ConcurrencyManager.createOptimisticLockError(
          currentProfile.updated_at,
          profile.updated_at
        );
        ConcurrencyManager.showConflictResolution('profile');
        return { error: conflictError };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    }, 2);
  };

  const getAllProfiles = async (): Promise<Profile[]> => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching profiles",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return data || [];
    }, 2);
  };

  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    return await ConcurrencyManager.retryOperation(async () => {
      console.log('Creating profile with data:', profileData);
      
      // Create the auth user using signup with email confirmation disabled temporarily
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profileData.email,
        password: 'TempPass123!', // Temporary password that will be reset
        options: {
          emailRedirectTo: `${window.location.origin}/auth?mode=reset`,
          data: {
            name: profileData.name,
            role: profileData.role,
            roles: profileData.roles
          }
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        // Handle specific error cases
        if (authError.message?.includes('User already registered')) {
          return { error: { message: 'A user with this email already exists' } };
        }
        if (authError.message?.includes('not allowed')) {
          return { error: { message: 'Email signup may be disabled. Please check Supabase Auth settings.' } };
        }
        return { error: authError };
      }

      console.log('Auth user created:', authData.user?.id);

      // Send password reset email for the new user to set their own password
      if (authData.user) {
        console.log('Sending password reset email to:', profileData.email);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          profileData.email,
          {
            redirectTo: `${window.location.origin}/auth?mode=reset`
          }
        );
        
        if (resetError) {
          console.warn('Failed to send password reset email:', resetError);
          // Don't fail the entire operation if email sending fails
        }
      }

      return { error: null };
    }, 2);
  };

  const updateUserProfile = async (id: string, updates: Partial<Profile>) => {
    return await ConcurrencyManager.retryOperation(async () => {
      console.log('Updating user profile:', id, updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating user profile:', error);
        return { error };
      }

      console.log('User profile updated successfully');
      
      // Refresh the profiles list to reflect the changes
      if (profile?.role === 'admin') {
        await fetchProfiles();
      }

      return { error: null };
    }, 2);
  };

  const deleteProfile = async (id: string) => {
    return await ConcurrencyManager.retryOperation(async () => {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) {
        return { error: profileError };
      }

      // Note: We can't delete the auth user from client side with anon key
      // This would need to be handled server-side with service role key
      // For now, we'll just delete the profile
      return { error: null };
    }, 2);
  };

  console.log('SupabaseAuthProvider providing context - loading:', loading, 'user:', !!user);

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      profile,
      profiles,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      resetPassword,
      getAllProfiles,
      createProfile,
      updateUserProfile,
      deleteProfile
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
