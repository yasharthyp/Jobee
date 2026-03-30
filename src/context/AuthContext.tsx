import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Tables } from '../types/database';

type Profile = Tables<'profiles'>;
type Worker = Tables<'workers'>;
type Company = Tables<'companies'>;

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  worker: Worker | null;
  company: Company | null;
  loading: boolean;
  isOnboarded: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setWorker: (worker: Worker) => void;
  setCompany: (company: Company) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    worker: null,
    company: null,
    loading: true,
    isOnboarded: false,
  });

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      let worker: Worker | null = null;
      let company: Company | null = null;

      if (profile?.role === 'worker') {
        const { data } = await supabase
          .from('workers')
          .select('*')
          .eq('profile_id', userId)
          .single();
        worker = data;
      } else if (profile?.role === 'company') {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .eq('profile_id', userId)
          .single();
        company = data;
      }

      const isOnboarded =
        !!profile &&
        ((profile.role === 'worker' && !!worker) ||
          (profile.role === 'company' && !!company));

      setState((prev) => ({
        ...prev,
        profile: profile ?? null,
        worker,
        company,
        isOnboarded,
        loading: false,
      }));
    } catch (err) {
      console.error('fetchUserData error:', err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session }));
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session }));
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState((prev) => ({
          ...prev,
          profile: null,
          worker: null,
          company: null,
          isOnboarded: false,
          loading: false,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Sign In Error', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Sign Up Error', error.message);
      throw error;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email,
      });
      if (profileError) {
        console.error('Error creating profile:', profileError);
        Alert.alert('Profile Error', 'Account created but profile setup failed. Please try logging in.');
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (state.session?.user) {
      await fetchUserData(state.session.user.id);
    }
  };

  const setWorker = (worker: Worker) => {
    setState((prev) => ({ ...prev, worker, isOnboarded: true }));
  };

  const setCompany = (company: Company) => {
    setState((prev) => ({ ...prev, company, isOnboarded: true }));
  };

  const updateProfile = (updates: Partial<Profile>) => {
    setState((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        setWorker,
        setCompany,
        updateProfile,
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
