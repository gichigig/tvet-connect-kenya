# Firebase Duplicate App Error - FIXED

## Issue
The HybridAuthService was trying to initialize Firebase with `initializeApp()`, but Firebase was already initialized in `src/integrations/firebase/config.ts`, causing the error:

```
FirebaseError: Firebase App named '[DEFAULT]' already exists with different options or config (app/duplicate-app).
```

## Solution Applied
Modified `src/services/HybridAuthService.ts` to:

1. **Removed duplicate Firebase initialization**: 
   - Removed `initializeApp()` call
   - Removed duplicate `firebaseConfig` object

2. **Used existing Firebase configuration**:
   - Import existing `auth` from `@/integrations/firebase/config`
   - Reuse the already initialized Firebase app

## Changes Made

### Before (causing error):
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = { /* duplicate config */ };
const firebaseApp = initializeApp(firebaseConfig); // ❌ Duplicate app
const firebaseAuth = getAuth(firebaseApp);
```

### After (fixed):
```typescript
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { firebaseApp, auth as existingAuth } from '@/integrations/firebase/config';

const firebaseAuth = existingAuth; // ✅ Use existing auth
```

## Testing
1. Open the application at `http://localhost:5175`
2. No more Firebase duplicate app error in console
3. HybridAuthService should now work properly
4. Users can login and will be created in Supabase automatically

## Technical Details
- Firebase only allows one default app per project
- The app was already initialized in `firebase/config.ts`
- HybridAuthService now reuses the existing Firebase instance
- Supabase initialization remains unchanged
- All functionality preserved while fixing the error

## Next Steps
Test the login flow to ensure:
1. No Firebase errors in console
2. Login works normally
3. Users are created in Supabase as expected
4. Both Firebase and Supabase authentication work
