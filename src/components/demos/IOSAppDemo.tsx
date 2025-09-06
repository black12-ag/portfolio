import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2,
  MessageCircle,
  Send,
  Phone,
  Camera,
  Settings,
  Search,
  Plus,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IOSAppDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  avatar: string;
  online?: boolean;
}

export const IOSAppDemo: React.FC<IOSAppDemoProps> = ({
  isOpen,
  onClose,
  onToggleFullscreen,
  isFullscreen = false
}) => {
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'settings'>('home');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const demoChats: Chat[] = [
    {
      id: '1',
      name: 'Portfolio Reviewer',
      lastMessage: 'This iOS app is impressive! Great work.',
      timestamp: '2:30 PM',
      unread: 2,
      avatar: '👨‍💻',
      online: true
    },
    {
      id: '2', 
      name: 'Potential Client',
      lastMessage: 'Can you build something similar for us?',
      timestamp: '1:15 PM',
      avatar: '👩‍💼',
      online: false
    },
    {
      id: '3',
      name: 'iOS Developer',
      lastMessage: 'Love the SwiftUI implementation 👍',
      timestamp: '12:45 PM',
      avatar: '🍎',
      online: true
    },
    {
      id: '4',
      name: 'Design Team',
      lastMessage: 'The interface follows HIG perfectly',
      timestamp: 'Yesterday',
      avatar: '🎨',
      online: false
    },
    {
      id: '5',
      name: 'Beta Tester',
      lastMessage: 'App runs smoothly on my iPhone 15',
      timestamp: 'Yesterday',
      avatar: '🧪',
      online: true
    }
  ];

  const generateChatMessages = (chat: Chat): ChatMessage[] => {
    const conversations: Record<string, ChatMessage[]> = {
      '1': [
        { id: '1', text: 'Hi! I just tried your MunirChat iOS app demo', isUser: false, timestamp: '2:28 PM', status: 'read' },
        { id: '2', text: 'Thanks for checking it out! What did you think?', isUser: true, timestamp: '2:29 PM', status: 'read' },
        { id: '3', text: 'This iOS app is impressive! Great work.', isUser: false, timestamp: '2:30 PM', status: 'delivered' },
        { id: '4', text: 'The SwiftUI components are really smooth', isUser: false, timestamp: '2:30 PM', status: 'delivered' }
      ],
      '2': [
        { id: '1', text: 'We saw your portfolio and iOS app', isUser: false, timestamp: '1:12 PM', status: 'read' },
        { id: '2', text: 'Hello! Great to hear from you', isUser: true, timestamp: '1:13 PM', status: 'read' },
        { id: '3', text: 'Can you build something similar for us?', isUser: false, timestamp: '1:15 PM', status: 'read' }
      ],
      '3': [
        { id: '1', text: 'Just checked out your iOS implementation', isUser: false, timestamp: '12:40 PM', status: 'read' },
        { id: '2', text: 'Love the SwiftUI implementation 👍', isUser: false, timestamp: '12:45 PM', status: 'read' },
        { id: '3', text: 'Thank you! SwiftUI makes everything so smooth', isUser: true, timestamp: '12:46 PM', status: 'read' }
      ],
      '4': [
        { id: '1', text: 'The interface follows HIG perfectly', isUser: false, timestamp: 'Yesterday 3:20 PM', status: 'read' },
        { id: '2', text: 'Thanks! I spent a lot of time on the design details', isUser: true, timestamp: 'Yesterday 3:25 PM', status: 'read' }
      ],
      '5': [
        { id: '1', text: 'App runs smoothly on my iPhone 15', isUser: false, timestamp: 'Yesterday 5:10 PM', status: 'read' },
        { id: '2', text: 'Great to hear! How\'s the performance?', isUser: true, timestamp: 'Yesterday 5:15 PM', status: 'read' }
      ]
    };
    
    return conversations[chat.id] || [];
  };

  const openChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(generateChatMessages(chat));
    setCurrentView('chat');
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !selectedChat) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate delivered status
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      );
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${isFullscreen ? '' : 'p-4'}`}>
      <div className={`${
        isFullscreen 
          ? 'w-full h-full max-w-none' 
          : 'w-full max-w-sm h-[80vh] mx-auto mt-10'
      } bg-gray-900 rounded-lg shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* iPhone Frame */}
        <div className="relative bg-black rounded-lg p-2">
          <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: isFullscreen ? 'auto' : '9/19.5' }}>
            
            {/* Status Bar */}
            <div className="bg-gray-900 px-4 py-2 flex justify-between items-center text-white text-sm">
              <div className="flex items-center gap-1">
                <span className="font-semibold">{currentTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                </div>
                <span className="text-xs">100%</span>
                {onToggleFullscreen && (
                  <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="text-white p-1">
                    {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-1">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* App Header */}
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentView === 'chat' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentView('home')}
                      className="text-blue-400 p-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <h1 className="text-white font-semibold">
                    {currentView === 'home' ? 'MunirChat' : selectedChat?.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {currentView === 'home' && (
                    <Button variant="ghost" size="sm" className="text-blue-400 p-1">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  {currentView === 'chat' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-blue-400 p-1">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-400 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-black overflow-hidden flex flex-col">
              
              {/* Home View - Chat List */}
              {currentView === 'home' && (
                <div className="flex-1 overflow-y-auto">
                  {/* Search Bar */}
                  <div className="p-4 bg-gray-900">
                    <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search chats..." 
                        className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Chat List */}
                  <div className="space-y-1">
                    {demoChats.map((chat) => (
                      <div 
                        key={chat.id}
                        onClick={() => openChat(chat)}
                        className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl">
                              {chat.avatar}
                            </div>
                            {chat.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-medium truncate">{chat.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">{chat.timestamp}</span>
                                {chat.unread && (
                                  <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {chat.unread}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm truncate mt-1">{chat.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Demo Info */}
                  <div className="p-4 mt-4">
                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-400 text-sm font-medium">iOS Portfolio Demo</span>
                      </div>
                      <p className="text-gray-300 text-xs">
                        This demonstrates native iOS chat interface with SwiftUI components, 
                        smooth animations, and iOS Human Interface Guidelines compliance.
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                          SwiftUI
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                          UIKit
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                          iOS 14.0+
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat View */}
              {currentView === 'chat' && selectedChat && (
                <div className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${
                          message.isUser 
                            ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
                            : 'bg-gray-700 text-white rounded-r-lg rounded-tl-lg'
                        } px-3 py-2`}>
                          <p className="text-sm">{message.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">{message.timestamp}</span>
                            {message.isUser && (
                              <div className="flex">
                                {message.status === 'sent' && <div className="w-1 h-1 bg-white/70 rounded-full"></div>}
                                {message.status === 'delivered' && (
                                  <>
                                    <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                                    <div className="w-1 h-1 bg-white/70 rounded-full ml-0.5"></div>
                                  </>
                                )}
                                {message.status === 'read' && (
                                  <>
                                    <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                                    <div className="w-1 h-1 bg-blue-300 rounded-full ml-0.5"></div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-gray-900">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Message..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!inputValue.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 h-8 w-8"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Bar */}
            <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
              <div className="flex justify-around">
                <Button 
                  variant="ghost" 
                  className={`flex-col gap-1 text-xs ${currentView === 'home' ? 'text-blue-400' : 'text-gray-500'}`}
                  onClick={() => setCurrentView('home')}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chats
                </Button>
                <Button variant="ghost" className="flex-col gap-1 text-xs text-gray-500">
                  <Camera className="w-4 h-4" />
                  Stories
                </Button>
                <Button 
                  variant="ghost" 
                  className={`flex-col gap-1 text-xs ${currentView === 'settings' ? 'text-blue-400' : 'text-gray-500'}`}
                  onClick={() => setCurrentView('settings')}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default IOSAppDemo;
