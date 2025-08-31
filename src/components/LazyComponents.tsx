import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const LoadingFallback = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary?: () => void 
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-md p-6">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">
        {error.message || "An unexpected error occurred"}
      </p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

// Lazy load page components
export const LazyEnhancedSearchResults = lazy(() => 
  import('../pages/EnhancedSearchResults').then(module => ({
    default: module.default
  }))
);

export const LazyHotelDemo = lazy(() => 
  import('../pages/HotelDemo').then(module => ({
    default: module.default
  }))
);

export const LazyButtonTest = lazy(() => 
  import('../pages/ButtonTest').then(module => ({
    default: module.default
  }))
);


// HOC to wrap lazy components with Suspense and error boundary
export const withLazyLoading = (Component: React.ComponentType, loadingText?: string) => {
  return function LazyLoadedComponent(props: unknown) {
    return (
      <Suspense fallback={<LoadingFallback text={loadingText} />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

// Pre-wrapped components ready to use
export const EnhancedSearchResults = withLazyLoading(LazyEnhancedSearchResults, "Loading search results...");
export const HotelDemo = withLazyLoading(LazyHotelDemo, "Loading hotel demo...");
export const ButtonTest = withLazyLoading(LazyButtonTest, "Loading button test...");

// Admin Components (Heavy - Load on demand)
export const LazyAdminDashboard = lazy(() => 
  import('../pages/admin/AdminDashboard').then(module => ({ default: module.default }))
);

export const LazyCompanyManagement = lazy(() => 
  import('../pages/admin/CompanyManagement').then(module => ({ default: module.default }))
);

export const LazyPropertyManagement = lazy(() => 
  import('../components/admin/PropertyManagement').then(module => ({ default: module.default }))
);

export const LazySecurityDashboard = lazy(() => 
  import('../components/admin/SecurityDashboard').then(module => ({ default: module.default }))
);

export const LazyPCIComplianceDashboard = lazy(() => 
  import('../components/admin/PCIComplianceDashboard').then(module => ({ default: module.default }))
);

// Agent/Staff Components
export const LazyAgentDashboard = lazy(() => 
  import('../pages/agent/AgentDashboard').then(module => ({ default: module.default }))
);

export const LazyReception = lazy(() => 
  import('../pages/staff/Reception').then(module => ({ default: module.default }))
);

export const LazyManager = lazy(() => 
  import('../pages/staff/Manager').then(module => ({ default: module.default }))
);

export const LazyHousekeeping = lazy(() => 
  import('../pages/staff/Housekeeping').then(module => ({ default: module.default }))
);

export const LazyMaintenance = lazy(() => 
  import('../pages/staff/Maintenance').then(module => ({ default: module.default }))
);

export const LazyKitchen = lazy(() => 
  import('../pages/staff/Kitchen').then(module => ({ default: module.default }))
);

export const LazySecurity = lazy(() => 
  import('../pages/staff/Security').then(module => ({ default: module.default }))
);

// Heavy Components (Maps, Charts, etc.)
export const LazyHotelManagementApp = lazy(() => 
  import('../components/HotelManagementApp').then(module => ({ default: module.default }))
);

export const LazyBecomeHost = lazy(() => 
  import('../pages/BecomeHost').then(module => ({ default: module.default }))
);

// Profile Components
export const LazyProfile = lazy(() => 
  import('../pages/profile/Profile').then(module => ({ default: module.default }))
);

export const LazyBookings = lazy(() => 
  import('../pages/profile/Bookings').then(module => ({ default: module.default }))
);

export const LazyWishlist = lazy(() => 
  import('../pages/profile/Wishlist').then(module => ({ default: module.default }))
);

// Wrapped components ready to use
export const AdminDashboard = withLazyLoading(LazyAdminDashboard, "Loading admin dashboard...");
export const CompanyManagement = withLazyLoading(LazyCompanyManagement, "Loading company management...");
export const PropertyManagement = withLazyLoading(LazyPropertyManagement, "Loading property management...");
export const SecurityDashboard = withLazyLoading(LazySecurityDashboard, "Loading security dashboard...");
export const PCIComplianceDashboard = withLazyLoading(LazyPCIComplianceDashboard, "Loading compliance dashboard...");

export const AgentDashboard = withLazyLoading(LazyAgentDashboard, "Loading agent dashboard...");
export const Reception = withLazyLoading(LazyReception, "Loading reception interface...");
export const Manager = withLazyLoading(LazyManager, "Loading manager dashboard...");
export const Housekeeping = withLazyLoading(LazyHousekeeping, "Loading housekeeping interface...");
export const Maintenance = withLazyLoading(LazyMaintenance, "Loading maintenance dashboard...");
export const Kitchen = withLazyLoading(LazyKitchen, "Loading kitchen management...");
export const Security = withLazyLoading(LazySecurity, "Loading security interface...");

export const HotelManagementApp = withLazyLoading(LazyHotelManagementApp, "Loading hotel management...");
export const BecomeHost = withLazyLoading(LazyBecomeHost, "Loading host registration...");

export const Profile = withLazyLoading(LazyProfile, "Loading profile...");
export const Bookings = withLazyLoading(LazyBookings, "Loading bookings...");
export const Wishlist = withLazyLoading(LazyWishlist, "Loading wishlist...");

// Bundle splitting utilities
export const preloadComponent = (componentLoader: () => Promise<{ default: React.ComponentType<any> }>) => {
  // Preload a component for better UX
  return componentLoader();
};

export const preloadAdminComponents = () => {
  // Preload admin components when user navigates to admin section
  return Promise.all([
    import('../pages/admin/AdminDashboard'),
    import('../components/admin/PropertyManagement'),
    import('../components/admin/SecurityDashboard')
  ]);
};

export const preloadStaffComponents = () => {
  // Preload staff components when user has staff role
  return Promise.all([
    import('../pages/staff/Reception'),
    import('../pages/staff/Manager'),
    import('../pages/staff/Housekeeping')
  ]);
};

export { ErrorFallback, LoadingFallback };
