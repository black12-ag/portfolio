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
  Menu,
  ArrowLeft,
  MoreVertical,
  Wifi,
  Battery,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AndroidAppDemoProps {
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

export const AndroidAppDemo: React.FC<AndroidAppDemoProps> = ({
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
      name: 'Android Developer',
      lastMessage: 'Material Design 3 looks fantastic!',
      timestamp: '3:20 PM',
      unread: 3,
      avatar: '🤖',
      online: true
    },
    {
      id: '2', 
      name: 'UI/UX Designer',
      lastMessage: 'The adaptive theming is perfect',
      timestamp: '2:45 PM',
      avatar: '🎨',
      online: true
    },
    {
      id: '3',
      name: 'Kotlin Expert',
      lastMessage: 'Clean code architecture! 👌',
      timestamp: '1:30 PM',
      unread: 1,
      avatar: '⚡',
      online: false
    },
    {
      id: '4',
      name: 'Portfolio Reviewer',
      lastMessage: 'This demonstrates real Android skills',
      timestamp: '12:15 PM',
      avatar: '👥',
      online: true
    },
    {
      id: '5',
      name: 'Beta Tester',
      lastMessage: 'Smooth performance on my Pixel',
      timestamp: 'Yesterday',
      avatar: '📱',
      online: false
    },
    {
      id: '6',
      name: 'Potential Client',
      lastMessage: 'Interested in hiring for Android project',
      timestamp: 'Yesterday',
      unread: 2,
      avatar: '💼',
      online: true
    }
  ];

  const generateChatMessages = (chat: Chat): ChatMessage[] => {
    const conversations: Record<string, ChatMessage[]> = {
      '1': [
        { id: '1', text: 'Hey! Just tried your Android portfolio app', isUser: false, timestamp: '3:15 PM', status: 'read' },
        { id: '2', text: 'Thanks for checking it out!', isUser: true, timestamp: '3:17 PM', status: 'read' },
        { id: '3', text: 'Material Design 3 looks fantastic!', isUser: false, timestamp: '3:20 PM', status: 'delivered' },
        { id: '4', text: 'The adaptive theming really shines', isUser: false, timestamp: '3:20 PM', status: 'delivered' },
        { id: '5', text: 'How did you implement the dynamic colors?', isUser: false, timestamp: '3:21 PM', status: 'sent' }
      ],
      '2': [
        { id: '1', text: 'Love the Material You implementation', isUser: false, timestamp: '2:40 PM', status: 'read' },
        { id: '2', text: 'Thank you! I focused on Google\'s latest guidelines', isUser: true, timestamp: '2:42 PM', status: 'read' },
        { id: '3', text: 'The adaptive theming is perfect', isUser: false, timestamp: '2:45 PM', status: 'read' }
      ],
      '3': [
        { id: '1', text: 'Checked out your Kotlin code structure', isUser: false, timestamp: '1:25 PM', status: 'read' },
        { id: '2', text: 'What did you think?', isUser: true, timestamp: '1:27 PM', status: 'read' },
        { id: '3', text: 'Clean code architecture! 👌', isUser: false, timestamp: '1:30 PM', status: 'read' }
      ],
      '4': [
        { id: '1', text: 'This demonstrates real Android skills', isUser: false, timestamp: '12:15 PM', status: 'read' },
        { id: '2', text: 'Thanks! I put a lot of work into the details', isUser: true, timestamp: '12:18 PM', status: 'read' }
      ],
      '5': [
        { id: '1', text: 'Smooth performance on my Pixel', isUser: false, timestamp: 'Yesterday 4:30 PM', status: 'read' },
        { id: '2', text: 'Great to hear! Performance was a priority', isUser: true, timestamp: 'Yesterday 4:35 PM', status: 'read' }
      ],
      '6': [
        { id: '1', text: 'Saw your Android portfolio app', isUser: false, timestamp: 'Yesterday 2:10 PM', status: 'read' },
        { id: '2', text: 'Interested in hiring for Android project', isUser: false, timestamp: 'Yesterday 2:15 PM', status: 'delivered' },
        { id: '3', text: 'I\'d love to discuss the opportunity!', isUser: true, timestamp: 'Yesterday 2:20 PM', status: 'sent' }
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
      } bg-gray-50 rounded-lg shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Android Frame */}
        <div className="relative bg-black rounded-lg p-2">
          <div className="bg-white rounded-lg overflow-hidden" style={{ aspectRatio: isFullscreen ? 'auto' : '9/19.5' }}>
            
            {/* Status Bar */}
            <div className="bg-green-600 px-4 py-2 flex justify-between items-center text-white text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
                <span className="text-xs">87%</span>
                {onToggleFullscreen && (
                  <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="text-white p-1 ml-2">
                    {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-1">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* App Header */}
            <div className="bg-green-600 px-4 py-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentView === 'chat' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentView('home')}
                      className="text-white p-1"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <h1 className="text-white font-medium text-lg">
                    {currentView === 'home' ? 'MunirChat' : selectedChat?.name}
                  </h1>
                  {currentView === 'chat' && selectedChat?.online && (
                    <span className="text-green-100 text-sm">Online</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentView === 'home' && (
                    <Button variant="ghost" size="sm" className="text-white p-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  )}
                  {currentView === 'chat' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-white p-2">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white p-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="text-white p-2">
                    <Menu className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
              
              {/* Home View - Chat List */}
              {currentView === 'home' && (
                <div className="flex-1 overflow-y-auto">
                  {/* Chat List */}
                  <div className="bg-white">
                    {demoChats.map((chat, index) => (
                      <div 
                        key={chat.id}
                        onClick={() => openChat(chat)}
                        className={`px-4 py-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${
                          index !== demoChats.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="relative">
                          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-xl">
                            {chat.avatar}
                          </div>
                          {chat.online && (
                            <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-gray-900 font-medium truncate">{chat.name}</h3>
                            <span className="text-gray-500 text-sm">{chat.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-600 text-sm truncate flex-1">{chat.lastMessage}</p>
                            {chat.unread && (
                              <div className="bg-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center ml-2">
                                {chat.unread}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Demo Info */}
                  <div className="p-4 bg-gray-50">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">Android Portfolio Demo</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        This showcases native Android development with Material Design 3, 
                        adaptive theming, and modern Kotlin architecture patterns.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-600 text-white text-xs">
                          Kotlin
                        </Badge>
                        <Badge className="bg-green-600 text-white text-xs">
                          Material Design 3
                        </Badge>
                        <Badge className="bg-green-600 text-white text-xs">
                          Android 6.0+
                        </Badge>
                        <Badge className="bg-green-600 text-white text-xs">
                          4,430 Files
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat View */}
              {currentView === 'chat' && selectedChat && (
                <div className="flex-1 flex flex-col bg-green-50">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] shadow-sm ${
                          message.isUser 
                            ? 'bg-green-600 text-white rounded-l-2xl rounded-tr-2xl' 
                            : 'bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl border border-gray-200'
                        } px-4 py-3`}>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <span className={`text-xs ${message.isUser ? 'text-green-100' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </span>
                            {message.isUser && (
                              <div className="flex ml-1">
                                {message.status === 'sent' && (
                                  <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                                )}
                                {message.status === 'delivered' && (
                                  <>
                                    <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                                    <div className="w-1 h-1 bg-green-200 rounded-full ml-0.5"></div>
                                  </>
                                )}
                                {message.status === 'read' && (
                                  <>
                                    <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                                    <div className="w-1 h-1 bg-green-300 rounded-full ml-0.5"></div>
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
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-500"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!inputValue.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 h-10 w-10 shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex justify-around">
                <Button 
                  variant="ghost" 
                  className={`flex-col gap-1 text-xs ${currentView === 'home' ? 'text-green-600' : 'text-gray-500'}`}
                  onClick={() => setCurrentView('home')}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chats
                </Button>
                <Button variant="ghost" className="flex-col gap-1 text-xs text-gray-500">
                  <Camera className="w-5 h-5" />
                  Status
                </Button>
                <Button 
                  variant="ghost" 
                  className={`flex-col gap-1 text-xs ${currentView === 'settings' ? 'text-green-600' : 'text-gray-500'}`}
                  onClick={() => setCurrentView('settings')}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Material Design 3 Floating Action Button */}
            {currentView === 'home' && (
              <div className="absolute bottom-20 right-6">
                <Button className="bg-green-600 hover:bg-green-700 rounded-full w-14 h-14 shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AndroidAppDemo;
