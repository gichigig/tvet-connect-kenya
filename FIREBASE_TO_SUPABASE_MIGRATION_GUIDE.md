# Firebase to Supabase Migration Guide

## Overview
This document outlines the complete migration strategy from Firebase (Realtime Database + Firestore) to Supabase for the TVET Connect Kenya project.

## Migration Strategy

### Phase 1: Database Schema Setup
1. **Supabase Database Schema Creation**
2. **Row Level Security (RLS) Setup**
3. **Database Functions and Triggers**

### Phase 2: Data Migration
1. **Export Data from Firebase**
2. **Transform and Import to Supabase**
3. **Data Validation**

### Phase 3: Code Migration
1. **Replace Firebase imports with Supabase**
2. **Update database operations**
3. **Authentication migration**

### Phase 4: Testing and Validation
1. **Functional testing**
2. **Performance testing**
3. **Data integrity validation**

## Current Firebase Usage Analysis

Based on the codebase analysis, here are the Firebase services being used:

### Firebase Realtime Database
- **Attendance records**: `/attendance/{recordId}`
- **User data**: `/admins`, `/students`
- **Real-time data sync**: For attendance tracking

### Firebase Firestore
- **Notifications**: `notifications` collection
- **File metadata**: Document storage metadata
- **User profiles**: Extended user information

### Firebase Auth
- **User authentication**
- **Password reset**
- **Session management**

## Supabase Schema Design

### 1. Authentication Tables
```sql
-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  role text not null check (role in ('student', 'lecturer', 'admin', 'hod', 'registrar', 'finance')),
  admission_number text unique,
  employee_id text unique,
  course text,
  department text,
  level integer,
  year_of_study integer,
  approved boolean default false,
  blocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 2. Attendance Tables
```sql
-- Attendance records
create table public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  unit_code text not null,
  unit_name text not null,
  lecturer_id uuid references public.users(id),
  date date not null,
  total_students integer not null,
  present_students integer not null,
  attendance_rate numeric(5,2),
  fingerprint text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Individual student attendance
