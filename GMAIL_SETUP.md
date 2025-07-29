# Gmail Integration Setup Guide

This guide will help you set up Gmail integration for the TVET Connect Kenya email management system using the browser-compatible Google APIs JavaScript client.

## Prerequisites

1. Google Cloud Console account
2. Gmail account
3. The following packages are already installed:
   - `gapi-script` (Browser-compatible Google API client)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "TVET Connect Kenya")
4. Click "Create"

### 2. Enable Gmail API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and then click "Enable"

### 3. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key for later use
4. (Optional) Restrict the API key to specific APIs for security

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" for user type
   - Fill in the required information:
     - App name: "TVET Connect Kenya"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: Select "Add or Remove Scopes" and add:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Add test users if needed
4. After configuring the consent screen, create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "TVET Connect Kenya Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:8080`
     - `http://localhost:8081`
     - `http://localhost:8082`
     - `http://localhost:8083`
     - `http://localhost:8084`
     - `http://localhost:5173`
     - Add your production domain when deploying
   - Authorized redirect URIs:
     - `http://localhost:8080/auth/callback`
     - `http://localhost:8081/auth/callback`
     - `http://localhost:8082/auth/callback`
     - `http://localhost:8083/auth/callback`
     - `http://localhost:8084/auth/callback`

### 5. Configure Environment Variables

1. Copy the `.env.example` file to `.env`
2. Fill in your Google credentials:

```env
# Gmail Integration Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 6. OAuth Consent Screen Configuration

For development and testing:
- Set the publishing status to "Testing"
- Add test user emails that will be able to authenticate

For production:
- Submit your app for verification
- Set publishing status to "In production"

## Features

### Current Implementation

✅ **Gmail Authentication**
- Browser-based OAuth 2.0 flow
- Secure authentication with Google Sign-In
- Automatic session management

✅ **Email Reading**
- Fetch inbox emails
- Read email content
- View attachments info
- Email threading support

✅ **Email Management**
- Mark as read/unread
- Archive emails
- Delete emails (move to trash)
- Real-time email state updates

✅ **Email Composition**
- Send new emails via Gmail
- Plain text composition
- Recipient validation

✅ **Fallback Mode**
- Mock emails when not connected to Gmail
- Seamless switching between modes
- Development-friendly testing

### Gmail API Scopes Used

- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/gmail.modify` - Modify email labels (mark as read, archive)

## Usage

### 1. Connect to Gmail

1. Navigate to the HOD Dashboard
2. Go to the "Emails" tab
3. Click "Connect Gmail" button
4. Complete the Google Sign-In flow
5. Grant the required permissions

### 2. Email Management

Once connected, you can:
- View real Gmail emails in your inbox
- Send emails directly through Gmail
- Manage emails (read, archive, delete)
- Compose new emails

### 3. Disconnect Gmail

- Click "Disconnect Gmail" to sign out and return to mock mode

## Technical Implementation

### Browser Compatibility

The integration uses `gapi-script` which provides:
- Cross-browser compatibility
- No server-side dependencies
- Secure client-side authentication
- Real-time API access

### Security Considerations

1. **Client-Side Authentication**: All authentication happens in the browser
2. **HTTPS Required**: Use HTTPS in production for security
3. **Scope Limitation**: Only necessary Gmail scopes are requested
4. **Token Management**: Tokens are managed by Google's client library

## Troubleshooting

### Common Issues

1. **"Origin mismatch"**
   - Ensure your domain is added to authorized JavaScript origins
   - Check for correct protocol (http vs https)

2. **"Access blocked: This app's request is invalid"**
   - Make sure Gmail API is enabled
   - Check OAuth consent screen configuration
   - Verify API key is correct

3. **"Unauthorized client"**
   - Verify your Client ID is correct
   - Check environment variables are properly loaded
   - Ensure OAuth client is configured for web application

4. **Email not loading**
   - Check browser console for API errors
   - Verify user has granted necessary permissions
   - Ensure user is properly signed in

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
window.gapi_debug = true;
```

## Production Deployment

### 1. Update OAuth Settings

1. Add your production domain to authorized JavaScript origins
2. Update environment variables for production
3. Test authentication flow on production domain

### 2. App Verification

For production use, you may need to verify your app with Google:
1. Submit your app for verification in Google Cloud Console
2. Provide required documentation
3. Wait for approval (can take several days)

### 3. Rate Limits

Gmail API has usage quotas:
- 1,000,000,000 quota units per day
- 250 quota units per user per second

Monitor usage in Google Cloud Console.

## API Reference

### GmailService Methods

```typescript
// Initialize the service
await gmailService.initialize();

// Sign in user
await gmailService.signIn();

// Check if signed in
gmailService.isUserSignedIn();

// Get current user
const user = gmailService.getCurrentUser();

// Fetch emails
const emails = await gmailService.fetchEmails(20, 'in:inbox');

// Send email
await gmailService.sendEmail(to, subject, body);

// Mark as read
await gmailService.markAsRead(messageId);

// Archive email
await gmailService.archiveEmail(messageId);

// Delete email
await gmailService.deleteEmail(messageId);

// Sign out
await gmailService.signOut();
```

### React Hooks

```typescript
import { useGmailAuth } from '@/contexts/GmailAuthContext';

const {
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
  deleteEmail
} = useGmailAuth();
```

## Troubleshooting

### Cross-Origin-Opener-Policy (COOP) Errors

If you see errors like "Cross-Origin-Opener-Policy policy would block the window.closed call":

1. **Check Authorized Origins**: Make sure your Google OAuth client includes the correct localhost port:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add all development ports to "Authorized JavaScript origins":
     - `http://localhost:8080`
     - `http://localhost:8081`
     - `http://localhost:8082`
     - `http://localhost:8083`
     - `http://localhost:8084`

2. **Clear Browser Cache**: Clear your browser cache and cookies for localhost

3. **Restart Development Server**: Restart your Vite development server

4. **Check Environment Variables**: Ensure your `.env` file has the correct credentials

### Authentication Fails

1. **Verify API Key**: Check that your Google API key is correct and has Gmail API enabled
2. **Check OAuth Consent Screen**: Ensure your email is added as a test user
3. **Verify Scopes**: Make sure the OAuth consent screen includes all required Gmail scopes

## Support

For additional help:
1. Check Google Cloud Console documentation
2. Review Gmail API documentation
3. Check the browser console for error messages
4. Verify environment variables are correctly set

## License

This Gmail integration is part of the TVET Connect Kenya project and follows the same license terms.
