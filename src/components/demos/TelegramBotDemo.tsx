import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  X,
  Maximize2,
  Minimize2,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

interface TelegramBotDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const TelegramBotDemo: React.FC<TelegramBotDemoProps> = ({
  isOpen,
  onClose,
  onToggleFullscreen,
  isFullscreen = false
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I\'m MunirChat AI Assistant. I can help you learn about Munir\'s projects, skills, and provide various services. Try asking me something!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botResponses: Record<string, string[]> = {
    'portfolio': [
      '📁 Munir has created amazing projects including:\n• MunirChat iOS & Android apps\n• AI-powered Telegram bot (that\'s me!)\n• Hotel booking website\n• E-commerce platforms\n• Full-stack web applications',
      '🚀 His portfolio showcases expertise in React, Swift, Kotlin, Python, and modern development practices!'
    ],
    'projects': [
      '💼 Here are some key projects:\n\n🍎 **iOS App**: Native Swift app with 2,502 files\n🤖 **Android App**: Kotlin with Material Design 3\n🤖 **Telegram Bot**: AI assistant with 16 plugins\n🏨 **Hotel Booking**: Full-stack web application\n💳 **E-commerce**: Payment integration & admin dashboard'
    ],
    'skills': [
      '🛠️ **Technical Skills:**\n• Frontend: React, TypeScript, SwiftUI\n• Backend: Node.js, Python, APIs\n• Mobile: iOS (Swift), Android (Kotlin)\n• AI: Telegram bots, GPT integration\n• Databases: PostgreSQL, MongoDB\n• Cloud: AWS, Docker deployment'
    ],
    'technologies': [
      '⚡ **Technologies Munir works with:**\n\n🌐 **Web**: React, Next.js, Vue.js, TypeScript\n📱 **Mobile**: Swift, Kotlin, React Native\n🖥️ **Backend**: Node.js, Python, Express\n🗄️ **Databases**: PostgreSQL, MongoDB, Redis\n☁️ **Cloud**: AWS, Docker, Kubernetes\n🤖 **AI**: OpenAI, Gemini, Telegram APIs'
    ],
    'contact': [
      '📬 **Contact Information:**\n• Portfolio: This website you\'re on\n• Email: Available in contact section\n• LinkedIn: Professional profile\n• GitHub: Code repositories\n\nFeel free to reach out for project discussions!'
    ],
    'ios': [
      '🍎 **MunirChat iOS App Features:**\n• 2,502 Swift files\n• SwiftUI + UIKit\n• 255 custom app icons\n• Apple Watch support\n• End-to-end encryption\n• iOS 14.0+ compatibility\n\nYou can try the web demo version right here!'
    ],
    'android': [
      '🤖 **MunirChat Android App:**\n• 4,430 Kotlin/Java files\n• Material Design 3\n• Adaptive icons\n• Background sync\n• Battery optimization\n• Android 6.0+ support\n\nTry the web demo to see it in action!'
    ],
    'demo': [
      '🎮 **Available Demos:**\n• 💬 Telegram Bot (this chat!)\n• 🍎 iOS App Demo\n• 🤖 Android App Demo\n\nAll demos run directly in your browser - no downloads needed!'
    ],
    'weather': [
      '🌤️ Weather Plugin: I can show weather info for any city!\n📍 Try: "What\'s the weather in London?"'
    ],
    'help': [
      '❓ **Available Commands:**\n\n• Ask about **portfolio** or **projects**\n• Inquire about **skills** or **technologies**  \n• Request **contact** information\n• Try **ios** or **android** app info\n• Ask for **demo** options\n• Weather: "weather in [city]"\n• Or just chat naturally - I understand context!'
    ]
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check for weather queries
    if (message.includes('weather') && message.includes('in ')) {
      const city = message.split('in ')[1]?.trim() || 'your location';
      return `🌤️ **Weather in ${city}:**\n🌡️ 22°C (72°F)\n☀️ Sunny with light clouds\n💨 Wind: 8 km/h\n💧 Humidity: 65%\n\n*This is a demo response - the real bot connects to weather APIs!*`;
    }
    
    // Find matching response
    for (const [key, responses] of Object.entries(botResponses)) {
      if (message.includes(key)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // Default responses for unmatched queries
    const defaultResponses = [
      '🤔 That\'s an interesting question! I\'m a demo version, but the real MunirChat bot has 16+ plugins including weather, translation, web search, and more.',
      '💡 Try asking about Munir\'s portfolio, projects, skills, or contact information. I can also demonstrate weather queries!',
      '🚀 I\'m showcasing Munir\'s AI integration skills. Ask me about his iOS app, Android app, or technical expertise!',
      '✨ This is just a taste of what the full bot can do! Try asking about "portfolio", "projects", "skills", or "demo".'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(userMessage.text),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    'Tell me about the portfolio',
    'What are your skills?',
    'Show me the projects',
    'Weather in London',
    'Available demos'
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${isFullscreen ? '' : 'p-4'}`}>
      <div className={`${
        isFullscreen 
          ? 'w-full h-full' 
          : 'w-full max-w-4xl h-[80vh] mx-auto mt-10'
      } bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col`}>
        
        {/* Header */}
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">MunirChat AI Assistant</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online • Demo Version</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-lg ${
                    message.isUser 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'bg-blue-100 dark:bg-blue-900/50'
                  }`}>
                    {message.isUser ? (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className={`max-w-[70%] ${message.isUser ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-500 text-sm">MunirChat is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-xs"
                    onClick={() => setInputValue(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about Munir's portfolio, skills, projects..."
                  className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={1}
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default TelegramBotDemo;
