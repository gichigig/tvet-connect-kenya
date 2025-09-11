// Notification utilities for the application
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipient_type: 'all' | 'students' | 'lecturers' | 'hods' | 'registrar' | 'finance' | 'admin';
  recipient_ids?: string[];
  sender_id: string;
  sender_name: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  metadata?: any;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: Notification['type'];
  recipient_type: Notification['recipient_type'];
  recipient_ids?: string[];
  sender_id: string;
  sender_name: string;
  priority: Notification['priority'];
  expires_at?: string;
  metadata?: any;
}

/**
 * Send a notification to specific users or user groups
 */
export const sendNotification = async (notificationData: CreateNotificationData): Promise<string> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notificationData,
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

/**
 * Create a notification (alias for sendNotification)
 */
export const createNotification = sendNotification;

/**
 * Send notification to all users
 */
export const sendNotificationToAll = async (
  title: string,
  message: string,
  type: Notification['type'],
  senderId: string,
  senderName: string,
  priority: Notification['priority'] = 'normal'
): Promise<string> => {
  return sendNotification({
    title,
    message,
    type,
    recipient_type: 'all',
    sender_id: senderId,
    sender_name: senderName,
    priority
  });
};

/**
 * Send notification to students only
 */
export const sendNotificationToStudents = async (
  title: string,
  message: string,
  type: Notification['type'],
  senderId: string,
  senderName: string,
  priority: Notification['priority'] = 'normal',
  specificStudentIds?: string[]
): Promise<string> => {
  return sendNotification({
    title,
    message,
    type,
    recipient_type: 'students',
    recipient_ids: specificStudentIds,
    sender_id: senderId,
    sender_name: senderName,
    priority
  });
};

/**
 * Send notification to lecturers only
 */
export const sendNotificationToLecturers = async (
  title: string,
  message: string,
  type: Notification['type'],
  senderId: string,
  senderName: string,
  priority: Notification['priority'] = 'normal',
  specificLecturerIds?: string[]
): Promise<string> => {
  return sendNotification({
    title,
    message,
    type,
    recipient_type: 'lecturers',
    recipient_ids: specificLecturerIds,
    sender_id: senderId,
    sender_name: senderName,
    priority
  });
};

/**
 * Send notification to HODs only
 */
export const sendNotificationToHods = async (
  title: string,
  message: string,
  type: Notification['type'],
  senderId: string,
  senderName: string,
  priority: Notification['priority'] = 'normal'
): Promise<string> => {
  return sendNotification({
    title,
    message,
    type,
    recipient_type: 'hods',
    sender_id: senderId,
    sender_name: senderName,
    priority
  });
};

/**
 * Send notification to registrar office only
 */
export const sendNotificationToRegistrar = async (
  title: string,
  message: string,
  type: Notification['type'],
  senderId: string,
  senderName: string,
  priority: Notification['priority'] = 'normal'
): Promise<string> => {
  return sendNotification({
    title,
    message,
    type,
    recipient_type: 'registrar',
    sender_id: senderId,
    sender_name: senderName,
    priority
  });
};

/**
 * Send notification to finance office only
 */
export const sendNotificationToFinance = async (
  title: string,
  message: string,
  type: Notification['type'],
  senderId: string,
  senderName: string,
  priority: Notification['priority'] = 'normal'
): Promise<string> => {
  return sendNotification({
    title,
    message,
    type,
    recipient_type: 'finance',
    sender_id: senderId,
    sender_name: senderName,
    priority
  });
};

/**
 * Get notifications for a specific user
 */
export const getNotificationsForUser = async (userId: string, userRole: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`recipient_type.eq.all,recipient_type.eq.${userRole},recipient_ids.cs.{${userId}}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

/**
 * Mark multiple notifications as read
 */
export const markNotificationsAsRead = async (notificationIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', notificationIds);

  if (error) throw error;
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
};

/**
 * Delete expired notifications
 */
export const deleteExpiredNotifications = async (): Promise<void> => {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .lt('expires_at', now);

  if (error) throw error;
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: string, userRole: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .or(`recipient_type.eq.all,recipient_type.eq.${userRole},recipient_ids.cs.{${userId}}`)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
};

/**
 * Subscribe to real-time notifications for a user
 */
export const subscribeToNotifications = (
  userId: string,
  userRole: string,
  callback: (notifications: Notification[]) => void
) => {
  const subscription = supabase
    .channel('user_notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications'
      },
      async () => {
        const notifications = await getNotificationsForUser(userId, userRole);
        callback(notifications);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Send timetable change notification
 */
export const sendTimetableChangeNotification = async (
  changes: string,
  senderId: string,
  senderName: string,
  affectedStudents?: string[]
): Promise<string> => {
  return sendNotificationToStudents(
    'Timetable Update',
    `Your class schedule has been updated: ${changes}`,
    'info',
    senderId,
    senderName,
    'high',
    affectedStudents
  );
};

/**
 * Send exam schedule notification
 */
export const sendExamScheduleNotification = async (
  examDetails: string,
  senderId: string,
  senderName: string,
  affectedStudents?: string[]
): Promise<string> => {
  return sendNotificationToStudents(
    'Exam Schedule Update',
    `Exam schedule update: ${examDetails}`,
    'warning',
    senderId,
    senderName,
    'urgent',
    affectedStudents
  );
};

/**
 * Send assignment deadline reminder
 */
export const sendAssignmentDeadlineReminder = async (
  assignmentTitle: string,
  deadline: string,
  senderId: string,
  senderName: string,
  affectedStudents?: string[]
): Promise<string> => {
  return sendNotificationToStudents(
    'Assignment Deadline Reminder',
    `Reminder: "${assignmentTitle}" is due on ${deadline}`,
    'warning',
    senderId,
    senderName,
    'normal',
    affectedStudents
  );
};

/**
 * Send fee payment reminder
 */
export const sendFeePaymentReminder = async (
  amount: number,
  dueDate: string,
  senderId: string,
  senderName: string,
  affectedStudents?: string[]
): Promise<string> => {
  return sendNotificationToStudents(
    'Fee Payment Reminder',
    `Your fee payment of $${amount} is due on ${dueDate}. Please make payment to avoid late fees.`,
    'warning',
    senderId,
    senderName,
    'high',
    affectedStudents
  );
};

/**
 * Send grade released notification
 */
export const sendGradeReleasedNotification = async (
  unitName: string,
  assessmentType: string,
  senderId: string,
  senderName: string,
  affectedStudents?: string[]
): Promise<string> => {
  return sendNotificationToStudents(
    'Grades Released',
    `Your ${assessmentType} grades for ${unitName} have been released. Check your student portal.`,
    'success',
    senderId,
    senderName,
    'normal',
    affectedStudents
  );
};
