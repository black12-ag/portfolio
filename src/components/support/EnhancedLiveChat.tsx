import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  createLiveChatSession, 
  addLiveChatMessage, 
  getLiveChatSession, 
  assignAgentToChat, 
  createTicketFromChat,
  getCustomerServiceAgents,
  type LiveChatSession,
  type LiveChatMessage,
  type TicketCategory,
  type TicketPriority
} from '@/lib/supportStore';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Phone, 
  Mail,
  FileText,
  Users
} from 'lucide-react';

interface EnhancedLiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  customerInfo?: {
    name?: string;
    email?: string;
    id?: string;
  };
}

export default function EnhancedLiveChat({ isOpen, onClose, customerInfo }: EnhancedLiveChatProps) {
  const { toast } = useToast();
  const [chatSession, setChatSession] = useState<LiveChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'help' as TicketCategory,
    priority: 'normal' as TicketPriority,
    email: customerInfo?.email || '',
    phone: '',
    bookingRef: ''
  });
  const [agents, setAgents] = useState(getCustomerServiceAgents());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatSession) {
      startNewChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages]);

  const startNewChat = () => {
    const session = createLiveChatSession({
      customerId: customerInfo?.id,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      category: 'help',
      priority: 'normal'
    });
    
    setChatSession(session);
    
    // Add welcome message
    addLiveChatMessage(session.id, {
      chatId: session.id,
      sender: 'agent',
      senderName: 'Metah Support',
      message: 'Welcome to Metah Support! How can we help you today?',
      isRead: false,
      messageType: 'text'
    });
    
    // Auto-assign agent after 2 seconds
    setTimeout(() => {
      assignAgentToChat(session.id);
      setChatSession(getLiveChatSession(session.id) || null);
    }, 2000);
  };

  const sendMessage = () => {
    if (!message.trim() || !chatSession) return;
    
    addLiveChatMessage(chatSession.id, {
      chatId: chatSession.id,
      sender: 'customer',
      senderName: customerInfo?.name || 'Customer',
      message: message.trim(),
      isRead: false,
      messageType: 'text'
    });
    
    setMessage('');
    setChatSession(getLiveChatSession(chatSession.id) || null);
    
    // Simulate agent response
    setTimeout(() => {
      simulateAgentResponse();
    }, 1000 + Math.random() * 2000);
  };

  const simulateAgentResponse = () => {
    if (!chatSession) return;
    
    const responses = [
      "I understand your concern. Let me help you with that.",
      "Thank you for reaching out. I'm looking into this for you.",
      "I can see the issue. Let me get this resolved quickly.",
      "That's a good question. Here's what I can tell you...",
      "I'm working on this right now. Please bear with me."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    addLiveChatMessage(chatSession.id, {
      chatId: chatSession.id,
      sender: 'agent',
      senderName: chatSession.agentName || 'Support Agent',
      message: randomResponse,
      isRead: false,
      messageType: 'text'
    });
    
    setChatSession(getLiveChatSession(chatSession.id) || null);
  };

  const createTicket = () => {
    if (!chatSession || !ticketForm.subject || !ticketForm.description) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    
    const ticket = createTicketFromChat(chatSession.id, {
      subject: ticketForm.subject,
      description: ticketForm.description,
      category: ticketForm.category,
      priority: ticketForm.priority,
      email: ticketForm.email,
      phone: ticketForm.phone,
      bookingRef: ticketForm.bookingRef
    });
    
    setShowTicketForm(false);
    setChatSession(getLiveChatSession(chatSession.id) || null);
    
    toast({ 
      title: 'Ticket Created', 
      description: `Support ticket ${ticket.id} has been created successfully!` 
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold">Live Chat Support</h3>
              <p className="text-xs opacity-90">
                {chatSession?.status === 'assigned' 
                  ? `Connected to ${chatSession.agentName}` 
                  : chatSession?.status === 'waiting' 
                    ? 'Connecting to agent...' 
                    : 'Online'
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {chatSession?.messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.sender === 'customer' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                msg.sender === 'customer' 
                  ? 'bg-blue-600 text-white' 
                  : msg.messageType === 'system' || msg.messageType === 'ticket_created' || msg.messageType === 'agent_assigned'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                {msg.messageType === 'ticket_created' && (
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium">Ticket Created</span>
                  </div>
                )}
                {msg.messageType === 'agent_assigned' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">Agent Assigned</span>
                  </div>
                )}
                <p className="text-sm">{msg.message}</p>
                <div className={`text-xs mt-1 ${
                  msg.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {chatSession?.status === 'assigned' && (
          <div className="px-4 py-2 bg-blue-50 border-t">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowTicketForm(true)}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(`mailto:${chatSession.agentName}@metah.com`)}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Ticket Form */}
        {showTicketForm && (
          <div className="p-4 bg-white border-t">
            <div className="space-y-3">
              <Input
                placeholder="Subject *"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
              />
              <Textarea
                placeholder="Description *"
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value as TicketCategory }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="help">General Help</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="cancellation">Cancellation</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value as TicketPriority }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createTicket} className="flex-1">Create Ticket</Button>
                <Button onClick={() => setShowTicketForm(false)} variant="outline">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={!chatSession || chatSession.status === 'closed'}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim() || !chatSession || chatSession.status === 'closed'}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Status Info */}
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>
              {chatSession?.ticketId && `Ticket: ${chatSession.ticketId}`}
            </span>
            <span>
              {chatSession?.status === 'waiting' && 'Waiting for agent...'}
              {chatSession?.status === 'assigned' && `Agent: ${chatSession.agentName}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
