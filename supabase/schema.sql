-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('student', 'lecturer', 'admin', 'hod', 'registrar', 'finance')),
  profile_picture text,
  course text,
  level text check (level in ('certificate', 'diploma')),
  admission_number text,
  department text,
  approved boolean default false,
  blocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Access policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update using ( auth.uid() = id );

-- Units table
create table public.units (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  name text not null,
  description text,
  course text not null,
  year integer not null,
  semester integer not null,
  lecturer_id uuid references public.profiles(id),
  lecturer_name text not null,
  department text not null,
  credits integer not null,
  status text not null check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.units enable row level security;

-- Access policies for units
create policy "Units are viewable by everyone"
  on public.units for select
  using ( true );

create policy "Only admins and lecturers can insert units"
  on public.units for insert
  with check (
    auth.jwt() ->> 'role' in ('admin', 'lecturer', 'hod')
  );

create policy "Only admins and owning lecturers can update units"
  on public.units for update using (
    auth.jwt() ->> 'role' = 'admin'
    or lecturer_id = auth.uid()
  );

create policy "Only admins can delete units"
  on public.units for delete using (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Content table (notes, assignments, etc.)
create table public.content (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('notes', 'assignment')),
  title text not null,
  description text,
  unit_id uuid references public.units(id) on delete cascade,
  unit_code text not null,
  unit_name text not null,
  lecturer_id uuid references public.profiles(id),
  files jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_visible boolean default true,
  topic text,
  due_date timestamp with time zone,
  assignment_type text check (type != 'assignment' or assignment_type in ('file_upload', 'multiple_choice', 'question_file')),
  accepted_formats text[],
  questions jsonb
);

-- Enable RLS
alter table public.content enable row level security;

-- Access policies for content
create policy "Content is viewable by authenticated users"
  on public.content for select
  using ( auth.role() = 'authenticated' );

create policy "Only lecturers can insert content"
  on public.content for insert
  with check (
    auth.jwt() ->> 'role' in ('lecturer', 'hod')
    and lecturer_id = auth.uid()
  );

create policy "Only owning lecturers can update content"
  on public.content for update using (
    lecturer_id = auth.uid()
  );

create policy "Only owning lecturers can delete content"
  on public.content for delete using (
    lecturer_id = auth.uid()
  );

-- Assignment submissions table
create table public.assignment_submissions (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references public.content(id) on delete cascade,
  student_id uuid references public.profiles(id),
  student_name text not null,
  student_email text not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  files jsonb,
  answers jsonb,
  score numeric,
  feedback text,
  status text not null check (status in ('pending', 'graded')) default 'pending',
  graded_by uuid references public.profiles(id),
  graded_at timestamp with time zone
);

-- Enable RLS
alter table public.assignment_submissions enable row level security;

-- Access policies for assignment submissions
create policy "Students can view their own submissions"
  on public.assignment_submissions for select
  using (
    student_id = auth.uid()
    or auth.jwt() ->> 'role' in ('lecturer', 'hod')
  );

create policy "Students can submit assignments"
  on public.assignment_submissions for insert
  with check (
    auth.jwt() ->> 'role' = 'student'
    and student_id = auth.uid()
  );

create policy "Only lecturers can grade submissions"
  on public.assignment_submissions for update using (
    auth.jwt() ->> 'role' in ('lecturer', 'hod')
  );

-- Student units table (for tracking enrollment and grades)
create table public.student_units (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  unit_id uuid references public.units(id) on delete cascade,
  unit_code text not null,
  unit_name text not null,
  status text not null check (status in ('enrolled', 'completed', 'failed')),
  grade text,
  semester integer not null,
  year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, unit_id)
);

-- Enable RLS
alter table public.student_units enable row level security;

-- Access policies for student units
create policy "Students can view their own units"
  on public.student_units for select
  using (
    student_id = auth.uid()
    or auth.jwt() ->> 'role' in ('lecturer', 'admin', 'hod', 'registrar')
  );

create policy "Only registrar and admin can enroll students"
  on public.student_units for insert
  with check (
    auth.jwt() ->> 'role' in ('admin', 'registrar')
  );

create policy "Only lecturers and admin can update grades"
  on public.student_units for update using (
    auth.jwt() ->> 'role' in ('lecturer', 'admin', 'hod')
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update the updated_at column
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

create trigger update_units_updated_at
  before update on public.units
  for each row
  execute function update_updated_at_column();

create trigger update_content_updated_at
  before update on public.content
  for each row
  execute function update_updated_at_column();

create trigger update_student_units_updated_at
  before update on public.student_units
  for each row
  execute function update_updated_at_column();
