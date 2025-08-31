// Real API-integrated Chat Store for Customer-Agent Communication
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from './apiClient';

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  senderId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    bookingRef?: string;
    attachments?: string[];
    isTransferred?: boolean;
    fromAgent?: string;
    toAgent?: string;
    translatedFrom?: string;
    originalMessage?: string;
  };
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'active' | 'transferred' | 'resolved' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: 'general' | 'booking' | 'payment' | 'technical' | 'billing';
  startedAt: string;
  endedAt?: string;
  lastMessageAt: string;
  estimatedWaitTime?: string;
  customerContext: {
    bookingHistory: CustomerBooking[];
    totalBookings: number;
    memberSince: string;
    loyaltyLevel: string;
    lastActivity: string;
    preferredLanguage: string;
    timezone: string;
    previousChats: number;
    totalSpent: number;
  };
  metadata: {
    source: 'website' | 'mobile' | 'email' | 'phone';
    userAgent?: string;
    location?: string;
    referrer?: string;
    currentPage?: string;
  };
  tags: string[];
  internalNotes: InternalNote[];
}

export interface CustomerBooking {
  id: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  total: number;
  currency: string;
  issues?: string[];
}

export interface InternalNote {
  id: string;
  agentId: string;
  agentName: string;
  note: string;
  timestamp: string;
  isPrivate: boolean;
}

export interface AgentPresence {
  agentId: string;
  name: string;
  email: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  currentChats: number;
  maxChats: number;
  skills: string[];
  languages: string[];
  department: string;
  lastSeen: string;
}

export interface ChatAgent {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'senior_agent' | 'admin';
  specialization: string;
  isOnline: boolean;
  currentChats: number;
  maxChats: number;
  skills: string[];
}

// API endpoints
const API_ENDPOINTS = {
  CHAT_SESSIONS: '/api/v1/chat/sessions',
  CHAT_MESSAGES: '/api/v1/chat/messages',
  AGENT_PRESENCE: '/api/v1/agents/presence',
  AGENTS: '/api/v1/agents',
  START_CHAT: '/api/v1/chat/start',
  ASSIGN_CHAT: '/api/v1/chat/assign',
  TRANSFER_CHAT: '/api/v1/chat/transfer',
  END_CHAT: '/api/v1/chat/end',
  ADD_NOTE: '/api/v1/chat/notes'
};

// Fallback to localStorage for offline/development mode
const STORAGE_KEYS = {
  CHAT_SESSIONS: 'metah-chat-sessions-cache',
  CHAT_MESSAGES: 'metah-chat-messages-cache',
  AGENT_PRESENCE: 'metah-agent-presence-cache'
};

// Utility functions for localStorage fallback
function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
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

// Real API Functions with localStorage fallback
export async function startChatSession(customerInfo: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  department?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  initialMessage?: string;
  metadata?: Record<string, unknown>;
}): Promise<ChatSession> {
  try {
    // Try API first
    const response = await apiRequest<{ chatSession: ChatSession }>(
      API_ENDPOINTS.START_CHAT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerInfo),
      }
    );
    
    if (response?.chatSession) {
      // Cache for offline usage
      const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
      const existingIndex = sessions.findIndex(s => s.id === response.chatSession.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = response.chatSession;
      } else {
        sessions.push(response.chatSession);
      }
      writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
      
      return response.chatSession;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage (mock behavior)
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  
  // Check if customer already has an active session
  const existingSession = sessions.find(
    s => s.customerId === customerInfo.customerId && 
    ['waiting', 'active'].includes(s.status)
  );
  
  if (existingSession) {
    return existingSession;
  }

  const newSession: ChatSession = {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId: customerInfo.customerId,
    customerName: customerInfo.customerName,
    customerEmail: customerInfo.customerEmail,
    customerAvatar: customerInfo.customerAvatar,
    status: 'waiting',
    priority: customerInfo.priority || 'medium',
    department: (customerInfo.department as any) || 'general',
    startedAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    customerContext: {
      bookingHistory: [],
      totalBookings: 0,
      memberSince: '2023-01-01',
      loyaltyLevel: 'Bronze',
      lastActivity: new Date().toISOString(),
      preferredLanguage: 'en-US',
      timezone: 'UTC',
      previousChats: 0,
      totalSpent: 0
    },
    metadata: {
      source: 'website',
      userAgent: navigator.userAgent,
      location: 'Unknown',
      currentPage: window.location.href,
      ...customerInfo.metadata
    },
    tags: [],
    internalNotes: []
  };

  sessions.push(newSession);
  writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);

  // Add initial message if provided
  if (customerInfo.initialMessage) {
    await addChatMessage({
      chatId: newSession.id,
      sender: 'customer',
      senderName: customerInfo.customerName,
      senderId: customerInfo.customerId,
      message: customerInfo.initialMessage,
      messageType: 'text'
    });
  }

  return newSession;
}

