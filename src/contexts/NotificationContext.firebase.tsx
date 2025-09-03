import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { useAuth } from './SupabaseAuthContext';
import { firebaseApp } from '@/integrations/firebase/config';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'assignment' | 'payment' | 'result';
  read: boolean;
  createdAt: Date;
  data?: any; // Additional data for the notification
  actionUrl?: string; // URL to navigate when notification is clicked
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to avoid loading state issues
  
  // Get auth context safely with error handling
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Delay auth context access to avoid timing issues
    setTimeout(() => {
      try {
        const authContext = useAuth();
        setUser(authContext.user);
      } catch (error) {
        console.log('Auth context not ready yet:', error);
        setUser(null);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const db = getFirestore(firebaseApp);
    const notificationsRef = collection(db, 'notifications');
    
    // Query notifications for the current user, ordered by creation date (newest first)
    const q = query(
      notificationsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to last 50 notifications
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationList.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          read: data.read || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          data: data.data,
          actionUrl: data.actionUrl
        });
      });
      setNotifications(notificationList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      const db = getFirestore(firebaseApp);
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const db = getFirestore(firebaseApp);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      const promises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        return updateDoc(notificationRef, { read: true });
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
