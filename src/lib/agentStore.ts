// Real API-integrated Agent Store - Comprehensive agent management and data
import { apiRequest } from './apiClient';

export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ChatPriority = 'low' | 'medium' | 'high';

export interface AgentMetrics {
  id: string;
  agentId: string;
  date: string;
  ticketsResolvedToday: number;
  weeklyTicketsResolved: number;
  avgResponseTime: number; // in seconds
  satisfactionScore: number; // percentage
  firstContactResolution: number; // percentage
  totalChatsHandled: number;
  totalCallsHandled: number;
  totalWorkingHours: number;
  activeTime: number; // in minutes
}

export interface AgentProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  status: AgentStatus;
  specializations: string[];
  languages: string[];
  skills: AgentSkill[];
  rating: number;
  totalTicketsResolved: number;
  joinDate: string;
  lastActivity: string;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
    daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  };
  permissions: AgentPermissions;
}

export interface AgentSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certifications?: string[];
}

export interface AgentPermissions {
  canViewCustomerEmail: boolean;
  canViewCustomerPhone: boolean;
  canViewBookingRef: boolean;
  canViewBillingInfo: boolean;
  canAssignTickets: boolean;
  canCloseTickets: boolean;
  canEscalateTickets: boolean;
  canAddInternalNotes: boolean;
  canInitiateCalls: boolean;
  canAccessKnowledgeBase: boolean;
  canViewReports: boolean;
  canManageOwnSchedule: boolean;
  // New permissions
  canModifyBookings: boolean;
  canIssueRefunds: boolean;
  canAccessSensitiveData: boolean;
  canCollaborate: boolean;
  canUseAIAssist: boolean;
  canCreateBookings: boolean;
  canCancelBookings: boolean;
}

export interface ActiveChat {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  subject: string;
  priority: ChatPriority;
  status: 'waiting' | 'active' | 'on-hold';
  waitTime: string;
  lastMessage: string;
  messageCount: number;
  startedAt: string;
  agentId: string;
  tags: string[];
  metadata: {
    bookingRef?: string;
    userAgent?: string;
    location?: string;
    previousInteractions?: number;
  };
}

export interface PendingTicket {
  id: string;
  subject: string;
  customerEmail: string;
  customerName: string;
  priority: TicketPriority;
  category: string;
  status: 'new' | 'assigned' | 'in-progress' | 'pending-customer';
  age: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  estimatedResolutionTime?: string;
  tags: string[];
}

export interface QuickResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  usageCount: number;
  lastUsed?: string;
  tags: string[];
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
}

export interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  action: 'assign_to_supervisor' | 'assign_to_specialist' | 'increase_priority' | 'notify_manager';
  triggerValue: string;
  isActive: boolean;
}

// API endpoints
const API_ENDPOINTS = {
  AGENTS: '/api/v1/agents',
  AGENT_METRICS: '/api/v1/agents/metrics',
  AGENT_CHATS: '/api/v1/agents/chats',
  AGENT_TICKETS: '/api/v1/agents/tickets',
  QUICK_RESPONSES: '/api/v1/support/quick-responses',
  KNOWLEDGE_BASE: '/api/v1/support/knowledge-base',
  BOOKINGS: '/api/v1/bookings',
  REFUNDS: '/api/v1/refunds',
  AUDIT_LOGS: '/api/v1/audit-logs',
  AI_ASSIST: '/api/v1/ai/suggestions'
};

// Fallback storage keys for offline/development
const STORAGE_KEYS = {
  AGENT_PROFILES: 'metah-agent-profiles-cache',
  AGENT_METRICS: 'metah-agent-metrics-cache',
  QUICK_RESPONSES: 'metah-quick-responses-cache',
  KNOWLEDGE_BASE: 'metah-knowledge-base-cache',
  AUDIT_LOGS: 'metah-agent-audit-logs'
};

// Utility functions for localStorage fallback
function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    logger.warn('storage', `Failed to read ${key} from storage:`, error);
    return defaultValue;
  }
}

function writeToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logger.warn('storage', `Failed to write ${key} to storage:`, error);
  }
}

// Mock data for fallback
import logger from './logger';

