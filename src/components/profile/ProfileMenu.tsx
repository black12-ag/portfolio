import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { profileMenu, MenuItem } from '@/config/profileMenu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, User as UserIcon, Settings, Shield, Lock, Cog, Calendar, Ticket, Bell, Heart, Star, CreditCard, Wallet, File as FileIcon, Users, Phone, IdCard, BadgeCheck, Gift, Trophy, Megaphone, MessageSquare, LifeBuoy, FileText, Building2, Gavel } from 'lucide-react';

type Props = {
  className?: string;
};

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  user: UserIcon,
  settings: Settings,
  shield: Shield,
  lock: Lock,
  cog: Cog,
  calendar: Calendar,
  ticket: Ticket,
  bell: Bell,
  heart: Heart,
  star: Star,
  'credit-card': CreditCard,
  wallet: Wallet,
  file: FileIcon,
  users: Users,
  phone: Phone,
  id: IdCard,
  'badge-check': BadgeCheck,
  gift: Gift,
  trophy: Trophy,
  megaphone: Megaphone,
  message: MessageSquare,
  'life-buoy': LifeBuoy,
  'file-text': FileText,
  building: Building2,
  gavel: Gavel,
};

function ItemLink({ item }: { item: MenuItem }) {
  const location = useLocation();
  const isActive = item.href && location.pathname.startsWith(item.href);
  return (
    <Link
      to={item.href || '#'}
      className={cn(
        'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="flex items-center gap-2">
        {item.icon && (() => { const Ico = IconMap[item.icon]; return Ico ? <Ico className="h-4 w-4"/> : null; })()}
        <span>{item.label}</span>
      </span>
      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-80 transition" />
    </Link>
  );
}

export default function ProfileMenu({ className }: Props) {
  const { user } = useAuth();

  const canShow = (item: MenuItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    const role = user?.role || 'guest';
    return item.roles.includes(role);
  };

  return (
    <nav className={cn('space-y-4', className)} aria-label="Profile">
      {profileMenu
        .filter(canShow)
        .map((section) => (
          <div key={section.id}>
            {!section.children ? null : (
              <div className="space-y-2">
                <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {section.children.filter(canShow).map((child) => (
                    <ItemLink key={child.id} item={child} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </nav>
  );
}


