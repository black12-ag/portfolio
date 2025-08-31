export type MenuItem = {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
  featureFlag?: string;
  roles?: Array<'guest' | 'user' | 'host' | 'admin'>;
};

export const profileMenu: MenuItem[] = [
  {
    id: 'account',
    label: 'Account',
    icon: 'settings',
    children: [
      { id: 'security', label: 'Security', href: '/profile/security', icon: 'shield' },
      { id: 'privacy', label: 'Privacy & Data', href: '/profile/privacy', icon: 'lock' },
      { id: 'appSettings', label: 'App Settings', href: '/profile/settings', icon: 'cog' },
    ],
  },
  {
    id: 'trips',
    label: 'Trips',
    icon: 'calendar',
    children: [
      { id: 'bookings', label: 'My Bookings', href: '/profile/bookings', icon: 'calendar' },
      { id: 'tickets', label: 'Tickets', href: '/profile/tickets', icon: 'ticket' },
      { id: 'alerts', label: 'Price Alerts', href: '/profile/alerts', icon: 'bell' },
      { id: 'saved', label: 'Saved Searches', href: '/profile/saved-searches', icon: 'search' },
      { id: 'wishlist', label: 'Wishlist', href: '/profile/wishlist', icon: 'heart' },
      { id: 'reviews', label: 'Reviews', href: '/profile/reviews', icon: 'star' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: 'credit-card',
    children: [
      { id: 'methods', label: 'Payment Methods', href: '/profile/payments', icon: 'credit-card' },
      { id: 'wallet', label: 'Wallet & Receipts', href: '/profile/wallet', icon: 'wallet' },
      { id: 'invoices', label: 'Invoices & Tax', href: '/profile/invoices', icon: 'file' },
    ],
  },
  {
    id: 'travelers',
    label: 'Travelers',
    icon: 'users',
    children: [
      { id: 'profiles', label: 'Traveler Profiles', href: '/profile/travelers', icon: 'users' },
      { id: 'contacts', label: 'Emergency Contacts', href: '/profile/contacts', icon: 'phone' },
      { id: 'documents', label: 'Documents', href: '/profile/documents', icon: 'id' },
      { id: 'verification', label: 'Verification', href: '/profile/verification', icon: 'badge-check' },
    ],
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: 'gift',
    children: [
      { id: 'loyalty', label: 'Loyalty & Points', href: '/profile/loyalty', icon: 'trophy' },
      { id: 'coupons', label: 'Coupons & Vouchers', href: '/profile/coupons', icon: 'ticket' },
      { id: 'refer', label: 'Refer a Friend', href: '/profile/refer', icon: 'megaphone' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: 'message',
    children: [
      { id: 'messages', label: 'Messages', href: '/profile/messages', icon: 'message' },
      { id: 'notifications', label: 'Notifications', href: '/profile/notifications', icon: 'bell' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: 'help',
    children: [
      { id: 'support', label: 'Support Center', href: '/support', icon: 'life-buoy' },
      { id: 'policies', label: 'Policies', href: '/policies', icon: 'file-text' },
    ],
  },
  { id: 'host', label: 'Host Console', href: '/host', icon: 'building', roles: ['host', 'admin'] },
  { id: 'admin', label: 'Admin Dashboard', href: '/admin', icon: 'gavel', roles: ['admin'] },
];


