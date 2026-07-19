-- Lets a student redo today's reflection (re-reflect action deletes the
-- existing session, which cascades to its answers, then the normal submit
-- flow creates a fresh one). Deliberately scoped to *today only* — a
-- student should never be able to delete yesterday's or older reflections,
-- since teachers rely on that history staying intact. This is the same
-- day-boundary rule already enforced by the one-per-day unique index.

create policy reflection_sessions_delete_own_today on public.reflection_sessions
  for delete using (
    student_id = auth.uid()
    and (submitted_at at time zone 'utc')::date = (now() at time zone 'utc')::date
  );
