// Real API-integrated Agent Directory - Live agent data and management
import { apiRequest } from './apiClient';

export interface AgentDirectoryEntry {
  id: string;
  name: string;
  email: string;
  specialization: string;
  role: 'agent' | 'senior_agent' | 'admin';
  isOnline: boolean;
  currentChats: number;
  maxChats: number;
  skills: string[];
  languages: string[];
  averageResponseTime: number; // seconds
  satisfactionRating: number; // 1-5
  totalChatsHandled: number;
  joinedAt: string;
  lastActive: string;
  profilePicture?: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: number[]; // 0-6, Sunday to Saturday
  };
  certifications: string[];
  availability: 'available' | 'busy' | 'away' | 'offline';
  currentStatus?: string; // Custom status message
}

export interface AgentPresenceUpdate {
  agentId: string;
  isOnline: boolean;
  availability: 'available' | 'busy' | 'away' | 'offline';
  currentStatus?: string;
  currentChats: number;
}

export interface AgentPerformanceStats {
  agentId: string;
  period: 'today' | 'week' | 'month';
  chatsHandled: number;
  averageResponseTime: number;
  satisfactionRating: number;
  escalationRate: number;
  resolutionRate: number;
}

// API endpoints
const API_ENDPOINTS = {
  AGENT_DIRECTORY: '/api/v1/agents/directory',
  AGENT_PRESENCE: '/api/v1/agents/presence',
  AGENT_PERFORMANCE: '/api/v1/agents/performance',
  AGENT_SEARCH: '/api/v1/agents/search'
};

// Fallback storage keys for offline/development
const STORAGE_KEYS = {
  AGENT_DIRECTORY: 'metah-agent-directory-cache',
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

// Mock data for fallback
const fallbackAgents: AgentDirectoryEntry[] = [
  {
    id: 'agent-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@metah.com',
    specialization: 'Booking & Reservations',
    role: 'agent',
    isOnline: true,
    currentChats: 2,
    maxChats: 5,
    skills: ['booking', 'reservations', 'cancellations'],
    languages: ['English', 'Spanish'],
    averageResponseTime: 45,
    satisfactionRating: 4.8,
    totalChatsHandled: 1247,
    joinedAt: '2023-01-15',
    lastActive: new Date().toISOString(),
    timezone: 'America/New_York',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    },
    certifications: ['Customer Service Excellence', 'Booking Systems'],
    availability: 'available'
  },
  {
    id: 'agent-002',
    name: 'Mike Chen',
    email: 'mike.chen@metah.com',
    specialization: 'Payment & Billing',
    role: 'agent',
    isOnline: true,
    currentChats: 1,
    maxChats: 4,
    skills: ['payment', 'billing', 'refunds'],
    languages: ['English', 'Mandarin'],
    averageResponseTime: 38,
    satisfactionRating: 4.6,
    totalChatsHandled: 892,
    joinedAt: '2023-03-20',
    lastActive: new Date().toISOString(),
    timezone: 'America/Los_Angeles',
    workingHours: {
      start: '08:00',
      end: '16:00',
      days: [1, 2, 3, 4, 5]
    },
    certifications: ['Payment Processing', 'Financial Services'],
    availability: 'busy'
  },
  {
    id: 'agent-003',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@metah.com',
    specialization: 'Technical Support',
    role: 'agent',
    isOnline: false,
    currentChats: 0,
    maxChats: 3,
    skills: ['technical', 'troubleshooting'],
    languages: ['English', 'Arabic'],
    averageResponseTime: 52,
    satisfactionRating: 4.4,
    totalChatsHandled: 634,
    joinedAt: '2023-06-10',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    timezone: 'Europe/London',
    workingHours: {
      start: '10:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5]
    },
    certifications: ['Technical Support', 'IT Systems'],
    availability: 'offline'
  },
  {
    id: 'agent-004',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@metah.com',
    specialization: 'Senior Support',
    role: 'senior_agent',
    isOnline: true,
    currentChats: 3,
    maxChats: 6,
    skills: ['escalation', 'complex_issues', 'training'],
    languages: ['English', 'Spanish', 'Portuguese'],
    averageResponseTime: 35,
    satisfactionRating: 4.9,
    totalChatsHandled: 2156,
    joinedAt: '2022-08-15',
    lastActive: new Date().toISOString(),
    timezone: 'America/New_York',
    workingHours: {
      start: '07:00',
      end: '15:00',
      days: [1, 2, 3, 4, 5]
    },
    certifications: ['Senior Support', 'Team Leadership', 'Conflict Resolution'],
    availability: 'available'
  },
  {
    id: 'admin-001',
    name: 'David Wilson',
    email: 'david.wilson@metah.com',
    specialization: 'Support Manager',
    role: 'admin',
    isOnline: true,
    currentChats: 1,
    maxChats: 3,
    skills: ['management', 'escalation', 'complex_issues', 'complaints'],
    languages: ['English'],
    averageResponseTime: 28,
    satisfactionRating: 4.9,
    totalChatsHandled: 892,
    joinedAt: '2022-01-10',
    lastActive: new Date().toISOString(),
    timezone: 'America/New_York',
    workingHours: {
      start: '08:00',
      end: '16:00',
      days: [1, 2, 3, 4, 5]
    },
    certifications: ['Management', 'Customer Experience', 'Team Leadership'],
    availability: 'available'
  },
  {
    id: 'admin-002',
    name: 'Lisa Park',
    email: 'lisa.park@metah.com',
    specialization: 'Operations Director',
    role: 'admin',
    isOnline: true,
    currentChats: 0,
    maxChats: 2,
    skills: ['high_priority', 'vip_customers', 'legal_issues'],
    languages: ['English', 'Korean'],
    averageResponseTime: 25,
    satisfactionRating: 5.0,
    totalChatsHandled: 456,
    joinedAt: '2021-11-05',
    lastActive: new Date().toISOString(),
    timezone: 'America/Los_Angeles',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5]
    },
    certifications: ['Operations Management', 'VIP Service', 'Legal Compliance'],
    availability: 'available'
  }
];