export async function assignChatToAgent(chatId: string, agentId: string, agentName: string): Promise<boolean> {
  try {
    // Try API first
    const response = await apiRequest<{ success: boolean }>(
      API_ENDPOINTS.ASSIGN_CHAT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, agentId, agentName }),
      }
    );
    
    if (response?.success) {
      return true;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const sessionIndex = sessions.findIndex(s => s.id === chatId);
  
  if (sessionIndex === -1) return false;

  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    agentId,
    agentName,
    status: 'active',
    lastMessageAt: new Date().toISOString()
  };

  writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);

  // Add system message about assignment
  await addChatMessage({
    chatId,
    sender: 'system',
    senderName: 'System',
    senderId: 'system',
    message: `${agentName} has joined the chat`,
    messageType: 'system'
  });

  return true;
}

export async function addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): Promise<ChatMessage> {
  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    isRead: false,
    ...message
  };

  try {
    // Try API first
    const response = await apiRequest<{ message: ChatMessage }>(
      API_ENDPOINTS.CHAT_MESSAGES,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      }
    );
    
    if (response?.message) {
      // Cache for offline usage
      const messages = readFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
      messages.push(response.message);
      writeToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);
      
      return response.message;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const messages = readFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
  messages.push(newMessage);
  writeToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);

  // Update session's last message time
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const sessionIndex = sessions.findIndex(s => s.id === message.chatId);
  if (sessionIndex !== -1) {
    sessions[sessionIndex].lastMessageAt = newMessage.timestamp;
    writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  }

  return newMessage;
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    // Try API first
    const response = await apiRequest<{ messages: ChatMessage[] }>(
      `${API_ENDPOINTS.CHAT_MESSAGES}/${chatId}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.messages) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.CHAT_MESSAGES, response.messages);
      return response.messages;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const messages = readFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
  return messages.filter(m => m.chatId === chatId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export async function getChatSession(chatId: string): Promise<ChatSession | null> {
  try {
    // Try API first
    const response = await apiRequest<{ session: ChatSession }>(
      `${API_ENDPOINTS.CHAT_SESSIONS}/${chatId}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.session) {
      return response.session;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  return sessions.find(s => s.id === chatId) || null;
}

export async function getAgentActiveChats(agentId: string): Promise<ChatSession[]> {
  try {
    // Try API first
    const response = await apiRequest<{ sessions: ChatSession[] }>(
      `${API_ENDPOINTS.CHAT_SESSIONS}/agent/${agentId}/active`,
      {
        method: 'GET',
      }
    );
    
    if (response?.sessions) {
      return response.sessions;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  return sessions.filter(s => s.agentId === agentId && s.status === 'active');
}

export async function getWaitingChats(): Promise<ChatSession[]> {
  try {
    // Try API first
    const response = await apiRequest<{ sessions: ChatSession[] }>(
      `${API_ENDPOINTS.CHAT_SESSIONS}/waiting`,
      {
        method: 'GET',
      }
    );
    
    if (response?.sessions) {
      return response.sessions;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  return sessions.filter(s => s.status === 'waiting').sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );
}

export async function addInternalNote(chatId: string, agentId: string, agentName: string, note: string, isPrivate = false): Promise<void> {
  const newNote: InternalNote = {
    id: `note-${Date.now()}`,
    agentId,
    agentName,
    note,
    timestamp: new Date().toISOString(),
    isPrivate
  };

  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      API_ENDPOINTS.ADD_NOTE,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, ...newNote }),
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const sessionIndex = sessions.findIndex(s => s.id === chatId);
  
  if (sessionIndex === -1) return;

  sessions[sessionIndex].internalNotes.push(newNote);
  writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);
}