const fallbackAgentProfiles: AgentProfile[] = [
  {
    id: 'agent-1',
    email: 'sarah.johnson@metah.com',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    status: 'online',
    specializations: ['Booking Issues', 'Payment Problems', 'General Support'],
    languages: ['English', 'Spanish', 'French'],
    skills: [
      { name: 'Customer Service', level: 'expert', certifications: ['Customer Service Excellence'] },
      { name: 'Technical Support', level: 'advanced' },
      { name: 'Conflict Resolution', level: 'expert' }
    ],
    rating: 4.9,
    totalTicketsResolved: 2847,
    joinDate: '2023-01-15',
    lastActivity: new Date().toISOString(),
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    permissions: {
      canViewCustomerEmail: true,
      canViewCustomerPhone: true,
      canViewBookingRef: true,
      canViewBillingInfo: true,
      canAssignTickets: true,
      canCloseTickets: true,
      canEscalateTickets: true,
      canAddInternalNotes: true,
      canInitiateCalls: true,
      canAccessKnowledgeBase: true,
      canViewReports: true,
      canManageOwnSchedule: true,
      canModifyBookings: true,
      canIssueRefunds: true,
      canAccessSensitiveData: true,
      canCollaborate: true,
      canUseAIAssist: true,
      canCreateBookings: true,
      canCancelBookings: true
    }
  }
];

const fallbackQuickResponses: QuickResponse[] = [
  {
    id: 'qr-1',
    title: 'Booking Confirmation',
    content: 'Thank you for contacting us regarding your booking. I can see your reservation details and will be happy to assist you. Let me review your booking information.',
    category: 'Booking',
    language: 'en',
    usageCount: 245,
    lastUsed: new Date().toISOString(),
    tags: ['booking', 'confirmation', 'greeting']
  },
  {
    id: 'qr-2',
    title: 'Payment Issue Investigation',
    content: 'I understand you\'re experiencing payment difficulties. Let me investigate this immediately. Can you please provide the last 4 digits of the card you used and the approximate time of the transaction?',
    category: 'Payment',
    language: 'en',
    usageCount: 189,
    lastUsed: new Date().toISOString(),
    tags: ['payment', 'investigation', 'security']
  }
];

