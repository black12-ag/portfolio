import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, Phone, Video, Upload, FileText, Clock, CheckCircle,
  AlertCircle, Star, Send, Paperclip, Mic, Camera, Shield, 
  HeadphonesIcon, Globe, TrendingUp, BarChart3, Users, Settings
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  specialization: string[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  languages: string[];
  timezone: string;
  availability: 'online' | 'busy' | 'offline';
  experience: string;
}

interface Message {
  id: string;
  senderId: string;
  senderType: 'host' | 'agent';
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
    url: string;
  }>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved';
  createdAt: Date;
  lastUpdate: Date;
  description: string;
  assignedAgent?: Agent;
}

export default function HostAgentCommunication() {
  const [activeTab, setActiveTab] = useState('chat');
  const [assignedAgent, setAssignedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [newTicket, setNewTicket] = useState({ title: '', category: '', priority: 'normal', description: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState<Agent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate assigned agent
    setAssignedAgent({
      id: 'agent-001',
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      specialization: ['Property Verification', 'Host Training', 'Market Analysis'],
      rating: 4.9,
      reviewCount: 342,
      responseTime: '< 30 minutes',
      languages: ['English', 'Spanish', 'French'],
      timezone: 'EST',
      availability: 'online',
      experience: '3+ years'
    });

    // Simulate initial messages
    setMessages([
      {
        id: '1',
        senderId: 'agent-001',
        senderType: 'agent',
        content: 'Welcome to Metah! I\'m Sarah, your dedicated property agent. I\'ll help you get your listing approved and optimized for success. Let\'s start by reviewing your property application.',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text'
      },
      {
        id: '2',
        senderId: 'host-001',
        senderType: 'host',
        content: 'Hi Sarah! Thank you so much. I\'m excited to get started. I have a few questions about the photo requirements.',
        timestamp: new Date(Date.now() - 1500000),
        type: 'text'
      },
      {
        id: '3',
        senderId: 'agent-001',
        senderType: 'agent',
        content: 'Great question! For photos, we recommend at least 5 high-quality images showing different angles of your space. Natural lighting works best. Would you like me to schedule a quick video call to review your current photos?',
        timestamp: new Date(Date.now() - 1200000),
        type: 'text'
      }
    ]);

    // Simulate support tickets
    setSupportTickets([
      {
        id: 'ticket-001',
        title: 'Photo Quality Improvement',
        category: 'Property Setup',
        priority: 'normal',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000),
        lastUpdate: new Date(Date.now() - 3600000),
        description: 'Need guidance on taking better property photos',
        assignedAgent
      },
      {
        id: 'ticket-002',
        title: 'Pricing Strategy Consultation',
        category: 'Revenue Optimization',
        priority: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 43200000),
        lastUpdate: new Date(Date.now() - 7200000),
        description: 'Request for market analysis and pricing recommendations'
      }
    ]);

    // Simulate online agents
    setOnlineAgents([
      {
        id: 'agent-002',
        name: 'Michael Chen',
        avatar: '/api/placeholder/40/40',
        specialization: ['Luxury Properties', 'International Markets'],
        rating: 4.8,
        reviewCount: 198,
        responseTime: '< 45 minutes',
        languages: ['English', 'Mandarin', 'Cantonese'],
        timezone: 'PST',
        availability: 'online',
        experience: '5+ years'
      },
      {
        id: 'agent-003',
        name: 'Elena Rodriguez',
        avatar: '/api/placeholder/40/40',
        specialization: ['New Host Support', 'Compliance'],
        rating: 4.9,
        reviewCount: 256,
        responseTime: '< 20 minutes',
        languages: ['English', 'Spanish', 'Portuguese'],
        timezone: 'CST',
        availability: 'online',
        experience: '4+ years'
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'host-001',
      senderType: 'host',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate agent typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'agent-001',
        senderType: 'agent',
        content: 'Thanks for your message! I\'ll review this and get back to you with detailed guidance shortly.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 2000);
  };

  const createSupportTicket = () => {
    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      title: newTicket.title,
      category: newTicket.category,
      priority: newTicket.priority as unknown,
      status: 'open',
      createdAt: new Date(),
      lastUpdate: new Date(),
      description: newTicket.description
    };

    setSupportTickets(prev => [ticket, ...prev]);
    setNewTicket({ title: '', category: '', priority: 'normal', description: '' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'waiting': return 'text-orange-600 bg-orange-50';
      case 'open': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🤝 Host-Agent Communication Center
        </h1>
        <p className="text-muted-foreground">Get expert support and guidance from our professional property agents</p>
      </div>

      {/* Assigned Agent Card */}
      {assignedAgent && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={assignedAgent.avatar} />
                    <AvatarFallback>{assignedAgent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                    assignedAgent.availability === 'online' ? 'bg-green-500' : 
                    assignedAgent.availability === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{assignedAgent.name}</h3>
                  <p className="text-muted-foreground">Your Dedicated Property Agent</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{assignedAgent.rating}</span>
                      <span className="text-sm text-muted-foreground">({assignedAgent.reviewCount} reviews)</span>
                    </div>
                    <Badge variant="secondary">{assignedAgent.responseTime}</Badge>
                    <Badge variant="outline">{assignedAgent.experience}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('📞 Calling your agent...\n\nThis will initiate a voice call with your assigned agent. Please ensure you have a stable internet connection.');
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('📹 Starting video call...\n\nThis will start a video call with your agent. Camera access may be requested.');
                  }}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video Call
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    alert('💬 Opening chat...\n\nRedirecting to the chat interface below.');
                    // You could scroll to chat or switch to chat tab here
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm">Specializations</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignedAgent.specialization.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{spec}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Languages</h4>
                <p className="text-sm text-muted-foreground">{assignedAgent.languages.join(', ')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Timezone</h4>
                <p className="text-sm text-muted-foreground">{assignedAgent.timezone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1">
          <TabsTrigger value="chat">💬 Chat</TabsTrigger>
          <TabsTrigger value="support">🎫 Support</TabsTrigger>
          <TabsTrigger value="agents">👥 Agents</TabsTrigger>
          <TabsTrigger value="resources">📚 Resources</TabsTrigger>
          <TabsTrigger value="training">🎓 Training</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Live Chat with {assignedAgent?.name}</span>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '*/*';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) {
                          alert(`${files.length} files selected for upload`);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert('📸 Screenshot feature coming soon!\n\nThis will allow you to take screenshots to share with your agent.');
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Screenshot
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'host' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.senderType === 'host' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg p-3`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderType === 'host' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          alert(`File attached: ${file.name}`);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert('🎤 Voice message feature coming soon!\n\nYou\'ll be able to record and send voice messages to your agent.');
                    }}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="support">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Ticket */}
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property_setup">Property Setup</SelectItem>
                        <SelectItem value="photo_quality">Photo Quality</SelectItem>
                        <SelectItem value="pricing">Pricing Strategy</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
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
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="Detailed description of your issue or request"
                    rows={4}
                  />
                </div>
                <Button onClick={createSupportTicket} className="w-full">
                  Create Ticket
                </Button>
              </CardContent>
            </Card>

            {/* Existing Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Your Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{ticket.title}</h4>
                        <div className="flex items-center space-x-2">
                          <div className={`h-2 w-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                        <span>Updated: {ticket.lastUpdate.toLocaleDateString()}</span>
                      </div>
                      {ticket.assignedAgent && (
                        <div className="flex items-center space-x-2 mt-2 text-xs">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignedAgent.avatar} />
                            <AvatarFallback>{ticket.assignedAgent.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>Assigned to {ticket.assignedAgent.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Available Agents Tab */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.experience}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{agent.rating}</span>
                        <span className="text-xs text-muted-foreground">({agent.reviewCount})</span>
                      </div>
                      <Badge variant="secondary">{agent.responseTime}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialization.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                        {agent.specialization.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{agent.specialization.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Languages</h4>
                      <p className="text-xs text-muted-foreground">{agent.languages.slice(0, 2).join(', ')}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          alert(`💬 Starting chat with ${agent.name}...\n\nThis will connect you with this specialist agent.`);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          alert(`📞 Calling ${agent.name}...\n\nInitiating video call with this specialist agent.`);
                        }}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Photography Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">Professional tips for property photos</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('📸 Photography Guide\n\n• Use natural lighting when possible\n• Take photos from multiple angles\n• Show the main living areas first\n• Include photos of amenities\n• Keep spaces clean and uncluttered\n• Shoot during golden hour for best lighting\n• Use a wide-angle lens for small spaces');
                  }}
                >
                  View Guide
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Pricing Strategy</h3>
                <p className="text-sm text-muted-foreground mb-4">Optimize your rates for maximum revenue</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('💰 Pricing Strategy Tips\n\n• Research local market rates\n• Offer weekly/monthly discounts\n• Adjust for seasonal demand\n• Consider amenities in pricing\n• Monitor competitor prices\n• Use dynamic pricing tools\n• Factor in cleaning and fees');
                  }}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Safety & Compliance</h3>
                <p className="text-sm text-muted-foreground mb-4">Legal requirements and safety standards</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('🛡️ Safety Compliance Checklist\n\n✓ Smoke detectors installed\n✓ Carbon monoxide detectors\n✓ Fire extinguisher available\n✓ First aid kit accessible\n✓ Emergency contact info posted\n✓ Local regulations compliance\n✓ Insurance coverage verified');
                  }}
                >
                  Check List
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Guest Management</h3>
                <p className="text-sm text-muted-foreground mb-4">Best practices for host-guest relations</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('👥 Guest Management Tips\n\n• Respond to inquiries within 1 hour\n• Provide clear check-in instructions\n• Welcome guests personally\n• Be available for questions\n• Respect guest privacy\n• Handle issues promptly\n• Request reviews politely');
                  }}
                >
                  Read Tips
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Performance Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">Understanding your hosting metrics</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('📊 Key Performance Metrics\n\n• Occupancy Rate: Target 70%+\n• Average Daily Rate (ADR)\n• Revenue Per Available Room\n• Guest Rating: Aim for 4.8+\n• Response Rate: Keep above 90%\n• Booking Lead Time\n• Repeat Guest Percentage');
                  }}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Market Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">Local market trends and opportunities</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    alert('🌍 Market Intelligence\n\n• Peak season: Jun-Aug\n• Average rate: $95/night\n• Competitor analysis available\n• Local events calendar\n• Tourism trends\n• Demand forecasting\n• Pricing recommendations');
                  }}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Host Training Program</CardTitle>
                <p className="text-muted-foreground">Complete our certification program to become a Superhost</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Property Setup Basics</h4>
                        <p className="text-sm text-muted-foreground">30 minutes</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Photography Masterclass</h4>
                        <p className="text-sm text-muted-foreground">45 minutes</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          alert('📸 Photography Masterclass Started!\n\nModule 1: Equipment and Lighting\nModule 2: Composition Techniques\nModule 3: Room-by-Room Photography\nModule 4: Editing and Enhancement\n\nEstimated completion: 45 minutes');
                        }}
                      >
                        Start
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Pricing Optimization</h4>
                        <p className="text-sm text-muted-foreground">25 minutes</p>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Guest Communication</h4>
                        <p className="text-sm text-muted-foreground">35 minutes</p>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Safety & Legal Compliance</h4>
                        <p className="text-sm text-muted-foreground">40 minutes</p>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Superhost Certification</h4>
                        <p className="text-sm text-muted-foreground">60 minutes</p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Agent Response Time</h3>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">18 minutes</div>
                <p className="text-sm text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Support Satisfaction</h3>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">4.9/5</div>
                <p className="text-sm text-muted-foreground">Based on 45 reviews</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Issues Resolved</h3>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">12/14</div>
                <p className="text-sm text-muted-foreground">86% resolution rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