// Real API Functions with localStorage fallback
export async function getAllAgents(): Promise<AgentDirectoryEntry[]> {
  try {
    // Try API first
    const response = await apiRequest<{ agents: AgentDirectoryEntry[] }>(
      API_ENDPOINTS.AGENT_DIRECTORY,
      {
        method: 'GET',
      }
    );
    
    if (response?.agents) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.AGENT_DIRECTORY, response.agents);
      return response.agents;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  return readFromStorage<AgentDirectoryEntry[]>(STORAGE_KEYS.AGENT_DIRECTORY, fallbackAgents);
}

export async function getAgentById(agentId: string): Promise<AgentDirectoryEntry | null> {
  try {
    // Try API first
    const response = await apiRequest<{ agent: AgentDirectoryEntry }>(
      `${API_ENDPOINTS.AGENT_DIRECTORY}/${agentId}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.agent) {
      return response.agent;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const agents = readFromStorage<AgentDirectoryEntry[]>(STORAGE_KEYS.AGENT_DIRECTORY, fallbackAgents);
  return agents.find(agent => agent.id === agentId) || null;
}

export async function getAvailableAgents(filters?: {
  role?: 'agent' | 'senior_agent' | 'admin';
  skills?: string[];
  languages?: string[];
  maxCurrentChats?: number;
}): Promise<AgentDirectoryEntry[]> {
  const allAgents = await getAllAgents();
  
  let available = allAgents.filter(agent => 
    agent.isOnline && 
    agent.currentChats < agent.maxChats &&
    agent.availability === 'available'
  );
  
  if (filters?.role) {
    available = available.filter(agent => agent.role === filters.role);
  }
  
  if (filters?.skills && filters.skills.length > 0) {
    available = available.filter(agent => 
      filters.skills.some(skill => agent.skills.includes(skill))
    );
  }
  
  if (filters?.languages && filters.languages.length > 0) {
    available = available.filter(agent => 
      filters.languages.some(lang => agent.languages.includes(lang))
    );
  }
  
  if (filters?.maxCurrentChats !== undefined) {
    available = available.filter(agent => agent.currentChats <= filters.maxCurrentChats);
  }
  
  // Sort by workload (fewer current chats first), then by satisfaction rating
  return available.sort((a, b) => {
    if (a.currentChats !== b.currentChats) {
      return a.currentChats - b.currentChats;
    }
    return b.satisfactionRating - a.satisfactionRating;
  });
}

export async function searchAgents(query: string): Promise<AgentDirectoryEntry[]> {
  try {
    // Try API first
    const response = await apiRequest<{ agents: AgentDirectoryEntry[] }>(
      `${API_ENDPOINTS.AGENT_SEARCH}?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.agents) {
      return response.agents;
    }
  } catch (error) {
    console.warn('API call failed, using local search fallback:', error);
  }

  // Fallback to local search
  const allAgents = await getAllAgents();
  const lowerQuery = query.toLowerCase();
  
  return allAgents.filter(agent => 
    agent.name.toLowerCase().includes(lowerQuery) ||
    agent.email.toLowerCase().includes(lowerQuery) ||
    agent.specialization.toLowerCase().includes(lowerQuery) ||
    agent.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
    agent.languages.some(lang => lang.toLowerCase().includes(lowerQuery))
  );
}

