import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // Corrected import
import toast from 'react-hot-toast';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

export interface UserProfile extends SupabaseUser {
  role?: string;
  subscription_status?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  startTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      setUser(authUser as UserProfile); // Fallback to auth user
    } else {
      setUser({ ...authUser, ...data });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetch user profile on initial load
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchUserProfile(session.user);
        }
        setLoading(false);
    };
    getInitialSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
  
  const signUp = (email: string, password: string) => supabase.auth.signUp({ email, password });

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const startTrial = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('You must be logged in to start a trial.');
    }
    
    const promise = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stats/start-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // Correctly send Bearer Token
      },
    }).then(async (res) => {
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to start trial');
        }
        return res.json();
    });

    await toast.promise(promise, {
        loading: 'Starting your trial...',
        success: (data) => {
            fetchUserProfile(session.user); // Refetch profile on success
            return data.message || 'Trial started successfully!';
        },
        error: (err) => err.message || 'Could not start trial.',
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, startTrial }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
