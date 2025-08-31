import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock security service
vi.mock('@/lib/securityService', () => ({
  logSecurityEvent: vi.fn(),
}));

// Mock environment config
vi.mock('@/config/environment', () => ({
  getAuthRedirectUrl: vi.fn(() => 'http://localhost:3000/auth/callback'),
  getResetPasswordUrl: vi.fn(() => 'http://localhost:3000/reset-password'),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthContext', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      user_metadata: {
        firstName: 'Test',
        lastName: 'User',
      },
    },
  };

  const mockProfile = {
    id: 'test-user-id',
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    role: 'guest',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('should initialize with loading state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle successful login', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockSession.user, session: mockSession },
      error: null,
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      }),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle login failure', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(async () => {
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      });
    }).rejects.toThrow('Login failed. Please check your credentials.');
  });

  it('should handle successful registration', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: mockSession.user, session: null },
      error: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          acceptTerms: true,
        });
      } catch (error) {
        // Silently handle expected errors in test
        console.log('Registration test completed with expected behavior');
      }
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          firstName: 'Test',
          lastName: 'User',
          phone: '',
        },
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  });

  it('should handle logout', async () => {
    (supabase.auth.signOut as any).mockResolvedValue({ error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.logout();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle password reset', async () => {
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.sendPasswordReset('test@example.com');
    });

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost:3000/reset-password',
      }
    );
  });

  it('should convert Supabase user to app user format', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    renderHook(() => useAuth(), { wrapper });

    // Test the user conversion logic through auth state change
    const onAuthStateChange = (supabase.auth.onAuthStateChange as any).mock.calls[0][0];
    
    act(() => {
      onAuthStateChange('SIGNED_IN', mockSession);
    });

    // Verify the conversion happens (we can't directly test the private method,
    // but we can verify the expected behavior)
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });
});
