-- =============================================
-- INITIAL DATA SEEDING FOR TVET CONNECT KENYA
-- =============================================
-- This script seeds the database with initial data for departments, courses, and system setup

-- =============================================
-- 1. DEPARTMENTS DATA
-- =============================================

-- Insert departments if they don't exist
INSERT INTO public.departments (name, code, description) 
VALUES 
  ('School of Business & Economics', 'SBE', 'Department of Business Administration, Commerce, Accounting, and Economics'),
  ('School of ICT, Media & Engineering', 'SICME', 'Department of Information Technology, Computer Science, Media Studies, and Engineering'),
  ('School of Education, Arts & Social Sciences', 'SEASS', 'Department of Education, Arts, Psychology, Sociology, and Social Sciences'),
  ('School of Health Sciences', 'SHS', 'Department of Health Sciences, Medical Studies, and Healthcare Management'),
  ('School of Hospitality', 'SH', 'Department of Hospitality Management, Tourism, and Food Science'),
  ('School of Development & Social Sciences', 'SDSS', 'Department of Development Studies, Social Work, and Community Development'),
  ('School of Media Arts & Communication', 'SMAC', 'Department of Media Studies, Journalism, and Communication')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. COURSES DATA
-- =============================================

-- Get department IDs for foreign key relationships
WITH dept_ids AS (
  SELECT id, code FROM public.departments
)

-- Insert courses for School of Business & Economics
INSERT INTO public.courses (name, code, description, department_id, level, duration_months, credits)
SELECT 
  course_data.name,
  course_data.code,
  course_data.description,
  dept_ids.id,
  course_data.level,
  course_data.duration_months,
  course_data.credits
FROM dept_ids,
(VALUES 
  ('Bachelor of Business Administration and Management', 'BBAM', 'Comprehensive business management program covering all aspects of business operations', 'degree', 48, 240),
  ('Bachelor of Commerce', 'BCOM', 'Commerce and trade-focused degree program', 'degree', 48, 240),
  ('Bachelor of Accounting and Finance', 'BAF', 'Professional accounting and finance degree program', 'degree', 48, 240),
  ('Diploma in Business Management & Administration', 'DBMA', 'Business management and administration diploma program', 'diploma', 24, 120),
  ('Diploma in Accounting & Finance', 'DAF', 'Accounting and finance diploma program', 'diploma', 24, 120),
  ('Diploma in Human Resources', 'DHR', 'Human resource management diploma program', 'diploma', 24, 120),
  ('Certificate in Business Management', 'CBM', 'Basic business management certificate program', 'certificate', 12, 60)
) AS course_data(name, code, description, level, duration_months, credits)
WHERE dept_ids.code = 'SBE'
ON CONFLICT (code) DO NOTHING;

-- Insert courses for School of ICT, Media & Engineering
INSERT INTO public.courses (name, code, description, department_id, level, duration_months, credits)
SELECT 
  course_data.name,
  course_data.code,
  course_data.description,
  dept_ids.id,
  course_data.level,
  course_data.duration_months,
  course_data.credits
FROM dept_ids,
(VALUES 
  ('Bachelor of Science in Information Technology', 'BSIT', 'Comprehensive IT degree covering software, hardware, and systems', 'degree', 48, 240),
  ('Bachelor of Science in Computer Science', 'BSCS', 'Computer science degree focusing on programming and algorithms', 'degree', 48, 240),
  ('Bachelor of Science in Software Engineering', 'BSSE', 'Software engineering degree with practical development focus', 'degree', 48, 240),
  ('Diploma in Information Technology', 'DIT', 'IT diploma covering essential computing skills', 'diploma', 24, 120),
  ('Diploma in Software Engineering', 'DSE', 'Software engineering diploma with hands-on programming', 'diploma', 24, 120),
  ('Diploma in Computer Engineering', 'DCE', 'Computer engineering diploma covering hardware and software', 'diploma', 24, 120),
  ('Diploma in Electrical Engineering', 'DEE', 'Electrical engineering diploma program', 'diploma', 30, 150),
  ('Certificate in Information Technology', 'CIT', 'Basic IT certificate program', 'certificate', 12, 60)
) AS course_data(name, code, description, level, duration_months, credits)
WHERE dept_ids.code = 'SICME'
ON CONFLICT (code) DO NOTHING;

-- Insert courses for School of Education, Arts & Social Sciences
INSERT INTO public.courses (name, code, description, department_id, level, duration_months, credits)
SELECT 
  course_data.name,
  course_data.code,
  course_data.description,
  dept_ids.id,
  course_data.level,
  course_data.duration_months,
  course_data.credits
