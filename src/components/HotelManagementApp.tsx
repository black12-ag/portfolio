import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Hotel,
  Settings,
  Users,
  Calendar,
  BarChart3,
  Receipt,
  Shield,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Map
} from 'lucide-react';

// Import all the components we've created
import CompleteDashboard from './manager/CompleteDashboard';
import ManagerApprovalDashboard from './manager/ManagerApprovalDashboard';
import StaffManager from './manager/StaffManager';
import QuickCheckIn from './reception/QuickCheckIn';
import ReceptionBookingManager from './reception/ReceptionBookingManager';
import VisualRoomMap from './reception/VisualRoomMap';
import VisualRoomMapMobile from './reception/VisualRoomMapMobile';
import { Capacitor } from '@capacitor/core';
import ExpenseManager from './common/ExpenseManager';
import { 
  LanguageProvider, 
  LanguageSelector, 
  useTranslation 
} from './common/LanguageSystem';
import { 
  CurrencyProvider, 
  OfflineProvider, 
  CurrencySelector, 
  OfflineStatus, 
  SyncProgress,
  OfflineDashboard 
} from './common/OfflineSystem';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'assistant_manager' | 'reception' | 'admin';
  permissions: string[];
  avatar?: string;
}

interface HotelInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

const NAVIGATION_ITEMS = {
  manager: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: 'CompleteDashboard' },
    { id: 'approvals', label: 'Approvals', icon: Shield, component: 'ManagerApprovalDashboard' },
    { id: 'staff', label: 'Staff Management', icon: Users, component: 'StaffManager' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, component: 'ExpenseManager' },
    { id: 'offline', label: 'Offline Data', icon: Settings, component: 'OfflineDashboard' }
  ],
  reception: [
    { id: 'checkin', label: 'Quick Check-in', icon: Calendar, component: 'QuickCheckIn' },
    { id: 'bookings', label: 'Booking Manager', icon: Hotel, component: 'ReceptionBookingManager' },
    { id: 'roommap', label: 'Room Map', icon: Map, component: 'VisualRoomMap' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, component: 'ExpenseManager' }
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: 'CompleteDashboard' },
    { id: 'staff', label: 'Staff Management', icon: Users, component: 'StaffManager' },
    { id: 'offline', label: 'Offline Data', icon: Settings, component: 'OfflineDashboard' }
  ]
};

export default function HotelManagementApp() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <OfflineProvider>
          <AppContent />
        </OfflineProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

function AppContent() {
  const { t } = useTranslation();
  
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-001',
    name: 'Alex Manager',
    email: 'alex@hotel.com',
    role: 'manager',
    permissions: ['all'],
    avatar: ''
  });

  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    id: 'hotel-001',
    name: 'Grand Ethiopian Hotel',
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-111-123456',
    email: 'info@grandethiopianhotel.com'
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load user preferences
    const savedTheme = localStorage.getItem('hotel_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('hotel_theme', !isDarkMode ? 'dark' : 'light');
  };

  const navigationItems = NAVIGATION_ITEMS[currentUser.role] || NAVIGATION_ITEMS.reception;

  const renderActiveComponent = () => {
    const activeItem = navigationItems.find(item => item.id === activeView);
    if (!activeItem) return null;

    const commonProps = {
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      permissions: currentUser.permissions,
      managerId: currentUser.id,
      managerName: currentUser.name,
      hotelId: hotelInfo.id,
      receptionistId: currentUser.id,
      receptionistName: currentUser.name
    };

    switch (activeItem.component) {
      case 'CompleteDashboard':
        return (
          <CompleteDashboard
            managerId={currentUser.id}
            managerName={currentUser.name}
            hotelId={hotelInfo.id}
            permissions={currentUser.permissions}
          />
        );
      case 'ManagerApprovalDashboard':
        return (
          <ManagerApprovalDashboard
            managerId={currentUser.id}
            managerName={currentUser.name}
          />
        );
      case 'StaffManager':
        return (
          <StaffManager
            managerId={currentUser.id}
            hotelId={hotelInfo.id}
            permissions={currentUser.permissions}
          />
        );
      case 'QuickCheckIn':
        return <QuickCheckIn />;
      case 'ReceptionBookingManager':
        return (
          <ReceptionBookingManager
            receptionistId={currentUser.id}
            receptionistName={currentUser.name}
          />
        );
      case 'ExpenseManager':
        return (
          <ExpenseManager
            userId={currentUser.id}
            userRole={currentUser.role}
            userName={currentUser.name}
            permissions={currentUser.permissions}
          />
        );
      case 'VisualRoomMap':
        // Use mobile-safe version on Capacitor to avoid maps initialization issues
        if (Capacitor.isNativePlatform()) {
          return (
            <VisualRoomMapMobile
              hotelId={hotelInfo.id}
              userRole={currentUser.role}
              userId={currentUser.id}
            />
          );
        }
        return (
          <VisualRoomMap
            hotelId={hotelInfo.id}
            userRole={currentUser.role}
            userId={currentUser.id}
          />
        );
      case 'OfflineDashboard':
        return <OfflineDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Select a menu item to get started</p>
          </div>
        );
    }
  };

  const switchUserRole = (role: 'manager' | 'reception' | 'admin') => {
    setCurrentUser(prev => ({
      ...prev,
      role,
      name: role === 'manager' ? 'Alex Manager' : 
            role === 'reception' ? 'Sarah Reception' : 
            'Admin User',
      permissions: role === 'manager' ? ['all'] : 
                  role === 'reception' ? ['bookings', 'payments', 'room_status'] : 
                  ['staff_management', 'reports']
    }));
    setActiveView('dashboard');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Hotel Info */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Hotel className="h-6 w-6 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold">{hotelInfo.name}</h1>
                    <p className="text-xs text-gray-500">{hotelInfo.address}</p>
                  </div>
                </div>
              </div>

              {/* Sync Progress */}
              <div className="flex-1 max-w-md mx-4">
                <SyncProgress />
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-3">
                {/* Role Switcher for Demo */}
                <div className="hidden md:flex gap-1">
                  {['manager', 'reception', 'admin'].map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={currentUser.role === role ? 'default' : 'outline'}
                      onClick={() => switchUserRole(role as any)}
                      className="capitalize"
                    >
                      {role}
                    </Button>
                  ))}
                </div>

                <LanguageSelector />
                <CurrencySelector />
                <OfflineStatus />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* User Info */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16
            transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out
          `}>
            <div className="flex flex-col h-full">
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${activeView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer Info */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>METAH Hotel Management</p>
                  <p>Version 2.1.0</p>
                  <p>🇪🇹 Made for Ethiopia</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderActiveComponent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
