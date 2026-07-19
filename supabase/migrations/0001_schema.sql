-- Basic Needs Tracker — core schema
-- Roles live on profiles.role rather than separate teachers/students tables,
-- since auth.users already gives us the user table and a role column + RLS
-- covers access control without duplicating rows.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.need_key as enum ('belonging', 'power', 'freedom', 'fun', 'survival');

-- One row per auth.users row, created by the handle_new_user trigger below.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_level text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.class_students (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table public.teacher_assignments (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (teacher_id, class_id)
);

-- The five Choice Theory needs. Fixed, seeded set — this table also serves
-- as the "question category" table so there's no redundant 1:1 lookup table.
create table public.needs (
  id uuid primary key default gen_random_uuid(),
  key public.need_key not null unique,
  label text not null,
  description text,
  color text not null default '#64748b',
  sort_order smallint not null default 0
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.needs (id) on delete cascade,
  prompt text not null,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

-- One reflection submission per student per calendar day.
create table public.reflection_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.reflection_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reflection_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  need_id uuid not null references public.needs (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text,
  unique (session_id, question_id)
);

-- Table-level UNIQUE constraints can't hold an expression like a date cast,
-- so the "one reflection per student per day" rule is a unique index instead.
create unique index reflection_sessions_one_per_day_idx
  on public.reflection_sessions (student_id, ((submitted_at at time zone 'utc')::date));

create index reflection_sessions_student_idx on public.reflection_sessions (student_id, submitted_at desc);
create index reflection_sessions_class_idx on public.reflection_sessions (class_id, submitted_at desc);
create index reflection_answers_session_idx on public.reflection_answers (session_id);
create index reflection_answers_need_idx on public.reflection_answers (need_id);
create index class_students_student_idx on public.class_students (student_id);
create index teacher_assignments_class_idx on public.teacher_assignments (class_id);

-- Auto-create a profile row whenever a new auth user signs up.
-- full_name and role are passed through from the signup form via
-- supabase.auth.signUp({ options: { data: { full_name, role } } }).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
