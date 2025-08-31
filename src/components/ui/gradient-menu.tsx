import React, { useCallback, Suspense, lazy, useEffect } from 'react';
import { Home, Heart, Calendar, MessageSquare, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { 
    title: 'Explore', 
    icon: <Home />, 
    href: '/',
    gradientFrom: '#a955ff', 
    gradientTo: '#ea51ff' 
  },
  { 
    title: 'Wishlist', 
    icon: <Heart />, 
    href: '/wishlist',
    gradientFrom: '#56CCF2', 
    gradientTo: '#2F80ED' 
  },
  { 
    title: 'Bookings', 
    icon: <Calendar />, 
    href: '/bookings',
    gradientFrom: '#FF9966', 
    gradientTo: '#FF5E62' 
  },
  { 
    title: 'Messages', 
    icon: <MessageSquare />, 
    href: '/messages',
    gradientFrom: '#80FF72', 
    gradientTo: '#7EE8FA' 
  },
  { 
    title: 'Profile', 
    icon: <User />, 
    href: '/profile',
    gradientFrom: '#ffa9c6', 
    gradientTo: '#f434e2' 
  }
];

export default function GradientMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (href: string) => {
    navigate(href);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex justify-center items-center p-4">
      <ul className="flex gap-4 md:gap-6">
        {menuItems.map(({ title, icon, href, gradientFrom, gradientTo }, idx) => (
          <li
            key={idx}
            style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as React.CSSProperties}
            className={`relative w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[140px] md:hover:w-[180px] hover:shadow-none group cursor-pointer ${
              isActive(href) ? 'shadow-none' : ''
            }`}
            onClick={() => handleItemClick(href)}
          >
            {/* Gradient background on hover or active */}
            <span className={`absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500 ${
              isActive(href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></span>
            
            {/* Blur glow */}
            <span className={`absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] -z-10 transition-all duration-500 ${
              isActive(href) ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'
            }`}></span>

            {/* Icon */}
            <span className={`relative z-10 transition-all duration-500 ${
              isActive(href) ? 'scale-0' : 'group-hover:scale-0'
            } delay-0`}>
              <span className={`text-xl md:text-2xl ${
                isActive(href) ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {icon}
              </span>
            </span>

            {/* Title */}
            <span className={`absolute text-white uppercase tracking-wide text-xs md:text-sm font-medium transition-all duration-500 ${
              isActive(href) ? 'scale-100' : 'scale-0 group-hover:scale-100'
            } delay-150`}>
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
