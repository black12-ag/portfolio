// Real API-integrated Agent Management Store - Comprehensive agent lifecycle management
import { apiRequest } from './apiClient';

export type AgentApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
export type AgentAccountStatus = 'pending' | 'active' | 'suspended' | 'deactivated' | 'terminated';
export type PerformanceRating = 1 | 2 | 3 | 4 | 5;

export interface AgentApplication {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    profilePhoto?: string;
  };
  professionalInfo: {
    previousExperience: string;
    educationLevel: string;
    languages: string[];
    specializations: string[];
    certifications: string[];
    resume?: string;
  };
  availability: {
    fullTime: boolean;
    partTime: boolean;
    preferredShifts: string[];
    hoursPerWeek: number;
    startDate: string;
  };
  documents: {
    idVerification?: string;
    backgroundCheck?: string;
    references: Array<{
      name: string;
      company: string;
      phone: string;
      email: string;
      relationship: string;
    }>;
  };
  applicationDate: string;
  status: AgentApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  lastUpdated: string;
}

export interface AgentAccount {
  id: string;
  applicationId: string;
  username: string;
  email: string;
  passwordHash: string; // In real app, would be properly hashed
  personalInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    profilePhoto?: string;
    phone: string;
  };
  professionalInfo: {
    employeeId: string;
    department: string;
    position: string;
    specializations: string[];
    languages: string[];
    certifications: string[];
    hireDate: string;
  };
  status: AgentAccountStatus;
  permissions: {
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
    maxConcurrentChats: number;
    canAccessAdminFeatures: boolean;
    // New permissions
    canModifyBookings: boolean;
    canIssueRefunds: boolean;
    canAccessSensitiveData: boolean;
    canCollaborate: boolean;
    canUseAIAssist: boolean;
    canCreateBookings: boolean;
    canCancelBookings: boolean;
  };
  schedule: {
    workingHours: {
      monday: { start: string; end: string; isWorking: boolean };
      tuesday: { start: string; end: string; isWorking: boolean };
      wednesday: { start: string; end: string; isWorking: boolean };
      thursday: { start: string; end: string; isWorking: boolean };
      friday: { start: string; end: string; isWorking: boolean };
      saturday: { start: string; end: string; isWorking: boolean };
      sunday: { start: string; end: string; isWorking: boolean };
    };
    timeZone: string;
    vacationDays: Array<{ start: string; end: string; type: string }>;
  };
  performanceMetrics: AgentPerformanceMetrics;
  createdAt: string;
  lastLogin?: string;
  lastActivity?: string;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  statistics: {
    totalCustomersHelped: number;
    totalTicketsResolved: number;
    totalChatSessions: number;
    totalCallsHandled: number;
    averageResponseTime: number; // seconds
    averageResolutionTime: number; // minutes
    firstContactResolutionRate: number; // percentage
    customerSatisfactionScore: number; // 1-5
    escalationRate: number; // percentage
    activeHours: number;
    utilizationRate: number; // percentage
  };
  ratings: {
    averageRating: number;
    totalRatings: number;
    ratingBreakdown: {
      fiveStars: number;
      fourStars: number;
      threeStars: number;
      twoStars: number;
      oneStar: number;
    };
    categoryRatings: {
      helpfulness: number;
      knowledge: number;
      communication: number;
      problemSolving: number;
      professionalism: number;
    };
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    achievedAt: string;
    category: 'excellence' | 'milestone' | 'improvement' | 'teamwork';
  }>;
  qualityScores: Array<{
    date: string;
    score: number; // 1-100
    category: string;
    reviewedBy: string;
    feedback: string;
  }>;
}