// Real API Functions with localStorage fallback
export const getAgentProfile = async (agentId: string): Promise<AgentProfile | null> => {
  try {
    // Try API first
    const response = await apiRequest<{ agent: AgentProfile }>(
      `${API_ENDPOINTS.AGENTS}/${agentId}`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.agent) {
      // Cache for offline usage
      const profiles = readFromStorage<AgentProfile[]>(STORAGE_KEYS.AGENT_PROFILES, []);
      const existingIndex = profiles.findIndex(p => p.id === response.data.agent.id);
      if (existingIndex >= 0) {
        profiles[existingIndex] = response.data.agent;
      } else {
        profiles.push(response.data.agent);
      }
      writeToStorage(STORAGE_KEYS.AGENT_PROFILES, profiles);
      
      return response.data.agent;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const profiles = readFromStorage<AgentProfile[]>(STORAGE_KEYS.AGENT_PROFILES, fallbackAgentProfiles);
  return profiles.find(agent => agent.id === agentId) || null;
};

export const getAgentMetrics = async (agentId: string): Promise<AgentMetrics> => {
  try {
    // Try API first
    const response = await apiRequest<{ metrics: AgentMetrics }>(
      `${API_ENDPOINTS.AGENT_METRICS}/${agentId}`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.metrics) {
      return response.data.metrics;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using mock fallback:', error);
  }
  
  // Generate mock metrics as fallback
  return {
    id: `metrics-${agentId}`,
    agentId,
    date: new Date().toISOString().split('T')[0],
    ticketsResolvedToday: Math.floor(Math.random() * 15) + 5,
    weeklyTicketsResolved: Math.floor(Math.random() * 40) + 25,
    avgResponseTime: Math.floor(Math.random() * 60) + 30,
    satisfactionScore: Math.floor(Math.random() * 15) + 85,
    firstContactResolution: Math.floor(Math.random() * 20) + 75,
    totalChatsHandled: Math.floor(Math.random() * 8) + 3,
    totalCallsHandled: Math.floor(Math.random() * 5) + 1,
    totalWorkingHours: 8,
    activeTime: Math.floor(Math.random() * 100) + 350
  };
};

export const getAgentActiveChats = async (agentId: string): Promise<ActiveChat[]> => {
  try {
    // Try API first
    const response = await apiRequest<{ chats: ActiveChat[] }>(
      `${API_ENDPOINTS.AGENT_CHATS}/${agentId}/active`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.chats) {
      return response.data.chats;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using mock fallback:', error);
  }
  
  // Generate mock active chats as fallback
  const mockChats: ActiveChat[] = [
    {
      id: 'chat-1',
      customerId: 'customer-1',
      customerName: 'John Davis',
      customerEmail: 'john.davis@email.com',
      subject: 'Booking modification request',
      priority: 'medium',
      status: 'active',
      waitTime: '2m 15s',
      lastMessage: 'I need to change my check-in date',
      messageCount: 8,
      startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      agentId,
      tags: ['booking', 'modification'],
      metadata: {
        bookingRef: 'MTH-2024-001',
        userAgent: 'Chrome/120.0.0.0',
        location: 'New York, US',
        previousInteractions: 2
      }
    }
  ];
  
  return Math.random() > 0.3 ? mockChats : [];
};

export const getAgentPendingTickets = async (agentId: string): Promise<PendingTicket[]> => {
  try {
    // Try API first
    const response = await apiRequest<{ tickets: PendingTicket[] }>(
      `${API_ENDPOINTS.AGENT_TICKETS}/${agentId}/pending`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.tickets) {
      return response.data.tickets;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using mock fallback:', error);
  }
  
  // Generate mock pending tickets as fallback
  const mockTickets: PendingTicket[] = [
    {
      id: 'T-2024-001',
      subject: 'Refund request for cancelled booking',
      customerEmail: 'alice.wong@email.com',
      customerName: 'Alice Wong',
      priority: 'medium',
      category: 'Refund',
      status: 'assigned',
      age: '2h 15m',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      assignedTo: agentId,
      estimatedResolutionTime: '4 hours',
      tags: ['refund', 'cancellation']
    }
  ];
  
  return Math.random() > 0.4 ? mockTickets : [];
};

export const updateAgentStatus = async (agentId: string, status: AgentStatus): Promise<void> => {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.AGENTS}/${agentId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );
    return;
  } catch (error) {
    logger.warn('agent', 'API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const profiles = readFromStorage<AgentProfile[]>(STORAGE_KEYS.AGENT_PROFILES, fallbackAgentProfiles);
  const agent = profiles.find(a => a.id === agentId);
  if (agent) {
    agent.status = status;
    agent.lastActivity = new Date().toISOString();
    writeToStorage(STORAGE_KEYS.AGENT_PROFILES, profiles);
  }
  
  // Store status separately for quick access
  localStorage.setItem(`agent-status-${agentId}`, status);
};

export const getQuickResponses = async (category?: string, language = 'en'): Promise<QuickResponse[]> => {
  try {
    // Try API first
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    queryParams.append('language', language);
    
    const response = await apiRequest<{ responses: QuickResponse[] }>(
      `${API_ENDPOINTS.QUICK_RESPONSES}?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.responses) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.QUICK_RESPONSES, response.data.responses);
      return response.data.responses;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  const cached = readFromStorage<QuickResponse[]>(STORAGE_KEYS.QUICK_RESPONSES, fallbackQuickResponses);
  let filtered = cached.filter(qr => qr.language === language);
  
  if (category) {
    filtered = filtered.filter(qr => qr.category.toLowerCase().includes(category.toLowerCase()));
  }
  
  return filtered.sort((a, b) => b.usageCount - a.usageCount);
};

export const searchKnowledgeBase = async (query: string, category?: string): Promise<KnowledgeBaseArticle[]> => {
  try {
    // Try API first
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (category) queryParams.append('category', category);
    
    const response = await apiRequest<{ articles: KnowledgeBaseArticle[] }>(
      `${API_ENDPOINTS.KNOWLEDGE_BASE}/search?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.articles) {
      return response.data.articles;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using fallback search:', error);
  }

  // Fallback to cached/mock search
  const knowledgeBase = readFromStorage<KnowledgeBaseArticle[]>(STORAGE_KEYS.KNOWLEDGE_BASE, [
    {
      id: 'kb-1',
      title: 'How to Process Booking Modifications',
      content: 'Guide for handling customer booking changes...',
      category: 'Booking Management',
      tags: ['booking', 'modification', 'process'],
      lastUpdated: new Date().toISOString(),
      author: 'Training Team',
      views: 1245,
      helpful: 187,
      notHelpful: 12,
      relatedArticles: ['kb-2', 'kb-3']
    }
  ]);
  
  const norm = (s: string) => s.toLowerCase().trim();
  const searchTerms = norm(query).split(' ').filter(Boolean);
  
  let results = knowledgeBase.filter(article => {
    if (searchTerms.length === 0) return true;
    const searchableText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
    return searchTerms.every(term => searchableText.includes(term));
  });
  
  if (category) {
    const cat = norm(category);
    results = results.filter(article => norm(article.category).includes(cat));
  }
  
  return results.sort((a, b) => b.helpful - a.helpful);
};

export const getAllAgents = async (): Promise<AgentProfile[]> => {
  try {
    // Try API first
    const response = await apiRequest<{ agents: AgentProfile[] }>(
      API_ENDPOINTS.AGENTS,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.agents) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.AGENT_PROFILES, response.data.agents);
      return response.data.agents;
    }
  } catch (error) {
    logger.warn('agent', 'API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  return readFromStorage<AgentProfile[]>(STORAGE_KEYS.AGENT_PROFILES, fallbackAgentProfiles);
};

export const updateAgentPermissions = async (agentId: string, permissions: Partial<AgentPermissions>): Promise<void> => {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.AGENTS}/${agentId}/permissions`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissions),
      }
    );
    return;
  } catch (error) {
    logger.warn('agent', 'API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const profiles = readFromStorage<AgentProfile[]>(STORAGE_KEYS.AGENT_PROFILES, fallbackAgentProfiles);
  const agent = profiles.find(a => a.id === agentId);
  if (agent) {
    agent.permissions = { ...agent.permissions, ...permissions };
    writeToStorage(STORAGE_KEYS.AGENT_PROFILES, profiles);
  }
};

export const markQuickResponseUsed = async (responseId: string): Promise<void> => {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.QUICK_RESPONSES}/${responseId}/use`,
      {
        method: 'POST',
      }
    );
    return;
  } catch (error) {
    logger.warn('agent', 'API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const responses = readFromStorage<QuickResponse[]>(STORAGE_KEYS.QUICK_RESPONSES, fallbackQuickResponses);
  const response = responses.find(qr => qr.id === responseId);
  if (response) {
    response.usageCount++;
    response.lastUsed = new Date().toISOString();
    writeToStorage(STORAGE_KEYS.QUICK_RESPONSES, responses);
  }
};

export const logAgentAction = async (agentId: string, action: string, details: Record<string, unknown>): Promise<void> => {
  const logEntry = {
    agentId,
    action,
    details,
    timestamp: new Date().toISOString()
  };

  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      API_ENDPOINTS.AUDIT_LOGS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      }
    );
    return;
  } catch (error) {
    logger.warn('agent', 'API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  logger.debug('agent', 'Agent Action:', logEntry);
  appendAuditLog(logEntry);
};

// Audit log utilities
export interface AuditLogEntry {
  id: string;
  agentId: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

function readAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    logger.warn('agent', 'Failed to read audit logs:', error);
    return [];
  }
}

function writeAuditLogs(entries: AuditLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(entries));
  } catch (error) {
    logger.warn('agent', 'Failed to write audit logs:', error);
  }
}

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id'>) {
  const list = readAuditLogs();
  const withId: AuditLogEntry = { id: `AUD${  Math.random().toString(36).slice(2, 10)}`, ...entry };
  list.push(withId);
  
  // Keep only last 1000 entries to prevent storage overflow
  if (list.length > 1000) {
    list.splice(0, list.length - 1000);
  }
  
  writeAuditLogs(list);
}

