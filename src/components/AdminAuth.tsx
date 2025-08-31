import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'system_admin' | 'super_admin';
  firstName: string;
  lastName: string;
  permissions: string[];
}

interface AdminContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string, resource?: string, action?: string) => boolean;
  isRole: (role: string | string[]) => boolean;
  logAction: (action: string, resource?: string, resourceId?: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize admin session
  useEffect(() => {
    checkAdminSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadAdminProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadAdminProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Check if user is an admin
      if (!['admin', 'system_admin', 'super_admin'].includes(profile.role)) {
        throw new Error('Access denied: Admin privileges required');
      }

      // Load permissions
      const { data: permissions, error: permError } = await supabase
        .from('admin_permissions')
        .select('permission, resource, action')
        .eq('role', profile.role);

      if (permError) throw permError;

      const adminUser: AdminUser = {
        id: user.id,
        email: user.email,
        role: profile.role,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        permissions: permissions.map(p => `${p.permission}:${p.resource}:${p.action}`)
      };

      setAdmin(adminUser);
    } catch (error) {
      console.error('Error loading admin profile:', error);
      setAdmin(null);
      await supabase.auth.signOut();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await loadAdminProfile(data.user);
        toast.success('Admin login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(`Login failed: ${  (error as Error).message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAdmin(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const hasPermission = (permission: string, resource = 'all', action = 'all'): boolean => {
    if (!admin) return false;

    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;

    // Check specific permissions
    const permissionKey = `${permission}:${resource}:${action}`;
    const fullAccessKey = `full_access:all:all`;

    return admin.permissions.includes(permissionKey) || 
           admin.permissions.includes(fullAccessKey);
  };

  const isRole = (role: string | string[]): boolean => {
    if (!admin) return false;
    
    if (Array.isArray(role)) {
      return role.includes(admin.role);
    }
    
    return admin.role === role;
  };

  const logAction = async (action: string, resource?: string, resourceId?: string) => {
    if (!admin) return;

    try {
      await supabase
        .from('admin_access_logs')
        .insert({
          admin_id: admin.id,
          action,
          resource,
          resource_id: resourceId,
          success: true
        });
    } catch (error) {
      console.warn('Failed to log admin action:', error);
    }
  };

  const value: AdminContextType = {
    admin,
    loading,
    login,
    logout,
    hasPermission,
    isRole,
    logAction
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Admin Login Component
export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(email, password);
    if (success) {
      // Redirect will be handled by the parent component
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            METAH Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the administrative dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-t-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-b-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔒 Authorized personnel only</p>
            <p>All access attempts are logged</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Guard Component
interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  resource?: string;
  action?: string;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  resource = 'all',
  action = 'read'
}) => {
  const { admin, loading, hasPermission, isRole } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  // Check role requirements
  if (requiredRole && !isRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have the required role to access this page.</p>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission, resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have the required permissions to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
