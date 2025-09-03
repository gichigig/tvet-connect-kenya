/**
 * Supabase Notifications Hook
 * Replaces Firebase Firestore notifications with Supabase real-time notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseNotifications, type Notification } from '@/services/SupabaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useSupabaseAuth';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  createNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (
  unreadOnly: boolean = false,
  autoRefresh: boolean = true
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await SupabaseNotifications.getUserNotifications(user.id, unreadOnly);
      setNotifications(data);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load notifications';
      setError(errorMessage);
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, unreadOnly]);

  const createNotification = useCallback(async (
    notification: Omit<Notification, 'id' | 'created_at'>
  ) => {
    try {
      await SupabaseNotifications.createNotification(notification);
      await loadNotifications(); // Refresh list
      
      toast({
        title: 'Notification Sent',
        description: 'Notification has been sent successfully.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create notification';
      setError(errorMessage);
      toast({
        title: 'Failed to Send',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [loadNotifications, toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await SupabaseNotifications.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to mark notification as read';
      setError(errorMessage);
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await SupabaseNotifications.markAllNotificationsAsRead(user.id);
      
      // Update local state
      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || now }))
      );

      toast({
        title: 'All Read',
        description: 'All notifications marked as read.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to mark all notifications as read';
      setError(errorMessage);
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await SupabaseNotifications.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: 'Deleted',
        description: 'Notification deleted successfully.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete notification';
      setError(errorMessage);
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !autoRefresh) return;

    const channel = SupabaseNotifications.subscribeToNotifications(user.id, (payload) => {
      console.log('Notification update received:', payload);
      
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT' && newRecord) {
        // Add new notification to the list
        setNotifications(prev => [newRecord as Notification, ...prev]);
        
        // Show toast for new notification
        toast({
          title: newRecord.title,
          description: newRecord.message,
          duration: 5000,
        });
      } else if (eventType === 'UPDATE' && newRecord) {
        // Update existing notification
        setNotifications(prev =>
          prev.map(n => n.id === newRecord.id ? newRecord as Notification : n)
        );
      } else if (eventType === 'DELETE' && oldRecord) {
        // Remove deleted notification
        setNotifications(prev => prev.filter(n => n.id !== oldRecord.id));
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, autoRefresh, toast]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};

/**
 * Hook for sending notifications to multiple users
 */
export const useNotificationSender = () => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendNotification = useCallback(async (
    recipientIds: string[],
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    data?: any
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to send notifications.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      const promises = recipientIds.map(recipientId =>
        SupabaseNotifications.createNotification({
          recipient_id: recipientId,
          sender_id: user.id,
          title,
          message,
          type,
          data,
        })
      );

      await Promise.all(promises);

      toast({
        title: 'Notifications Sent',
        description: `Successfully sent notifications to ${recipientIds.length} users.`,
      });
    } catch (error: any) {
      console.error('Error sending notifications:', error);
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send notifications.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSending(false);
    }
  }, [user, toast]);

  const sendBulkNotification = useCallback(async (
    userRole: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    data?: any
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to send notifications.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      // This would need to be implemented in the backend
      // as a single API call to avoid fetching all users on the frontend
      toast({
        title: 'Bulk Notification',
        description: 'Bulk notification feature needs backend implementation.',
        variant: 'destructive',
      });
    } catch (error: any) {
      console.error('Error sending bulk notification:', error);
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send bulk notification.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSending(false);
    }
  }, [user, toast]);

  return {
    sending,
    sendNotification,
    sendBulkNotification,
  };
};
