// Real API-integrated Support Store - Comprehensive ticket and chat management
import { apiRequest } from './apiClient';

export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory = 'help' | 'safety' | 'cancellation' | 'accessibility' | 'technical' | 'billing' | 'booking' | 'other';

export type SupportTicket = {
  id: string;
  category: TicketCategory;
  subject: string;
  description: string;
  email?: string;
  phone?: string;
  bookingRef?: string;
  attachments?: { name: string; url?: string }[];
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  internalNotes?: string[];
  assignedTo?: string;
  customerServiceAccess?: boolean;
  liveChatId?: string;
  customerName?: string;
  resolutionTime?: number; // minutes
  firstResponseTime?: number; // minutes
  escalatedAt?: string;
  resolvedAt?: string;
  tags: string[];
};

export type LiveChatMessage = {
  id: string;
  chatId: string;
  ticketId?: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'ticket_created' | 'agent_assigned' | 'system' | 'image' | 'file';
  metadata?: {
    attachments?: string[];
    translatedFrom?: string;
    originalMessage?: string;
  };
};

export type LiveChatSession = {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  status: 'active' | 'waiting' | 'assigned' | 'closed';
  agentId?: string;
  agentName?: string;
  ticketId?: string;
  createdAt: string;
  lastActivity: string;
  messages: LiveChatMessage[];
  priority: TicketPriority;
  category: TicketCategory;
  subject?: string;
  satisfaction?: {
    rating: number;
    feedback?: string;
    submittedAt: string;
  };
  duration?: number; // minutes
  waitTime?: number; // minutes
};

export type SupportContact = {
  phone: string;
  whatsapp: string;
  email: string;
  liveChatEnabled: boolean;
  businessHours: string;
  emergencyContact: string;
};

export type CustomerServiceAgent = {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastSeen: string;
  activeChats: number;
  maxChats: number;
  specialties: TicketCategory[];
  permissions?: AgentPermissions;
  skillLevel: 'junior' | 'senior' | 'lead';
  languages: string[];
  averageResponseTime: number; // seconds
  satisfactionRating: number;
};

export type AgentPermissions = {
  // Read-only personal info
  canViewEmail: boolean;
  canViewPhone: boolean;
  canViewBookingRef: boolean;
  // Sensitive fields
  canViewPaymentIssues: boolean; // redact billing notes otherwise
  canViewInternalNotes: boolean;
  // Actions
  canCreateTickets: boolean;
  canAssignTickets: boolean;
  canCloseTickets: boolean;
  canAddInternalNotes: boolean;
  canEscalateTickets: boolean;
  // New actions/rights
  canModifyBookings?: boolean;
  canIssueRefunds?: boolean;
  canCollaborate?: boolean;
  canUseAIAssist?: boolean;
  canAccessSensitiveData?: boolean;
  canTransferChats?: boolean;
};

// API endpoints
const API_ENDPOINTS = {
  TICKETS: '/api/v1/support/tickets',
  LIVE_CHAT: '/api/v1/support/live-chat',
  AGENTS: '/api/v1/support/agents',
  CHAT_SESSIONS: '/api/v1/support/chat-sessions',
  CHAT_MESSAGES: '/api/v1/support/chat-messages',
  SUPPORT_CONTACTS: '/api/v1/support/contacts'
};

// Fallback storage keys for offline/development
const STORAGE_KEYS = {
  TICKETS: 'metah-support-tickets-cache',
  CHAT_SESSIONS: 'metah-live-chat-sessions-cache',
  AGENTS: 'metah-support-agents-cache',
  CONTACTS: 'metah-support-contacts-cache'
};

// Utility functions for localStorage fallback
function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read ${key} from storage:`, error);
    return defaultValue;
  }
}

function writeToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to write ${key} to storage:`, error);
  }
}

// Mock data for fallback
const fallbackTickets: SupportTicket[] = [
  {
    id: 'T001',
    category: 'help',
    subject: 'How to change my booking dates?',
    description: 'I need to shift my stay by 2 days.',
    email: 'guest1@example.com',
    bookingRef: 'BK1001',
    status: 'open',
    priority: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [],
    internalNotes: [],
    customerServiceAccess: false,
    tags: ['booking', 'date_change']
  }
];