export async function transferChat(chatId: string, fromAgentId: string, toAgentId: string, toAgentName: string, reason?: string): Promise<boolean> {
  try {
    // Try API first
    const response = await apiRequest<{ success: boolean }>(
      API_ENDPOINTS.TRANSFER_CHAT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          fromAgentId,
          toAgentId,
          toAgentName,
          reason
        }),
      }
    );
    
    if (response?.success) {
      return true;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage with mock agent data
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const sessionIndex = sessions.findIndex(s => s.id === chatId);
  
  if (sessionIndex === -1) return false;

  // Mock escalation logic for fallback
  const isEscalation = toAgentId.includes('admin') || toAgentId.includes('senior');
  const newStatus = isEscalation ? 'active' : 'transferred';
  
  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    agentId: toAgentId,
    agentName: toAgentName,
    status: newStatus,
    priority: isEscalation ? 'urgent' : sessions[sessionIndex].priority,
    lastMessageAt: new Date().toISOString()
  };

  if (isEscalation && !sessions[sessionIndex].tags.includes('escalated')) {
    sessions[sessionIndex].tags.push('escalated');
  }

  writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);

  // Add system message about transfer/escalation
  const messageText = isEscalation 
    ? `Chat escalated to ${toAgentName}${reason ? `: ${reason}` : ''}`
    : `Chat transferred to ${toAgentName}${reason ? `: ${reason}` : ''}`;

  await addChatMessage({
    chatId,
    sender: 'system',
    senderName: 'System',
    senderId: 'system',
    message: messageText,
    messageType: 'system',
    metadata: {
      isTransferred: true,
      fromAgent: fromAgentId,
      toAgent: toAgentId
    }
  });

  return true;
}

export async function endChatSession(chatId: string, agentId: string, reason?: string): Promise<boolean> {
  try {
    // Try API first
    const response = await apiRequest<{ success: boolean }>(
      API_ENDPOINTS.END_CHAT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, agentId, reason }),
      }
    );
    
    if (response?.success) {
      return true;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const sessions = readFromStorage<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
  const sessionIndex = sessions.findIndex(s => s.id === chatId);
  
  if (sessionIndex === -1) return false;

  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    status: 'resolved',
    endedAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString()
  };

  writeToStorage(STORAGE_KEYS.CHAT_SESSIONS, sessions);

  // Add system message about ending
  await addChatMessage({
    chatId,
    sender: 'system',
    senderName: 'System',
    senderId: 'system',
    message: `Chat session ended${reason ? `: ${reason}` : ''}. Thank you for contacting Metah Support!`,
    messageType: 'system',
    metadata: {
      endedBy: agentId,
      endReason: reason,
      endTime: new Date().toISOString()
    }
  });

  return true;
}

// Agent Presence Management
export async function updateAgentPresence(agentId: string, status: AgentPresence['status']): Promise<void> {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      API_ENDPOINTS.AGENT_PRESENCE,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId, status }),
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const presence = readFromStorage<AgentPresence[]>(STORAGE_KEYS.AGENT_PRESENCE, []);
  const agentIndex = presence.findIndex(p => p.agentId === agentId);
  
  if (agentIndex !== -1) {
    presence[agentIndex].status = status;
    presence[agentIndex].lastSeen = new Date().toISOString();
  } else {
    // Add new agent presence (mock data)
    presence.push({
      agentId,
      name: `Agent ${  agentId.slice(-4)}`,
      email: `agent${agentId.slice(-4)}@metah.com`,
      status,
      currentChats: 0,
      maxChats: 5,
      skills: ['general_support', 'bookings'],
      languages: ['en', 'es'],
      department: 'support',
      lastSeen: new Date().toISOString()
    });
  }

  writeToStorage(STORAGE_KEYS.AGENT_PRESENCE, presence);
}

