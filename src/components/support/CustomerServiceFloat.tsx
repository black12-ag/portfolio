import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SuperiorLiveChat from '@/components/support/SuperiorLiveChat';
import CustomerChatInitiator from '@/components/support/CustomerChatInitiator';
import { LifeBuoy, MessageSquare, Phone, BookOpen, X, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { startChatSession, getChatSession, ChatSession } from '@/lib/chatStore';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

const STORAGE_KEY = 'customer-service-float-pos';

export default function CustomerServiceFloat() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showChatInitiator, setShowChatInitiator] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [showContactChooser, setShowContactChooser] = useState(false);
  const { settings } = useAdminSettings();
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      // Handle localStorage access error
      console.debug('localStorage access error:', error);
    }
    return { x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300, y: typeof window !== 'undefined' ? window.innerHeight - 140 : 500 };
  });
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const safeInsetsRef = useRef({ top: 0, right: 0, bottom: 0, left: 0 });

  useEffect(() => {
    // Read CSS safe area insets if available
    try {
      const cs = getComputedStyle(document.documentElement);
      const parse = (v: string) => (v ? parseInt(v) || 0 : 0);
      safeInsetsRef.current = {
        top: parse(cs.getPropertyValue('env(safe-area-inset-top)')),
        right: parse(cs.getPropertyValue('env(safe-area-inset-right)')),
        bottom: parse(cs.getPropertyValue('env(safe-area-inset-bottom)')),
        left: parse(cs.getPropertyValue('env(safe-area-inset-left)')),
      };
    } catch (error) {
      // Handle safe area insets parsing error
      console.debug('Safe area insets error:', error);
    }
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const pt = 'touches' in e ? e.touches[0] : e;
      // Prevent page scroll during drag
      if ('touches' in e && (e as any).cancelable) (e).preventDefault();
      const nextX = pt.clientX - dragOffset.current.x;
      const nextY = pt.clientY - dragOffset.current.y;
      const BTN = 48; // base size; scales up via CSS on md+
      const MARGIN = 8;
      const RESERVED_BOTTOM = 96; // reserve space for mobile bottom nav
      const si = safeInsetsRef.current;
      const maxX = window.innerWidth - BTN - Math.max(MARGIN, si.right);
      const maxY = window.innerHeight - BTN - Math.max(MARGIN, si.bottom) - RESERVED_BOTTOM;
      const minX = Math.max(MARGIN, si.left);
      const minY = Math.max(MARGIN, si.top);
      setPos({ x: Math.max(minX, Math.min(nextX, Math.max(minX, maxX))), y: Math.max(minY, Math.min(nextY, Math.max(minY, maxY))) });
      movedRef.current = true;
    };
    const handleUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Snap to nearest horizontal edge for visibility
        const BTN = 48; const MARGIN = 8; const si = safeInsetsRef.current;
        const snapLeft = Math.max(MARGIN, si.left);
        const snapRight = window.innerWidth - BTN - Math.max(MARGIN, si.right);
        const snappedX = Math.abs(pos.x - snapLeft) < Math.abs(pos.x - snapRight) ? snapLeft : snapRight;
        const snapped = { x: snappedX, y: pos.y };
        setPos(snapped);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped)); } catch (error) {
          // Handle localStorage save error
          console.debug('localStorage save error:', error);
        }
      }
    };
    window.addEventListener('mousemove', handleMove as EventListener);
    window.addEventListener('touchmove', handleMove as EventListener, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    const handleResize = () => {
      // Clamp within viewport on resize
      const BTN = 48; const MARGIN = 8; const si = safeInsetsRef.current;
      const maxX = window.innerWidth - BTN - Math.max(MARGIN, si.right);
      const maxY = window.innerHeight - BTN - Math.max(MARGIN, si.bottom) - 96;
      const minX = Math.max(MARGIN, si.left);
      const minY = Math.max(MARGIN, si.top);
      setPos(prev => ({ x: Math.max(minX, Math.min(prev.x, maxX)), y: Math.max(minY, Math.min(prev.y, maxY)) }));
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMove as EventListener);
      window.removeEventListener('touchmove', handleMove as EventListener);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDragging, pos]);

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pt = 'touches' in e ? e.touches[0] : (e);
    const rect = containerRef.current?.getBoundingClientRect();
    dragOffset.current = {
      x: pt.clientX - (rect?.left || 0),
      y: pt.clientY - (rect?.top || 0),
    };
    setIsDragging(true);
    setShowMenu(false);
    movedRef.current = false;
  };

  const handleStartChat = () => {
    setShowChatInitiator(true);
    setShowMenu(false);
  };

  const handleChatStarted = async (chatId: string) => {
    const session = await getChatSession(chatId);
    if (session) {
      setActiveChatSession(session);
      setShowChatInitiator(false);
      setIsOpen(true);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setActiveChatSession(null);
    setShowChatInitiator(false);
  };

  return (
    <>
      {/* Floating widget */}
      <div
        ref={containerRef}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        className="fixed left-0 top-0 z-[60] transition-transform ease-out"
      >
        <div className="relative">
          <button
            aria-label="Customer Service"
            onMouseDown={onDown as any}
            onTouchStart={onDown as any}
            onClick={() => { if (!movedRef.current) setShowMenu(v => !v); }}
            className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center border border-white/30 transition-transform duration-150 ${isDragging ? 'cursor-grabbing scale-95' : 'cursor-grab active:scale-95'}`}
          >
            <LifeBuoy className="w-5 h-5" />
          </button>
          {showMenu && (
            <Card className="absolute bottom-16 right-0 w-64 shadow-xl">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">{t('Customer Service')}</div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowMenu(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* Live Chat Status */}
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 dark:text-green-300">{t('3 agents online')}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {t('~2 min wait')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-700"
                    onClick={handleStartChat}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> 
                    {t('Start Live Chat')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => { navigate('/support/help-center'); setShowMenu(false); }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> {t('Help Center')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => { setShowContactChooser(true); setShowMenu(false); }}
                  >
                    <Phone className="w-4 h-4 mr-2" /> {t('Contact Us')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Chat Initiator Modal */}
      {showChatInitiator && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">{t('Start Live Chat')}</div>
              <Button variant="ghost" size="icon" onClick={() => setShowChatInitiator(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <CustomerChatInitiator onChatStarted={handleChatStarted} />
            </div>
          </div>
        </div>
      )}

      {/* Active Chat Modal */}
      {isOpen && activeChatSession && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[75vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold">{t('Live Chat Support')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {activeChatSession.agentName ? 
                      t('Connected to {{agent}}', { agent: activeChatSession.agentName }) : 
                      t('Waiting for agent...')
                    }
                  </div>
                </div>
                <Badge variant={activeChatSession.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {activeChatSession.status}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseChat}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SuperiorLiveChat
                isOpen={true}
                onClose={handleCloseChat}
                isAgentView={false}
                chatId={activeChatSession.id}
                customerInfo={{
                  name: activeChatSession.customerName,
                  email: activeChatSession.customerEmail,
                  avatar: activeChatSession.customerAvatar,
                  memberSince: activeChatSession.customerContext.memberSince,
                  totalBookings: activeChatSession.customerContext.totalBookings,
                  loyaltyLevel: activeChatSession.customerContext.loyaltyLevel
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact chooser modal */}
      {showContactChooser && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">{t('Contact Support')}</div>
              <Button variant="ghost" size="icon" onClick={() => setShowContactChooser(false)}>×</Button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground mb-2">
                {t('Choose how you want to reach us:')}
              </div>
              <Button
                className="w-full justify-start"
                onClick={() => {
                  const raw = settings.supportContacts.whatsapp || settings.socialLinks?.whatsapp;
                  const digits = (raw || '').replace(/[^0-9]/g, '');
                  if (digits) {
                    window.open(`https://wa.me/${digits}?text=${encodeURIComponent('Hello, I need assistance')}`);
                    setShowContactChooser(false);
                  }
                }}
                disabled={!settings.supportContacts.whatsapp && !(settings as any).socialLinks?.whatsapp}
              >
                <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">🟢</span>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const phone = settings.supportContacts.phone || settings.contacts?.phone;
                  if (phone) {
                    window.open(`tel:${phone.replace(/\s+/g, '')}`);
                    setShowContactChooser(false);
                  }
                }}
                disabled={!settings.supportContacts.phone && !(settings as any).contacts?.phone}
              >
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">📞</span>
                {t('Direct Call')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