FROM dept_ids,
(VALUES 
  ('Bachelor of Arts in Education', 'BAE', 'Education degree for teaching professionals', 'degree', 48, 240),
  ('Bachelor of Arts in Psychology', 'BAP', 'Psychology degree focusing on human behavior', 'degree', 48, 240),
  ('Diploma in Early Childhood Development & Education', 'DECDE', 'Early childhood education diploma', 'diploma', 24, 120),
  ('Diploma in Counseling Psychology', 'DCP', 'Counseling psychology diploma program', 'diploma', 24, 120),
  ('Certificate in Early Childhood Development', 'CECD', 'Basic early childhood development certificate', 'certificate', 12, 60)
) AS course_data(name, code, description, level, duration_months, credits)
WHERE dept_ids.code = 'SEASS'
ON CONFLICT (code) DO NOTHING;

-- Insert courses for School of Hospitality
INSERT INTO public.courses (name, code, description, department_id, level, duration_months, credits)
SELECT 
  course_data.name,
  course_data.code,
  course_data.description,
  dept_ids.id,
  course_data.level,
  course_data.duration_months,
  course_data.credits
FROM dept_ids,
(VALUES 
  ('Bachelor of Science in Hospitality & Tourism Management', 'BSHTM', 'Comprehensive hospitality and tourism management degree', 'degree', 48, 240),
  ('Diploma in Hospitality Management', 'DHM', 'Hospitality management diploma program', 'diploma', 24, 120),
  ('Diploma in Tourism Management', 'DTM', 'Tourism management diploma program', 'diploma', 24, 120),
  ('Certificate in Hospitality & Tourism Management', 'CHTM', 'Basic hospitality and tourism certificate', 'certificate', 12, 60)
) AS course_data(name, code, description, level, duration_months, credits)
WHERE dept_ids.code = 'SH'
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 3. SAMPLE UNITS FOR TESTING
-- =============================================

-- Insert sample units for IT diploma program
WITH course_ids AS (
  SELECT id, code FROM public.courses WHERE code = 'DIT'
),
dept_ids AS (
  SELECT id FROM public.departments WHERE code = 'SICME'
)
INSERT INTO public.units (code, name, description, credits, department_id, course, course_id, year, semester, created_by)
SELECT 
  unit_data.code,
  unit_data.name,
  unit_data.description,
  unit_data.credits,
  dept_ids.id,
  'Diploma in Information Technology',
  course_ids.id,
  unit_data.year,
  unit_data.semester,
  'system'
FROM course_ids, dept_ids,
(VALUES 
  ('DIT101', 'Computer Fundamentals', 'Introduction to computer systems and basic operations', 3, 1, 1),
  ('DIT102', 'Programming Basics', 'Introduction to programming concepts and logic', 4, 1, 1),
  ('DIT103', 'Mathematics for IT', 'Mathematical concepts for information technology', 3, 1, 1),
  ('DIT104', 'Computer Applications', 'Practical computer applications and software usage', 3, 1, 1),
  ('DIT105', 'Digital Literacy', 'Digital skills and online safety', 2, 1, 1),
  
  ('DIT201', 'Database Systems', 'Introduction to database design and management', 4, 1, 2),
  ('DIT202', 'Web Development', 'HTML, CSS, and basic web development', 4, 1, 2),
  ('DIT203', 'Network Fundamentals', 'Basic networking concepts and protocols', 3, 1, 2),
  ('DIT204', 'System Analysis', 'System analysis and design methodologies', 3, 1, 2),
  ('DIT205', 'IT Ethics', 'Ethical issues in information technology', 2, 1, 2)
) AS unit_data(code, name, description, credits, year, semester)
ON CONFLICT (code) DO NOTHING;

-- Insert sample units for Business Management diploma
WITH course_ids AS (
  SELECT id, code FROM public.courses WHERE code = 'DBMA'
),
dept_ids AS (
  SELECT id FROM public.departments WHERE code = 'SBE'
)
INSERT INTO public.units (code, name, description, credits, department_id, course, course_id, year, semester, created_by)
SELECT 
  unit_data.code,
  unit_data.name,
  unit_data.description,
  unit_data.credits,
  dept_ids.id,
  'Diploma in Business Management & Administration',
  course_ids.id,
  unit_data.year,
  unit_data.semester,
  'system'
FROM course_ids, dept_ids,
(VALUES 
  ('BMA101', 'Introduction to Business', 'Basic principles of business operations', 3, 1, 1),
  ('BMA102', 'Business Mathematics', 'Mathematical applications in business', 3, 1, 1),
  ('BMA103', 'Business Communication', 'Effective business communication skills', 3, 1, 1),
  ('BMA104', 'Principles of Management', 'Fundamentals of management theory and practice', 4, 1, 1),
  ('BMA105', 'Business Ethics', 'Ethical considerations in business', 2, 1, 1),
  
  ('BMA201', 'Marketing Principles', 'Introduction to marketing concepts', 4, 1, 2),
  ('BMA202', 'Human Resource Management', 'Managing human resources effectively', 4, 1, 2),
  ('BMA203', 'Financial Management', 'Basic financial management for businesses', 4, 1, 2),
  ('BMA204', 'Operations Management', 'Managing business operations efficiently', 3, 1, 2),
  ('BMA205', 'Project Management', 'Planning and managing business projects', 3, 1, 2)
) AS unit_data(code, name, description, credits, year, semester)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 4. SYSTEM CONFIGURATION DATA
-- =============================================

