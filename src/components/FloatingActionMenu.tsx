import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  X, 
  Search, 
  Heart, 
  Calendar, 
  User, 
  Settings, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Camera, 
  Mic, 
  Share2,
  BookOpen,
  Calculator,
  Bell,
  Zap,
  TrendingUp,
  Award,
  Gift,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FloatingAction {
  id: string;
  icon: React.ComponentTypeunknown;
  label: string;
  color: string;
  action: () => void;
  badge?: string;
  premium?: boolean;
}

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 120 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isRemoveZoneActive, setIsRemoveZoneActive] = useState(false);
  const [isHidden, setIsHidden] = useState(() => {
    try {
      return localStorage.getItem('floating-action-menu-hidden') === 'true';
    } catch {
      return false;
    }
  });
  
  // Shared positioning logic
  const getPositionData = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const buttonCenterX = position.x + 35;
    const buttonCenterY = position.y + 35;
    
    // Estimate menu height
    const menuHeight = 400;
    
    // Check available space
    const spaceAbove = position.y;
    const spaceBelow = screenHeight - (position.y + 70);
    const showBelow = spaceAbove < menuHeight && spaceBelow >= menuHeight;
    
    // Determine horizontal position
    let horizontalPosition: 'left' | 'right' | 'center' = 'center';
    if (buttonCenterX > screenWidth * 0.6) {
      horizontalPosition = 'right'; // button on right, menu on left
    } else if (buttonCenterX < screenWidth * 0.4) {
      horizontalPosition = 'left'; // button on left, menu on right
    }
    
    return {
      screenWidth,
      screenHeight,
      buttonCenterX,
      buttonCenterY,
      showBelow,
      horizontalPosition
    };
  };
  
  // Dynamic positioning for tooltip and menu
  const getTooltipSide = () => {
    const { buttonCenterX, screenWidth } = getPositionData();
    
    if (buttonCenterX > screenWidth * 0.6) return 'left';
    if (buttonCenterX < screenWidth * 0.4) return 'right';
    return 'left'; // default
  };
  
  const getMenuPosition = () => {
    const { showBelow, horizontalPosition } = getPositionData();
    
    let menuClass = 'w-80 max-h-96 overflow-y-auto shadow-2xl animate-in ';
    
    // Apply positioning classes based on calculated position
    if (horizontalPosition === 'right') {
      // Button on right side - menu appears to the left
      if (showBelow) {
        menuClass += 'slide-in-from-right-2 slide-in-from-top-2 ';
      } else {
        menuClass += 'slide-in-from-right-2 slide-in-from-bottom-2 ';
      }
    } else if (horizontalPosition === 'left') {
      // Button on left side - menu appears to the right
      if (showBelow) {
        menuClass += 'slide-in-from-left-2 slide-in-from-top-2 ';
      } else {
        menuClass += 'slide-in-from-left-2 slide-in-from-bottom-2 ';
      }
    } else {
      // Button in center
      if (showBelow) {
        menuClass += 'slide-in-from-top-2 mt-4 ';
      } else {
        menuClass += 'slide-in-from-bottom-2 mb-4 ';
      }
    }
    
    return menuClass;
  };
  
  const getMenuStyle = () => {
    const { showBelow, horizontalPosition } = getPositionData();
    
    if (horizontalPosition === 'right') {
      // Position menu to the left of button when button is on right side
      return {
        position: 'absolute' as const,
        right: '100%',
        marginRight: '8px',
        ...(showBelow 
          ? { marginTop: '16px', top: '0' }
          : { marginBottom: '16px', bottom: '0' }
        )
      };
    } else if (horizontalPosition === 'left') {
      // Position menu to the right of button when button is on left side
      return {
        position: 'absolute' as const,
        left: '100%',
        marginLeft: '8px',
        ...(showBelow 
          ? { marginTop: '16px', top: '0' }
          : { marginBottom: '16px', bottom: '0' }
        )
      };
    } else {
      // Position menu above or below button (center positioning)
      if (showBelow) {
        return { marginTop: '16px' };
      } else {
        return { marginBottom: '16px' };
      }
    }
  };
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 120)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide/show based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when menu is open
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return; // Don't drag when menu is open
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 70, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 70, e.clientY - dragStart.y));
      
      // Check if in remove zone (bottom center of screen)
      const removeZoneX = window.innerWidth / 2 - 50;
      const removeZoneY = window.innerHeight - 100;
      const isInRemoveZone = 
        newX >= removeZoneX - 50 && newX <= removeZoneX + 50 &&
        newY >= removeZoneY - 50;
      
      setIsRemoveZoneActive(isInRemoveZone);
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth - 70, touch.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 70, touch.clientY - dragStart.y));
      
      // Check if in remove zone (bottom center of screen)
      const removeZoneX = window.innerWidth / 2 - 50;
      const removeZoneY = window.innerHeight - 100;
      const isInRemoveZone = 
        newX >= removeZoneX - 50 && newX <= removeZoneX + 50 &&
        newY >= removeZoneY - 50;
      
      setIsRemoveZoneActive(isInRemoveZone);
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isRemoveZoneActive) {
        // Hide the widget
        setIsHidden(true);
        try {
          localStorage.setItem('floating-action-menu-hidden', 'true');
        } catch {}
        toast({ 
          title: "Widget Hidden", 
          description: "Double-tap anywhere to restore the floating menu",
          duration: 5000
        });
      }
      setIsDragging(false);
      setIsRemoveZoneActive(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStart, isRemoveZoneActive, toast]);

  // Double-tap to restore functionality
  useEffect(() => {
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;
    
    const handleDoubleTab = () => {
      if (isHidden) {
        setIsHidden(false);
        try {
          localStorage.removeItem('floating-action-menu-hidden');
        } catch {}
        toast({
          title: "Widget Restored",
          description: "The floating menu is back!",
          duration: 3000
        });
      }
    };
    
    const handleTap = () => {
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 300); // Reset after 300ms
      } else if (tapCount === 2) {
        clearTimeout(tapTimer);
        tapCount = 0;
        handleDoubleTab();
      }
    };
    
    if (isHidden) {
      document.addEventListener('click', handleTap);
      document.addEventListener('touchend', handleTap);
    }
    
    return () => {
      document.removeEventListener('click', handleTap);
      document.removeEventListener('touchend', handleTap);
      if (tapTimer) clearTimeout(tapTimer);
    };
  }, [isHidden, toast]);

  const quickActions: FloatingAction[] = [
    {
      id: 'search',
      icon: Search,
      label: 'Quick Search',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        navigate('/search');
        toast({ title: "Quick Search", description: "Find your perfect accommodation" });
      }
    },
    {
      id: 'wishlist',
      icon: Heart,
      label: 'My Wishlist',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => {
        navigate('/wishlist');
        toast({ title: "Wishlist", description: "View your saved properties" });
      },
      badge: JSON.parse(localStorage.getItem('wishlist') || '[]').length.toString()
    },
    {
      id: 'bookings',
      icon: Calendar,
      label: 'My Bookings',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        navigate('/bookings');
        toast({ title: "Bookings", description: "Manage your reservations" });
      },
      badge: JSON.parse(localStorage.getItem('user-bookings') || '[]').length.toString()
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => {
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          toast({ title: "Sign In Required", description: "Please sign in to view your profile" });
        }
      }
    },
    {
      id: 'near-me',
      icon: MapPin,
      label: 'Near Me',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(() => {
            navigate('/search?location=nearby');
            toast({ title: "Near Me", description: "Finding properties near your location" });
          });
        }
      }
    },
    {
      id: 'voice-search',
      icon: Mic,
      label: 'Voice Search',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          toast({ title: "Voice Search", description: "Say your destination" });
        } else {
          toast({ title: "Not Supported", description: "Voice search not available on this device", variant: "destructive" });
        }
      },
      premium: true
    },
    {
      id: 'photo-search',
      icon: Camera,
      label: 'Photo Search',
      color: 'bg-pink-500 hover:bg-pink-600',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = () => {
          toast({ title: "Photo Search", description: "Finding similar places..." });
        };
        input.click();
      },
      premium: true
    },
    {
      id: 'trip-planner',
      icon: BookOpen,
      label: 'Trip Planner',
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => {
        navigate('/search?planner=true');
        toast({ title: "Trip Planner", description: "Plan your perfect itinerary" });
      }
    },
    {
      id: 'budget-calc',
      icon: Calculator,
      label: 'Budget Calculator',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => {
        toast({ title: "Budget Calculator", description: "Calculate your trip costs" });
      }
    },
    {
      id: 'price-alerts',
      icon: Bell,
      label: 'Price Alerts',
      color: 'bg-amber-500 hover:bg-amber-600',
      action: () => {
        const alert = {
          id: Date.now(),
          type: 'price_alert',
          title: 'Price Alert Set',
          message: 'We\'ll notify you when prices drop',
          timestamp: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('user-notifications') || '[]');
        localStorage.setItem('user-notifications', JSON.stringify([alert, ...existing].slice(0, 10)));
        toast({ title: "Price Alert Set", description: "You'll be notified of price drops" });
      }
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share App',
      color: 'bg-gray-500 hover:bg-gray-600',
      action: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Metah Travel Platform',
              text: 'Check out this amazing travel booking platform!',
              url: window.location.origin
            });
            toast({ title: "Shared Successfully", description: "Thanks for sharing Metah!" });
          } catch (err) {
            console.log('Share cancelled');
          }
        } else {
          navigator.clipboard.writeText(window.location.origin);
          toast({ title: "Link Copied", description: "Share this link with friends" });
        }
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      color: 'bg-slate-500 hover:bg-slate-600',
      action: () => {
        navigate('/support');
        toast({ title: "Help & Support", description: "We're here to help you" });
      }
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: FloatingAction) => {
    action.action();
    setIsOpen(false);
  };

  // Don't render if widget is hidden
  if (isHidden) return null;
  
  // Only show for admin users
  if (!isAuthenticated || !user?.role || user.role !== 'admin') return null;
  
  if (!isVisible) return null;

  return (
    <TooltipProvider>
      {/* Remove Zone Indicator - Only show when dragging and in remove zone */}
      {isDragging && isRemoveZoneActive && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-red-500 border-4 border-red-600 transition-all duration-200 flex items-center justify-center z-40 scale-110 animate-pulse"
        >
          <X className="h-8 w-8 text-white" />
        </div>
      )}
      
      <div 
        className="fixed z-50 transition-all duration-200"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          cursor: isDragging ? 'grabbing' : (isOpen ? 'default' : 'grab')
        }}
      >
        {/* Action Menu */}
        {isOpen && (
          <Card className={getMenuPosition()} style={getMenuStyle()}>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-1 relative"
                        onClick={() => handleActionClick(action)}
                      >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs font-medium truncate">{action.label}</span>
                        
                        {action.badge && parseInt(action.badge) > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {action.badge}
                          </Badge>
                        )}
                        
                        {action.premium && (
                          <Badge className="absolute -top-1 -left-1 h-4 w-4 flex items-center justify-center p-0 bg-gradient-to-r from-yellow-400 to-orange-500">
                            <Award className="h-2 w-2" />
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={getTooltipSide()}>
                      <p>{action.label}</p>
                      {action.premium && <p className="text-xs text-yellow-400">Premium Feature</p>}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-sm font-bold text-blue-600">
                    {JSON.parse(localStorage.getItem('wishlist') || '[]').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Saved</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-sm font-bold text-green-600">
                    {JSON.parse(localStorage.getItem('user-bookings') || '[]').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Bookings</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="text-sm font-bold text-purple-600">
                    {JSON.parse(localStorage.getItem('recently-viewed') || '[]').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Viewed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main FAB */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 select-none ${
                isOpen 
                  ? 'bg-red-500 hover:bg-red-600 rotate-45' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25 animate-pulse'
              } ${isDragging ? 'shadow-3xl ring-4 ring-blue-300/30 animate-bounce' : ''} hover:scale-105 active:scale-95`}
              onClick={toggleMenu}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Zap className="h-6 w-6 text-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={getTooltipSide()}>
            <p>{isOpen ? 'Close Menu' : (isDragging ? 'Dragging...' : 'Quick Actions • Drag to move')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Notification Dot */}
        {!isOpen && (JSON.parse(localStorage.getItem('user-notifications') || '[]')).length > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
    </TooltipProvider>
  );
}
