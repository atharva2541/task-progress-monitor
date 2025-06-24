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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Initial session:', initialSession ? 'Found' : 'None');
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // If we have a user, try to fetch their profile
          if (initialSession?.user) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', initialSession.user.id)
                .single();
              
              if (profileData && !profileError && mounted) {
                setProfile(profileData);
              }
            } catch (profileErr) {
              console.log('Profile fetch failed, continuing without profile:', profileErr);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'no user');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile in background, don't block the auth flow
          setTimeout(async () => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profileData && !profileError && mounted) {
                setProfile(profileData);
              }
            } catch (err) {
              console.log('Background profile fetch failed:', err);
            }
          }, 100);
        } else {
          setProfile(null);
        }
        
        // Ensure loading is false after auth state changes
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
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
    };

    const channel = RealtimeManager.subscribeToTable(
      'profiles', 
      handleProfileChange,
      { column: 'id', value: user.id }
    );

    return () => {
      RealtimeManager.unsubscribeFromTable('profiles', { column: 'id', value: user.id });
    };
  }, [user]);

  const signUp = async (email: string, password: string, userData?: any) => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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
        redirectTo: `${window.location.origin}/reset-password`,
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
      // First create the auth user
      const temporaryPassword = ConcurrencyManager.generateVersion().substring(0, 12);
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: profileData.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          name: profileData.name,
          role: profileData.role,
          roles: profileData.roles
        }
      });

      if (authError) return { error: authError };

      // Profile will be created automatically by the trigger
      return { error: null };
    }, 2);
  };

  const updateUserProfile = async (id: string, updates: Partial<Profile>) => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      return { error };
    }, 2);
  };

  const deleteProfile = async (id: string) => {
    return await ConcurrencyManager.retryOperation(async () => {
      const { error } = await supabase.auth.admin.deleteUser(id);
      return { error };
    }, 2);
  };

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      profile,
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
