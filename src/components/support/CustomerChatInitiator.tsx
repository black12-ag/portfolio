import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { startChatSession } from '@/lib/chatStore';

interface CustomerChatInitiatorProps {
  onChatStarted?: (chatId: string) => void;
  className?: string;
}

export default function CustomerChatInitiator({ onChatStarted, className }: CustomerChatInitiatorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [chatForm, setChatForm] = useState({
    customerName: 'John Davis',
    customerEmail: 'john.davis@email.com',
    department: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    subject: '',
    initialMessage: ''
  });

  const departments = [
    { value: 'general', label: t('General Support') },
    { value: 'booking', label: t('Booking Assistance') },
    { value: 'payment', label: t('Payment Issues') },
    { value: 'technical', label: t('Technical Support') },
    { value: 'billing', label: t('Billing Questions') }
  ];

  const priorities = [
    { value: 'low', label: t('Low'), color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: t('Medium'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: t('High'), color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: t('Urgent'), color: 'bg-red-100 text-red-800' }
  ];

  const handleStartChat = async () => {
    if (!chatForm.customerName || !chatForm.customerEmail || !chatForm.initialMessage) {
      toast({
        title: t('Missing Information'),
        description: t('Please fill in all required fields'),
        variant: 'destructive'
      });
      return;
    }

    setIsStarting(true);
    
    try {
      const chatSession = await startChatSession({
        customerId: `customer-${Date.now()}`,
        customerName: chatForm.customerName,
        customerEmail: chatForm.customerEmail,
        customerAvatar: '/avatars/customer.jpg',
        department: chatForm.department,
        priority: chatForm.priority,
        initialMessage: chatForm.initialMessage,
        metadata: {
          subject: chatForm.subject,
          source: 'website',
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      });

      toast({
        title: t('Chat Started'),
        description: t('You will be connected to an agent shortly'),
        variant: 'default'
      });

      // Simulate browser notification permission request
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      onChatStarted?.(chatSession.id);
      
      // Reset form
      setChatForm({
        ...chatForm,
        subject: '',
        initialMessage: ''
      });
      
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast({
        title: t('Error'),
        description: t('Failed to start chat. Please try again.'),
        variant: 'destructive'
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={className}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            {t('Start Live Chat')}
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {t('Avg. wait: 2 min')}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {t('3 agents online')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t('Name')} *</label>
              <Input
                value={chatForm.customerName}
                onChange={(e) => setChatForm({ ...chatForm, customerName: e.target.value })}
                placeholder={t('Your name')}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('Email')} *</label>
              <Input
                type="email"
                value={chatForm.customerEmail}
                onChange={(e) => setChatForm({ ...chatForm, customerEmail: e.target.value })}
                placeholder={t('Your email')}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t('Department')}</label>
            <Select value={chatForm.department} onValueChange={(value) => setChatForm({ ...chatForm, department: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">{t('Priority')}</label>
            <Select value={chatForm.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setChatForm({ ...chatForm, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${priority.color}`}>
                        {priority.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">{t('Subject')} (optional)</label>
            <Input
              value={chatForm.subject}
              onChange={(e) => setChatForm({ ...chatForm, subject: e.target.value })}
              placeholder={t('Brief description of your issue')}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('Message')} *</label>
            <Textarea
              value={chatForm.initialMessage}
              onChange={(e) => setChatForm({ ...chatForm, initialMessage: e.target.value })}
              placeholder={t('How can we help you today?')}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleStartChat} 
            disabled={isStarting}
            className="w-full"
          >
            {isStarting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                {t('Starting Chat...')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t('Start Chat')}
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('By starting a chat, you agree to our terms of service. We may record this conversation for quality assurance.')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
