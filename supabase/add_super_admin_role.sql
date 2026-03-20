alter table if exists public.profiles
  drop constraint if exists profiles_role_check;

alter table if exists public.profiles
  add constraint profiles_role_check
  check (role in ('contributor', 'moderator', 'super_admin'));

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('moderator', 'super_admin')
  );
$$;

-- Promote one specific account to super_admin.
update public.profiles
set role = 'super_admin'
where lower(email) = lower('lumainitiative@gmail.com');

-- Verify role assignment.
select id, email, role
from public.profiles
where lower(email) = lower('lumainitiative@gmail.com');
