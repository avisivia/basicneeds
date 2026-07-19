-- auth.users.email is character varying(255), not text. Postgres requires
-- an exact type match for RETURNS TABLE columns, so the previous version
-- of this function failed at call time with "structure of query does not
-- match function result type" (42804). Cast explicitly to text.

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role public.user_role,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can list users.';
  end if;

  return query
    select p.id, u.email::text, p.full_name, p.role, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;
