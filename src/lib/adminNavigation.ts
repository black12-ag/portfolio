// Admin Navigation Data Structure
// This contains all admin routes, pages, and searchable information

export interface AdminNavigationItem {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
  icon?: string;
  requiresPermission?: string;
  isNew?: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: AdminNavigationItem[];
}

export const adminNavigationData: AdminCategory[] = [
  {
    id: 'dashboard',
    name: 'Dashboard & Overview',
    description: 'Main admin dashboard and overview pages',
    icon: 'LayoutDashboard',
    items: [
      {
        id: 'main-dashboard',
        title: 'Admin Dashboard',
        description: 'Main admin dashboard with system overview',
        path: '/admin',
        category: 'Dashboard',
        keywords: ['dashboard', 'main', 'overview', 'home', 'admin', 'control panel', 'summary']
      }
    ]
  },
  {
    id: 'settings',
    name: 'Settings & Configuration',
    description: 'System settings and configuration pages',
    icon: 'Settings',
    items: [
      {
        id: 'general-settings',
        title: 'General Settings',
        description: 'Basic system configuration and settings',
        path: '/admin/settings',
        category: 'Settings',
        keywords: ['settings', 'configuration', 'general', 'system', 'basic', 'config']
      },
      {
        id: 'contacts-settings',
        title: 'Contact Settings',
        description: 'Manage contact information and communication settings',
        path: '/admin/contacts',
        category: 'Settings',
        keywords: ['contacts', 'communication', 'email', 'phone', 'address', 'contact info']
      },
      {
        id: 'localization',
        title: 'Localization Settings',
        description: 'Language, currency, and regional settings',
        path: '/admin/localization',
        category: 'Settings',
        keywords: ['localization', 'language', 'currency', 'region', 'translation', 'locale', 'i18n']
      }
    ]
  },
  {
    id: 'user-management',
    name: 'User & Role Management',
    description: 'Manage users, roles, and permissions',
    icon: 'Users',
    items: [
      {
        id: 'user-roles',
        title: 'User Role Management',
        description: 'Manage user roles and permissions',
        path: '/admin/user-roles',
        category: 'User Management',
        keywords: ['users', 'roles', 'permissions', 'access', 'security', 'authorization']
      },
      {
        id: 'agent-management',
        title: 'Agent Management',
        description: 'Manage customer service agents',
        path: '/admin/agent-management',
        category: 'User Management',
        keywords: ['agents', 'customer service', 'support', 'staff', 'employees']
      },
      {
        id: 'agent-profiles',
        title: 'Agent Profile Settings',
        description: 'Configure agent profiles and settings',
        path: '/admin/agent-profile-settings',
        category: 'User Management',
        keywords: ['agent profiles', 'agent settings', 'profile configuration']
      },
      {
        id: 'advanced-agent-management',
        title: 'Advanced Agent Management',
        description: 'Advanced agent management features',
        path: '/admin/agent-management-advanced',
        category: 'User Management',
        keywords: ['advanced agents', 'agent admin', 'complex agent management'],
        isNew: true
      }
    ]
  },
  {
    id: 'content-management',
    name: 'Content & Policies',
    description: 'Manage website content and policies',
    icon: 'FileText',
    items: [
      {
        id: 'policies-editor',
        title: 'Policies Editor',
        description: 'Edit privacy policy, terms of service, and other policies',
        path: '/admin/policies',
        category: 'Content',
        keywords: ['policies', 'privacy', 'terms', 'legal', 'editor', 'content', 'documents']
      }
    ]
  },
  {
    id: 'property-management',
    name: 'Property & Booking Management',
    description: 'Manage properties, bookings, and availability',
    icon: 'Building',
    items: [
      {
        id: 'properties',
        title: 'Property Management',
        description: 'Manage hotels, properties, and listings',
        path: '/admin/properties',
        category: 'Properties',
        keywords: ['properties', 'hotels', 'listings', 'accommodations', 'venues']
      },
      {
        id: 'bookings',
        title: 'Booking Management',
        description: 'Manage reservations and bookings',
        path: '/admin/bookings',
        category: 'Bookings',
        keywords: ['bookings', 'reservations', 'orders', 'customers', 'booking management']
      },
      {
        id: 'availability',
        title: 'Availability Management',
        description: 'Manage room and property availability',
        path: '/admin/availability',
        category: 'Properties',
        keywords: ['availability', 'calendar', 'rooms', 'schedule', 'inventory']
      }
    ]
  },
  {
    id: 'payment-financial',
    name: 'Payment & Financial',
    description: 'Payment processing and financial management',
    icon: 'CreditCard',
    items: [
      {
        id: 'payments',
        title: 'Payment Management',
        description: 'Manage payments, transactions, and billing',
        path: '/admin/payments',
        category: 'Payments',
        keywords: ['payments', 'transactions', 'billing', 'money', 'financial', 'revenue']
      },
      {
        id: 'pci-compliance',
        title: 'PCI Compliance',
        description: 'PCI compliance monitoring and management',
        path: '/admin/pci-compliance',
        category: 'Security',
        keywords: ['pci', 'compliance', 'security', 'payment security', 'standards'],
        isNew: true
      }
    ]
  },
  {
    id: 'communication',
    name: 'Communication & Support',
    description: 'Email, notifications, and customer support',
    icon: 'MessageSquare',
    items: [
      {
        id: 'support-console',
        title: 'Support Console',
        description: 'Customer support management console',
        path: '/admin/support',
        category: 'Support',
        keywords: ['support', 'customer service', 'help desk', 'tickets', 'console']
      },
      {
        id: 'support-contacts',
        title: 'Support Contact Settings',
        description: 'Configure support contact information',
        path: '/admin/support-contacts',
        category: 'Support',
        keywords: ['support contacts', 'help contacts', 'customer service contacts']
      },
      {
        id: 'customer-service-portal',
        title: 'Customer Service Portal',
        description: 'Customer service management portal',
        path: '/admin/customer-service',
        category: 'Support',
        keywords: ['customer service', 'portal', 'service management', 'help center']
      },
      {
        id: 'notifications',
        title: 'Notification Management',
        description: 'Manage system notifications and alerts',
        path: '/admin/notifications',
        category: 'Communication',
        keywords: ['notifications', 'alerts', 'messages', 'communication', 'email notifications']
      },
      {
        id: 'email-management',
        title: 'Email Management',
        description: 'Email templates and delivery management',
        path: '/admin/email-management',
        category: 'Communication',
        keywords: ['email', 'templates', 'delivery', 'smtp', 'mail system']
      }
    ]
  },
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    description: 'Security settings, privacy, and compliance',
    icon: 'Shield',
    items: [
      {
        id: 'security-dashboard',
        title: 'Security Dashboard',
        description: 'Security monitoring and management',
        path: '/admin/security-dashboard',
        category: 'Security',
        keywords: ['security', 'monitoring', 'threats', 'protection', 'firewall']
      },
      {
        id: 'gdpr-data',
        title: 'GDPR Data Management',
        description: 'GDPR compliance and data protection',
        path: '/admin/gdpr-data',
        category: 'Privacy',
        keywords: ['gdpr', 'privacy', 'data protection', 'compliance', 'personal data']
      },
      {
        id: 'audit-logs',
        title: 'Audit Logs Dashboard',
        description: 'System audit logs and activity monitoring',
        path: '/admin/audit-logs',
        category: 'Security',
        keywords: ['audit', 'logs', 'activity', 'monitoring', 'history', 'tracking']
      },
      {
        id: 'digital-keys',
        title: 'Digital Key Management',
        description: 'Manage digital keys and access codes',
        path: '/admin/digital-keys',
        category: 'Security',
        keywords: ['digital keys', 'access codes', 'key management', 'security keys']
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations & APIs',
    description: 'External integrations and API management',
    icon: 'Plug',
    items: [
      {
        id: 'liteapi',
        title: 'LiteAPI Management',
        description: 'LiteAPI integration and configuration',
        path: '/admin/liteapi',
        category: 'Integrations',
        keywords: ['liteapi', 'api', 'integration', 'hotels', 'booking api'],
        isNew: true
      },
      {
        id: 'liteapi-test',
        title: 'LiteAPI Test Bench',
        description: 'Run and verify LiteAPI search, rates, booking workflows',
        path: '/admin/liteapi-test',
        category: 'Integrations',
        keywords: ['liteapi', 'test', 'bench', 'diagnostics', 'rates', 'search', 'booking'],
        isNew: true
      }
    ]
  },
  {
    id: 'company',
    name: 'Company Management',
    description: 'Company settings and management',
    icon: 'Building2',
    items: [
      {
        id: 'company-management',
        title: 'Company Management',
        description: 'Company information and management',
        path: '/admin/company-management',
        category: 'Company',
        keywords: ['company', 'organization', 'business', 'corporate', 'management'],
        isNew: true
      }
    ]
  }
];

// Flatten all items for easy searching
export const getAllAdminNavigationItems = (): AdminNavigationItem[] => {
  return adminNavigationData.reduce((acc, category) => {
    return [...acc, ...category.items];
  }, [] as AdminNavigationItem[]);
};

// Search function with fuzzy matching
export const searchAdminNavigation = (query: string): AdminNavigationItem[] => {
  if (!query.trim()) return [];
  
  const allItems = getAllAdminNavigationItems();
  const lowercaseQuery = query.toLowerCase();
  
  // Score each item based on relevance
  const scoredItems = allItems.map(item => {
    let score = 0;
    
    // Exact title match gets highest score
    if (item.title.toLowerCase().includes(lowercaseQuery)) {
      score += 100;
    }
    
    // Description match gets medium score
    if (item.description.toLowerCase().includes(lowercaseQuery)) {
      score += 50;
    }
    
    // Keyword matches get varying scores based on relevance
    item.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(lowercaseQuery)) {
        score += 30;
      }
      // Partial keyword match
      if (keyword.toLowerCase().startsWith(lowercaseQuery)) {
        score += 40;
      }
    });
    
    // Category match gets lower score
    if (item.category.toLowerCase().includes(lowercaseQuery)) {
      score += 20;
    }
    
    // Path match (for direct URL searches)
    if (item.path.toLowerCase().includes(lowercaseQuery)) {
      score += 25;
    }
    
    return { ...item, score } as any;
  });
  
  // Filter and sort by score
  return (scoredItems as any)
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 10); // Return top 10 results
};

// Get suggestions based on partial input
export const getSearchSuggestions = (query: string): string[] => {
  if (!query.trim()) return [];
  
  const allItems = getAllAdminNavigationItems();
  const suggestions = new Set<string>();
  const lowercaseQuery = query.toLowerCase();
  
  allItems.forEach(item => {
    // Add matching keywords as suggestions
    item.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(lowercaseQuery) && keyword.length > query.length) {
        suggestions.add(keyword);
      }
    });
    
    // Add title words as suggestions
    const titleWords = item.title.toLowerCase().split(' ');
    titleWords.forEach(word => {
      if (word.includes(lowercaseQuery) && word.length > query.length) {
        suggestions.add(word);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 5);
};
