-- Row Level Security: this is the primary access-control layer. App code
-- (the services/ DAL) is a second layer, not a substitute for this.

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.needs enable row level security;
alter table public.questions enable row level security;
alter table public.reflection_sessions enable row level security;
alter table public.reflection_answers enable row level security;

-- security definer helpers so policies don't recurse into RLS on the
-- tables they inspect, and so the same check isn't re-written per policy.

create function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.current_role() = 'admin';
$$;

create function public.teaches_class(target_class_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.teacher_assignments ta
    where ta.class_id = target_class_id and ta.teacher_id = auth.uid()
  );
$$;

create function public.is_teacher_of(target_student_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.teacher_assignments ta on ta.class_id = cs.class_id
    where cs.student_id = target_student_id and ta.teacher_id = auth.uid()
  );
$$;

-- Block role self-escalation: a signed-in user can update their own profile
-- (name, avatar) but not their own role. Only the service-role key (used by
-- server-only admin actions) may change role.
create function public.prevent_role_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role <> old.role and auth.role() <> 'service_role' then
    raise exception 'You cannot change your own role.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- profiles ------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy profiles_select_by_teacher on public.profiles
  for select using (public.is_teacher_of(id) or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- classes ---------------------------------------------------------------
create policy classes_select_teacher_admin on public.classes
  for select using (public.is_admin() or public.teaches_class(id));

create policy classes_select_student_member on public.classes
  for select using (
    exists (
      select 1 from public.class_students cs
      where cs.class_id = classes.id and cs.student_id = auth.uid()
    )
  );

create policy classes_insert_teacher on public.classes
  for insert with check (
    public.current_role() in ('teacher', 'admin') and created_by = auth.uid()
  );

create policy classes_update_owner on public.classes
  for update using (created_by = auth.uid() or public.is_admin());

create policy classes_delete_owner on public.classes
  for delete using (created_by = auth.uid() or public.is_admin());

-- class_students ----------------------------------------------------------
create policy class_students_select on public.class_students
  for select using (
    student_id = auth.uid()
    or public.is_admin()
    or public.teaches_class(class_id)
  );

create policy class_students_insert_teacher on public.class_students
  for insert with check (public.is_admin() or public.teaches_class(class_id));

create policy class_students_delete_teacher on public.class_students
  for delete using (public.is_admin() or public.teaches_class(class_id));

-- teacher_assignments -----------------------------------------------------
create policy teacher_assignments_select_own on public.teacher_assignments
  for select using (teacher_id = auth.uid() or public.is_admin());

create policy teacher_assignments_insert_self_or_admin on public.teacher_assignments
  for insert with check (
    public.is_admin()
    or (teacher_id = auth.uid() and public.current_role() = 'teacher')
  );

create policy teacher_assignments_delete on public.teacher_assignments
  for delete using (teacher_id = auth.uid() or public.is_admin());

-- needs / questions: shared reference data, readable by any signed-in user
create policy needs_select_all on public.needs
  for select using (auth.role() = 'authenticated');

create policy needs_admin_write on public.needs
  for all using (public.is_admin()) with check (public.is_admin());

create policy questions_select_all on public.questions
  for select using (auth.role() = 'authenticated');

create policy questions_admin_write on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

-- reflection_sessions -------------------------------------------------
create policy reflection_sessions_select_own on public.reflection_sessions
  for select using (student_id = auth.uid());

create policy reflection_sessions_select_teacher on public.reflection_sessions
  for select using (public.is_admin() or public.is_teacher_of(student_id));

create policy reflection_sessions_insert_own on public.reflection_sessions
  for insert with check (
    student_id = auth.uid() and public.current_role() = 'student'
  );

create policy reflection_sessions_update_own on public.reflection_sessions
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

-- reflection_answers ----------------------------------------------------
create policy reflection_answers_select_own on public.reflection_answers
  for select using (
    exists (
      select 1 from public.reflection_sessions rs
      where rs.id = reflection_answers.session_id and rs.student_id = auth.uid()
    )
  );

create policy reflection_answers_select_teacher on public.reflection_answers
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.reflection_sessions rs
      where rs.id = reflection_answers.session_id and public.is_teacher_of(rs.student_id)
    )
  );

create policy reflection_answers_insert_own on public.reflection_answers
  for insert with check (
    exists (
      select 1 from public.reflection_sessions rs
      where rs.id = reflection_answers.session_id and rs.student_id = auth.uid()
    )
  );

create policy reflection_answers_update_own on public.reflection_answers
  for update using (
    exists (
      select 1 from public.reflection_sessions rs
      where rs.id = reflection_answers.session_id and rs.student_id = auth.uid()
    )
  );