export function getAuditLogs(agentId: string, limit = 50): AuditLogEntry[] {
  return readAuditLogs()
    .filter(e => e.agentId === agentId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

// Booking management with real API integration
export interface BookingModification {
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
  roomType?: string;
  notes?: string;
}

export interface BookingModificationResult {
  bookingId: string;
  success: boolean;
  message: string;
  updated?: BookingModification;
  usedBackend: boolean;
}

export async function modifyBooking(bookingId: string, updates: BookingModification, actorAgentId: string): Promise<BookingModificationResult> {
  await logAgentAction(actorAgentId, 'modify_booking', { bookingId, updates });

  try {
    // Try API first
    const response = await apiRequest<{ 
      success: boolean; 
      message: string; 
      updated?: BookingModification 
    }>(
      `${API_ENDPOINTS.BOOKINGS}/${bookingId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );
    
    if (response.ok && response.data) {
      return {
        bookingId,
        success: response.data.success,
        message: response.data.message,
        updated: response.data.updated || updates,
        usedBackend: true,
      };
    }
  } catch (error) {
    logger.warn('agent', 'modifyBooking: API call failed, using mock fallback:', error);
  }

  // Fallback mock
  return {
    bookingId,
    success: true,
    message: 'Booking updated successfully (using mock data)',
    updated: updates,
    usedBackend: false,
  };
}

export interface RefundRequest {
  amount: number;
  currency: string;
  reason: string;
}

export interface RefundResult {
  bookingId: string;
  success: boolean;
  refundId?: string;
  message: string;
  usedBackend: boolean;
}

export async function issueRefund(bookingId: string, request: RefundRequest, actorAgentId: string): Promise<RefundResult> {
  await logAgentAction(actorAgentId, 'issue_refund', { bookingId, request });

  try {
    // Try API first
    const response = await apiRequest<{ 
      success: boolean; 
      refundId: string;
      message: string;
    }>(
      `${API_ENDPOINTS.REFUNDS}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, ...request }),
      }
    );
    
    if (response.ok && response.data) {
      return {
        bookingId,
        success: response.data.success,
        refundId: response.data.refundId,
        message: response.data.message,
        usedBackend: true,
      };
    }
  } catch (error) {
    logger.warn('agent', 'issueRefund: API call failed, using mock fallback:', error);
  }

  // Fallback mock
  return {
    bookingId,
    success: true,
    refundId: `RF${  Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    message: 'Refund submitted for processing (using mock data)',
    usedBackend: false,
  };
}

export interface CreateBookingDetails {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  customerEmail: string;
  customerName: string;
  roomType?: string;
  specialRequests?: string;
}

export interface CreateBookingResult {
  success: boolean;
  bookingId?: string;
  message: string;
  usedBackend: boolean;
}

export async function createBooking(details: CreateBookingDetails, actorAgentId: string): Promise<CreateBookingResult> {
  await logAgentAction(actorAgentId, 'create_booking', details);

  try {
    // Try API first
    const response = await apiRequest<{ 
      success: boolean; 
      bookingId: string;
      message: string;
    }>(
      API_ENDPOINTS.BOOKINGS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details as unknown as Record<string, unknown>),
      }
    );
    
    if (response.ok && response.data) {
      return { 
        success: response.data.success, 
        bookingId: response.data.bookingId, 
        message: response.data.message, 
        usedBackend: true 
      };
    }
  } catch (error) {
    logger.warn('agent', 'createBooking: API call failed, using mock fallback:', error);
  }

  // Mock fallback
  return { 
    success: true, 
    bookingId: `BK${  Math.random().toString(36).slice(2, 10).toUpperCase()}`, 
    message: 'Booking created successfully (using mock data)', 
    usedBackend: false 
  };
}

export interface CancelBookingResult {
  success: boolean;
  message: string;
  usedBackend: boolean;
}

export async function cancelBooking(bookingId: string, reason: string, actorAgentId: string): Promise<CancelBookingResult> {
  await logAgentAction(actorAgentId, 'cancel_booking', { bookingId, reason });

  try {
    // Try API first
    const response = await apiRequest<{ 
      success: boolean;
      message: string;
    }>(
      `${API_ENDPOINTS.BOOKINGS}/${bookingId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );
    
    if (response.ok && response.data) {
      return { 
        success: response.data.success, 
        message: response.data.message, 
        usedBackend: true 
      };
    }
  } catch (error) {
    logger.warn('agent', 'cancelBooking: API call failed, using mock fallback:', error);
  }

  // Mock fallback
  return { 
    success: true, 
    message: 'Booking cancelled successfully (using mock data)', 
    usedBackend: false 
  };
}

