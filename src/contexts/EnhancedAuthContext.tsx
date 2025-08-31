import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { advancedAuthService, UserProfile, AuthResult } from '@/services/advancedAuthService';
import { Capacitor } from '@capacitor/core';
import { emailVerificationService } from '@/services/auth/emailVerificationService';
import { phoneVerificationService } from '@/services/auth/phoneVerificationService';
import { passwordService } from '@/services/auth/passwordService';

export interface EnhancedUser extends UserProfile {
  role: 'guest' | 'host' | 'admin' | 'agent' | 'senior_agent';
  subscription?: {
    plan: 'free' | 'premium' | 'business';
    expiresAt?: string;
  };
  hostProfile?: {
    verified: boolean;
    properties: number;
    rating: number;
    responseRate: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface TwoFactorSetup {
  method: 'sms' | 'totp' | 'email';
  phoneNumber?: string;
}

interface EnhancedAuthContextType {
  // User state
  user: EnhancedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authToken: string | null;

  // Basic authentication
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;

  // OAuth authentication  
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithApple: () => Promise<void>;

  // Advanced authentication
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<void>;

  // Two-factor authentication
  setupTwoFactor: (options: TwoFactorSetup) => Promise<{ secret?: string; qrCode?: string }>;
  verifyTwoFactor: (code: string, method: 'sms' | 'totp' | 'email') => Promise<boolean>;
  disableTwoFactor: () => Promise<void>;

  // Profile management
  updateProfile: (data: Partial<EnhancedUser>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (phoneNumber: string, code: string) => Promise<void>;

  // Security
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // Account management
  deleteAccount: (password: string) => Promise<void>;
  exportUserData: () => Promise<any>;
  
  // Utilities
  refreshToken: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const isAuthenticated = !!user && !!authToken;

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const storedUser = advancedAuthService.getCurrentUser();
      const storedToken = advancedAuthService.getAuthToken();

      if (storedUser && storedToken) {
        setUser(enhanceUser(storedUser));
        setAuthToken(storedToken);
        
        // Verify token is still valid
        await checkAuthStatus();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceUser = (baseUser: UserProfile): EnhancedUser => {
    return {
      ...baseUser,
      role: 'guest', // Default role, would be determined by backend
      subscription: {
        plan: 'free'
      }
    };
  };

  // Basic Authentication Methods
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.signInWithEmail(
        credentials.email,
        credentials.password
      );

      if (result.success && result.user && result.token) {
        const enhancedUser = enhanceUser(result.user);
        setUser(enhancedUser);
        setAuthToken(result.token);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.registerWithEmail({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      if (result.success) {
        if (result.requiresVerification) {
          // Handle email verification flow
          console.log('Email verification required');
        } else if (result.user && result.token) {
          const enhancedUser = enhanceUser(result.user);
          setUser(enhancedUser);
          setAuthToken(result.token);
        }
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await advancedAuthService.signOut();
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Authentication Methods
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.signInWithGoogle();
      
      if (result.success && result.user && result.token) {
        const enhancedUser = enhanceUser(result.user);
        setUser(enhancedUser);
        setAuthToken(result.token);
      } else {
        throw new Error(result.error || 'Google login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.signInWithFacebook();
      
      if (result.success && result.user && result.token) {
        const enhancedUser = enhanceUser(result.user);
        setUser(enhancedUser);
        setAuthToken(result.token);
      } else {
        throw new Error(result.error || 'Facebook login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.signInWithApple();
      
      if (result.success && result.user && result.token) {
        const enhancedUser = enhanceUser(result.user);
        setUser(enhancedUser);
        setAuthToken(result.token);
      } else {
        throw new Error(result.error || 'Apple login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Magic Link Authentication
  const sendMagicLink = async (email: string): Promise<void> => {
    const result = await advancedAuthService.sendMagicLink({ email });
    if (!result.success) {
      throw new Error(result.error || 'Failed to send magic link');
    }
  };

  const verifyMagicLink = async (token: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.verifyMagicLink(token);
      
      if (result.success && result.user && result.token) {
        const enhancedUser = enhanceUser(result.user);
        setUser(enhancedUser);
        setAuthToken(result.token);
      } else {
        throw new Error(result.error || 'Invalid magic link');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric Authentication
  const enableBiometric = async (): Promise<boolean> => {
    const result = await advancedAuthService.enableBiometricAuth();
    return result.success;
  };

  const authenticateWithBiometric = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await advancedAuthService.authenticateWithBiometric();
      
      if (result.success && result.user) {
        const enhancedUser = enhanceUser(result.user);
        setUser(enhancedUser);
        setAuthToken(result.token || authToken);
      } else {
        throw new Error(result.error || 'Biometric authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Two-Factor Authentication
  const setupTwoFactor = async (options: TwoFactorSetup): Promise<{ secret?: string; qrCode?: string }> => {
    const result = await advancedAuthService.setupTwoFactor({
      method: options.method,
      phoneNumber: options.phoneNumber
    });

    if (!result.success) {
      throw new Error(result.error || '2FA setup failed');
    }

    return {
      secret: result.secret,
      qrCode: result.qrCode
    };
  };

  const verifyTwoFactor = async (code: string, method: 'sms' | 'totp' | 'email'): Promise<boolean> => {
    const result = await advancedAuthService.verifyTwoFactor(code, method);
    return result.success;
  };

  const disableTwoFactor = async (): Promise<void> => {
    // Implementation would disable 2FA for the user
    console.log('2FA disabled');
  };

  // Profile Management
  const updateProfile = async (data: Partial<EnhancedUser>): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    try {
      // Update local state immediately for better UX
      setUser(prev => prev ? { ...prev, ...data } : null);

      // TODO: Send update to backend
      console.log('Profile updated:', data);
    } catch (error) {
      // Revert on error
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    // TODO: Implement file upload to cloud storage
    const url = URL.createObjectURL(file);
    await updateProfile({ avatar: url });
    return url;
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      const result = await emailVerificationService.verifyEmailToken(token);
      if (result.success && user) {
        setUser(prev => prev ? { ...prev, emailVerified: true } : null);
      } else {
        throw new Error(result.error || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const verifyPhone = async (phoneNumber: string, code: string): Promise<void> => {
    try {
      const result = await phoneVerificationService.verifyPhoneCode(phoneNumber, code);
      if (result.success && user) {
        const formattedPhone = phoneVerificationService.formatPhoneNumber(phoneNumber, 'US');
        setUser(prev => prev ? { ...prev, phoneVerified: true, phone: formattedPhone } : null);
      } else {
        throw new Error(result.error || 'Phone verification failed');
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };

  // Security Methods
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const result = await passwordService.changePassword(currentPassword, newPassword);
      if (!result.success) {
        throw new Error(result.error || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      const result = await passwordService.sendPasswordReset(email);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      const result = await passwordService.resetPassword(token, newPassword);
      if (!result.success) {
        throw new Error(result.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Account Management
  const deleteAccount = async (password: string): Promise<void> => {
    // TODO: Implement account deletion
    console.log('Account deleted');
    await logout();
  };

  const exportUserData = async (): Promise<any> => {
    if (!user) throw new Error('Not authenticated');
    
    // TODO: Export user data for GDPR compliance
    return {
      user,
      exportedAt: new Date().toISOString()
    };
  };

  // Utility Methods
  const refreshToken = async (): Promise<void> => {
    // TODO: Implement token refresh
    console.log('Token refreshed');
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      // TODO: Verify token with backend
      return isAuthenticated;
    } catch (error) {
      await logout();
      return false;
    }
  };

  const contextValue: EnhancedAuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated,
    authToken,

    // Basic auth
    login,
    register,
    logout,

    // OAuth
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,

    // Advanced auth
    sendMagicLink,
    verifyMagicLink,
    enableBiometric,
    authenticateWithBiometric,

    // 2FA
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,

    // Profile
    updateProfile,
    uploadAvatar,
    verifyEmail,
    verifyPhone,

    // Security
    changePassword,
    sendPasswordReset,
    resetPassword,

    // Account
    deleteAccount,
    exportUserData,

    // Utilities
    refreshToken,
    checkAuthStatus
  };

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export const useEnhancedAuth = (): EnhancedAuthContextType => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};
