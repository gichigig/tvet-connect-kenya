# Manual Migration Guide - Using Supabase Dashboard

## Step 1: Deploy Schema via Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Open your project**: `ympnvccreuhxouyovszg`
3. **Navigate to**: SQL Editor (from left sidebar)
4. **Copy the schema** from `supabase-schema.sql` and paste it into the SQL editor
5. **Run the schema** by clicking "Run"

## Step 2: Verify Schema Deployment

After running the schema, check the Tables tab to verify these tables were created:
- users
- departments  
- units
- student_unit_registrations
- attendance_sessions
- student_attendance
- notifications
- files
- assignments
- submissions
- grades

## Step 3: Export Firebase Data

Run the export script to get your current Firebase data:

```bash
node scripts/export-firebase-data.js
```

This will create a `firebase-export.json` file with all your data.

## Step 4: Import Data to Supabase

```bash
node scripts/import-to-supabase.js
```

This will read the exported data and import it to your Supabase database.

## Step 5: Update Your Application

Replace Firebase imports in your application with the new Supabase services:

### Authentication
```typescript
// OLD: Firebase Auth
import { auth } from '@/integrations/firebase/config';

// NEW: Supabase Auth
import { useAuth } from '@/hooks/useSupabaseAuth';
```

### Database Operations
```typescript
// OLD: Firebase/Firestore
import { db } from '@/integrations/firebase/config';

// NEW: Supabase Services
import { SupabaseAttendance, SupabaseUsers } from '@/services/SupabaseService';
```

## Step 6: Test the Migration

1. **Test Authentication**: Login with existing credentials
2. **Test Real-time**: Check if attendance updates work in real-time
3. **Test File Upload**: Use the R2 storage integration
4. **Test Notifications**: Send and receive notifications

## Ready to Start?

Would you like to proceed with this manual approach? I can guide you through each step.
