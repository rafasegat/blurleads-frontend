'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { setAuthToken, clearAuthToken } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Auth] Initializing auth context');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Initial session:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);

      // Set auth token for API client
      if (session?.access_token) {
        console.log('[Auth] Setting API auth token');
        setAuthToken(session.access_token);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(
        '[Auth] Auth state changed:',
        _event,
        session ? 'Session exists' : 'No session'
      );
      setSession(session);
      setUser(session?.user ?? null);

      // Update auth token for API client
      if (session?.access_token) {
        console.log('[Auth] Updating API auth token');
        setAuthToken(session.access_token);
      } else {
        console.log('[Auth] Clearing API auth token');
        clearAuthToken();
      }

      setLoading(false);
    });

    return () => {
      console.log('[Auth] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('[Auth] Signing up user:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    }
    console.log('[Auth] Sign up successful');
    return data;
  };

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }
    console.log('[Auth] Sign in successful');

    // Set auth token for API client
    if (data.session?.access_token) {
      setAuthToken(data.session.access_token);
    }

    return data;
  };

  const signInWithGoogle = async () => {
    console.log('[Auth] Initiating Google OAuth sign-in');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error('[Auth] Google sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[Auth] Signing out user');
    clearAuthToken();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Sign-out error:', error);
      throw error;
    }
    console.log('[Auth] Sign out successful');
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
