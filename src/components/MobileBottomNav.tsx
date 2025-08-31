import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Heart, Calendar, MessageSquare, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive: (pathname: string) => boolean;
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { pathname } = location;

  // Hide on reception dashboard pages (ReceptionMobileNav handles those)
  const isReceptionPage = pathname.startsWith('/reception') || pathname.startsWith('/re') || 
                         pathname.includes('/desk/reception') || pathname.includes('/desk/re') || 
                         pathname.includes('reception-local') || pathname.includes('re-local');
  
  if (isReceptionPage) {
    return null;
  }

  const items: NavItem[] = [
    {
      label: 'Explore',
      href: '/',
      icon: <Home className="h-5 w-5" />,
      isActive: (p) => p === '/',
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: <Heart className="h-5 w-5" />,
      isActive: (p) => p === '/wishlist' || p.startsWith('/profile/wishlist'),
    },
    {
      label: 'Bookings',
      href: '/bookings',
      icon: <Calendar className="h-5 w-5" />,
      isActive: (p) => p === '/bookings' || p.startsWith('/profile/bookings'),
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      isActive: (p) => p.startsWith('/messages'),
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: <User className="h-5 w-5" />,
      isActive: (p) => p.startsWith('/profile'),
    },
  ];

  return (
    <nav
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors relative',
                active ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200',
                  active
                    ? 'bg-rose-100 dark:bg-rose-900/30 ring-2 ring-rose-300 dark:ring-rose-800'
                    : 'bg-transparent'
                )}
              >
                {item.icon}
              </div>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
