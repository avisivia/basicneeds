-- Lets a teacher look up a student by email to add them to a class roster.
-- profiles has no email column (avoids duplicating PII from auth.users), so
-- this has to read auth.users, which normal RLS-bound queries can't do.
-- security definer bridges that gap, but the function enforces its own
-- authorization check (caller must be teacher/admin) so it can't be used
-- for general email enumeration.

create function public.find_student_by_email(lookup_email text)
returns table (id uuid, full_name text)
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_role() not in ('teacher', 'admin') then
    raise exception 'Only teachers can look up students.';
  end if;

  return query
    select p.id, p.full_name
    from public.profiles p
    join auth.users u on u.id = p.id
    where lower(u.email) = lower(lookup_email)
      and p.role = 'student';
end;
$$;

grant execute on function public.find_student_by_email(text) to authenticated;