export async function getAvailableAgents(): Promise<ChatAgent[]> {
  try {
    // Try API first
    const response = await apiRequest<{ agents: ChatAgent[] }>(
      `${API_ENDPOINTS.AGENTS}/available`,
      {
        method: 'GET',
      }
    );
    
    if (response?.agents) {
      return response.agents;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback with mock data
  return [
    {
      id: 'agent-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@metah.com',
      role: 'agent',
      specialization: 'Booking & Reservations',
      isOnline: true,
      currentChats: 2,
      maxChats: 5,
      skills: ['booking', 'reservations', 'cancellations']
    },
    {
      id: 'agent-002',
      name: 'Mike Chen',
      email: 'mike.chen@metah.com',
      role: 'agent',
      specialization: 'Payment & Billing',
      isOnline: true,
      currentChats: 1,
      maxChats: 4,
      skills: ['payment', 'billing', 'refunds']
    },
    {
      id: 'senior-001',
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@metah.com',
      role: 'senior_agent',
      specialization: 'Senior Support',
      isOnline: true,
      currentChats: 3,
      maxChats: 6,
      skills: ['escalation', 'complex_issues', 'training']
    },
    {
      id: 'admin-001',
      name: 'David Wilson',
      email: 'david.wilson@metah.com',
      role: 'admin',
      specialization: 'Support Manager',
      isOnline: true,
      currentChats: 1,
      maxChats: 3,
      skills: ['management', 'escalation', 'complex_issues', 'complaints']
    }
  ];
}

// React Hook for Chat Management
export function useChatManager(agentId?: string) {
  const [waitingChats, setWaitingChats] = useState<ChatSession[]>([]);
  const [activeChats, setActiveChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    try {
      const [waiting, active] = await Promise.all([
        getWaitingChats(),
        agentId ? getAgentActiveChats(agentId) : Promise.resolve([])
      ]);
      
      setWaitingChats(waiting);
      setActiveChats(active);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadChats();
    
    // Refresh chats every 10 seconds
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, [loadChats, setInterval]);

  const assignChat = useCallback(async (chatId: string, agentName: string) => {
    if (!agentId) return false;
    
    const success = await assignChatToAgent(chatId, agentId, agentName);
    if (success) {
      await loadChats();
    }
    return success;
  }, [agentId, loadChats]);

  const transferChatFn = useCallback(async (chatId: string, toAgentId: string, toAgentName: string, reason?: string) => {
    if (!agentId) return false;
    
    const success = await transferChat(chatId, agentId, toAgentId, toAgentName, reason);
    if (success) {
      await loadChats();
    }
    return success;
  }, [agentId, loadChats]);

  const endChat = useCallback(async (chatId: string, reason?: string) => {
    if (!agentId) return false;
    
    const success = await endChatSession(chatId, agentId, reason);
    if (success) {
      await loadChats();
    }
    return success;
  }, [agentId, loadChats]);

  return {
    waitingChats,
    activeChats,
    loading,
    assignChat,
    transferChat: transferChatFn,
    endChat,
    refresh: loadChats
  };
}

// React Hook for Chat Messages
export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    
    try {
      const chatMessages = await getChatMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadMessages();
    
    // Refresh messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages, setInterval]);

  const sendMessage = useCallback(async (
    sender: 'customer' | 'agent',
    senderName: string,
    senderId: string,
    message: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ) => {
    try {
      await addChatMessage({
        chatId,
        sender,
        senderName,
        senderId,
        message,
        messageType
      });
      
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [chatId, loadMessages]);

  return {
    messages,
    loading,
    sendMessage,
    refresh: loadMessages
  };
}

// Note function for adding chat notes
export async function addChatNote(chatId: string, agentId: string, agentName: string, note: string, isInternal = true): Promise<void> {
  return addInternalNote(chatId, agentId, agentName, note, isInternal);
}