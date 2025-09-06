import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Download, 
  Bot, 
  Smartphone,
  ExternalLink,
  Play,
  Users,
  Clock,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TelegramBotDemo from '../demos/TelegramBotDemo';
import IOSAppDemo from '../demos/IOSAppDemo';
import AndroidAppDemo from '../demos/AndroidAppDemo';

export const InteractivePortfolio: React.FC = () => {
  const [botStatus, setBotStatus] = useState({
    isOnline: true,
    activeUsers: 47,
    responseTime: '< 1.5s',
    totalConversations: 1247
  });

  const [appStats, setAppStats] = useState({
    downloads: 156,
    version: '1.0.0',
    rating: 4.9,
    size: '8.2 MB'
  });

  // Demo states
  const [demoStates, setDemoStates] = useState({
    telegramBot: { isOpen: false, isFullscreen: false },
    iosApp: { isOpen: false, isFullscreen: false },
    androidApp: { isOpen: false, isFullscreen: false }
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setBotStatus(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 20) + 35,
        isOnline: Math.random() > 0.05, // 95% uptime
        totalConversations: prev.totalConversations + Math.floor(Math.random() * 3)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const openDemo = (demo: 'telegramBot' | 'iosApp' | 'androidApp') => {
    setDemoStates(prev => ({
      ...prev,
      [demo]: { ...prev[demo], isOpen: true }
    }));
  };

  const closeDemo = (demo: 'telegramBot' | 'iosApp' | 'androidApp') => {
    setDemoStates(prev => ({
      ...prev,
      [demo]: { isOpen: false, isFullscreen: false }
    }));
  };

  const toggleFullscreen = (demo: 'telegramBot' | 'iosApp' | 'androidApp') => {
    setDemoStates(prev => ({
      ...prev,
      [demo]: { ...prev[demo], isFullscreen: !prev[demo].isFullscreen }
    }));
  };

  const demoPrompts = [
    'Tell me about MunirChat',
    'What projects are in your portfolio?',
    'How can I download the Android app?',
    'Show me your technical skills',
    'What technologies do you work with?'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Interactive Portfolio
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Try My Projects Live
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don't just read about my projects—interact with them! Chat with my AI bot on Telegram 
            or download the Android portfolio app and experience the quality firsthand.
          </p>
        </div>

        {/* Main Interactive Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Telegram Bot Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">MunirChat AI Bot</CardTitle>
                  <CardDescription className="text-blue-100">
                    Powered by Google Gemini Pro
                  </CardDescription>
                </div>
              </div>
              
              {/* Live Status */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${botStatus.isOnline ? 'bg-green-300' : 'bg-red-300'}`} />
                  <span>{botStatus.isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{botStatus.activeUsers} active</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{botStatus.responseTime}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4">
                <p className="text-blue-100">
                  Chat with my AI assistant that showcases natural language processing, 
                  contextual understanding, and integration with 16 specialized plugins.
                </p>

                {/* Quick Demo Prompts */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-200">Try asking:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {demoPrompts.slice(0, 3).map((prompt, index) => (
                      <div 
                        key={index}
                        className="text-xs bg-white/10 rounded px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors"
                        onClick={() => navigator.clipboard.writeText(prompt)}
                      >
                        "{prompt}"
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{botStatus.totalConversations.toLocaleString()}</div>
                    <div className="text-xs text-blue-200">Total Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">16</div>
                    <div className="text-xs text-blue-200">AI Plugins</div>
                  </div>
                </div>

                <Button
                  onClick={() => openDemo('telegramBot')}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Try AI Chat Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* iOS App Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Portfolio iOS App</CardTitle>
                  <CardDescription className="text-purple-100">
                    Native Swift with iOS Human Interface Guidelines
                  </CardDescription>
                </div>
              </div>

              {/* App Info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>v2.1.0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>4.9/5.0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>89 testers</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4">
                <p className="text-purple-100">
                  Experience native iOS development with SwiftUI, CoreData integration, 
                  and seamless Apple ecosystem features.
                </p>

                {/* App Features */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-200">Features:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>SwiftUI + UIKit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>255 App Icons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Apple Watch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>TestFlight Beta</span>
                    </div>
                  </div>
                </div>

                {/* App Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">24.7 MB</div>
                    <div className="text-xs text-purple-200">App Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">iOS 14.0+</div>
                    <div className="text-xs text-purple-200">Min Version</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">2,502</div>
                    <div className="text-xs text-purple-200">Swift Files</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => openDemo('iosApp')}
                    className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                  <Button
                    onClick={() => openDemo('telegramBot')}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-purple-600"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    AI Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Android App Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Portfolio Android App</CardTitle>
                  <CardDescription className="text-green-100">
                    Native Kotlin with Material Design 3
                  </CardDescription>
                </div>
              </div>

              {/* App Info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>v{appStats.version}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{appStats.rating}/5.0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{appStats.downloads} downloads</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4">
                <p className="text-green-100">
                  Download the demo app to experience native Android development with 
                  Material Design 3, adaptive theming, and smooth performance.
                </p>

                {/* App Features */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-200">Features:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Material Design 3</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Adaptive Icons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Chat Demo UI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Portfolio Showcase</span>
                    </div>
                  </div>
                </div>

                {/* App Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{appStats.size}</div>
                    <div className="text-xs text-green-200">App Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">Android 6.0+</div>
                    <div className="text-xs text-green-200">Min Version</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">4,430</div>
                    <div className="text-xs text-green-200">Kotlin Files</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => openDemo('androidApp')}
                    className="bg-white text-green-600 hover:bg-green-50 font-semibold"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                  <Button
                    onClick={() => openDemo('telegramBot')}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-green-600"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    AI Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Access Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              How to Access My Interactive Portfolio
            </CardTitle>
            <CardDescription>
              Three simple ways to experience my work directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {/* Method 1: Telegram Bot */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat with AI Bot</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Message @MunirChatBot on Telegram. Ask about my projects, skills, 
                  or request the Android app download link.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openDemo('telegramBot')}
                >
                  Try Demo
                </Button>
              </div>

              {/* Method 2: iOS App Download */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Download iOS App</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join TestFlight beta to experience native iOS development 
                  with SwiftUI and Apple ecosystem integration.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openDemo('iosApp')}
                >
                  Try Demo
                </Button>
              </div>

              {/* Method 3: Android App Download */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Download Android App</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get the portfolio demo app directly from Google Play Store 
                  or download the APK file.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openDemo('androidApp')}
                >
                  Try Demo
                </Button>
              </div>

              {/* Method 4: Browse Portfolio */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Browse This Website</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore this portfolio website to see detailed project descriptions, 
                  code samples, and live demos.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Projects
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Demo Alert */}
        <Alert className="max-w-2xl mx-auto mt-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <Play className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">
            Ready to Experience My Work?
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            These are fully interactive web demos running in your browser! Experience the AI chat bot, 
            iOS app interface, and Android Material Design 3 - all without any downloads required.
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Demo Modals */}
      <TelegramBotDemo 
        isOpen={demoStates.telegramBot.isOpen}
        onClose={() => closeDemo('telegramBot')}
        onToggleFullscreen={() => toggleFullscreen('telegramBot')}
        isFullscreen={demoStates.telegramBot.isFullscreen}
      />
      
      <IOSAppDemo 
        isOpen={demoStates.iosApp.isOpen}
        onClose={() => closeDemo('iosApp')}
        onToggleFullscreen={() => toggleFullscreen('iosApp')}
        isFullscreen={demoStates.iosApp.isFullscreen}
      />
      
      <AndroidAppDemo 
        isOpen={demoStates.androidApp.isOpen}
        onClose={() => closeDemo('androidApp')}
        onToggleFullscreen={() => toggleFullscreen('androidApp')}
        isFullscreen={demoStates.androidApp.isFullscreen}
      />
    </div>
  );
};

export default InteractivePortfolio;
