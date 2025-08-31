export type UserRole = 'guest' | 'host' | 'admin' | 'agent' | 'senior_agent' | 'manager' | 'staff' | 'housekeeping' | 'reception' | 'kitchen' | 'maintenance';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'property' | 'booking' | 'user' | 'financial' | 'content' | 'system' | 'support';
}

export interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: string[];
  menuItems: MenuItem[];
  dashboardConfig: DashboardConfig;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  subItems?: MenuItem[];
  permissions?: string[];
}

export interface DashboardConfig {
  layout: 'standard' | 'analytics' | 'operational' | 'minimal';
  widgets: DashboardWidget[];
  quickActions: QuickAction[];
}

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'calendar' | 'map' | 'notifications';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  config: any;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
  permissions?: string[];
}

// Define all available permissions
export const PERMISSIONS: Permission[] = [
  // Property Management
  { id: 'property.create', name: 'Create Property', description: 'Add new properties', category: 'property' },
  { id: 'property.edit', name: 'Edit Property', description: 'Modify property details', category: 'property' },
  { id: 'property.delete', name: 'Delete Property', description: 'Remove properties', category: 'property' },
  { id: 'property.view_all', name: 'View All Properties', description: 'Access all properties', category: 'property' },
  { id: 'property.manage_pricing', name: 'Manage Pricing', description: 'Set and update pricing', category: 'property' },
  { id: 'property.manage_availability', name: 'Manage Availability', description: 'Control availability calendar', category: 'property' },
  
  // Booking Management
  { id: 'booking.view', name: 'View Bookings', description: 'Access booking information', category: 'booking' },
  { id: 'booking.create', name: 'Create Booking', description: 'Make new reservations', category: 'booking' },
  { id: 'booking.modify', name: 'Modify Booking', description: 'Change booking details', category: 'booking' },
  { id: 'booking.cancel', name: 'Cancel Booking', description: 'Cancel reservations', category: 'booking' },
  { id: 'booking.checkin', name: 'Check-in Guest', description: 'Process guest check-ins', category: 'booking' },
  { id: 'booking.checkout', name: 'Check-out Guest', description: 'Process guest check-outs', category: 'booking' },
  
  // User Management
  { id: 'user.view', name: 'View Users', description: 'Access user profiles', category: 'user' },
  { id: 'user.edit', name: 'Edit Users', description: 'Modify user information', category: 'user' },
  { id: 'user.suspend', name: 'Suspend Users', description: 'Suspend user accounts', category: 'user' },
  { id: 'user.delete', name: 'Delete Users', description: 'Remove user accounts', category: 'user' },
  { id: 'user.assign_roles', name: 'Assign Roles', description: 'Change user roles', category: 'user' },
  
  // Financial
  { id: 'financial.view_revenue', name: 'View Revenue', description: 'Access financial reports', category: 'financial' },
  { id: 'financial.process_payments', name: 'Process Payments', description: 'Handle payment transactions', category: 'financial' },
  { id: 'financial.issue_refunds', name: 'Issue Refunds', description: 'Process refund requests', category: 'financial' },
  { id: 'financial.view_payouts', name: 'View Payouts', description: 'Access payout information', category: 'financial' },
  
  // Content Management
  { id: 'content.edit', name: 'Edit Content', description: 'Modify app content', category: 'content' },
  { id: 'content.publish', name: 'Publish Content', description: 'Publish content changes', category: 'content' },
  { id: 'content.moderate', name: 'Moderate Content', description: 'Review and approve content', category: 'content' },
  
  // System Administration
  { id: 'system.view_logs', name: 'View System Logs', description: 'Access system logs', category: 'system' },
  { id: 'system.manage_settings', name: 'Manage Settings', description: 'Configure system settings', category: 'system' },
  { id: 'system.backup', name: 'System Backup', description: 'Create and manage backups', category: 'system' },
  { id: 'system.monitor', name: 'System Monitoring', description: 'Monitor system performance', category: 'system' },
  
  // Support
  { id: 'support.view_tickets', name: 'View Support Tickets', description: 'Access support requests', category: 'support' },
  { id: 'support.respond', name: 'Respond to Tickets', description: 'Reply to support requests', category: 'support' },
  { id: 'support.escalate', name: 'Escalate Tickets', description: 'Escalate support issues', category: 'support' },
  { id: 'support.close', name: 'Close Tickets', description: 'Resolve support requests', category: 'support' }
];

