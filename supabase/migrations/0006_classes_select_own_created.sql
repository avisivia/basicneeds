-- A teacher creating a class needs to see it immediately (Postgres requires
-- a SELECT-permitting policy for `INSERT ... RETURNING`, which is how
-- Supabase's .insert().select() works). classes_select_teacher_admin only
-- grants visibility once a teacher_assignments row exists, which is created
-- in a *second* statement right after this one — so at the moment of
-- insert, nothing yet lets the creator see their own new row, and Postgres
-- reports that as "new row violates row-level security policy" (a
-- misleading message — it's the RETURNING visibility check, not the
-- WITH CHECK clause, that fails).

create policy classes_select_own_created on public.classes
  for select using (created_by = auth.uid());
