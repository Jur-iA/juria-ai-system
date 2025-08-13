import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineAlerts: boolean;
  caseUpdates: boolean;
  weeklyReports: boolean;
}

export interface Notification {
  id: string;
  type: 'email' | 'push' | 'deadline' | 'case' | 'report';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  settings: NotificationSettings;
  notifications: Notification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  updateSettings: (settings: NotificationSettings) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      pushNotifications: true,
      deadlineAlerts: true,
      caseUpdates: true,
      weeklyReports: false
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved).map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    })) : [];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const refresh = async () => {
    try {
      const res = await api.get<{ ok: boolean; data: any[] }>('/api/notifications');
      const items = (res?.data || []).map((r: any) => ({
        id: r.id,
        type: (r.type === 'deadline' || r.type === 'case' || r.type === 'report' || r.type === 'push' || r.type === 'email') ? r.type : 'email',
        title: r.title || 'Notificação',
        message: r.message || '',
        timestamp: new Date(r.created_at || Date.now()),
        read: Boolean(r?.metadata?.read),
        priority: (String(r.severity || 'LOW').toLowerCase() === 'high') ? 'high' : (String(r.severity || 'LOW').toLowerCase() === 'medium' ? 'medium' : 'low'),
      })) as Notification[];
      setNotifications(items);
    } catch (_) {
      // silencioso em caso de erro
    }
  };

  // Load notifications from backend on mount
  useEffect(() => { void refresh(); }, []);

  // Request browser notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // Show browser notification
  const showBrowserNotification = (notification: Notification) => {
    if (!settings.pushNotifications) return;
    if (Notification.permission !== 'granted') return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'high'
    });

    browserNotification.onclick = () => {
      window.focus();
      markAsRead(notification.id);
      browserNotification.close();
    };

    // Auto close after 5 seconds for low/medium priority
    if (notification.priority !== 'high') {
      setTimeout(() => browserNotification.close(), 5000);
    }
  };

  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    
    // If push notifications are enabled, request permission
    if (newSettings.pushNotifications && !settings.pushNotifications) {
      requestPermission();
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    // Check if this type of notification is enabled
    const shouldShow = (
      (notification.type === 'email' && settings.emailNotifications) ||
      (notification.type === 'push' && settings.pushNotifications) ||
      (notification.type === 'deadline' && settings.deadlineAlerts) ||
      (notification.type === 'case' && settings.caseUpdates) ||
      (notification.type === 'report' && settings.weeklyReports)
    );

    if (shouldShow) {
      setNotifications(prev => [notification, ...prev]);
      showBrowserNotification(notification);
      // Persist to backend (fire-and-forget)
      const severity = notification.priority === 'high' ? 'HIGH' : (notification.priority === 'medium' ? 'MEDIUM' : 'LOW');
      void api.post('/api/notifications', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        severity,
        metadata: { read: false }
      }).catch(() => {});
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Persist to backend (fire-and-forget)
    void api.patch(`/api/notifications/${id}/read`, { metadata: { read: true } }).catch(() => {});
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Persist delete to backend (fire-and-forget)
    void api.del(`/api/notifications/${id}`).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    // Bulk delete (if supported) or ignore
    void api.del('/api/notifications').catch(() => {});
  };

  // Remove seed de demo para ambiente real (carregamos do backend)

  return (
    <NotificationContext.Provider value={{
      settings,
      notifications,
      unreadCount,
      refresh,
      updateSettings,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      requestPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
