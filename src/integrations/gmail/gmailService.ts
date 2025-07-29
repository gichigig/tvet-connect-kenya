import { gapi } from 'gapi-script';

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
  labels: string[];
}

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

class GmailService {
  private isInitialized = false;
  private isSignedIn = false;

  /**
   * Wait for auth2 to be ready
   */
  private async waitForAuth2(maxRetries = 20, delay = 250): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
          return true;
        }
      } catch (error) {
        // Auth2 not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    console.warn('Auth2 instance not available after waiting. Gmail will use mock mode.');
    return false;
  }

  /**
   * Initialize the Gmail service with Google API
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Check if gapi is available
      if (typeof gapi === 'undefined') {
        console.warn('Google API (gapi) not available. Gmail integration will use mock mode.');
        return false;
      }

      // Check environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!apiKey || !clientId) {
        console.warn('Gmail API credentials not configured. Gmail integration will use mock mode:', {
          apiKey: apiKey ? 'Set' : 'Missing',
          clientId: clientId ? 'Set' : 'Missing'
        });
        return false;
      }

      // Load Google API client with timeout
      await Promise.race([
        new Promise((resolve, reject) => {
          gapi.load('client:auth2', {
            callback: resolve,
            onerror: reject,
          });
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Google API load timeout')), 10000)
        )
      ]);

      // Initialize the client with timeout
      await Promise.race([
        gapi.client.init({
          apiKey: apiKey,
          clientId: clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
          ux_mode: 'popup',
          redirect_uri: `${window.location.origin}/auth/callback`
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Google client init timeout')), 10000)
        )
      ]);

      // Wait for auth2 to be ready
      const auth2Ready = await this.waitForAuth2();
      if (!auth2Ready) {
        console.warn('Auth2 not ready, Gmail will use mock mode');
        return false;
      }

      this.isInitialized = true;
      
      // Check if auth2 is available and get sign-in status
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        this.isSignedIn = authInstance.isSignedIn.get();
      } else {
        this.isSignedIn = false;
      }
      
      console.log('Gmail service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail service:', error);
      return false;
    }
  }

  /**
   * Sign in to Gmail
   */
  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          console.warn('Gmail not initialized, cannot sign in');
          return false;
        }
      }

      // Wait for auth2 to be ready if it's not available immediately
      const auth2Ready = await this.waitForAuth2();
      if (!auth2Ready) {
        console.warn('Auth2 not ready, cannot sign in');
        return false;
      }

      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        console.warn('Google Auth instance not available after waiting');
        return false;
      }
      
      if (!authInstance.isSignedIn.get()) {
        // Try popup first, fallback to redirect if it fails
        try {
          await authInstance.signIn({
            ux_mode: 'popup',
            prompt: 'select_account'
          });
        } catch (popupError) {
          console.warn('Popup auth failed, trying redirect mode:', popupError);
          // Fallback to redirect mode
          await authInstance.signIn({
            ux_mode: 'redirect',
            prompt: 'select_account'
          });
        }
      }
      
      this.isSignedIn = authInstance.isSignedIn.get();
      return this.isSignedIn;
    } catch (error) {
      console.error('Failed to sign in to Gmail:', error);
      return false;
    }
  }

  /**
   * Sign out from Gmail
   */
  async signOut(): Promise<void> {
    try {
      if (this.isInitialized) {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
          await authInstance.signOut();
          this.isSignedIn = false;
        }
      }
    } catch (error) {
      console.error('Failed to sign out from Gmail:', error);
    }
  }

  /**
   * Check if user is signed in
   */
  isUserSignedIn(): boolean {
    return this.isSignedIn && this.isInitialized;
  }

  /**
   * Get current user profile
   */
  getCurrentUser() {
    if (!this.isSignedIn || !this.isInitialized) {
      return null;
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      return null;
    }
    
    const user = authInstance.currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  }

  /**
   * Fetch emails from Gmail
   */
  async fetchEmails(maxResults: number = 10, query?: string): Promise<GmailMessage[]> {
    if (!this.isUserSignedIn()) {
      throw new Error('User not signed in to Gmail');
    }

    try {
      // List messages
      const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: query || 'in:inbox',
      });

      const messages = response.result.messages || [];
      const emailPromises = messages.map((message: any) => this.getMessageDetails(message.id));
      
      return await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Get detailed message information
   */
  private async getMessageDetails(messageId: string): Promise<GmailMessage> {
    try {
      const response = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const message = response.result;
      const headers = message.payload?.headers || [];
      
      // Extract header information
      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      // Extract message body
      const body = this.extractMessageBody(message.payload);
      
      // Check if message is read
      const isRead = !message.labelIds?.includes('UNREAD');
      
      // Check for attachments
      const hasAttachments = this.hasAttachments(message.payload);

      return {
        id: message.id || '',
        threadId: message.threadId || '',
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        snippet: message.snippet || '',
        body: body,
        date: new Date(parseInt(message.internalDate || '0')).toISOString(),
        isRead: isRead,
        hasAttachments: hasAttachments,
        labels: message.labelIds || [],
      };
    } catch (error) {
      console.error('Error getting message details:', error);
      throw error;
    }
  }

  /**
   * Extract message body from payload
   */
  private extractMessageBody(payload: any): string {
    let body = '';

    if (payload?.body?.data) {
      body = this.base64Decode(payload.body.data);
    } else if (payload?.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = this.base64Decode(part.body.data);
          break;
        } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
          body = this.base64Decode(part.body.data);
        }
      }
    }

    return body;
  }

  /**
   * Decode base64 data
   */
  private base64Decode(data: string): string {
    try {
      // Gmail uses URL-safe base64 encoding
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      console.error('Error decoding base64:', error);
      return data;
    }
  }

  /**
   * Check if message has attachments
   */
  private hasAttachments(payload: any): boolean {
    if (payload?.parts) {
      return payload.parts.some((part: any) => 
        part.filename && part.filename.length > 0
      );
    }
    return false;
  }

  /**
   * Send an email
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.isUserSignedIn()) {
      throw new Error('User not signed in to Gmail');
    }

    try {
      // Create email message in RFC2822 format
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\r\n');

      // Encode the email
      const encodedEmail = btoa(email)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedEmail,
        },
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    if (!this.isUserSignedIn()) {
      throw new Error('User not signed in to Gmail');
    }

    try {
      await gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        resource: {
          removeLabelIds: ['UNREAD'],
        },
      });
      return true;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  /**
   * Archive email
   */
  async archiveEmail(messageId: string): Promise<boolean> {
    if (!this.isUserSignedIn()) {
      throw new Error('User not signed in to Gmail');
    }

    try {
      await gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        resource: {
          removeLabelIds: ['INBOX'],
        },
      });
      return true;
    } catch (error) {
      console.error('Error archiving email:', error);
      throw error;
    }
  }

  /**
   * Delete email (move to trash)
   */
  async deleteEmail(messageId: string): Promise<boolean> {
    if (!this.isUserSignedIn()) {
      throw new Error('User not signed in to Gmail');
    }

    try {
      await gapi.client.gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile() {
    if (!this.isUserSignedIn()) {
      throw new Error('User not signed in to Gmail');
    }

    try {
      const response = await gapi.client.gmail.users.getProfile({
        userId: 'me',
      });
      return response.result;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

export const gmailService = new GmailService();