-- Insert system notification templates
INSERT INTO public.notifications (recipient_id, recipient_type, title, message, type, category, is_read, sender_name)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin',
  'System Initialization Complete',
  'The TVET Connect Kenya database has been successfully initialized with all required tables and initial data.',
  'success',
  'technical',
  false,
  'System'
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications 
  WHERE title = 'System Initialization Complete'
);

-- =============================================
-- 5. DEFAULT FEE STRUCTURES
-- =============================================

-- Insert default fee structure for IT Diploma
WITH course_data AS (
  SELECT id FROM public.courses WHERE code = 'DIT'
)
INSERT INTO public.fee_structures (
  course, course_id, year, semester, academic_year,
  tuition_fee, exam_fee, library_fee, lab_fee, caution_money, activity_fee, medical_fee, total_fee,
  created_by, is_active
)
SELECT 
  'Diploma in Information Technology',
  course_data.id,
  year_sem.year,
  year_sem.semester,
  '2024/2025',
  45000, 3000, 2000, 5000, 10000, 1000, 2000, 68000,
  '00000000-0000-0000-0000-000000000000'::uuid,
  true
FROM course_data,
(VALUES (1, 1), (1, 2), (2, 1), (2, 2)) AS year_sem(year, semester)
ON CONFLICT (course, year, semester, academic_year) DO NOTHING;

-- Insert default fee structure for Business Management Diploma  
WITH course_data AS (
  SELECT id FROM public.courses WHERE code = 'DBMA'
)
INSERT INTO public.fee_structures (
  course, course_id, year, semester, academic_year,
  tuition_fee, exam_fee, library_fee, lab_fee, caution_money, activity_fee, medical_fee, total_fee,
  created_by, is_active
)
SELECT 
  'Diploma in Business Management & Administration',
  course_data.id,
  year_sem.year,
  year_sem.semester,
  '2024/2025',
  40000, 3000, 2000, 2000, 10000, 1000, 2000, 60000,
  '00000000-0000-0000-0000-000000000000'::uuid,
  true
FROM course_data,
(VALUES (1, 1), (1, 2), (2, 1), (2, 2)) AS year_sem(year, semester)
ON CONFLICT (course, year, semester, academic_year) DO NOTHING;

-- =============================================
-- 6. ACADEMIC CALENDAR SETUP
-- =============================================

-- Insert semester plans for 2024/2025 academic year
INSERT INTO public.semester_plans (course, year, semester, academic_year, start_date, end_date, created_by)
SELECT 
  course_sem.course,
  course_sem.year,
  course_sem.semester,
  '2024/2025',
  course_sem.start_date,
  course_sem.end_date,
  '00000000-0000-0000-0000-000000000000'::uuid
FROM (VALUES 
  ('Diploma in Information Technology', 1, 1, '2024-09-01'::date, '2024-12-20'::date),
  ('Diploma in Information Technology', 1, 2, '2025-01-15'::date, '2025-05-30'::date),
  ('Diploma in Information Technology', 2, 1, '2024-09-01'::date, '2024-12-20'::date),
  ('Diploma in Information Technology', 2, 2, '2025-01-15'::date, '2025-05-30'::date),
  ('Diploma in Business Management & Administration', 1, 1, '2024-09-01'::date, '2024-12-20'::date),
  ('Diploma in Business Management & Administration', 1, 2, '2025-01-15'::date, '2025-05-30'::date),
  ('Diploma in Business Management & Administration', 2, 1, '2024-09-01'::date, '2024-12-20'::date),
  ('Diploma in Business Management & Administration', 2, 2, '2025-01-15'::date, '2025-05-30'::date)
) AS course_sem(course, year, semester, start_date, end_date)
ON CONFLICT (course, year, semester, academic_year) DO NOTHING;

-- =============================================
-- 7. VERIFICATION QUERIES
-- =============================================

-- Display summary of inserted data
DO $$
DECLARE
    dept_count INTEGER;
    course_count INTEGER;
    unit_count INTEGER;
    fee_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dept_count FROM public.departments;
    SELECT COUNT(*) INTO course_count FROM public.courses;
    SELECT COUNT(*) INTO unit_count FROM public.units;
    SELECT COUNT(*) INTO fee_count FROM public.fee_structures;
    
    RAISE NOTICE 'Database seeding completed successfully:';
    RAISE NOTICE '- Departments: %', dept_count;
    RAISE NOTICE '- Courses: %', course_count;
    RAISE NOTICE '- Units: %', unit_count;
    RAISE NOTICE '- Fee Structures: %', fee_count;
END $$;