export interface CustomerRating {
  id: string;
  customerId: string;
  agentId: string;
  sessionId: string;
  sessionType: 'chat' | 'call' | 'ticket';
  overallRating: PerformanceRating;
  categoryRatings: {
    helpfulness: PerformanceRating;
    knowledge: PerformanceRating;
    communication: PerformanceRating;
    problemSolving: PerformanceRating;
    professionalism: PerformanceRating;
  };
  feedback: {
    positiveAspects: string[];
    improvementAreas: string[];
    additionalComments: string;
  };
  isAnonymous: boolean;
  submittedAt: string;
  resolvedIssue: boolean;
  wouldRecommend: boolean;
}

export interface AgentPerformanceAlert {
  id: string;
  agentId: string;
  type: 'performance_decline' | 'quality_issue' | 'customer_complaint' | 'achievement' | 'goal_missed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
}

// API endpoints
const API_ENDPOINTS = {
  AGENT_APPLICATIONS: '/api/v1/hr/agent-applications',
  AGENT_ACCOUNTS: '/api/v1/hr/agent-accounts',
  AGENT_RATINGS: '/api/v1/hr/agent-ratings',
  AGENT_PERFORMANCE: '/api/v1/hr/agent-performance',
  AGENT_ALERTS: '/api/v1/hr/agent-alerts'
};

// Fallback storage keys for offline/development
const STORAGE_KEYS = {
  AGENT_APPLICATIONS: 'metah-agent-applications-cache',
  AGENT_ACCOUNTS: 'metah-agent-accounts-cache',
  CUSTOMER_RATINGS: 'metah-customer-ratings-cache',
  PERFORMANCE_ALERTS: 'metah-performance-alerts-cache'
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
const fallbackAgentApplications: AgentApplication[] = [
  {
    id: 'app-1',
    personalInfo: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1-555-0123',
      dateOfBirth: '1995-03-15',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      profilePhoto: '/avatars/emily.jpg'
    },
    professionalInfo: {
      previousExperience: '3 years customer service at TechCorp, 2 years chat support at SupportPlus',
      educationLevel: 'Bachelor\'s Degree in Communications',
      languages: ['English', 'Spanish', 'Portuguese'],
      specializations: ['Technical Support', 'Billing Issues', 'Product Questions'],
      certifications: ['Customer Service Excellence', 'Conflict Resolution'],
      resume: '/documents/emily_resume.pdf'
    },
    availability: {
      fullTime: true,
      partTime: false,
      preferredShifts: ['morning', 'afternoon'],
      hoursPerWeek: 40,
      startDate: '2024-02-01'
    },
    documents: {
      idVerification: '/documents/emily_id.pdf',
      backgroundCheck: '/documents/emily_background.pdf',
      references: [
        {
          name: 'John Smith',
          company: 'TechCorp',
          phone: '+1-555-0111',
          email: 'john.smith@techcorp.com',
          relationship: 'Former Supervisor'
        }
      ]
    },
    applicationDate: '2024-01-15T10:00:00Z',
    status: 'pending',
    lastUpdated: '2024-01-15T10:00:00Z'
  }
];

