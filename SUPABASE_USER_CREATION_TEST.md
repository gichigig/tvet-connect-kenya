# Supabase User Creation Integration Test Guide

## Overview
After integrating the HybridAuthService into the AuthContext, users should now be automatically created in Supabase when they login with Firebase credentials.

## What Changed
1. **AuthHelpers.tsx Updated**: Added HybridAuthService integration to the login flow
2. **Automatic Migration**: Users logging in with email addresses will trigger Supabase user creation
3. **Fallback Support**: Existing Firebase and realtime database authentication still works

## Testing Steps

### Step 1: Login with Email
1. Open the application at `http://localhost:5175`
2. Login with an email-based account (e.g., user@example.com)
3. Check browser console for these messages:
   - `🔄 Attempting hybrid authentication...`
   - `✅ Hybrid authentication successful, user created/migrated in Supabase`

### Step 2: Verify Supabase User Creation
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to Authentication → Users
3. You should see the new user created with:
   - Email address
   - User ID from Firebase
   - Created timestamp

### Step 3: Check User Profile in Database
1. Go to Supabase → Table Editor → `profiles` table
2. Look for a new profile record with:
   - `id` matching the auth user ID
   - `email` from the login
   - `full_name` extracted from displayName (if available)
   - `created_at` timestamp

### Step 4: Test Different Login Methods
1. **Email Login**: Should create Supabase user + Firebase auth
2. **Username Login**: Should use realtime DB + attempt Supabase migration
3. **Admin Login**: Should create both Firebase and Supabase accounts

## Expected Console Output
```
🔐 Login attempt with identifier: user@example.com, role: undefined
🔄 Attempting hybrid authentication...
✅ Firebase authentication successful
✅ User created/migrated to Supabase
✅ Hybrid authentication successful, user created/migrated in Supabase
```

## Troubleshooting

### If Users Are Not Created in Supabase:
1. Check browser console for error messages
2. Verify environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Check network tab for failed API calls
4. Verify Supabase project is active and accessible

### Common Issues:
1. **Environment Variables**: Make sure Vite can access the VITE_* prefixed variables
2. **CORS Issues**: Check if Supabase allows requests from localhost
3. **RLS Policies**: Ensure Row Level Security policies allow user creation
4. **Network Issues**: Verify internet connection to Supabase

## Migration Progress Tracking
The HybridAuthService also provides migration progress tracking:
- Users migrated from Firebase to Supabase
- Authentication method used (Firebase vs Supabase)
- Migration status and errors

## Next Steps
1. Test user creation with different account types
2. Verify data synchronization between Firebase and Supabase
3. Implement data migration for existing users
4. Deploy database schema if not already done

## API Server Requirements
- API server should be running on port 3001
- Migration endpoints available at `/api/auth-migration/`
- Firebase Admin SDK properly configured