// AI Assistance with real API integration
export async function getAISuggestions(context: { 
  prompt: string; 
  tags?: string[]; 
  language?: string;
  chatHistory?: string[];
}): Promise<string[]> {
  try {
    // Try API first
    const response = await apiRequest<{ suggestions: string[] }>(
      API_ENDPOINTS.AI_ASSIST,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      }
    );
    
    if (response.ok && response.data?.suggestions) {
      return response.data.suggestions;
    }
  } catch (error) {
    logger.warn('agent', 'AI API call failed, using mock suggestions:', error);
  }

  // Mock fallback suggestions
  const base = context.prompt.toLowerCase();
  const suggestions: string[] = [];
  
  if (base.includes('refund')) {
    suggestions.push('I understand you need a refund. I can help process that according to the policy on your booking. Let me review the details.');
  }
  if (base.includes('date') || base.includes('change')) {
    suggestions.push('I can help change your dates. Could you confirm your preferred new check-in and check-out dates? I will check availability.');
  }
  if (base.includes('payment')) {
    suggestions.push('I see there was a payment issue. Please share the last 4 digits of your card and the transaction time so I can investigate.');
  }
  if (base.includes('cancel')) {
    suggestions.push('I can help with cancellation. Let me check your booking details and explain the cancellation policy and any applicable fees.');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Thanks for reaching out. I am here to help. Could you share more details so I can assist you quickly?');
  }
  
  return suggestions;
}