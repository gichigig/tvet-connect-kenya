import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'assignment' | 'payment' | 'result';
  read: boolean;
  createdAt: Date;
  data?: any;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Simplified provider for Supabase transition - no Firebase dependencies
  const [notifications] = useState<Notification[]>([]);
  const [loading] = useState(false);

  const markAsRead = async (notificationId: string) => {
    // TODO: Implement with Supabase
    console.log('Mark as read:', notificationId);
  };

  const markAllAsRead = async () => {
    // TODO: Implement with Supabase  
    console.log('Mark all as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
