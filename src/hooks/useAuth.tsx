
import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Extended User type that includes database user properties
type User = SupabaseUser & {
  name?: string;
  avatar_url?: string | null;
  phone?: string | null;
  location?: string | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile and merge with auth user
  const fetchUserProfile = async (authUser: SupabaseUser): Promise<User> => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('name, avatar_url, phone, location')
        .eq('id', authUser.id)
        .single();

      return {
        ...authUser,
        name: profile?.name,
        avatar_url: profile?.avatar_url,
        phone: profile?.phone,
        location: profile?.location,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return authUser;
    }
  };

  useEffect(() => {
    let mounted = true;
    let initialized = false;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          const userWithProfile = await fetchUserProfile(session.user);
          if (mounted) {
            setUser(userWithProfile);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
        }
        
        // Set loading to false after processing auth state change
        if (mounted) {
          initialized = true;
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initAuth = async () => {
      try {
        console.log('Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            initialized = true;
            setLoading(false);
          }
          return;
        }
        
        console.log('Existing session:', session?.user?.email || 'No session');
        
        if (!mounted) return;
        
        // If we have a session, the onAuthStateChange will handle it
        // If no session, we can set loading to false immediately
        if (!session) {
          setSession(null);
          setUser(null);
          initialized = true;
          setLoading(false);
        }
        // If there is a session, let onAuthStateChange handle it
        
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          initialized = true;
          setLoading(false);
        }
      }
    };

    initAuth();
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('Auth initialization timeout, setting loading to false');
        initialized = true;
        setLoading(false);
      }
    }, 5000); // Increased timeout to 5 seconds

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, userData = {}) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: userData
      }
    });
    
    return { error };
  };

  // Public function to refresh user profile
  const refreshUserProfile = async () => {
    if (session?.user) {
      const userWithProfile = await fetchUserProfile(session.user);
      setUser(userWithProfile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signOut,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      fetchUserProfile: refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
