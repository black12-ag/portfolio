import React, { useState, lazy, Suspense, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Heart, Calendar, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationCenter from '@/components/NotificationCenter';

// Lazy load auth modals for better performance
const LoginModal = lazy(() => import('@/components/auth/LoginModal'));
const RegisterModal = lazy(() => import('@/components/auth/RegisterModal'));

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className }: UserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Notification Center */}
        <NotificationCenter />
        
        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full"
              aria-label={t('user.menu')}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name?.slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && (
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              {t('user.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/bookings')}>
              <Calendar className="mr-2 h-4 w-4" />
              {t('user.bookings')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/wishlist')}>
              <Heart className="mr-2 h-4 w-4" />
              {t('user.wishlist')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              {t('user.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('user.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setShowLoginModal(true)}
        aria-label={t('auth.login')}
      >
        {t('auth.login')}
      </Button>
      <Button
        onClick={() => setShowRegisterModal(true)}
        aria-label={t('auth.register')}
      >
        {t('auth.register')}
      </Button>

      {/* Auth Modals */}
      <Suspense fallback={null}>
        <LoginModal 
          open={showLoginModal} 
          onOpenChange={setShowLoginModal}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
        <RegisterModal 
          open={showRegisterModal} 
          onOpenChange={setShowRegisterModal}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </Suspense>
    </div>
  );
}