const fallbackAgents: CustomerServiceAgent[] = [
  {
    id: 'AGENT001',
    name: 'Sarah Johnson',
    email: 'sarah.j@metah.com',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    activeChats: 2,
    maxChats: 5,
    specialties: ['technical', 'billing', 'booking'],
    skillLevel: 'senior',
    languages: ['English', 'Spanish'],
    averageResponseTime: 45,
    satisfactionRating: 4.8,
    permissions: {
      canViewEmail: true,
      canViewPhone: true,
      canViewBookingRef: true,
      canViewPaymentIssues: true,
      canViewInternalNotes: true,
      canCreateTickets: true,
      canAssignTickets: true,
      canCloseTickets: true,
      canAddInternalNotes: true,
      canEscalateTickets: true,
      canModifyBookings: true,
      canIssueRefunds: true,
      canCollaborate: true,
      canUseAIAssist: true,
      canAccessSensitiveData: true,
      canTransferChats: true
    }
  }
];

// Real API Functions with localStorage fallback
export async function listTickets(filters?: { 
  status?: TicketStatus; 
  priority?: TicketPriority; 
  category?: TicketCategory;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}): Promise<SupportTicket[]> {
  try {
    // Try API first
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());
    
    const response = await apiRequest<{ tickets: SupportTicket[] }>(
      `${API_ENDPOINTS.TICKETS}?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.tickets) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.TICKETS, response.data.tickets);
      return response.data.tickets;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  let tickets = readFromStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, fallbackTickets);
  
  // Apply filters on cached data
  if (filters?.status) {
    tickets = tickets.filter(t => t.status === filters.status);
  }
  if (filters?.priority) {
    tickets = tickets.filter(t => t.priority === filters.priority);
  }
  if (filters?.category) {
    tickets = tickets.filter(t => t.category === filters.category);
  }
  if (filters?.assignedTo) {
    tickets = tickets.filter(t => t.assignedTo === filters.assignedTo);
  }
  
  return tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTicketById(id: string): Promise<SupportTicket | null> {
  try {
    // Try API first
    const response = await apiRequest<{ ticket: SupportTicket }>(
      `${API_ENDPOINTS.TICKETS}/${id}`,
      {
        method: 'GET',
      }
    );
    
    if (response.ok && response.data?.ticket) {
      return response.data.ticket;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const tickets = readFromStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, fallbackTickets);
  return tickets.find(t => t.id === id) || null;
}

export async function createTicket(
  partial: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'tags'> & 
  Partial<Pick<SupportTicket, 'priority' | 'tags'>>
): Promise<SupportTicket> {
  const now = new Date().toISOString();
  const newTicket: SupportTicket = {
    id: `T${  Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    status: 'open',
    priority: partial.priority || 'normal',
    createdAt: now,
    updatedAt: now,
    attachments: [],
    internalNotes: [],
    customerServiceAccess: false,
    tags: partial.tags || [],
    ...partial,
  };

  try {
    // Try API first
    const response = await apiRequest<{ ticket: SupportTicket }>(
      API_ENDPOINTS.TICKETS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      }
    );
    
    if (response?.ticket) {
      return response.ticket;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const tickets = readFromStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, fallbackTickets);
  tickets.push(newTicket);
  writeToStorage(STORAGE_KEYS.TICKETS, tickets);
  
  return newTicket;
}

export async function updateTicket(id: string, patch: Partial<SupportTicket>): Promise<SupportTicket | null> {
  const updates = { ...patch, updatedAt: new Date().toISOString() };

  try {
    // Try API first
    const response = await apiRequest<{ ticket: SupportTicket }>(
      `${API_ENDPOINTS.TICKETS}/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );
    
    if (response?.ticket) {
      return response.ticket;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const tickets = readFromStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, fallbackTickets);
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) return null;
  
  tickets[idx] = { ...tickets[idx], ...updates };
  writeToStorage(STORAGE_KEYS.TICKETS, tickets);
  
  return tickets[idx];
}

export async function assignTicketToCustomerService(id: string): Promise<SupportTicket | null> {
  return updateTicket(id, { customerServiceAccess: true, status: 'assigned' });
}

export async function getCustomerServiceTickets(): Promise<SupportTicket[]> {
  return listTickets({ assignedTo: 'customer_service' });
}

export async function createLiveChatSession(customerInfo: {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  category: TicketCategory;
  subject?: string;
  priority?: TicketPriority;
}): Promise<LiveChatSession> {
  const newSession: LiveChatSession = {
    id: `CHAT${  Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    customerId: customerInfo.customerId,
    customerName: customerInfo.customerName,
    customerEmail: customerInfo.customerEmail,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    messages: [],
    priority: customerInfo.priority || 'normal',
    category: customerInfo.category,
    subject: customerInfo.subject,
  };
  
  try {
    // Try API first
    const response = await apiRequest<{ session: LiveChatSession }>(
      API_ENDPOINTS.CHAT_SESSIONS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSession),
      }
    );
    
    if (response?.session) {
      return response.session;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = getAllLiveChatSessions();
  sessions.push(newSession);
  writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  
  return newSession;
}

export async function addLiveChatMessage(
  chatId: string, 
  message: Omit<LiveChatMessage, 'id' | 'timestamp'>
): Promise<LiveChatMessage> {
  const newMessage: LiveChatMessage = {
    ...message,
    id: `MSG${  Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Try API first
    const response = await apiRequest<{ message: LiveChatMessage }>(
      `${API_ENDPOINTS.CHAT_MESSAGES}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, ...newMessage }),
      }
    );
    
    if (response?.message) {
      return response.message;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = getAllLiveChatSessions();
  const sessionIndex = sessions.findIndex(s => s.id === chatId);
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex].messages.push(newMessage);
    sessions[sessionIndex].lastActivity = new Date().toISOString();
    writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  }
  
  return newMessage;
}

