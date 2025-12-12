'use client';

import { useState, useEffect } from 'react';
import { Bell, Package, AlertTriangle, Clock, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCount {
  totalNotifications: number;
  recentNotifications: number;
  lowStockAlerts: number;
  pendingOrders: number;
  failedNotifications: number;
  totalUnread: number;
}

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<NotificationCount>({
    totalNotifications: 0,
    recentNotifications: 0,
    lowStockAlerts: 0,
    pendingOrders: 0,
    failedNotifications: 0,
    totalUnread: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchNotificationCounts = async () => {
    try {
      const response = await fetch('/api/notifications/count');
      const data = await response.json();
      
      if (data.success) {
        setCounts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const notificationItems = [
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      count: counts.lowStockAlerts,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      href: '/admin?section=inventory&filter=lowStock'
    },
    {
      id: 'pending-orders',
      title: 'Pending Orders',
      count: counts.pendingOrders,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      href: '/admin?section=orders&status=pending'
    },
    {
      id: 'failed-notifications',
      title: 'Failed Notifications',
      count: counts.failedNotifications,
      icon: Mail,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      href: '/admin?section=overview'
    },
    {
      id: 'recent-notifications',
      title: 'Recent Notifications',
      count: counts.recentNotifications,
      icon: Bell,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      href: '/admin?section=overview'
    }
  ];

  const hasUnread = counts.totalUnread > 0;

  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {counts.totalUnread > 99 ? '99+' : counts.totalUnread}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {hasUnread ? `${counts.totalUnread} unread items` : 'All caught up!'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                <div className="space-y-1 p-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    notificationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            item.count > 0 ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => {
                            if (item.href) {
                              window.location.href = item.href;
                            }
                            setIsOpen(false);
                          }}
                        >
                          <div className={`p-2 rounded-full ${item.bgColor}`}>
                            <Icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.count === 0 
                                ? 'No items' 
                                : `${item.count} ${item.count === 1 ? 'item' : 'items'}`
                              }
                            </p>
                          </div>
                          {item.count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {item.count}
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