const fallbackAgentAccounts: AgentAccount[] = [
  {
    id: 'agent-acc-1',
    applicationId: 'app-approved-1',
    username: 'sarah.johnson',
    email: 'sarah.johnson@metah.com',
    passwordHash: 'hashed_password_123',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      displayName: 'Sarah J.',
      profilePhoto: '/avatars/sarah.jpg',
      phone: '+1-555-0789'
    },
    professionalInfo: {
      employeeId: 'EMP-001',
      department: 'Customer Support',
      position: 'Senior Customer Service Agent',
      specializations: ['Booking Issues', 'Payment Problems', 'General Support'],
      languages: ['English', 'Spanish', 'French'],
      certifications: ['Customer Service Excellence', 'Conflict Resolution'],
      hireDate: '2023-01-15'
    },
    status: 'active',
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
      maxConcurrentChats: 5,
      canAccessAdminFeatures: false,
      canModifyBookings: true,
      canIssueRefunds: true,
      canAccessSensitiveData: true,
      canCollaborate: true,
      canUseAIAssist: true,
      canCreateBookings: true,
      canCancelBookings: true
    },
    schedule: {
      workingHours: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '00:00', end: '00:00', isWorking: false },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      timeZone: 'America/New_York',
      vacationDays: []
    },
    performanceMetrics: {
      agentId: 'agent-acc-1',
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      statistics: {
        totalCustomersHelped: 485,
        totalTicketsResolved: 312,
        totalChatSessions: 278,
        totalCallsHandled: 45,
        averageResponseTime: 45,
        averageResolutionTime: 15,
        firstContactResolutionRate: 87,
        customerSatisfactionScore: 4.7,
        escalationRate: 5,
        activeHours: 160,
        utilizationRate: 85
      },
      ratings: {
        averageRating: 4.7,
        totalRatings: 234,
        ratingBreakdown: {
          fiveStars: 145,
          fourStars: 67,
          threeStars: 18,
          twoStars: 3,
          oneStar: 1
        },
        categoryRatings: {
          helpfulness: 4.8,
          knowledge: 4.6,
          communication: 4.7,
          problemSolving: 4.5,
          professionalism: 4.9
        }
      },
      achievements: [
        {
          id: 'ach-1',
          title: 'Customer Hero',
          description: 'Helped 500+ customers with 95%+ satisfaction',
          achievedAt: '2024-01-25',
          category: 'excellence'
        }
      ],
      qualityScores: [
        {
          date: '2024-01-25',
          score: 92,
          category: 'Chat Quality',
          reviewedBy: 'supervisor-1',
          feedback: 'Excellent communication and problem resolution skills'
        }
      ]
    },
    createdAt: '2023-01-15T08:00:00Z',
    lastLogin: '2024-01-25T08:30:00Z',
    lastActivity: '2024-01-25T16:45:00Z'
  }
];

