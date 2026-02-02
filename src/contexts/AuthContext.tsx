import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type UserRole = 'admin' | 'viewer' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Initializing...');
    let mounted = true;

    // Failsafe: Always stop loading after 3 seconds max
    const failsafeTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthContext] Failsafe triggered - forcing loading to false');
        setIsLoading(false);
      }
    }, 3000);

    // Helper function to fetch and set user role
    const fetchAndSetRole = async (userId: string, userEmail: string) => {
      try {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('[AuthContext] Role fetch error:', error);
          // Super Admin Override
          if (userEmail === 'amithkg20@gmail.com') {
            console.log('[AuthContext] Super Admin override applied');
            setRole('admin');
          } else {
            setRole('viewer');
          }
        } else {
          const fetchedRole = (roleData?.role as UserRole) ?? 'viewer';
          // Super Admin Override
          if (userEmail === 'amithkg20@gmail.com') {
            console.log('[AuthContext] Super Admin override applied');
            setRole('admin');
          } else {
            setRole(fetchedRole);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Role fetch exception:', err);
        // Super Admin Override fallback
        if (userEmail === 'amithkg20@gmail.com') {
          setRole('admin');
        } else {
          setRole('viewer');
        }
      }
    };

    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] Session error:', error);
        }

        if (mounted) {
          if (initialSession?.user) {
            console.log('[AuthContext] Session found:', initialSession.user.email);
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchAndSetRole(initialSession.user.id, initialSession.user.email);
          } else {
            console.log('[AuthContext] No session found');
            setSession(null);
            setUser(null);
            setRole(null);
          }

          // CRITICAL: Always set loading to false after initialization
          clearTimeout(failsafeTimeout);
          setIsLoading(false);
          console.log('[AuthContext] Initialization complete');
        }
      } catch (err) {
        console.error('[AuthContext] Init error:', err);
        if (mounted) {
          clearTimeout(failsafeTimeout);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AuthContext] Auth event:', event);

        if (!mounted) return;

        if (newSession?.user) {
          console.log('[AuthContext] User authenticated:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
          await fetchAndSetRole(newSession.user.id, newSession.user.email);
        } else {
          console.log('[AuthContext] User signed out');
          setSession(null);
          setUser(null);
          setRole(null);
        }
      }
    );

    // Start initialization
    initAuth();

    // Cleanup
    return () => {
      console.log('[AuthContext] Cleanup');
      mounted = false;
      clearTimeout(failsafeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Sign in attempt:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[AuthContext] Sign in error:', error.message);
      return { error: error.message };
    }

    console.log('[AuthContext] Sign in successful');
    return { error: null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('[AuthContext] Sign up attempt:', email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      console.error('[AuthContext] Sign up error:', error.message);
      return { error: error.message };
    }

    console.log('[AuthContext] Sign up successful');
    return { error: null };
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] Sign out attempt');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
      console.log('[AuthContext] Sign out successful');
      // Force reload to clear any cached states
      window.location.href = '/';
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAuthenticated: !!user,
        isAdmin: role === 'admin',
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
