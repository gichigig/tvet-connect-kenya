# TVET Connect Kenya - Complete Database Schema Documentation

## Overview
This document provides a comprehensive guide to the database schema for the TVET Connect Kenya application, a complete Technical and Vocational Education and Training management system.

## User Roles & Permissions

The system supports 6 distinct user roles:

1. **Admin** - Full system access and management
2. **Registrar** - Student registration, unit management, academic records
3. **HOD (Head of Department)** - Department oversight, result approval
4. **Lecturer** - Course content, assignments, grading, attendance
5. **Finance** - Fee management, payments, financial clearance
6. **Student** - Course access, submissions, results viewing

## Database Structure

### 1. Core System Tables

#### `public.profiles`
**Primary user profile table** - Extended from basic auth.users
- Contains all user information for all roles
- Links to auth.users via user_id
- Role-based access control
- Extended student fields (guardian info, academic details)

#### `public.departments`
**Academic departments/schools**
- School of Business & Economics
- School of ICT, Media & Engineering  
- School of Education, Arts & Social Sciences
- School of Hospitality

#### `public.courses`
**Available courses by department**
- Certificate, Diploma, Higher Diploma, Degree levels
- Links to departments
- Duration and credit information

### 2. Academic Management

#### `public.units`
**Course units/subjects**
- Individual subjects within courses
- Year and semester organization
- Lecturer assignments
- Prerequisites tracking
- Capacity and enrollment management

#### `public.student_unit_registrations`
**Student course registrations**
- Links students to units
- Registration approval workflow
- Academic year tracking

#### `public.semester_plans`
**Academic calendar management**
- Semester start/end dates
- Course scheduling
- Academic year organization

### 3. Learning Content & Assessments

#### `public.assignments`
**Student assignments**
- Essay, multiple choice, practical assignments
- File submissions and online submissions
- Due dates and visibility controls

#### `public.assignment_submissions`
**Student assignment submissions**
- AI detection integration
- Human review workflow
- Grading and feedback

#### `public.cats` (Continuous Assessment Tests)
**Mid-semester examinations**
- CAT 1, CAT 2, CAT 3 tracking
- Scheduling and venue management
- Question storage (JSONB)

#### `public.exams`
**Final examinations**
- Main, supplementary, special exams
- Comprehensive exam management

#### `public.notes`
**Learning materials**
- Lecturer-provided study materials
- File attachments and content

#### `public.online_classes`
**Virtual classroom sessions**
- BigBlueButton integration
- Scheduled online meetings
- Platform flexibility (Zoom, Teams, etc.)

### 4. Grading & Results

#### `public.student_results`
**Comprehensive grade management**
- CAT scores (CAT1: 30%, CAT2: 30%)
- Assignment scores (20%)
- Exam scores (70%)
- Automatic grade calculation
- HOD approval workflow

#### `public.exam_results`
**Individual exam records**
- Detailed exam performance
- Grade point calculations

#### `public.certificates` & `public.transcripts`
**Digital certificates and academic records**
- QR code verification
- PDF generation
- Academic transcript management

### 5. Attendance System

#### `public.attendance_sessions`
**Attendance tracking sessions**
- Manual and quiz-based attendance
- Location-based verification (GPS)
- Session scheduling

#### `public.quiz_attendance`
**Quiz-based attendance verification**
- Question sets for attendance
- Time-limited sessions

#### `public.student_attendance`
**Individual attendance records**
- Present/absent/late status
- Location verification
- Academic performance correlation

### 6. Financial Management

#### `public.student_fees`
**Individual student fee records**
- Tuition, exam, library, lab fees
- Unit-specific fees (retakes, supplementary)
- Payment status tracking

#### `public.fee_structures`
**Standard fee schedules**
- Course-specific fee structures
- Semester-based fees
- Academic year management

#### `public.payment_records`
**Payment transaction history**
- Receipt generation
- Multiple payment methods
- Financial audit trails

#### `public.clearance_forms`
**Student financial clearance**
- Graduation clearance
- Outstanding balance tracking

#### `public.student_cards`
**Student ID card management**
- Card activation/deactivation
- Academic year validity

### 7. System Management

#### `public.notifications`
**System-wide notifications**
- Role-based notifications
- Academic, financial, administrative alerts
- Read/unread status

#### `public.activity_logs`
**System audit trails**
- User action tracking
- Department-specific logs
- Security monitoring

#### `public.supply_requests` & `public.supply_items`
**Procurement management**
- Department supply requests
- Approval workflow
- Budget tracking

### 8. Virtual Learning

#### `public.virtual_labs`
**Virtual laboratory simulations**
- Interactive lab experiences
- Category-based organization

#### `public.experiments`
**Lab experiment tracking**
- Student progress monitoring
- Results storage

#### `public.calendar_events` & `public.reminders`
**Academic calendar**
- Event scheduling
- Automated reminders
- Personal calendars

## Security Features

### Row Level Security (RLS)
All tables implement comprehensive RLS policies:

- **Students**: Can only access their own records
- **Lecturers**: Can manage content for assigned units
- **HODs**: Departmental oversight and approval rights
- **Finance**: Fee and payment management access
- **Registrar**: Student and academic record management
- **Admin**: Full system access

### Data Protection
- Sensitive information encrypted
- Audit trails for all critical operations
- Role-based access controls
- Financial data protection

## Performance Optimizations

### Indexes
- User and role-based queries
- Academic year and semester lookups
- Financial status and payment tracking
- Attendance and performance analytics

### Triggers
- Automatic timestamp updates
- Enrollment count maintenance
- Financial status calculations
- Activity logging

## API Integration Points

### External Services
- **BigBlueButton**: Virtual classroom integration
- **AI Detection**: Assignment authenticity checking
- **Email Services**: Automated notifications
- **SMS Gateways**: Mobile notifications
- **Payment Gateways**: Fee collection

### Data Synchronization
- Real-time updates across user roles
- Automated grade calculations
- Financial status updates
- Attendance correlations

## Backup & Recovery

### Data Protection
- Regular automated backups
- Point-in-time recovery
- Geographic replication
- Data integrity verification

## Scalability Considerations

### Performance
- Horizontal scaling support
- Query optimization
- Connection pooling
- Caching strategies

### Growth Management
- Multi-campus support
- Academic year transitions
- Historical data retention
- Archive management

## Getting Started

1. **Run Master Setup Script**: Execute `master_database_setup.sql` in Supabase
2. **Create Admin User**: Use admin creation scripts
3. **Configure Departments**: Set up academic structure
4. **Import Courses**: Add course catalog
5. **User Registration**: Enable student and staff registration

## File Structure

```
database/
├── master_database_setup.sql          # Main setup script
├── complete_database_schema.sql       # Full table definitions
├── rls_policies.sql                   # Security policies
├── database_indexes_triggers.sql      # Performance optimization
└── initial_data_seed.sql              # Sample data
```

## Support & Maintenance

### Regular Tasks
- Database maintenance
- Performance monitoring
- Security updates
- Backup verification

### Troubleshooting
- Query performance analysis
- User access issues
- Data integrity checks
- System monitoring

---

## Summary

This comprehensive database schema provides a complete foundation for managing all aspects of a TVET institution, from student registration and academic management to financial tracking and virtual learning. The system is designed for scalability, security, and ease of use across all user roles.
