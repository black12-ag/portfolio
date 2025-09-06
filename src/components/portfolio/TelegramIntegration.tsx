import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Download, 
  QrCode, 
  ExternalLink, 
  Bot, 
  Smartphone,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TelegramIntegrationProps {
  projectId: string;
  telegramAccess?: {
    botUsername: string;
    startCommand: string;
    demoPrompts: string[];
    liveDemoAvailable: boolean;
    requiresAuthentication: boolean;
    responseTime: string;
    availablePlugins: string[];
  };
  downloadOptions?: {
    // Android specific
    googlePlay?: string;
    directApk?: string;
    // iOS specific  
    appStore?: string;
    testFlight?: string;
    // Common
    qrCode: string;
    minRequirements: string;
    size: string;
    latestVersion: string;
    telegramBot: string;
    telegramCommand: string;
    platform?: 'iOS' | 'Android';
  };
}

export const TelegramIntegration: React.FC<TelegramIntegrationProps> = ({
  projectId,
  telegramAccess,
  downloadOptions
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentUsers, setCurrentUsers] = useState(Math.floor(Math.random() * 50) + 20);

  useEffect(() => {
    // Simulate bot status check
    const checkBotStatus = () => {
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
      setCurrentUsers(Math.floor(Math.random() * 50) + 20);
    };

    const interval = setInterval(checkBotStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleTelegramClick = (username: string) => {
    window.open(`https://t.me/${username.replace('@', '')}`, '_blank');
  };

  const handleDownloadClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (projectId === 'munirchat-bot' && telegramAccess) {
    return (
      <Card className="w-full mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Try the AI Bot Live on Telegram
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>
                Chat with the AI assistant directly on Telegram - no installation required
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bot Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Clock className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{telegramAccess.responseTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{currentUsers} online now</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Availability</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">24/7 Live</p>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Start:</strong> Click the button below to open Telegram and start chatting with the AI bot instantly.
              Try asking: "{telegramAccess.demoPrompts[0]}"
            </AlertDescription>
          </Alert>

          {/* Action Button */}
          <Button
            onClick={() => handleTelegramClick(telegramAccess.botUsername)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat with {telegramAccess.botUsername} on Telegram
          </Button>

          {/* Demo Prompts */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Try these example prompts:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {telegramAccess.demoPrompts.slice(0, 4).map((prompt, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="justify-start p-2 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => navigator.clipboard.writeText(prompt)}
                >
                  "{prompt}"
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Plugins */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Available AI Plugins ({telegramAccess.availablePlugins.length}):
            </h4>
            <div className="flex flex-wrap gap-1">
              {telegramAccess.availablePlugins.map((plugin, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {plugin}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if ((projectId === 'munirchat-android' || projectId === 'munirchat-portfolio-android' || projectId === 'munirchat-ios') && downloadOptions) {
    const isIOS = downloadOptions.platform === 'iOS' || projectId === 'munirchat-ios';
    const platformName = isIOS ? 'iOS' : 'Android';
    const colorScheme = isIOS 
      ? 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800'
      : 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800';
    const iconColor = isIOS 
      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
      : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
    
    return (
      <Card className={`w-full mt-6 bg-gradient-to-br ${colorScheme}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconColor}`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Download {platformName} Portfolio App</CardTitle>
              <CardDescription>
                Get the demo app directly or via Telegram bot
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* App Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">Version</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{downloadOptions.latestVersion}</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">Size</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{downloadOptions.size}</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">Min {platformName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isIOS ? 'iOS 14.0+' : 'Android 6.0+'}
              </p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">Status</p>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">Ready</p>
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Download Options:
            </h4>
            
            {/* Primary Download Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {isIOS ? (
                <>
                  <Button
                    onClick={() => handleDownloadClick(downloadOptions.appStore || downloadOptions.testFlight!)}
                    variant="outline"
                    className="flex items-center gap-2 h-12"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">App Store</div>
                      <div className="text-xs text-gray-500">TestFlight Beta</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleDownloadClick(downloadOptions.testFlight!)}
                    variant="outline" 
                    className="flex items-center gap-2 h-12"
                  >
                    <Download className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">TestFlight</div>
                      <div className="text-xs text-gray-500">Beta Access</div>
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleDownloadClick(downloadOptions.googlePlay!)}
                    variant="outline"
                    className="flex items-center gap-2 h-12"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Google Play Store</div>
                      <div className="text-xs text-gray-500">Beta Testing</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleDownloadClick(downloadOptions.directApk!)}
                    variant="outline" 
                    className="flex items-center gap-2 h-12"
                  >
                    <Download className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Direct APK</div>
                      <div className="text-xs text-gray-500">Latest Build</div>
                    </div>
                  </Button>
                </>
              )}
            </div>

            {/* Telegram Bot Download */}
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <strong>Alternative:</strong> Get the APK via Telegram bot! Message{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-blue-600 dark:text-blue-400"
                  onClick={() => handleTelegramClick(downloadOptions.telegramBot)}
                >
                  {downloadOptions.telegramBot}
                </Button>
                {' '}and send "{downloadOptions.telegramCommand}" to receive the download link.
              </AlertDescription>
            </Alert>

            {/* QR Code Option */}
            <div className="flex items-center justify-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <QrCode className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium">QR Code Download</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Scan with your phone to download
                </p>
                <Button variant="link" className="text-xs p-0 h-auto mt-1">
                  Show QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Installation Note */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> This is a portfolio demonstration app. 
              {isIOS 
                ? 'TestFlight beta access may require invitation. The app showcases iOS development skills with native Swift UI and smooth performance.'
                : 'You may need to enable "Install from unknown sources" for direct APK installation. The app showcases UI/UX design and development skills with sample chat conversations.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TelegramIntegration;