create table public.student_attendance (
  id uuid default gen_random_uuid() primary key,
  attendance_record_id uuid references public.attendance_records(id) on delete cascade,
  student_id uuid references public.users(id),
  present boolean not null,
  marked_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 3. Academic Tables
```sql
-- Departments
create table public.departments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Units/Courses
create table public.units (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  department_id uuid references public.departments(id),
  lecturer_id uuid references public.users(id),
  level integer,
  semester integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references public.users(id),
  title text not null,
  message text not null,
  type text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4. File Storage Tables
```sql
-- Files metadata
create table public.files (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  original_name text not null,
  size bigint not null,
  mime_type text not null,
  storage_path text not null,
  uploaded_by uuid references public.users(id),
  category text not null check (category in ('assignment', 'material', 'submission', 'notes')),
  entity_id uuid, -- Reference to assignment, unit, etc.
  entity_type text,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Row Level Security (RLS) Policies

### Users Table Policies
```sql
-- Enable RLS
alter table public.users enable row level security;

-- Users can view their own profile
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Admins can view all users
create policy "Admins can view all users" on public.users
  for select using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'admin'
    )
  );
```

### Attendance Policies
```sql
-- Enable RLS
alter table public.attendance_records enable row level security;
alter table public.student_attendance enable row level security;

-- Lecturers can manage their own attendance records
create policy "Lecturers can manage own attendance" on public.attendance_records
  for all using (lecturer_id = auth.uid());

-- Students can view their own attendance
create policy "Students can view own attendance" on public.student_attendance
  for select using (student_id = auth.uid());
```

## Migration Scripts

### 1. Firebase Data Export Script
```javascript
// export-firebase-data.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

// Export Realtime Database data
async function exportRealtimeData() {
  const db = getDatabase();
  
  // Export attendance records
  const attendanceRef = ref(db, 'attendance');
  const attendanceSnap = await get(attendanceRef);
  if (attendanceSnap.exists()) {
    fs.writeFileSync('attendance-export.json', JSON.stringify(attendanceSnap.val(), null, 2));
  }
  
  // Export users
  const usersData = {};
  const adminsRef = ref(db, 'admins');
  const studentsRef = ref(db, 'students');
  
  const adminsSnap = await get(adminsRef);
  const studentsSnap = await get(studentsRef);
  
  if (adminsSnap.exists()) usersData.admins = adminsSnap.val();
  if (studentsSnap.exists()) usersData.students = studentsSnap.val();
  
  fs.writeFileSync('users-export.json', JSON.stringify(usersData, null, 2));
}

// Export Firestore data
async function exportFirestoreData() {
  const db = getFirestore();
  
  // Export notifications
  const notificationsRef = collection(db, 'notifications');
  const notificationsSnap = await getDocs(notificationsRef);
  const notifications = notificationsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  fs.writeFileSync('notifications-export.json', JSON.stringify(notifications, null, 2));
}
```

### 2. Supabase Data Import Script
```javascript
// import-to-supabase.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importUsers() {
  const usersData = JSON.parse(fs.readFileSync('users-export.json'));
  
  // Transform and import users
  const allUsers = [
    ...Object.values(usersData.admins || {}),
    ...Object.values(usersData.students || {})
  ];
  
  for (const user of allUsers) {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName || user.first_name,
        last_name: user.lastName || user.last_name
      }
    });
    
    if (authError) {
      console.error('Auth creation failed:', authError);
      continue;
    }
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: user.email,
        first_name: user.firstName || user.first_name,
        last_name: user.lastName || user.last_name,
        role: user.role,
        admission_number: user.admissionNumber,
        employee_id: user.employeeId,
        course: user.course,
        department: user.department,
        level: user.level,
        approved: user.approved || false,
        blocked: user.blocked || false
      });
    
    if (profileError) {
      console.error('Profile creation failed:', profileError);
    }
  }
}

async function importAttendance() {
  const attendanceData = JSON.parse(fs.readFileSync('attendance-export.json'));
  
  for (const [recordId, sessions] of Object.entries(attendanceData)) {
    for (const [sessionId, session] of Object.entries(sessions)) {
      // Insert attendance record
      const { data: record, error: recordError } = await supabase
        .from('attendance_records')
        .insert({
          unit_code: session.unitCode,
          unit_name: session.unitName,
          lecturer_id: await getUserIdByEmail(session.lecturerEmail),
          date: session.date,
          total_students: session.totalStudents,
          present_students: session.presentStudents,
          attendance_rate: session.attendanceRate,
          fingerprint: session.fingerprint
        })
        .select()
        .single();
      
      if (recordError) {
        console.error('Attendance record creation failed:', recordError);
        continue;
      }
      
      // Insert individual student attendance
      if (session.students) {
        for (const student of session.students) {
          await supabase
            .from('student_attendance')
            .insert({
              attendance_record_id: record.id,
              student_id: await getUserIdByEmail(student.email),
              present: student.present
            });
        }
      }
    }
  }
}
```

## Code Migration Strategy

### 1. Create Supabase Service Layer
```typescript
// src/services/SupabaseService.ts
import { supabase } from '@/integrations/supabase/client';

export class SupabaseService {
  // User management
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Attendance management
  static async saveAttendance(attendanceData: any) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(attendanceData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Real-time subscriptions
  static subscribeToAttendance(callback: (payload: any) => void) {
    return supabase
      .channel('attendance_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance_records'
      }, callback)
      .subscribe();
  }
}
```

### 2. Replace Firebase Imports
```typescript
// Before (Firebase)
import { getDatabase, ref, push, get } from "firebase/database";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// After (Supabase)
import { supabase } from '@/integrations/supabase/client';
import { SupabaseService } from '@/services/SupabaseService';
```

### 3. Update Database Operations
```typescript
// Before (Firebase Realtime Database)
const db = getDatabase();
const attendanceRef = ref(db, `attendance/${recordId}`);
await push(attendanceRef, attendanceData);

// After (Supabase)
const { data, error } = await supabase
  .from('attendance_records')
  .insert(attendanceData);
```

## Authentication Migration

### 1. Update Auth Context
```typescript
// src/contexts/SupabaseAuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Testing Strategy

### 1. Data Integrity Tests
- Compare data between Firebase and Supabase
- Validate user counts and data completeness
- Check foreign key relationships

### 2. Functional Tests
- Authentication flows
- CRUD operations
- Real-time functionality
- File uploads

### 3. Performance Tests
- Query performance comparison
- Real-time updates latency
- Concurrent user handling

## Rollback Plan

1. **Keep Firebase active during migration**
2. **Implement feature flags for gradual rollout**
3. **Maintain data sync between systems during transition**
4. **Have rollback procedures documented**

## Timeline

### Week 1: Setup and Schema
- [ ] Create Supabase database schema
- [ ] Set up RLS policies
- [ ] Create migration scripts

### Week 2: Data Migration
- [ ] Export Firebase data
- [ ] Import to Supabase
- [ ] Validate data integrity

### Week 3: Code Migration
- [ ] Replace Firebase services
- [ ] Update authentication
- [ ] Test core functionality

### Week 4: Testing and Deployment
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Production deployment

## Benefits of Migration

1. **Cost Reduction**: Supabase is often more cost-effective
2. **Better TypeScript Support**: Auto-generated types
3. **PostgreSQL Power**: Advanced queries and relationships
4. **Real-time Features**: Built-in real-time subscriptions
5. **Better Developer Experience**: Intuitive dashboard and APIs
