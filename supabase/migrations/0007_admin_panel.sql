-- Admin panel support: app-wide settings (currently just the email
-- verification toggle), the ability for an admin to change a user's role,
-- and a way for an admin to list users with their email (profiles has no
-- email column by design, so this needs auth.users via security definer,
-- same pattern as find_student_by_email).

-- Single-row settings table. The boolean primary key + check(id) is a
-- standard Postgres trick to enforce exactly one row exists.
create table public.app_settings (
  id boolean primary key default true,
  require_email_verification boolean not null default true,
  updated_at timestamptz not null default now(),
  check (id)
);

insert into public.app_settings (id) values (true);

alter table public.app_settings enable row level security;

-- Readable by anyone, including anonymous signup requests (the signup
-- Server Action checks this before the user has a session). It's a single
-- boolean, not sensitive.
create policy app_settings_select_all on public.app_settings
  for select using (true);

create policy app_settings_update_admin on public.app_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- Allow an admin to change another user's role. The original trigger only
-- allowed service_role (server-only admin scripts); this extends it to
-- also allow an authenticated admin acting through the normal client.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role <> old.role
     and auth.role() <> 'service_role'
     and coalesce(
       (select role from public.profiles where id = auth.uid()),
       'student'
     ) <> 'admin' then
    raise exception 'You cannot change this role.';
  end if;
  return new;
end;
$$;

create policy profiles_update_by_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Admin-only directory listing with email (security definer to read
-- auth.users; the function itself enforces the caller is an admin so it
-- can't be used for general email enumeration).
create function public.admin_list_users()
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
    select p.id, u.email, p.full_name, p.role, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;
