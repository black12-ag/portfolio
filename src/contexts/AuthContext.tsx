import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getAuthRedirectUrl, getResetPasswordUrl, log } from '@/config/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  nationality?: string;
  preferences: {
    currency: string;
    language: string;
  };
  isVerified: boolean;
  createdAt: string;
  role: 'guest' | 'host' | 'admin' | 'agent' | 'senior_agent';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to our User type
  interface ProfileData {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    date_of_birth?: string;
    nationality?: string;
    preferences?: {
      currency: string;
      language: string;
    };
    role?: 'guest' | 'host' | 'admin' | 'agent' | 'senior_agent';
  }

  const convertSupabaseUser = (supabaseUser: SupabaseUser, profile: ProfileData | null = null): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    firstName: profile?.first_name || supabaseUser.user_metadata?.firstName || '',
    lastName: profile?.last_name || supabaseUser.user_metadata?.lastName || '',
    phone: profile?.phone || supabaseUser.user_metadata?.phone || '',
    avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
    dateOfBirth: profile?.date_of_birth || '',
    nationality: profile?.nationality || '',
    preferences: profile?.preferences || {
      currency: 'ETB',
      language: 'en'
    },
    isVerified: supabaseUser.email_confirmed_at !== null,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
    role: profile?.role || 'guest'
  });

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          // Get user profile from database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(convertSupabaseUser(session.user, profile));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile from database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(convertSupabaseUser(session.user, profile));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw error;
      }

      // Log successful login
      try {
        const { logSecurityEvent } = await import('@/lib/securityService');
        logSecurityEvent('login', {
          userId: data.user?.id,
          email: data.user?.email,
        }, 'low');
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }
    } catch (error) {
      // Log failed login attempt
      try {
        const { logSecurityEvent } = await import('@/lib/securityService');
        logSecurityEvent('failed_login', {
          email: credentials.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'medium');
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting registration process for:', data.email);
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || ''
          },
          emailRedirectTo: getAuthRedirectUrl()
        }
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw error;
      }

      console.log('✅ Supabase registration successful:', {
        userId: authData.user?.id,
        emailConfirmed: authData.user?.email_confirmed_at,
        needsEmailConfirmation: !authData.user?.email_confirmed_at
      });

      if (authData.user) {
        // Create profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone || '',
            preferences: {
              currency: 'ETB',
              language: 'en'
            },
            role: 'guest'
          });

        if (profileError) {
          console.error('⚠️ Profile creation error:', profileError);
        } else {
          console.log('✅ Profile created successfully');
        }
      }

      // Note: Supabase handles email verification automatically
      // The user will need to click the verification link in their email
      console.log('📧 Email verification required. User needs to check email.');
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    // User state will be updated via onAuthStateChange
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update profile in database
      const profileUpdate = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        avatar_url: data.avatar,
        date_of_birth: data.dateOfBirth,
        nationality: data.nationality,
        preferences: data.preferences
      };

      // Remove undefined values
      Object.keys(profileUpdate).forEach(key => 
        profileUpdate[key] === undefined && delete profileUpdate[key]
      );

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update user metadata if needed
      if (data.firstName || data.lastName) {
        await supabase.auth.updateUser({
          data: {
            firstName: data.firstName || user.firstName,
            lastName: data.lastName || user.lastName
          }
        });
      }

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Profile update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getResetPasswordUrl()
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Verifying email with token:', token);
      
      // If using Supabase auth, verify with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        console.error('❌ Email verification error:', error);
        throw error;
      }

      console.log('✅ Email verified successfully:', data);
      
      // User will be automatically signed in via onAuthStateChange
      return { message: 'Email verified successfully' };
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Email verification failed. Please try again or request a new verification link.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const loginWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const sendMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      log.info('Sending magic link to:', email);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl()
        }
      });

      if (error) {
        log.error('Magic link error:', error);
        throw error;
      }

      log.info('Magic link sent successfully');
    } catch (error) {
      log.error('Failed to send magic link:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Verifying OTP for:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('❌ OTP verification error:', error);
        throw error;
      }

      console.log('✅ OTP verified successfully:', data);
      
      // User will be automatically signed in via onAuthStateChange
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    sendPasswordReset,
    verifyEmail,
    loginWithGoogle,
    loginWithFacebook,
    sendMagicLink,
    verifyOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
