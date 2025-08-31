import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';
import { translateText, commonLanguageOptions } from '@/lib/translation';
import { useChatMessages, getChatSession as getExternalChatSession } from '@/lib/chatStore';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Phone, 
  Mail,
  FileText,
  Users,
  Paperclip,
  Image,
  Mic,
  MicOff,
  Smile,
  MoreVertical,
  Minimize2,
  Maximize2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Search,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  Zap,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  StopCircle,
  Languages
} from 'lucide-react';

import CustomerRatingModal from '@/components/agent/CustomerRatingModal';
// Enhanced types for better chat experience
interface ChatAgent {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  rating: number;
  isOnline: boolean;
  responseTime: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'system' | 'ticket_created' | 'agent_assigned' | 'call_started' | 'call_ended';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  voiceDuration?: number;
  reactions?: Array<{ emoji: string; userId: string; userName: string; }>;
  isEdited?: boolean;
  replyTo?: string;
  callDuration?: number;
  callType?: 'voice' | 'video';
  callRecordingUrl?: string;
}

// Call interface types
interface CallSession {
  id: string;
  chatId: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'declined';
  initiatedBy: 'agent' | 'customer';
  startTime?: string;
  endTime?: string;
  duration?: number;
  isRecording: boolean;
  recordingUrl?: string;
  participants: {
    agent: { id: string; name: string; hasVideo: boolean; hasAudio: boolean; };
    customer: { id: string; name: string; hasVideo: boolean; hasAudio: boolean; };
  };
}

interface ChatSession {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  agentId?: string;
  agentName?: string;
  agent?: ChatAgent;
  status: 'waiting' | 'assigned' | 'closed' | 'transferred';
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  messages: ChatMessage[];
  ticketId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    userAgent?: string;
    location?: string;
    bookingId?: string;
    previousChats?: number;
  };
}

interface SuperiorLiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  customerInfo?: {
    name?: string;
    email?: string;
    id?: string;
    bookingId?: string;
    avatar?: string;
    memberSince?: string;
    totalBookings?: number;
    loyaltyLevel?: string;
  };
  chatBubbleMode?: boolean;
  isAgentView?: boolean; // Determines if calling features are visible
  onClickOutside?: boolean; // Enable click outside to close
  chatId?: string; // External chat session ID to integrate with chat store
}

// Emoji data
const emojiCategories = {
  recent: ['😊', '👍', '❤️', '😂', '😢', '😮', '😡', '🙏'],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  gestures: ['👍', '👎', '👏', '🤝', '🙏', '👋', '🤷', '🤔', '💪', '✌️', '🤞', '👌', '👈', '👉', '👆', '👇'],
  objects: ['💼', '📱', '💻', '📋', '📝', '📊', '📈', '📉', '🎯', '💡', '🔧', '⚙️', '🏆', '🎉', '🎊', '✨']
};

// Quick reply templates
const quickReplies = {
  'en': [
    { text: 'Thank you!', category: 'gratitude' },
    { text: 'I need help with booking', category: 'booking' },
    { text: 'Payment issue', category: 'payment' },
    { text: 'Cancellation request', category: 'cancellation' },
    { text: 'Technical problem', category: 'technical' },
    { text: 'Speak to manager', category: 'escalation' }
  ],
  'es': [
    { text: '¡Gracias!', category: 'gratitude' },
    { text: 'Necesito ayuda con la reserva', category: 'booking' },
    { text: 'Problema de pago', category: 'payment' },
    { text: 'Solicitud de cancelación', category: 'cancellation' },
    { text: 'Problema técnico', category: 'technical' },
    { text: 'Hablar con el gerente', category: 'escalation' }
  ],
  'ar': [
    { text: 'شكراً لك!', category: 'gratitude' },
    { text: 'أحتاج مساعدة في الحجز', category: 'booking' },
    { text: 'مشكلة في الدفع', category: 'payment' },
    { text: 'طلب إلغاء', category: 'cancellation' },
    { text: 'مشكلة تقنية', category: 'technical' },
    { text: 'التحدث مع المدير', category: 'escalation' }
  ]
};

