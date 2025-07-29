import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gmailService, GmailMessage } from '@/integrations/gmail/gmailService';

interface GmailAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: any;
  emails: GmailMessage[];
  authenticate: () => Promise<void>;
  logout: () => Promise<void>;
  refreshEmails: () => Promise<void>;
  sendEmail: (to: string, subject: string, body: string) => Promise<boolean>;
  markAsRead: (messageId: string) => Promise<boolean>;
  archiveEmail: (messageId: string) => Promise<boolean>;
  deleteEmail: (messageId: string) => Promise<boolean>;
}

const GmailAuthContext = createContext<GmailAuthContextType | undefined>(undefined);

interface GmailAuthProviderProps {
  children: ReactNode;
}

export const GmailAuthProvider: React.FC<GmailAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [emails, setEmails] = useState<GmailMessage[]>([]);

  // Initialize Gmail service on mount
  useEffect(() => {
    const initializeGmail = async () => {
      try {
        setIsLoading(true);
        
        // Debug: Check environment variables
        console.log('Gmail API Key:', import.meta.env.VITE_GOOGLE_API_KEY ? 'Set' : 'Not set');
        console.log('Gmail Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
        
        const initialized = await gmailService.initialize();
        
        if (initialized) {
          // Check if user is already signed in
          const isSignedIn = gmailService.isUserSignedIn();
          setIsAuthenticated(isSignedIn);
          
          if (isSignedIn) {
            await loadUserProfile();
            await refreshEmails();
          }
        } else {
          console.log('Gmail initialization failed, using mock mode');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing Gmail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGmail();
  }, []);

  const authenticate = async () => {
    try {
      setIsLoading(true);
      const success = await gmailService.signIn();
      
      if (success) {
        setIsAuthenticated(true);
        await loadUserProfile();
        await refreshEmails();
      }
    } catch (error) {
      console.error('Error authenticating with Gmail:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await gmailService.signOut();
      setIsAuthenticated(false);
      setUserProfile(null);
      setEmails([]);
    } catch (error) {
      console.error('Error logging out from Gmail:', error);
      throw error;
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = gmailService.getCurrentUser();
      if (user) {
        setUserProfile({
          emailAddress: user.email,
          name: user.name,
          id: user.id,
          imageUrl: user.imageUrl
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const refreshEmails = async () => {
    try {
      setIsLoading(true);
      const fetchedEmails = await gmailService.fetchEmails(20);
      setEmails(fetchedEmails);
    } catch (error) {
      console.error('Error refreshing emails:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
    try {
      return await gmailService.sendEmail(to, subject, body);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string): Promise<boolean> => {
    try {
      const success = await gmailService.markAsRead(messageId);
      if (success) {
        // Update local state
        setEmails(prev => prev.map(email => 
          email.id === messageId ? { ...email, isRead: true } : email
        ));
      }
      return success;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  };

  const archiveEmail = async (messageId: string): Promise<boolean> => {
    try {
      const success = await gmailService.archiveEmail(messageId);
      if (success) {
        // Remove from local state
        setEmails(prev => prev.filter(email => email.id !== messageId));
      }
      return success;
    } catch (error) {
      console.error('Error archiving email:', error);
      throw error;
    }
  };

  const deleteEmail = async (messageId: string): Promise<boolean> => {
    try {
      const success = await gmailService.deleteEmail(messageId);
      if (success) {
        // Remove from local state
        setEmails(prev => prev.filter(email => email.id !== messageId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  };

  const value: GmailAuthContextType = {
    isAuthenticated,
    isLoading,
    userProfile,
    emails,
    authenticate,
    logout,
    refreshEmails,
    sendEmail,
    markAsRead,
    archiveEmail,
    deleteEmail,
  };

  return (
    <GmailAuthContext.Provider value={value}>
      {children}
    </GmailAuthContext.Provider>
  );
};

export const useGmailAuth = (): GmailAuthContextType => {
  const context = useContext(GmailAuthContext);
  if (context === undefined) {
    throw new Error('useGmailAuth must be used within a GmailAuthProvider');
  }
  return context;
};