// Real API Functions with localStorage fallback
export const getAgentApplications = async (status?: AgentApplicationStatus): Promise<AgentApplication[]> => {
  try {
    // Try API first
    const queryParams = status ? `?status=${status}` : '';
    const response = await apiRequest<{ applications: AgentApplication[] }>(
      `${API_ENDPOINTS.AGENT_APPLICATIONS}${queryParams}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.applications) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.AGENT_APPLICATIONS, response.applications);
      return response.applications;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  const cached = readFromStorage<AgentApplication[]>(STORAGE_KEYS.AGENT_APPLICATIONS, fallbackAgentApplications);
  if (status) {
    return cached.filter(app => app.status === status);
  }
  return cached;
};

export const getAgentApplication = async (id: string): Promise<AgentApplication | null> => {
  try {
    // Try API first
    const response = await apiRequest<{ application: AgentApplication }>(
      `${API_ENDPOINTS.AGENT_APPLICATIONS}/${id}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.application) {
      return response.application;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const cached = readFromStorage<AgentApplication[]>(STORAGE_KEYS.AGENT_APPLICATIONS, fallbackAgentApplications);
  return cached.find(app => app.id === id) || null;
};

export const submitAgentApplication = async (application: Omit<AgentApplication, 'id' | 'applicationDate' | 'status' | 'lastUpdated'>): Promise<AgentApplication> => {
  const newApplication: AgentApplication = {
    ...application,
    id: `app-${Date.now()}`,
    applicationDate: new Date().toISOString(),
    status: 'pending',
    lastUpdated: new Date().toISOString()
  };
  
  try {
    // Try API first
    const response = await apiRequest<{ application: AgentApplication }>(
      API_ENDPOINTS.AGENT_APPLICATIONS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newApplication),
      }
    );
    
    if (response?.application) {
      return response.application;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<AgentApplication[]>(STORAGE_KEYS.AGENT_APPLICATIONS, fallbackAgentApplications);
  cached.push(newApplication);
  writeToStorage(STORAGE_KEYS.AGENT_APPLICATIONS, cached);
  
  return newApplication;
};

export const reviewAgentApplication = async (
  applicationId: string, 
  decision: 'approved' | 'rejected', 
  reviewerId: string, 
  comments: string
): Promise<AgentApplication> => {
  const reviewData = {
    decision,
    reviewerId,
    comments,
    reviewedAt: new Date().toISOString()
  };

  try {
    // Try API first
    const response = await apiRequest<{ application: AgentApplication }>(
      `${API_ENDPOINTS.AGENT_APPLICATIONS}/${applicationId}/review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      }
    );
    
    if (response?.application) {
      return response.application;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<AgentApplication[]>(STORAGE_KEYS.AGENT_APPLICATIONS, fallbackAgentApplications);
  const application = cached.find(app => app.id === applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = decision;
  application.reviewedBy = reviewerId;
  application.reviewedAt = reviewData.reviewedAt;
  application.reviewComments = comments;
  application.lastUpdated = reviewData.reviewedAt;
  
  writeToStorage(STORAGE_KEYS.AGENT_APPLICATIONS, cached);
  
  // If approved, create agent account
  if (decision === 'approved') {
    await createAgentAccount(application);
  }
  
  return application;
};

export const createAgentAccount = async (application: AgentApplication): Promise<AgentAccount> => {
  const username = `${application.personalInfo.firstName.toLowerCase()}.${application.personalInfo.lastName.toLowerCase()}`;
  const newAgent: AgentAccount = {
    id: `agent-acc-${Date.now()}`,
    applicationId: application.id,
    username,
    email: application.personalInfo.email,
    passwordHash: 'temp_password_123', // In real app, generate secure password
    personalInfo: {
      firstName: application.personalInfo.firstName,
      lastName: application.personalInfo.lastName,
      displayName: `${application.personalInfo.firstName} ${application.personalInfo.lastName.charAt(0)}.`,
      profilePhoto: application.personalInfo.profilePhoto,
      phone: application.personalInfo.phone
    },
    professionalInfo: {
      employeeId: `EMP-${String(Date.now()).slice(-3)}`,
      department: 'Customer Support',
      position: 'Customer Service Agent',
      specializations: application.professionalInfo.specializations,
      languages: application.professionalInfo.languages,
      certifications: application.professionalInfo.certifications,
      hireDate: new Date().toISOString().split('T')[0]
    },
    status: 'active',
    permissions: {
      canViewCustomerEmail: true,
      canViewCustomerPhone: false,
      canViewBookingRef: true,
      canViewBillingInfo: false,
      canAssignTickets: true,
      canCloseTickets: true,
      canEscalateTickets: true,
      canAddInternalNotes: true,
      canInitiateCalls: false,
      canAccessKnowledgeBase: true,
      canViewReports: false,
      canManageOwnSchedule: true,
      maxConcurrentChats: 3,
      canAccessAdminFeatures: false,
      canModifyBookings: true,
      canIssueRefunds: false,
      canAccessSensitiveData: false,
      canCollaborate: true,
      canUseAIAssist: true,
      canCreateBookings: false,
      canCancelBookings: false
    },
    schedule: {
      workingHours: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '00:00', end: '00:00', isWorking: false },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      timeZone: 'UTC',
      vacationDays: []
    },
    performanceMetrics: {
      agentId: newAgent.id,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      statistics: {
        totalCustomersHelped: 0,
        totalTicketsResolved: 0,
        totalChatSessions: 0,
        totalCallsHandled: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        firstContactResolutionRate: 0,
        customerSatisfactionScore: 0,
        escalationRate: 0,
        activeHours: 0,
        utilizationRate: 0
      },
      ratings: {
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0
        },
        categoryRatings: {
          helpfulness: 0,
          knowledge: 0,
          communication: 0,
          problemSolving: 0,
          professionalism: 0
        }
      },
      achievements: [],
      qualityScores: []
    },
    createdAt: new Date().toISOString(),
  };
  
  try {
    // Try API first
    const response = await apiRequest<{ account: AgentAccount }>(
      API_ENDPOINTS.AGENT_ACCOUNTS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgent),
      }
    );
    
    if (response?.account) {
      return response.account;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<AgentAccount[]>(STORAGE_KEYS.AGENT_ACCOUNTS, fallbackAgentAccounts);
  cached.push(newAgent);
  writeToStorage(STORAGE_KEYS.AGENT_ACCOUNTS, cached);
  
  return newAgent;
};

export const getAllAgentAccounts = async (): Promise<AgentAccount[]> => {
  try {
    // Try API first
    const response = await apiRequest<{ accounts: AgentAccount[] }>(
      API_ENDPOINTS.AGENT_ACCOUNTS,
      {
        method: 'GET',
      }
    );
    
    if (response?.accounts) {
      // Cache for offline usage
      writeToStorage(STORAGE_KEYS.AGENT_ACCOUNTS, response.accounts);
      return response.accounts;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached or default data
  return readFromStorage<AgentAccount[]>(STORAGE_KEYS.AGENT_ACCOUNTS, fallbackAgentAccounts);
};

export const getAgentAccount = async (id: string): Promise<AgentAccount | null> => {
  try {
    // Try API first
    const response = await apiRequest<{ account: AgentAccount }>(
      `${API_ENDPOINTS.AGENT_ACCOUNTS}/${id}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.account) {
      return response.account;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const cached = readFromStorage<AgentAccount[]>(STORAGE_KEYS.AGENT_ACCOUNTS, fallbackAgentAccounts);
  return cached.find(agent => agent.id === id) || null;
};

export const updateAgentAccount = async (id: string, updates: Partial<AgentAccount>): Promise<AgentAccount> => {
  try {
    // Try API first
    const response = await apiRequest<{ account: AgentAccount }>(
      `${API_ENDPOINTS.AGENT_ACCOUNTS}/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );
    
    if (response?.account) {
      return response.account;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<AgentAccount[]>(STORAGE_KEYS.AGENT_ACCOUNTS, fallbackAgentAccounts);
  const agentIndex = cached.findIndex(agent => agent.id === id);
  if (agentIndex === -1) {
    throw new Error('Agent account not found');
  }
  
  cached[agentIndex] = { ...cached[agentIndex], ...updates };
  writeToStorage(STORAGE_KEYS.AGENT_ACCOUNTS, cached);
  
  return cached[agentIndex];
};

export const submitCustomerRating = async (rating: Omit<CustomerRating, 'id' | 'submittedAt'>): Promise<CustomerRating> => {
  const newRating: CustomerRating = {
    ...rating,
    id: `rating-${Date.now()}`,
    submittedAt: new Date().toISOString()
  };
  
  try {
    // Try API first
    const response = await apiRequest<{ rating: CustomerRating }>(
      API_ENDPOINTS.AGENT_RATINGS,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRating),
      }
    );
    
    if (response?.rating) {
      return response.rating;
    }
  } catch (error) {
    console.warn('API call failed, using localStorage fallback:', error);
  }

  // Fallback to localStorage
  const cached = readFromStorage<CustomerRating[]>(STORAGE_KEYS.CUSTOMER_RATINGS, []);
  cached.push(newRating);
  writeToStorage(STORAGE_KEYS.CUSTOMER_RATINGS, cached);
  
  // Update agent performance metrics
  await updateAgentPerformanceWithRating(rating.agentId, newRating);
  
  return newRating;
};

export const getAgentRatings = async (agentId: string): Promise<CustomerRating[]> => {
  try {
    // Try API first
    const response = await apiRequest<{ ratings: CustomerRating[] }>(
      `${API_ENDPOINTS.AGENT_RATINGS}?agentId=${agentId}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.ratings) {
      return response.ratings;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const cached = readFromStorage<CustomerRating[]>(STORAGE_KEYS.CUSTOMER_RATINGS, []);
  return cached.filter(rating => rating.agentId === agentId);
};

export const updateAgentPerformanceWithRating = async (agentId: string, rating: CustomerRating): Promise<void> => {
  const cached = readFromStorage<AgentAccount[]>(STORAGE_KEYS.AGENT_ACCOUNTS, fallbackAgentAccounts);
  const agent = cached.find(a => a.id === agentId);
  if (!agent) return;
  
  const metrics = agent.performanceMetrics;
  
  // Update rating statistics
  metrics.ratings.totalRatings++;
  const starKey = rating.overallRating === 5 ? 'fiveStars' : 
                  rating.overallRating === 4 ? 'fourStars' : 
                  rating.overallRating === 3 ? 'threeStars' : 
                  rating.overallRating === 2 ? 'twoStars' : 'oneStar';
  metrics.ratings.ratingBreakdown[starKey]++;
  
  // Recalculate average rating
  const totalStars = (metrics.ratings.ratingBreakdown.fiveStars * 5) +
                    (metrics.ratings.ratingBreakdown.fourStars * 4) +
                    (metrics.ratings.ratingBreakdown.threeStars * 3) +
                    (metrics.ratings.ratingBreakdown.twoStars * 2) +
                    (metrics.ratings.ratingBreakdown.oneStar * 1);
  
  metrics.ratings.averageRating = totalStars / metrics.ratings.totalRatings;
  
  // Update category ratings
  Object.keys(rating.categoryRatings).forEach(category => {
    const key = category as keyof typeof metrics.ratings.categoryRatings;
    const currentAvg = metrics.ratings.categoryRatings[key];
    const newValue = rating.categoryRatings[key];
    metrics.ratings.categoryRatings[key] = 
      (currentAvg * (metrics.ratings.totalRatings - 1) + newValue) / metrics.ratings.totalRatings;
  });
  
  // Update customer satisfaction score
  metrics.statistics.customerSatisfactionScore = metrics.ratings.averageRating;
  
  // Increment customers helped
  metrics.statistics.totalCustomersHelped++;
  
  // Save back to storage
  writeToStorage(STORAGE_KEYS.AGENT_ACCOUNTS, cached);
};

export const generateAgentPerformanceReport = async (agentId: string, period: string): Promise<AgentPerformanceMetrics> => {
  try {
    // Try API first
    const response = await apiRequest<{ metrics: AgentPerformanceMetrics }>(
      `${API_ENDPOINTS.AGENT_PERFORMANCE}/${agentId}?period=${period}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.metrics) {
      return response.metrics;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Fallback to cached data
  const cached = readFromStorage<AgentAccount[]>(STORAGE_KEYS.AGENT_ACCOUNTS, fallbackAgentAccounts);
  const agent = cached.find(a => a.id === agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }
  
  return agent.performanceMetrics;
};

export const getAgentPerformanceAlerts = async (agentId?: string): Promise<AgentPerformanceAlert[]> => {
  try {
    // Try API first
    const queryParams = agentId ? `?agentId=${agentId}` : '';
    const response = await apiRequest<{ alerts: AgentPerformanceAlert[] }>(
      `${API_ENDPOINTS.AGENT_ALERTS}${queryParams}`,
      {
        method: 'GET',
      }
    );
    
    if (response?.alerts) {
      return response.alerts;
    }
  } catch (error) {
    console.warn('API call failed, using cached/fallback data:', error);
  }

  // Mock alerts as fallback
  const alerts: AgentPerformanceAlert[] = [
    {
      id: 'alert-1',
      agentId: 'agent-acc-1',
      type: 'achievement',
      severity: 'low',
      title: 'Customer Satisfaction Goal Achieved',
      description: 'Agent has maintained 95%+ customer satisfaction for 30 days',
      actionRequired: false,
      createdAt: '2024-01-25T10:00:00Z',
      status: 'open'
    }
  ];
  
  return agentId ? alerts.filter(alert => alert.agentId === agentId) : alerts;
};