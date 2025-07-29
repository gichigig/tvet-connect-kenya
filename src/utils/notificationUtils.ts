import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/integrations/firebase/config';
import { Notification } from '@/contexts/NotificationContext';

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'assignment' | 'payment' | 'result';
  actionUrl?: string;
  data?: any;
}

/**
 * Create a new notification in Firestore
 */
export async function createNotification(notificationData: CreateNotificationData): Promise<string> {
  try {
    const db = getFirestore(firebaseApp);
    const notificationsRef = collection(db, 'notifications');
    
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    });
    
    console.log('Notification created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create sample notifications for testing
 */
export async function createSampleNotifications(userId: string) {
  const sampleNotifications: Omit<CreateNotificationData, 'userId'>[] = [
    {
      title: 'Welcome to TVET Connect Kenya!',
      message: 'Your account has been successfully created. Explore courses and start your learning journey.',
      type: 'success',
      actionUrl: '/'
    },
    {
      title: 'New Assignment Available',
      message: 'A new assignment has been posted for Computer Science 101. Due date: December 30, 2024.',
      type: 'assignment',
      actionUrl: '/assignments'
    },
    {
      title: 'Fee Payment Reminder',
      message: 'Your semester fee payment is due in 3 days. Please make payment to avoid late fees.',
      type: 'payment',
      actionUrl: '/payments'
    },
    {
      title: 'Exam Results Published',
      message: 'Your exam results for Semester 1 are now available. Check your performance in the results section.',
      type: 'result',
      actionUrl: '/results'
    },
    {
      title: 'System Maintenance Notice',
      message: 'Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM. Some services may be unavailable.',
      type: 'warning'
    },
    {
      title: 'New Course Announcement',
      message: 'Exciting new courses in Data Science and Machine Learning are now available for enrollment.',
      type: 'announcement',
      actionUrl: '/courses'
    }
  ];

  try {
    const promises = sampleNotifications.map(notification => 
      createNotification({ ...notification, userId })
    );
    
    await Promise.all(promises);
    console.log('Sample notifications created successfully');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    throw error;
  }
}

/**
 * Create notification for lecturer when unit is assigned
 */
export async function notifyLecturerOfUnitAssignment(lecturerId: string, unitCode: string, unitName: string) {
  try {
    await createNotification({
      userId: lecturerId,
      title: 'New Unit Assigned',
      message: `You have been assigned to teach ${unitCode} - ${unitName}. You can now manage coursework for this unit.`,
      type: 'assignment',
      actionUrl: '/lecturer-dashboard?tab=units'
    });
  } catch (error) {
    console.error('Error notifying lecturer of unit assignment:', error);
  }
}

/**
 * Create notification for students when new units are available for their course
 */
export async function notifyStudentsOfNewUnits(studentIds: string[], unitCount: number, course: string, year: number) {
  try {
    const promises = studentIds.map(studentId => 
      createNotification({
        userId: studentId,
        title: 'New Units Available',
        message: `${unitCount} new unit(s) are now available for ${course} Year ${year}. Register now to secure your spot.`,
        type: 'info',
        actionUrl: '/student-dashboard?tab=unit-registration'
      })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error notifying students of new units:', error);
  }
}

/**
 * Create notification when lecturer adds coursework
 */
export async function notifyStudentsOfNewCoursework(studentIds: string[], lecturerName: string, unitCode: string, courseworkType: string, title: string) {
  try {
    const promises = studentIds.map(studentId => 
      createNotification({
        userId: studentId,
        title: `New ${courseworkType} - ${unitCode}`,
        message: `${lecturerName} has added a new ${courseworkType}: "${title}" for ${unitCode}.`,
        type: courseworkType === 'assignment' ? 'assignment' : 'info',
        actionUrl: '/student-dashboard?tab=units'
      })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error notifying students of new coursework:', error);
  }
}
