import React from 'react';
import { useTranslation } from "react-i18next";
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationItem {
  name: string;
  href: string;
  isActive?: (pathname: string) => boolean;
  requiresAuth?: boolean;
  role?: string;
}

interface NavigationItemsProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
  onItemClick?: () => void;
}

export default function NavigationItems({ className, variant = 'desktop', onItemClick }: NavigationItemsProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems: NavigationItem[] = [
    { 
      name: t('nav.properties'), 
      href: '/properties',
      isActive: (pathname) => pathname === '/properties'
    },
    { 
      name: t('nav.hotels'), 
      href: '/hotels',
      isActive: (pathname) => pathname === '/hotels'
    },
    { 
      name: t('nav.experiences'), 
      href: '/experiences',
      isActive: (pathname) => pathname === '/experiences'
    },
    { 
      name: t('nav.becomeHost'), 
      href: '/host',
      isActive: (pathname) => pathname.startsWith('/host')
    },
  ];

  // Agent navigation items (shown only for agents)
  const agentNavItems: NavigationItem[] = [
    { 
      name: t('agent.dashboard'), 
      href: '/agent/dashboard',
      requiresAuth: true,
      role: 'agent'
    },
    { 
      name: t('agent.workspace'), 
      href: '/agent/workspace',
      requiresAuth: true,
      role: 'agent'
    },
    { 
      name: t('agent.performance'), 
      href: '/agent/performance',
      requiresAuth: true,
      role: 'agent'
    },
    { 
      name: t('agent.knowledgeBase'), 
      href: '/agent/knowledge-base',
      requiresAuth: true,
      role: 'agent'
    },
    { 
      name: t('agent.routing'), 
      href: '/agent/routing',
      requiresAuth: true,
      role: 'agent'
    },
    { 
      name: t('agent.properties'), 
      href: '/agent/properties',
      requiresAuth: true,
      role: 'agent'
    },
  ];

  // Combine navigation items based on user role
  const getAllNavItems = () => {
    let items = [...navItems];
    
    // Add agent items if user is an agent
    if (isAuthenticated && user?.role === 'agent') {
      items = [...items, ...agentNavItems];
    }
    
    return items;
  };

  const allNavItems = getAllNavItems();

  const isItemActive = (item: NavigationItem) => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    return location.pathname === item.href;
  };

  const shouldShowItem = (item: NavigationItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }
    if (item.role && user?.role !== item.role) {
      return false;
    }
    return true;
  };

  if (variant === 'mobile') {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        {allNavItems.filter(shouldShowItem).map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isItemActive(item)
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <nav className={`hidden md:flex items-center space-x-1 ${className}`}>
      {allNavItems.filter(shouldShowItem).map((item) => (
        <Button
          key={item.href}
          variant={isItemActive(item) ? "default" : "ghost"}
          size="sm"
          asChild
          className={cn(
            "transition-colors",
            isItemActive(item) && "bg-primary text-primary-foreground"
          )}
        >
          <Link to={item.href}>
            {item.name}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
