import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Star,
  Calendar,
  MapPin,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Filter,
  Archive,
  Trash2,
  Flag
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isHost: boolean;
}

interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  propertyName: string;
  propertyId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  messages: Message[];
  isOnline: boolean;
}

const HostMessaging: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'pending' | 'active'>('all');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate API call to fetch conversations
    const fetchConversations = async () => {
      setLoading(true);
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockConversations: Conversation[] = [
        {
          id: '1',
          guestId: 'guest1',
          guestName: 'Sarah Johnson',
          guestAvatar: '/api/placeholder/40/40',
          propertyName: 'Luxury Villa Sunset',
          propertyId: 'prop1',
          lastMessage: 'Thank you for the quick response! Looking forward to our stay.',
          lastMessageTime: '2024-01-20T14:30:00Z',
          unreadCount: 0,
          bookingStatus: 'confirmed',
          isOnline: true,
          messages: [
            {
              id: 'msg1',
              senderId: 'guest1',
              senderName: 'Sarah Johnson',
              content: 'Hi! I have a question about the property amenities.',
              timestamp: '2024-01-20T14:25:00Z',
              isRead: true,
              isHost: false
            },
            {
              id: 'msg2',
              senderId: 'host1',
              senderName: 'You',
              content: 'Hello Sarah! I\'d be happy to help. What would you like to know?',
              timestamp: '2024-01-20T14:27:00Z',
              isRead: true,
              isHost: true
            },
            {
              id: 'msg3',
              senderId: 'guest1',
              senderName: 'Sarah Johnson',
              content: 'Thank you for the quick response! Looking forward to our stay.',
              timestamp: '2024-01-20T14:30:00Z',
              isRead: true,
              isHost: false
            }
          ]
        },
        {
          id: '2',
          guestId: 'guest2',
          guestName: 'Mike Chen',
          guestAvatar: '/api/placeholder/40/40',
          propertyName: 'Modern City Apartment',
          propertyId: 'prop2',
          lastMessage: 'Is early check-in possible?',
          lastMessageTime: '2024-01-20T12:15:00Z',
          unreadCount: 2,
          bookingStatus: 'pending',
          isOnline: false,
          messages: [
            {
              id: 'msg4',
              senderId: 'guest2',
              senderName: 'Mike Chen',
              content: 'Hi! I have a booking request for next week.',
              timestamp: '2024-01-20T12:10:00Z',
              isRead: true,
              isHost: false
            },
            {
              id: 'msg5',
              senderId: 'guest2',
              senderName: 'Mike Chen',
              content: 'Is early check-in possible?',
              timestamp: '2024-01-20T12:15:00Z',
              isRead: false,
              isHost: false
            }
          ]
        },
        {
          id: '3',
          guestId: 'guest3',
          guestName: 'Emma Davis',
          guestAvatar: '/api/placeholder/40/40',
          propertyName: 'Beachfront Cottage',
          propertyId: 'prop3',
          lastMessage: 'The stay was amazing! Thank you so much.',
          lastMessageTime: '2024-01-19T18:45:00Z',
          unreadCount: 0,
          bookingStatus: 'completed',
          isOnline: true,
          messages: [
            {
              id: 'msg6',
              senderId: 'guest3',
              senderName: 'Emma Davis',
              content: 'The stay was amazing! Thank you so much.',
              timestamp: '2024-01-19T18:45:00Z',
              isRead: true,
              isHost: false
            }
          ]
        }
      ];

      setConversations(mockConversations);
      setLoading(false);
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'host1',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
      isHost: true
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: newMessage,
            lastMessageTime: newMsg.timestamp
          }
        : conv
    ));

    setNewMessage('');
    setTimeout(scrollToBottom, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread' && conv.unreadCount === 0) return false;
    if (filter === 'pending' && conv.bookingStatus !== 'pending') return false;
    if (filter === 'active' && conv.bookingStatus === 'completed') return false;
    
    if (searchQuery) {
      return conv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             conv.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg border border-gray-200 h-96">
              <div className="flex h-full">
                <div className="w-1/3 border-r border-gray-200 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center p-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Communicate with your guests</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </button>
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-white rounded-lg border border-gray-200 h-[calc(100vh-200px)] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                {['all', 'unread', 'pending', 'active'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType as 'all' | 'unread' | 'pending' | 'active')}
                    className={`px-3 py-1 text-xs rounded-full capitalize ${
                      filter === filterType
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="relative">
                      <img
                        src={conversation.guestAvatar}
                        alt={conversation.guestName}
                        className="w-10 h-10 rounded-full"
                      />
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.guestName}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1 truncate">
                        {conversation.propertyName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(conversation.bookingStatus)}`}>
                          {conversation.bookingStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={selectedConv.guestAvatar}
                          alt={selectedConv.guestName}
                          className="w-10 h-10 rounded-full"
                        />
                        {selectedConv.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedConv.guestName}
                        </h2>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedConv.propertyName}
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(selectedConv.bookingStatus)}`}>
                            {selectedConv.bookingStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConv.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isHost ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isHost
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.isHost ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.isHost && (
                            <div className="text-xs">
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostMessaging;