export default function SuperiorLiveChat({ 
  isOpen, 
  onClose, 
  customerInfo, 
  chatBubbleMode = false, 
  isAgentView = false,
  onClickOutside = true,
  chatId
}: SuperiorLiveChatProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  // Enhanced state management
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [searchHistory, setSearchHistory] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [satisfaction, setSatisfaction] = useState<'positive' | 'negative' | 'skipped' | null>(null);
  
  // Call system state
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallRecording, setIsCallRecording] = useState(false);
  const [callRecorder, setCallRecorder] = useState<MediaRecorder | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [agentLang, setAgentLang] = useState('en');
  const [customerLang, setCustomerLang] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Bridge to external chat store when chatId is provided
  const shouldUseChatStore = Boolean(chatId);
  const chatStoreBridge = useChatMessages(shouldUseChatStore ? chatId : null);

  // If using external chat store, hydrate header/session context from store
  useEffect(() => {
    if (!isOpen || !chatId) return;
    (async () => {
      try {
        const external = await getExternalChatSession(chatId);
        if (external) {
          setChatSession(prev => ({
            id: external.id,
            customerId: external.customerId,
            customerName: external.customerName,
            customerEmail: external.customerEmail,
            agentId: external.agentId,
            agentName: external.agentName,
            agent: external.agentName
              ? { id: external.agentId || 'agent', name: external.agentName, rating: 5, specialization: 'Support', isOnline: true, responseTime: '< 1 min' }
              : undefined,
            status: external.status === 'active' ? 'assigned' : external.status === 'waiting' ? 'waiting' : 'closed',
            category: external.department,
            priority: external.priority === 'urgent' ? 'urgent' : external.priority === 'high' ? 'high' : external.priority === 'low' ? 'low' : 'normal',
            messages: [],
            tags: external.tags,
            createdAt: external.startedAt,
            updatedAt: external.lastMessageAt,
            metadata: {
              userAgent: external.metadata?.userAgent,
              location: external.metadata?.location,
              bookingId: undefined,
              previousChats: external.customerContext?.previousChats || 0
            }
          } as ChatSession));
        }
      } catch (e) {
        console.warn('Failed to hydrate external chat session', e);
      }
    })();
  }, [isOpen, chatId]);

  // When using external chat store, reflect its messages into our local session for rendering
  useEffect(() => {
    if (!chatStoreBridge || !chatSession) return;
    setChatSession(prev => prev ? { ...prev, messages: chatStoreBridge.messages as unknown as ChatMessage[] } : prev);
  }, [chatStoreBridge?.messages]);

  // Enhanced chat agents
  const availableAgents: ChatAgent[] = [
    {
      id: 'agent1',
      name: 'Sarah Johnson',
      avatar: '/agents/sarah.jpg',
      specialization: 'Booking & Reservations',
      rating: 4.9,
      isOnline: true,
      responseTime: '< 1 min'
    },
    {
      id: 'agent2', 
      name: 'Ahmed Hassan',
      avatar: '/agents/ahmed.jpg',
      specialization: 'Payment & Billing',
      rating: 4.8,
      isOnline: true,
      responseTime: '< 2 min'
    },
    {
      id: 'agent3',
      name: 'Maria Rodriguez',
      avatar: '/agents/maria.jpg', 
      specialization: 'Technical Support',
      rating: 4.7,
      isOnline: false,
      responseTime: '< 5 min'
    }
  ];

  // Click outside to close handler - improved to ignore dropdowns and modals
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    
    // Don't close if clicking on dropdowns, modals, or portals
    if (
      !onClickOutside || 
      !chatContainerRef.current || 
      chatContainerRef.current.contains(target) ||
      // Ignore clicks on Radix portals (dropdowns, modals, etc.)
      (target as Element)?.closest('[data-radix-portal]') ||
      (target as Element)?.closest('[role="dialog"]') ||
      (target as Element)?.closest('[role="menu"]') ||
      (target as Element)?.closest('[role="listbox"]') ||
      (target as Element)?.closest('.radix-portal') ||
      // Ignore clicks on select dropdowns
      (target as Element)?.closest('[data-radix-select-content]') ||
      (target as Element)?.closest('[data-radix-select-trigger]')
    ) {
      return;
    }
    
    onClose();
  }, [onClickOutside, onClose]);

  // Voice/Video call functions
  const initiateCall = async (type: 'voice' | 'video') => {
    if (!isAgentView || !chatSession) return;

    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const newCallSession: CallSession = {
        id: `call_${Date.now()}`,
        chatId: chatSession.id,
        type,
        status: 'ringing',
        initiatedBy: 'agent',
        startTime: new Date().toISOString(),
        isRecording: false,
        participants: {
          agent: { 
            id: chatSession.agentId || 'agent1',
            name: chatSession.agentName || 'Agent',
            hasVideo: type === 'video',
            hasAudio: true
          },
          customer: {
            id: chatSession.customerId || 'customer',
            name: chatSession.customerName || 'Customer',
            hasVideo: false,
            hasAudio: false
          }
        }
      };

      setCallSession(newCallSession);
      setIncomingCall(newCallSession); // Simulate incoming call for customer

      // Add call started message
      const callMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        chatId: chatSession.id,
        sender: 'system',
        senderName: 'System',
        message: t('{{type}} call initiated by agent', { type: type === 'video' ? t('Video') : t('Voice') }),
        timestamp: new Date().toISOString(),
        isRead: false,
        messageType: 'call_started',
        callType: type
      };

      setChatSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, callMessage],
          updatedAt: new Date().toISOString()
        };
      });

      // Simulate customer answering after 3 seconds
      setTimeout(() => {
        acceptCall();
      }, 3000);

    } catch (error) {
      toast({ 
        title: t('Error'), 
        description: t('Could not access camera/microphone'), 
        variant: 'destructive' 
      });
    }
  };

  const acceptCall = () => {
    if (!incomingCall) return;

    setCallSession(prev => prev ? { ...prev, status: 'active', startTime: new Date().toISOString() } : null);
    setIncomingCall(null);

    // Start call recording automatically
    startCallRecording();

    toast({ title: t('Call connected'), description: t('You are now connected with the agent') });
  };

  const declineCall = () => {
    if (!incomingCall) return;

    setCallSession(prev => prev ? { ...prev, status: 'declined' } : null);
    setIncomingCall(null);
    endCall();
  };

  const endCall = () => {
    if (!callSession) return;

    // Stop recording
    stopCallRecording();

    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    const endTime = new Date().toISOString();
    const duration = callSession.startTime ? 
      Math.floor((new Date(endTime).getTime() - new Date(callSession.startTime).getTime()) / 1000) : 0;

    // Add call ended message
    const callEndMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: callSession.chatId,
      sender: 'system',
      senderName: 'System',
      message: t('Call ended - Duration: {{duration}}', { 
        duration: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` 
      }),
      timestamp: endTime,
      isRead: false,
      messageType: 'call_ended',
      callDuration: duration,
      callType: callSession.type,
      callRecordingUrl: callSession.recordingUrl
    };

    setChatSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, callEndMessage],
        updatedAt: new Date().toISOString()
      };
    });

    setCallSession(null);
    setIncomingCall(null);
    if (!isAgentView) {
      setTimeout(() => setShowRatingModal(true), 300);
    }
  };

  const startCallRecording = async () => {
    if (!localStream || isCallRecording) return;

    try {
      const recorder = new MediaRecorder(localStream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const recordingUrl = URL.createObjectURL(blob);
        
        setCallSession(prev => prev ? { ...prev, recordingUrl } : null);
      };

      recorder.start();
      setCallRecorder(recorder);
      setIsCallRecording(true);

    } catch (error) {
      console.error('Call recording failed:', error);
    }
  };

  const stopCallRecording = () => {
    if (callRecorder && isCallRecording) {
      callRecorder.stop();
      setCallRecorder(null);
      setIsCallRecording(false);
    }
  };

  // Initialize chat session
  const startNewChat = useCallback(() => {
    if (chatId) return; // external chat provided; do not create a new local session
    const bestAgent = availableAgents
      .filter(a => a.isOnline)
      .sort((a, b) => b.rating - a.rating)[0];

    const session: ChatSession = {
      id: `chat_${Date.now()}`,
      customerId: customerInfo?.id,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      status: 'waiting',
      category: 'general',
      priority: 'normal',
      messages: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        bookingId: customerInfo?.bookingId,
        previousChats: chatHistory.length
      }
    };

    setChatSession(session);

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: session.id,
      sender: 'system',
      senderName: 'Metah Support',
      message: t('Welcome to Metah Support! How can we help you today?'),
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'system'
    };

    session.messages.push(welcomeMessage);

    // Auto-assign best agent
    if (bestAgent) {
      setTimeout(() => {
        assignAgent(session.id, bestAgent);
      }, 2000);
    }
  }, [customerInfo, chatHistory.length, t]);

  // Assign agent to chat
  const assignAgent = (chatId: string, agent: ChatAgent) => {
    setChatSession(prev => {
      if (!prev || prev.id !== chatId) return prev;
      
      const updatedSession = {
        ...prev,
        agentId: agent.id,
        agentName: agent.name,
        agent,
        status: 'assigned' as const,
        updatedAt: new Date().toISOString()
      };

      const assignMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        chatId,
        sender: 'system',
        senderName: 'System',
        message: t('{{agentName}} has joined the chat', { agentName: agent.name }),
        timestamp: new Date().toISOString(),
        isRead: false,
        messageType: 'agent_assigned'
      };

      updatedSession.messages.push(assignMessage);
      
      if (soundEnabled) {
        playNotificationSound();
      }

      return updatedSession;
    });
  };

  // Enhanced message sending
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !chatSession) return;
    const raw = message.trim();
    setMessage('');
    setShowQuickReplies(false);

    const senderRole: 'customer' | 'agent' = isAgentView ? 'agent' : 'customer';
    const senderName = isAgentView ? (chatSession.agentName || 'Agent') : (customerInfo?.name || t('Customer'));
    const senderId = isAgentView ? (chatSession.agentId || 'agent') : (chatSession.customerId || 'customer');

    // Translate outgoing into recipient language if enabled
    const sourceLang = isAgentView ? agentLang : customerLang;
    const targetLang = isAgentView ? customerLang : agentLang;
    const textToSend = autoTranslate ? await translateText(raw, sourceLang, targetLang) : raw;

    if (chatStoreBridge && chatId) {
      chatStoreBridge.sendMessage(senderRole, senderName, senderId, textToSend, 'text');
      return;
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: chatSession.id,
      sender: senderRole,
      senderName,
      message: textToSend,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'text'
    };
    setChatSession(prev => prev ? { ...prev, messages: [...prev.messages, newMessage], updatedAt: new Date().toISOString() } : prev);

    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      simulateAgentResponse();
    }, 1500 + Math.random() * 3000);
  }, [message, chatSession, customerInfo?.name, t, chatStoreBridge, chatId, isAgentView, autoTranslate, agentLang, customerLang]);

  // Enhanced agent response simulation
  const simulateAgentResponse = () => {
    if (!chatSession) return;

    const responses = [
      t("I understand your concern. Let me help you with that."),
      t("Thank you for reaching out. I'm looking into this for you."),
      t("I can see the issue. Let me get this resolved quickly."),
      t("That's a good question. Here's what I can tell you..."),
      t("I'm working on this right now. Please bear with me."),
      t("Let me check our system for more information."),
      t("I've found some relevant information that might help."),
      t("Would you like me to escalate this to a specialist?")
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const agentMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: chatSession.id,
      sender: 'agent',
      senderName: chatSession.agentName || t('Support Agent'),
      message: randomResponse,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'text'
    };

    setChatSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, agentMessage],
        updatedAt: new Date().toISOString()
      };
    });

    setUnreadCount(prev => prev + 1);
    
    if (soundEnabled) {
      playNotificationSound();
    }
  };

  // File upload handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !chatSession) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t('Error'), description: t('File size must be less than 10MB'), variant: 'destructive' });
      return;
    }

    const fileMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: chatSession.id,
      sender: 'customer',
      senderName: customerInfo?.name || t('Customer'),
      message: t('Shared a file: {{fileName}}', { fileName: file.name }),
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: file.type.startsWith('image/') ? 'image' : 'file',
      fileName: file.name,
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file)
    };

    setChatSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, fileMessage],
        updatedAt: new Date().toISOString()
      };
    });

    toast({ title: t('File uploaded'), description: t('Your file has been shared with the agent') });
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const voiceMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          chatId: chatSession.id,
          sender: 'customer',
          senderName: customerInfo?.name || t('Customer'),
          message: t('Voice message'),
          timestamp: new Date().toISOString(),
          isRead: false,
          messageType: 'voice',
          fileUrl: URL.createObjectURL(blob),
          voiceDuration: 15 // Placeholder duration
        };

        setChatSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, voiceMessage],
            updatedAt: new Date().toISOString()
          };
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({ title: t('Error'), description: t('Could not access microphone'), variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Emoji handling
  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Quick reply handling
  const sendQuickReply = (replyText: string) => {
    setMessage(replyText);
    setTimeout(() => sendMessage(), 100);
  };

  // Notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {
      // Fallback for browsers that block autoplay
      console.log('Could not play notification sound');
    });
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Effects
  useEffect(() => {
    if (isOpen && !chatSession) {
      startNewChat();
    }
  }, [isOpen, chatSession, startNewChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Click outside to close effect
  useEffect(() => {
    if (isOpen && onClickOutside) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  // Video stream effects
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Format message time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  // Translate messages for display when languages/settings change
  useEffect(() => {
    const doTranslate = async () => {
      if (!chatSession || !autoTranslate) { 
        setTranslatedMap({});
        setIsTranslating(false);
        return; 
      }
      
      const viewerLang = isAgentView ? agentLang : customerLang;
      const messagesToTranslate = chatSession.messages.filter(msg => {
        if (msg.messageType !== 'text' || !msg.message) return false;
        const sourceLang = msg.sender === 'agent' ? agentLang : 
                         msg.sender === 'customer' ? customerLang : viewerLang;
        return sourceLang !== viewerLang;
      });

      if (messagesToTranslate.length === 0) {
        setTranslatedMap({});
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      const entries: Record<string, string> = {};
      
      // Process messages in parallel for faster translation
      const translationPromises = messagesToTranslate.map(async (msg) => {
        const sourceLang = msg.sender === 'agent' ? agentLang : 
                         msg.sender === 'customer' ? customerLang : viewerLang;
        
        try {
          const translated = await translateText(msg.message, sourceLang, viewerLang);
          return { id: msg.id, translated };
        } catch {
          return null;
        }
      });
      
      const results = await Promise.all(translationPromises);
      
      results.forEach(result => {
        if (result) {
          entries[result.id] = result.translated;
        }
      });
      
      setTranslatedMap(entries);
      setIsTranslating(false);
    };
    
    // Immediate translation for better UX, with debounce for rapid changes
    const timeoutId = setTimeout(doTranslate, 100);
    return () => clearTimeout(timeoutId);
  }, [chatSession?.messages, agentLang, customerLang, autoTranslate, isAgentView]);

  // Get current language quick replies
  const getCurrentQuickReplies = () => {
    const lang = i18n.language.split('-')[0];
    return quickReplies[lang as keyof typeof quickReplies] || quickReplies['en'];
  };

  if (!isOpen && !chatBubbleMode) return null;

  // Chat bubble mode (floating bubble)
  if (chatBubbleMode && !isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => onClose()}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      {showRatingModal && !isAgentView && chatSession && (
        <CustomerRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          agentId={chatSession.agent?.id || 'agent-unknown'}
          agentName={chatSession.agent?.name || t('Support Agent')}
          agentAvatar={chatSession.agent?.avatar}
          sessionId={chatSession.id}
          sessionType={callSession ? 'call' : 'chat'}
          customerId={chatSession.customerId || 'customer-unknown'}
        />
      )}
      {/* Incoming Call Modal */}
      {incomingCall && !isAgentView && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4 flex items-center justify-center">
                {incomingCall.type === 'video' ? (
                  <Video className="h-8 w-8 text-white" />
                ) : (
                  <Phone className="h-8 w-8 text-white" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {t('Incoming {{type}} call', { type: incomingCall.type === 'video' ? t('video') : t('voice') })}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('{{agentName}} is calling you', { agentName: incomingCall.participants.agent.name })}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={declineCall}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  {t('Decline')}
                </Button>
                <Button
                  onClick={acceptCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <PhoneCall className="h-4 w-4 mr-2" />
                  {t('Accept')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Interface */}
      {callSession?.status === 'active' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[55] bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 min-w-80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                {callSession.type === 'video' ? (
                  <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {isAgentView ? callSession.participants.customer.name : callSession.participants.agent.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('Call active')} {isCallRecording && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                      {t('Recording')}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={endCall}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <PhoneOff className="h-4 w-4 mr-1" />
              {t('End')}
            </Button>
          </div>

          {/* Video interface for video calls */}
          {callSession.type === 'video' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {t('You')}
                </div>
              </div>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {isAgentView ? callSession.participants.customer.name : callSession.participants.agent.name}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
        <div 
          ref={chatContainerRef}
          className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {chatSession?.agent ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={chatSession.agent.avatar} />
                  <AvatarFallback>{chatSession.agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                chatSession?.agent?.isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {chatSession?.agent ? chatSession.agent.name : t('Live Chat Support')}
              </h3>
              <p className="text-xs opacity-90">
                {agentTyping ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-pulse">{t('typing...')}</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-75" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-150" />
                    </div>
                  </span>
                ) : chatSession?.status === 'assigned' ? (
                  `${t('Online')} • ${chatSession.agent?.responseTime || '< 1 min'}`
                ) : chatSession?.status === 'waiting' ? (
                  t('Connecting to agent...')
                ) : (
                  t('Online')
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Agent-only call buttons */}
            {isAgentView && chatSession?.status === 'assigned' && !callSession && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => initiateCall('voice')}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0"
                  title={t('Start voice call')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => initiateCall('video')}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0"
                  title={t('Start video call')}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Language & settings */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Select value={agentLang} onValueChange={setAgentLang}>
                <SelectTrigger className="w-16 h-8 text-xs bg-white/20 border-white/30 text-white">
                  <SelectValue>
                    {commonLanguageOptions.find(opt => opt.code === agentLang)?.shortLabel || agentLang.toUpperCase()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {commonLanguageOptions.map(opt => (
                    <SelectItem key={opt.code} value={opt.code}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs mr-2">{opt.shortLabel}</span>
                        <span className="text-xs opacity-70">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-white/80 text-xs">↔</span>
              <Select value={customerLang} onValueChange={setCustomerLang}>
                <SelectTrigger className="w-16 h-8 text-xs bg-white/20 border-white/30 text-white">
                  <SelectValue>
                    {commonLanguageOptions.find(opt => opt.code === customerLang)?.shortLabel || customerLang.toUpperCase()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {commonLanguageOptions.map(opt => (
                    <SelectItem key={opt.code} value={opt.code}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs mr-2">{opt.shortLabel}</span>
                        <span className="text-xs opacity-70">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoTranslate(v => !v)}
                className={`text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0 ${autoTranslate ? 'opacity-100' : 'opacity-60'} relative`}
                title={autoTranslate ? t('Auto-translate on') : t('Auto-translate off')}
              >
                <Languages className={`h-4 w-4 ${isTranslating ? 'animate-pulse' : ''}`} />
                {isTranslating && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                )}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-4">
              {chatSession?.messages.map((msg, index) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'customer' ? 'order-2' : 'order-1'}`}>
                    {/* Agent info for agent messages */}
                    {msg.sender === 'agent' && chatSession.agent && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={chatSession.agent.avatar} />
                          <AvatarFallback className="text-xs">{chatSession.agent.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{msg.senderName}</span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`relative p-3 rounded-lg ${
                      msg.sender === 'customer' 
                        ? 'bg-blue-600 text-white' 
                        : msg.messageType === 'system' || msg.messageType === 'agent_assigned'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm'
                    }`}>
                      {/* Message content based on type */}
                      {msg.messageType === 'image' && msg.fileUrl && (
                        <div className="mb-2">
                          <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full h-auto rounded" />
                        </div>
                      )}
                      
                      {msg.messageType === 'voice' && msg.fileUrl && (
                        <div className="flex items-center gap-2 mb-2">
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                            <Mic className="h-4 w-4" />
                          </Button>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded h-2">
                            <div className="bg-blue-500 h-2 rounded w-1/3" />
                          </div>
                          <span className="text-xs">{msg.voiceDuration}s</span>
                        </div>
                      )}
                      
                      {msg.messageType === 'file' && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-gray-600 rounded">
                          <FileText className="h-5 w-5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{msg.fileName}</p>
                            <p className="text-xs opacity-70">{msg.fileSize && formatFileSize(msg.fileSize)}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {msg.messageType === 'call_started' && (
                        <div className="flex items-center gap-2 mb-2">
                          {msg.callType === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                          <span className="text-xs font-medium">
                            {msg.callType === 'video' ? t('Video Call Started') : t('Voice Call Started')}
                          </span>
                        </div>
                      )}
                      
                      {msg.messageType === 'call_ended' && (
                        <div className="flex items-center gap-2 mb-2">
                          <PhoneOff className="h-4 w-4" />
                          <span className="text-xs font-medium">{t('Call Ended')}</span>
                          {msg.callRecordingUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={() => window.open(msg.callRecordingUrl)}
                              title={t('Play recording')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                      
                       <div className="text-sm">
                        {autoTranslate && translatedMap[msg.id] ? (
                          <div>
                            <p className="mb-1">{translatedMap[msg.id]}</p>
                            <div className="flex items-center text-xs opacity-60">
                              <Languages className="w-3 h-3 mr-1" />
                              <span>{t('Translated from')} {commonLanguageOptions.find(opt => opt.code === (msg.sender === 'agent' ? agentLang : customerLang))?.shortLabel || 'Unknown'}</span>
                            </div>
                          </div>
                        ) : (
                          <p>{msg.message}</p>
                        )}
                      </div>
                      
                      {/* Message metadata */}
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        msg.sender === 'customer' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span>{formatTime(msg.timestamp)}</span>
                        <div className="flex items-center gap-1">
                          {msg.isEdited && <span className="opacity-70">{t('edited')}</span>}
                          {msg.sender === 'customer' && (
                            <CheckCircle className={`h-3 w-3 ${msg.isRead ? 'text-blue-300' : 'text-blue-100'}`} />
                          )}
                        </div>
                      </div>
                      
                      {/* Message reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {msg.reactions.map((reaction, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-1 py-0">
                              {reaction.emoji} 1
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && chatSession?.messages.length <= 1 && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('Quick replies:')}</p>
                <div className="flex flex-wrap gap-2">
                  {getCurrentQuickReplies().slice(0, 3).map((reply, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => sendQuickReply(reply.text)}
                      className="text-xs h-7"
                    >
                      {reply.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white dark:bg-gray-900">
              {/* File upload input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                    {Object.values(emojiCategories).flat().map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => addEmoji(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input toolbar */}
              <div className="flex items-center gap-2 mb-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 p-0"
                  title={t('Attach file')}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-8 h-8 p-0"
                  title={t('Add emoji')}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={`w-8 h-8 p-0 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
                  title={t('Record voice message')}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Main input */}
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder={t('Type your message...')}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!chatSession || chatSession.status === 'closed'}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!message.trim() || !chatSession || chatSession.status === 'closed'}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Status info */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>
                  {chatSession?.ticketId && `${t('Ticket')}: ${chatSession.ticketId}`}
                </span>
                <span>
                  {chatSession?.status === 'waiting' && t('Waiting for agent...')}
                  {chatSession?.status === 'assigned' && chatSession.agent && 
                    `${t('Agent')}: ${chatSession.agent.name}`
                  }
                </span>
              </div>
            </div>

            {/* Post-Chat Rating - Only show when chat is ended/resolved */}
            {(chatSession?.status === 'closed' || (chatSession as any)?.status === 'resolved') && !satisfaction && !isAgentView && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                <div className="text-center mb-3">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    {t('Chat Session Ended')}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t('Please rate your experience with our support team')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSatisfaction('positive');
                      setTimeout(() => setShowRatingModal(true), 300);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {t('Good Experience')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline" 
                    onClick={() => {
                      setSatisfaction('negative');
                      setTimeout(() => setShowRatingModal(true), 300);
                    }}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    {t('Poor Experience')}
                  </Button>
                </div>
                <div className="mt-2 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSatisfaction('skipped')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {t('Skip Rating')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