// Define role configurations
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  guest: {
    id: 'guest',
    name: 'Guest',
    description: 'Regular traveler using the platform',
    icon: '👤',
    color: '#6B7280',
    permissions: ['booking.create', 'booking.view', 'booking.modify'],
    menuItems: [
      { id: 'search', label: 'Search', icon: '🔍', route: '/search' },
      { id: 'bookings', label: 'My Bookings', icon: '📅', route: '/bookings' },
      { id: 'wishlist', label: 'Wishlist', icon: '❤️', route: '/wishlist' },
      { id: 'profile', label: 'Profile', icon: '👤', route: '/profile' }
    ],
    dashboardConfig: {
      layout: 'minimal',
      widgets: [
        { id: 'upcoming_trips', type: 'list', title: 'Upcoming Trips', size: 'medium', position: { row: 0, col: 0 }, config: {} },
        { id: 'wishlist_items', type: 'list', title: 'Wishlist', size: 'medium', position: { row: 0, col: 1 }, config: {} }
      ],
      quickActions: [
        { id: 'search_hotels', label: 'Search Hotels', icon: '🔍', action: 'navigate:/search', color: '#3B82F6' },
        { id: 'view_bookings', label: 'My Bookings', icon: '📅', action: 'navigate:/bookings', color: '#10B981' }
      ]
    }
  },

  host: {
    id: 'host',
    name: 'Host',
    description: 'Property owner managing listings',
    icon: '🏠',
    color: '#F59E0B',
    permissions: [
      'property.create', 'property.edit', 'property.manage_pricing', 'property.manage_availability',
      'booking.view', 'booking.modify', 'booking.checkin', 'booking.checkout',
      'financial.view_revenue', 'financial.view_payouts'
    ],
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/host/dashboard' },
      { id: 'properties', label: 'Properties', icon: '🏠', route: '/host/properties' },
      { id: 'bookings', label: 'Bookings', icon: '📅', route: '/host/bookings' },
      { id: 'calendar', label: 'Calendar', icon: '🗓️', route: '/host/calendar' },
      { id: 'earnings', label: 'Earnings', icon: '💰', route: '/host/earnings' },
      { id: 'messages', label: 'Messages', icon: '💬', route: '/host/messages' },
      { id: 'analytics', label: 'Analytics', icon: '📈', route: '/host/analytics' }
    ],
    dashboardConfig: {
      layout: 'analytics',
      widgets: [
        { id: 'revenue_chart', type: 'chart', title: 'Revenue Overview', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'booking_stats', type: 'stats', title: 'Booking Statistics', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'upcoming_checkins', type: 'list', title: 'Upcoming Check-ins', size: 'medium', position: { row: 1, col: 0 }, config: {} },
        { id: 'property_performance', type: 'chart', title: 'Property Performance', size: 'medium', position: { row: 1, col: 1 }, config: {} }
      ],
      quickActions: [
        { id: 'add_property', label: 'Add Property', icon: '➕', action: 'navigate:/host/properties/new', color: '#10B981' },
        { id: 'view_messages', label: 'Messages', icon: '💬', action: 'navigate:/host/messages', color: '#3B82F6' },
        { id: 'update_calendar', label: 'Update Calendar', icon: '🗓️', action: 'navigate:/host/calendar', color: '#F59E0B' }
      ]
    }
  },

  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Platform administrator with full access',
    icon: '👑',
    color: '#DC2626',
    permissions: Object.keys(PERMISSIONS),
    menuItems: [
      { id: 'dashboard', label: 'Admin Dashboard', icon: '📊', route: '/admin/dashboard' },
      { id: 'users', label: 'User Management', icon: '👥', route: '/admin/users' },
      { id: 'properties', label: 'Property Management', icon: '🏢', route: '/admin/properties' },
      { id: 'bookings', label: 'Booking Management', icon: '📋', route: '/admin/bookings' },
      { id: 'finances', label: 'Financial Overview', icon: '💰', route: '/admin/finances' },
      { id: 'analytics', label: 'Platform Analytics', icon: '📈', route: '/admin/analytics' },
      { id: 'support', label: 'Support Console', icon: '🎧', route: '/admin/support' },
      { id: 'settings', label: 'System Settings', icon: '⚙️', route: '/admin/settings' }
    ],
    dashboardConfig: {
      layout: 'standard',
      widgets: [
        { id: 'platform_stats', type: 'stats', title: 'Platform Statistics', size: 'full', position: { row: 0, col: 0 }, config: {} },
        { id: 'revenue_analytics', type: 'chart', title: 'Revenue Analytics', size: 'large', position: { row: 1, col: 0 }, config: {} },
        { id: 'user_activity', type: 'chart', title: 'User Activity', size: 'medium', position: { row: 1, col: 2 }, config: {} },
        { id: 'support_queue', type: 'list', title: 'Support Queue', size: 'medium', position: { row: 2, col: 0 }, config: {} },
        { id: 'system_health', type: 'stats', title: 'System Health', size: 'medium', position: { row: 2, col: 1 }, config: {} }
      ],
      quickActions: [
        { id: 'user_management', label: 'Manage Users', icon: '👥', action: 'navigate:/admin/users', color: '#3B82F6' },
        { id: 'system_settings', label: 'Settings', icon: '⚙️', action: 'navigate:/admin/settings', color: '#6B7280' },
        { id: 'support_console', label: 'Support', icon: '🎧', action: 'navigate:/admin/support', color: '#F59E0B' },
        { id: 'view_analytics', label: 'Analytics', icon: '📈', action: 'navigate:/admin/analytics', color: '#10B981' }
      ]
    }
  },

  agent: {
    id: 'agent',
    name: 'Customer Service Agent',
    description: 'Customer support representative',
    icon: '🎧',
    color: '#8B5CF6',
    permissions: [
      'support.view_tickets', 'support.respond', 'support.escalate',
      'booking.view', 'booking.modify', 'booking.cancel',
      'user.view', 'user.edit'
    ],
    menuItems: [
      { id: 'dashboard', label: 'Agent Dashboard', icon: '📊', route: '/agent/dashboard' },
      { id: 'tickets', label: 'Support Tickets', icon: '🎫', route: '/agent/tickets' },
      { id: 'live_chat', label: 'Live Chat', icon: '💬', route: '/agent/chat' },
      { id: 'knowledge_base', label: 'Knowledge Base', icon: '📚', route: '/agent/knowledge' },
      { id: 'customer_lookup', label: 'Customer Lookup', icon: '🔍', route: '/agent/customers' },
      { id: 'escalations', label: 'Escalations', icon: '🔺', route: '/agent/escalations' }
    ],
    dashboardConfig: {
      layout: 'operational',
      widgets: [
        { id: 'ticket_queue', type: 'list', title: 'My Ticket Queue', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'agent_stats', type: 'stats', title: 'My Performance', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'active_chats', type: 'list', title: 'Active Chats', size: 'medium', position: { row: 1, col: 0 }, config: {} },
        { id: 'recent_escalations', type: 'list', title: 'Recent Escalations', size: 'medium', position: { row: 1, col: 1 }, config: {} }
      ],
      quickActions: [
        { id: 'new_ticket', label: 'New Ticket', icon: '🎫', action: 'navigate:/agent/tickets/new', color: '#3B82F6' },
        { id: 'start_chat', label: 'Start Chat', icon: '💬', action: 'open_chat', color: '#10B981' },
        { id: 'customer_search', label: 'Find Customer', icon: '🔍', action: 'navigate:/agent/customers', color: '#F59E0B' }
      ]
    }
  },

  senior_agent: {
    id: 'senior_agent',
    name: 'Senior Agent',
    description: 'Senior customer support representative',
    icon: '🎯',
    color: '#7C3AED',
    permissions: [
      'support.view_tickets', 'support.respond', 'support.escalate', 'support.close',
      'booking.view', 'booking.modify', 'booking.cancel',
      'user.view', 'user.edit', 'user.suspend',
      'financial.issue_refunds'
    ],
    menuItems: [
      { id: 'dashboard', label: 'Senior Dashboard', icon: '📊', route: '/senior-agent/dashboard' },
      { id: 'all_tickets', label: 'All Tickets', icon: '🎫', route: '/senior-agent/tickets' },
      { id: 'team_performance', label: 'Team Performance', icon: '👥', route: '/senior-agent/team' },
      { id: 'escalations', label: 'Escalations', icon: '🔺', route: '/senior-agent/escalations' },
      { id: 'training', label: 'Training Materials', icon: '📖', route: '/senior-agent/training' },
      { id: 'reports', label: 'Reports', icon: '📈', route: '/senior-agent/reports' }
    ],
    dashboardConfig: {
      layout: 'analytics',
      widgets: [
        { id: 'team_performance', type: 'chart', title: 'Team Performance', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'escalation_trends', type: 'chart', title: 'Escalation Trends', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'high_priority_tickets', type: 'list', title: 'High Priority Tickets', size: 'medium', position: { row: 1, col: 0 }, config: {} },
        { id: 'agent_workload', type: 'stats', title: 'Agent Workload', size: 'medium', position: { row: 1, col: 1 }, config: {} }
      ],
      quickActions: [
        { id: 'assign_tickets', label: 'Assign Tickets', icon: '📋', action: 'navigate:/senior-agent/assign', color: '#3B82F6' },
        { id: 'team_meeting', label: 'Team Meeting', icon: '👥', action: 'schedule_meeting', color: '#10B981' },
        { id: 'performance_review', label: 'Performance Review', icon: '📊', action: 'navigate:/senior-agent/performance', color: '#F59E0B' }
      ]
    }
  },

  manager: {
    id: 'manager',
    name: 'Hotel Manager',
    description: 'Hotel operations manager',
    icon: '🏨',
    color: '#059669',
    permissions: [
      'property.view_all', 'property.edit', 'property.manage_pricing',
      'booking.view', 'booking.modify', 'booking.checkin', 'booking.checkout',
      'financial.view_revenue', 'user.view', 'user.edit'
    ],
    menuItems: [
      { id: 'dashboard', label: 'Manager Dashboard', icon: '📊', route: '/manager/dashboard' },
      { id: 'operations', label: 'Operations', icon: '⚙️', route: '/manager/operations' },
      { id: 'staff', label: 'Staff Management', icon: '👥', route: '/manager/staff' },
      { id: 'guests', label: 'Guest Management', icon: '🎯', route: '/manager/guests' },
      { id: 'revenue', label: 'Revenue Analysis', icon: '💰', route: '/manager/revenue' },
      { id: 'maintenance', label: 'Maintenance', icon: '🔧', route: '/manager/maintenance' },
      { id: 'reports', label: 'Reports', icon: '📈', route: '/manager/reports' }
    ],
    dashboardConfig: {
      layout: 'operational',
      widgets: [
        { id: 'occupancy_chart', type: 'chart', title: 'Occupancy Rate', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'daily_stats', type: 'stats', title: 'Daily Statistics', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'guest_checkins', type: 'list', title: "Today's Check-ins", size: 'medium', position: { row: 1, col: 0 }, config: {} },
        { id: 'maintenance_requests', type: 'list', title: 'Maintenance Requests', size: 'medium', position: { row: 1, col: 1 }, config: {} }
      ],
      quickActions: [
        { id: 'check_in_guest', label: 'Check-in Guest', icon: '🔑', action: 'navigate:/manager/checkin', color: '#10B981' },
        { id: 'room_status', label: 'Room Status', icon: '🏠', action: 'navigate:/manager/rooms', color: '#3B82F6' },
        { id: 'staff_schedule', label: 'Staff Schedule', icon: '📅', action: 'navigate:/manager/schedule', color: '#F59E0B' }
      ]
    }
  },

  staff: {
    id: 'staff',
    name: 'Hotel Staff',
    description: 'General hotel staff member',
    icon: '👔',
    color: '#6366F1',
    permissions: [
      'booking.view', 'booking.checkin', 'booking.checkout',
      'user.view'
    ],
    menuItems: [
      { id: 'dashboard', label: 'Staff Dashboard', icon: '📊', route: '/staff/dashboard' },
      { id: 'tasks', label: 'My Tasks', icon: '✅', route: '/staff/tasks' },
      { id: 'guests', label: 'Guest Services', icon: '🎯', route: '/staff/guests' },
      { id: 'schedule', label: 'My Schedule', icon: '📅', route: '/staff/schedule' },
      { id: 'training', label: 'Training', icon: '📚', route: '/staff/training' }
    ],
    dashboardConfig: {
      layout: 'minimal',
      widgets: [
        { id: 'my_tasks', type: 'list', title: 'My Tasks', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'my_schedule', type: 'calendar', title: 'My Schedule', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'guest_requests', type: 'list', title: 'Guest Requests', size: 'medium', position: { row: 1, col: 0 }, config: {} }
      ],
      quickActions: [
        { id: 'new_task', label: 'New Task', icon: '➕', action: 'navigate:/staff/tasks/new', color: '#10B981' },
        { id: 'guest_request', label: 'Guest Request', icon: '🎯', action: 'navigate:/staff/guests/request', color: '#3B82F6' },
        { id: 'view_schedule', label: 'My Schedule', icon: '📅', action: 'navigate:/staff/schedule', color: '#F59E0B' }
      ]
    }
  },

  housekeeping: {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Housekeeping staff member',
    icon: '🧹',
    color: '#EC4899',
    permissions: ['booking.view'],
    menuItems: [
      { id: 'dashboard', label: 'Housekeeping Dashboard', icon: '📊', route: '/housekeeping/dashboard' },
      { id: 'rooms', label: 'Room Status', icon: '🏠', route: '/housekeeping/rooms' },
      { id: 'tasks', label: 'Cleaning Tasks', icon: '🧹', route: '/housekeeping/tasks' },
      { id: 'inventory', label: 'Inventory', icon: '📦', route: '/housekeeping/inventory' },
      { id: 'reports', label: 'Daily Reports', icon: '📋', route: '/housekeeping/reports' }
    ],
    dashboardConfig: {
      layout: 'operational',
      widgets: [
        { id: 'room_assignments', type: 'list', title: 'Room Assignments', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'cleaning_progress', type: 'stats', title: 'Cleaning Progress', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'inventory_alerts', type: 'list', title: 'Inventory Alerts', size: 'medium', position: { row: 1, col: 0 }, config: {} }
      ],
      quickActions: [
        { id: 'start_cleaning', label: 'Start Cleaning', icon: '🧹', action: 'navigate:/housekeeping/clean', color: '#EC4899' },
        { id: 'report_issue', label: 'Report Issue', icon: '⚠️', action: 'navigate:/housekeeping/report', color: '#EF4444' },
        { id: 'check_inventory', label: 'Check Inventory', icon: '📦', action: 'navigate:/housekeeping/inventory', color: '#10B981' }
      ]
    }
  },

  reception: {
    id: 'reception',
    name: 'Reception',
    description: 'Front desk receptionist',
    icon: '🎯',
    color: '#0891B2',
    permissions: [
      'booking.view', 'booking.create', 'booking.modify', 'booking.checkin', 'booking.checkout',
      'user.view', 'user.edit'
    ],
    menuItems: [
      { id: 'dashboard', label: 'Reception Dashboard', icon: '📊', route: '/reception/dashboard' },
      { id: 'checkin', label: 'Check-in / Check-out', icon: '🔑', route: '/reception/checkin' },
      { id: 'bookings', label: 'Bookings', icon: '📅', route: '/reception/bookings' },
      { id: 'guests', label: 'Guest Directory', icon: '👥', route: '/reception/guests' },
      { id: 'payments', label: 'Payments', icon: '💳', route: '/reception/payments' },
      { id: 'services', label: 'Guest Services', icon: '🛎️', route: '/reception/services' }
    ],
    dashboardConfig: {
      layout: 'operational',
      widgets: [
        { id: 'todays_arrivals', type: 'list', title: "Today's Arrivals", size: 'medium', position: { row: 0, col: 0 }, config: {} },
        { id: 'todays_departures', type: 'list', title: "Today's Departures", size: 'medium', position: { row: 0, col: 1 }, config: {} },
        { id: 'room_availability', type: 'stats', title: 'Room Availability', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'pending_payments', type: 'list', title: 'Pending Payments', size: 'medium', position: { row: 1, col: 0 }, config: {} }
      ],
      quickActions: [
        { id: 'quick_checkin', label: 'Quick Check-in', icon: '🔑', action: 'navigate:/reception/checkin', color: '#10B981' },
        { id: 'new_booking', label: 'New Booking', icon: '➕', action: 'navigate:/reception/bookings/new', color: '#3B82F6' },
        { id: 'process_payment', label: 'Process Payment', icon: '💳', action: 'navigate:/reception/payments', color: '#F59E0B' }
      ]
    }
  },

  kitchen: {
    id: 'kitchen',
    name: 'Kitchen Staff',
    description: 'Kitchen and food service staff',
    icon: '👨‍🍳',
    color: '#F97316',
    permissions: [],
    menuItems: [
      { id: 'dashboard', label: 'Kitchen Dashboard', icon: '📊', route: '/kitchen/dashboard' },
      { id: 'orders', label: 'Food Orders', icon: '🍽️', route: '/kitchen/orders' },
      { id: 'menu', label: 'Menu Management', icon: '📋', route: '/kitchen/menu' },
      { id: 'inventory', label: 'Kitchen Inventory', icon: '🥗', route: '/kitchen/inventory' },
      { id: 'schedule', label: 'Kitchen Schedule', icon: '📅', route: '/kitchen/schedule' }
    ],
    dashboardConfig: {
      layout: 'operational',
      widgets: [
        { id: 'active_orders', type: 'list', title: 'Active Orders', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'kitchen_stats', type: 'stats', title: 'Kitchen Statistics', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'inventory_alerts', type: 'list', title: 'Inventory Alerts', size: 'medium', position: { row: 1, col: 0 }, config: {} }
      ],
      quickActions: [
        { id: 'new_order', label: 'New Order', icon: '🍽️', action: 'navigate:/kitchen/orders/new', color: '#F97316' },
        { id: 'update_menu', label: 'Update Menu', icon: '📋', action: 'navigate:/kitchen/menu', color: '#10B981' },
        { id: 'check_inventory', label: 'Check Inventory', icon: '🥗', action: 'navigate:/kitchen/inventory', color: '#3B82F6' }
      ]
    }
  },

  maintenance: {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Maintenance and technical staff',
    icon: '🔧',
    color: '#737373',
    permissions: [],
    menuItems: [
      { id: 'dashboard', label: 'Maintenance Dashboard', icon: '📊', route: '/maintenance/dashboard' },
      { id: 'work_orders', label: 'Work Orders', icon: '🔧', route: '/maintenance/orders' },
      { id: 'preventive', label: 'Preventive Maintenance', icon: '🛠️', route: '/maintenance/preventive' },
      { id: 'inventory', label: 'Parts Inventory', icon: '📦', route: '/maintenance/inventory' },
      { id: 'schedule', label: 'Maintenance Schedule', icon: '📅', route: '/maintenance/schedule' }
    ],
    dashboardConfig: {
      layout: 'operational',
      widgets: [
        { id: 'urgent_repairs', type: 'list', title: 'Urgent Repairs', size: 'large', position: { row: 0, col: 0 }, config: {} },
        { id: 'maintenance_stats', type: 'stats', title: 'Maintenance Statistics', size: 'medium', position: { row: 0, col: 2 }, config: {} },
        { id: 'scheduled_tasks', type: 'list', title: 'Scheduled Tasks', size: 'medium', position: { row: 1, col: 0 }, config: {} }
      ],
      quickActions: [
        { id: 'new_work_order', label: 'New Work Order', icon: '🔧', action: 'navigate:/maintenance/orders/new', color: '#737373' },
        { id: 'emergency_repair', label: 'Emergency Repair', icon: '🚨', action: 'navigate:/maintenance/emergency', color: '#EF4444' },
        { id: 'parts_request', label: 'Request Parts', icon: '📦', action: 'navigate:/maintenance/parts', color: '#10B981' }
      ]
    }
  }
};

// Utility functions
export function getUserRole(user: any): UserRole {
  return user?.role || 'guest';
}

export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role] || ROLE_CONFIGS.guest;
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const config = getRoleConfig(userRole);
  return config.permissions.includes(permission);
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const config = getRoleConfig(userRole);
  return config.menuItems.some(item => {
    if (item.route === route) return true;
    return item.subItems?.some(subItem => subItem.route === route) || false;
  });
}

export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return getRoleConfig(role).menuItems;
}

export function getDashboardConfigForRole(role: UserRole): DashboardConfig {
  return getRoleConfig(role).dashboardConfig;
}
