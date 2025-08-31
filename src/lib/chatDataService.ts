// Real chat data service - manages actual customer support chat data
import { ChatSession } from '@/types/chat';
import { agentStore } from './agentStore';

// Service for managing real customer support chats
export class ChatDataService {
  private static instance: ChatDataService;
  
  private constructor() {}
  
  static getInstance(): ChatDataService {
    if (!ChatDataService.instance) {
      ChatDataService.instance = new ChatDataService();
    }
    return ChatDataService.instance;
  }
  
  // Get active chat sessions for an agent
  async getActiveChatSessions(agentId: string): Promise<ChatSession[]> {
    try {
      // Fetch from API/database - real implementation needed
      const response = await fetch(`/api/chats/agent/${agentId}/active`);
      if (!response.ok) throw new Error('Failed to fetch active chats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching active chats:', error);
      return [];
    }
  }
  
  // Create a new chat session from customer support request
  async createChatSession(customerInfo: {
    id: string;
    name: string;
    email: string;
    bookingId?: string;
    issue?: string;
  }): Promise<ChatSession> {
    try {
      const response = await fetch('/api/chats/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerInfo.id,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          bookingId: customerInfo.bookingId,
          initialIssue: customerInfo.issue,
          createdAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to create chat session');
      return await response.json();
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }
  
  // Get available support agents
  async getAvailableAgents(): Promise<any[]> {
    return agentStore.getAvailableAgents();
  }
  
  // Assign chat to an agent
  async assignChatToAgent(chatId: string, agentId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/chats/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, agentId })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error assigning chat to agent:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatDataService = ChatDataService.getInstance();