export function getAllLiveChatSessions(): LiveChatSession[] {
  return readFromStorage<LiveChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
}

export function getLiveChatSession(chatId: string): LiveChatSession | undefined {
  return getAllLiveChatSessions().find(s => s.id === chatId);
}

export async function updateLiveChatSession(
  chatId: string, 
  updates: Partial<LiveChatSession>
): Promise<LiveChatSession | null> {
  const sessionUpdates = { ...updates, lastActivity: new Date().toISOString() };

  try {
    // Try API first
    const response = await apiRequest<{ session: LiveChatSession }>(
      `${API_ENDPOINTS.CHAT_SESSIONS}/${chatId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionUpdates),
      }
    );
    
    if (response?.session) {
      return response.session;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = getAllLiveChatSessions();
  const sessionIndex = sessions.findIndex(s => s.id === chatId);
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...sessionUpdates };
    writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
    return sessions[sessionIndex];
  }
  
  return null;
}

export async function assignAgentToChat(
  chatId: string, 
  agentId: string, 
  agentName: string
): Promise<LiveChatSession | null> {
  const session = await updateLiveChatSession(chatId, {
    status: 'assigned',
    agentId,
    agentName,
  });
  
  if (session) {
    // Add system message about agent assignment
    await addLiveChatMessage(chatId, {
      chatId,
      sender: 'system',
      senderName: 'System',
      message: `You have been assigned to ${agentName}. They will respond shortly.`,
      isRead: false,
      messageType: 'agent_assigned',
    });
  }
  
  return session;
}

export async function createTicketFromChat(chatId: string, ticketData: {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  email?: string;
  phone?: string;
  bookingRef?: string;
}): Promise<SupportTicket> {
  const session = getLiveChatSession(chatId);
  const ticket = await createTicket({
    ...ticketData,
    customerName: session?.customerName,
    liveChatId: chatId,
  });
  
  // Update chat session with ticket ID
  await updateLiveChatSession(chatId, { ticketId: ticket.id });
  
  // Add system message about ticket creation
  await addLiveChatMessage(chatId, {
    chatId,
    ticketId: ticket.id,
    sender: 'system',
    senderName: 'System',
    message: `Support ticket ${ticket.id} has been created. Our team will respond within 24 hours.`,
    isRead: false,
    messageType: 'ticket_created',
  });
  
  return ticket;
}

export async function getCustomerServiceAgents(): Promise<CustomerServiceAgent[]> {
  try {
    // Try API first
    const response = await apiRequest<{ agents: CustomerServiceAgent[] }>(
      API_ENDPOINTS.AGENTS,
      {
        method: 'GET',
      }
    );
    
    if (response?.agents) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.AGENTS, response.agents);
      return response.agents;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  return readFromStorage<CustomerServiceAgent[]>(STORAGE_KEYS.AGENTS, fallbackAgents);
}

export async function getAvailableAgents(category?: TicketCategory): Promise<CustomerServiceAgent[]> {
  const agents = await getCustomerServiceAgents();
  let available = agents.filter(agent => 
    agent.isOnline && 
    agent.activeChats < agent.maxChats
  );
  
  if (category) {
    available = available.filter(agent => 
      agent.specialties.includes(category)
    );
  }
  
  return available.sort((a, b) => a.activeChats - b.activeChats); // Prefer agents with fewer active chats
}

export async function updateAgentStatus(
  agentId: string, 
  status: { isOnline: boolean; activeChats?: number }
): Promise<void> {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.AGENTS}/${agentId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const agents = readFromStorage<CustomerServiceAgent[]>(STORAGE_KEYS.AGENTS, fallbackAgents);
  const agentIndex = agents.findIndex(a => a.id === agentId);
  
  if (agentIndex !== -1) {
    agents[agentIndex] = {
      ...agents[agentIndex],
      ...status,
      lastSeen: new Date().toISOString()
    };
    writeToStorage(STORAGE_KEYS.AGENTS, agents);
  }
}

export async function getSupportContacts(): Promise<SupportContact> {
  try {
    // Try API first
    const response = await apiRequest<{ contacts: SupportContact }>(
      API_ENDPOINTS.SUPPORT_CONTACTS,
      {
        method: 'GET',
      }
    );
    
    if (response?.contacts) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.CONTACTS, response.contacts);
      return response.contacts;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  return readFromStorage<SupportContact>(STORAGE_KEYS.CONTACTS, {
    phone: '+1-800-555-0123',
    whatsapp: '+1-800-555-0123',
    email: 'support@metah.com',
    liveChatEnabled: true,
    businessHours: 'Mon-Sun 24/7',
    emergencyContact: '+1-800-555-0199'
  });
}

export async function updateSupportContacts(contacts: SupportContact): Promise<SupportContact> {
  try {
    // Try API first
    const response = await apiRequest<{ contacts: SupportContact }>(
      API_ENDPOINTS.SUPPORT_CONTACTS,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contacts),
      }
    );
    
    if (response?.contacts) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.CONTACTS, response.contacts);
      return response.contacts;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  writeToStorage(STORAGE_KEYS.CONTACTS, contacts);
  return contacts;
}

// Auto-assignment logic
export async function autoAssignChat(chatId: string): Promise<LiveChatSession | null> {
  const session = getLiveChatSession(chatId);
  if (!session) return null;
  
  const availableAgents = await getAvailableAgents(session.category);
  if (availableAgents.length === 0) return null;
  
  // Select best agent based on workload and specialty
  const bestAgent = availableAgents[0];
  
  return assignAgentToChat(chatId, bestAgent.id, bestAgent.name);
}

// Escalation logic
export async function escalateTicket(
  ticketId: string, 
  reason: string, 
  escalatedBy: string
): Promise<SupportTicket | null> {
  return updateTicket(ticketId, {
    priority: 'urgent',
    escalatedAt: new Date().toISOString(),
    tags: ['escalated'],
    internalNotes: [`Escalated by ${escalatedBy}: ${reason}`]
  });
}

// Demo data seeder
export function seedDemoTickets(): SupportTicket[] {
  const current = readFromStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
  if (current.length) return current;
  
  const demo: SupportTicket[] = [
    {
      id: 'T001',
      category: 'help',
      subject: 'How to change my booking dates?',
      description: 'I need to shift my stay by 2 days.',
      email: 'guest1@example.com',
      bookingRef: 'BK1001',
      status: 'open',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      internalNotes: [],
      customerServiceAccess: false,
      tags: ['booking', 'date_change']
    },
    {
      id: 'T002',
      category: 'cancellation',
      subject: 'Cancel my booking',
      description: 'Trip cancelled, need a refund per policy.',
      email: 'guest2@example.com',
      bookingRef: 'BK1002',
      status: 'assigned',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      internalNotes: [],
      customerServiceAccess: true,
      assignedTo: 'AGENT001',
      tags: ['cancellation', 'refund']
    }
  ];
  
  writeToStorage(STORAGE_KEYS.TICKETS, demo);
  return demo;
}