export async function updateAgentPresence(update: AgentPresenceUpdate): Promise<void> {
  try {
    // Try API first
    await apiRequest<{ success: boolean }>(
      `${API_ENDPOINTS.AGENT_PRESENCE}/${update.agentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      }
    );
    return;
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const agents = readFromStorage<AgentDirectoryEntry[]>(STORAGE_KEYS.AGENT_DIRECTORY, fallbackAgents);
  const agentIndex = agents.findIndex(a => a.id === update.agentId);
  
  if (agentIndex !== -1) {
    agents[agentIndex] = {
      ...agents[agentIndex],
      isOnline: update.isOnline,
      availability: update.availability,
      currentStatus: update.currentStatus,
      currentChats: update.currentChats,
      lastActive: new Date().toISOString()
    };
    writeToStorage(STORAGE_KEYS.AGENT_DIRECTORY, agents);
  }
}

export async function getAgentPerformance(
  agentId: string, 
  period: 'today' | 'week' | 'month' = 'today'
): Promise<AgentPerformanceStats | null> {
  try {
    // Try API first
    const response = await apiRequest<{ performance: AgentPerformanceStats }>(
      `${API_ENDPOINTS.AGENT_PERFORMANCE}/${agentId}?period=${period}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.performance) {
      return response.performance;
    }
  } catch (error) {
    console.warn('API call failed, using mock fallback:', error);
  }

  // Mock performance data as fallback
  const agent = await getAgentById(agentId);
  if (!agent) return null;
  
  return {
    agentId,
    period,
    chatsHandled: Math.floor(Math.random() * 20) + 5,
    averageResponseTime: agent.averageResponseTime,
    satisfactionRating: agent.satisfactionRating,
    escalationRate: Math.random() * 10,
    resolutionRate: 85 + Math.random() * 15
  };
}

export async function getAgentsByRole(role: 'agent' | 'senior_agent' | 'admin'): Promise<AgentDirectoryEntry[]> {
  const allAgents = await getAllAgents();
  return allAgents.filter(agent => agent.role === role);
}

export async function getOnlineAgentsCount(): Promise<number> {
  const allAgents = await getAllAgents();
  return allAgents.filter(agent => agent.isOnline).length;
}

export async function getAgentWorkload(agentId: string): Promise<{
  currentChats: number;
  maxChats: number;
  utilizationRate: number;
  averageWaitTime: number;
}> {
  const agent = await getAgentById(agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }
  
  const utilizationRate = (agent.currentChats / agent.maxChats) * 100;
  
  return {
    currentChats: agent.currentChats,
    maxChats: agent.maxChats,
    utilizationRate,
    averageWaitTime: Math.max(0, (agent.currentChats - 1) * 2) // Estimated minutes
  };
}

// Auto-assignment logic
export async function findBestAgentForChat(requirements: {
  skills?: string[];
  languages?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  customerType?: 'regular' | 'vip';
}): Promise<AgentDirectoryEntry | null> {
  let candidates = await getAvailableAgents({
    skills: requirements.skills,
    languages: requirements.languages
  });
  
  if (candidates.length === 0) {
    // If no specific skill match, get any available agent
    candidates = await getAvailableAgents();
  }
  
  if (candidates.length === 0) {
    return null;
  }
  
  // For urgent or VIP, prefer senior agents or admins
  if (requirements.priority === 'urgent' || requirements.customerType === 'vip') {
    const seniorCandidates = candidates.filter(agent => 
      agent.role === 'senior_agent' || agent.role === 'admin'
    );
    if (seniorCandidates.length > 0) {
      candidates = seniorCandidates;
    }
  }
  
  // Return the best candidate (already sorted by workload and satisfaction)
  return candidates[0];
}

// Legacy compatibility - re-export as mockAgents for existing code
export const mockAgents = fallbackAgents;

// Initialize mock chat data (legacy compatibility)
export async function createMockChats(): Promise<void> {
  // This function is kept for backward compatibility
  // In the real implementation, this would be handled by the backend
  console.log('Mock chat creation is handled by the backend in the real implementation');
}
