import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellRing,
  Check,
  X,
  MessageSquare,
  Calendar,
  CreditCard,
  Star,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Filter,
  Archive,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'booking' | 'payment' | 'review' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    guestName?: string;
    propertyName?: string;
    bookingId?: string;
    amount?: number;
    rating?: number;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'bookings' | 'payments'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'New Message from Sarah Johnson',
          message: 'Hi! I have a question about the property amenities.',
          timestamp: '2024-01-20T14:30:00Z',
          isRead: false,
          priority: 'medium',
          actionUrl: '/host/messages/1',
          metadata: {
            guestName: 'Sarah Johnson',
            propertyName: 'Luxury Villa Sunset'
          }
        },
        {
          id: '2',
          type: 'booking',
          title: 'New Booking Request',
          message: 'Mike Chen has requested to book Modern City Apartment for 5 nights.',
          timestamp: '2024-01-20T12:15:00Z',
          isRead: false,
          priority: 'high',
          actionUrl: '/host/bookings/pending',
          metadata: {
            guestName: 'Mike Chen',
            propertyName: 'Modern City Apartment',
            bookingId: 'BK-2024-001'
          }
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Received',
          message: 'Payment of $450 received for booking BK-2024-002.',
          timestamp: '2024-01-20T10:30:00Z',
          isRead: true,
          priority: 'medium',
          actionUrl: '/host/earnings',
          metadata: {
            amount: 450,
            bookingId: 'BK-2024-002'
          }
        },
        {
          id: '4',
          type: 'review',
          title: 'New Review Received',
          message: 'Emma Davis left a 5-star review for Beachfront Cottage.',
          timestamp: '2024-01-19T18:45:00Z',
          isRead: true,
          priority: 'low',
          actionUrl: '/host/reviews',
          metadata: {
            guestName: 'Emma Davis',
            propertyName: 'Beachfront Cottage',
            rating: 5
          }
        },
        {
          id: '5',
          type: 'reminder',
          title: 'Check-in Reminder',
          message: 'Guest John Smith will be checking in tomorrow at Sunset Villa.',
          timestamp: '2024-01-19T16:00:00Z',
          isRead: false,
          priority: 'medium',
          actionUrl: '/host/calendar',
          metadata: {
            guestName: 'John Smith',
            propertyName: 'Sunset Villa'
          }
        },
        {
          id: '6',
          type: 'system',
          title: 'Property Listing Update',
          message: 'Your listing "Mountain Cabin Retreat" has been successfully updated.',
          timestamp: '2024-01-19T14:20:00Z',
          isRead: true,
          priority: 'low',
          actionUrl: '/host/properties'
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' :
      'text-gray-500'
    }`;

    switch (type) {
      case 'message': return <MessageSquare className={iconClass} />;
      case 'booking': return <Calendar className={iconClass} />;
      case 'payment': return <CreditCard className={iconClass} />;
      case 'review': return <Star className={iconClass} />;
      case 'reminder': return <Clock className={iconClass} />;
      case 'system': return <Settings className={iconClass} />;
      default: return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'messages') return notif.type === 'message';
    if (filter === 'bookings') return notif.type === 'booking' || notif.type === 'reminder';
    if (filter === 'payments') return notif.type === 'payment';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="h-8 w-8 mr-3" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 bg-red-500 text-white text-sm rounded-full px-3 py-1">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Stay updated with your property activities</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Notifications', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'messages', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
              { key: 'bookings', label: 'Bookings', count: notifications.filter(n => n.type === 'booking' || n.type === 'reminder').length },
              { key: 'payments', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as 'all' | 'unread' | 'messages' | 'bookings' | 'payments')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
                <span className="ml-2 bg-white text-gray-600 rounded-full px-2 py-1 text-xs">
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-md ${
                  notification.isRead ? 'border-gray-200' : getPriorityColor(notification.priority)
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm font-semibold ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {notification.metadata.guestName && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {notification.metadata.guestName}
                              </span>
                            )}
                            {notification.metadata.propertyName && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {notification.metadata.propertyName}
                              </span>
                            )}
                            {notification.metadata.amount && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                ${notification.metadata.amount}
                              </span>
                            )}
                            {notification.metadata.rating && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                <Star className="h-3 w-3 mr-1" />
                                {notification.metadata.rating}/5
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Mark as read"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete notification"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      
                      {/* Dropdown menu */}
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {notification.actionUrl && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Details →
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination or Load More */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
