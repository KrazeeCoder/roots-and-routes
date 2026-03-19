create extension if not exists pgcrypto;

do $$
begin
  create type public.content_status as enum ('draft', 'pending', 'published', 'rejected', 'archived');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'contributor' check (role in ('contributor', 'moderator', 'super_admin')),
  organization_name text,
  display_name text,
  first_name text,
  middle_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  full_description text,
  address text not null,
  phone text,
  website text,
  hours text,
  tags text[] not null default '{}'::text[],
  image_url text,
  created_by uuid references auth.users(id) on delete set null,
  posted_by_name text,
  status public.content_status not null default 'draft',
  is_spotlight boolean not null default false,
  spotlight_subtitle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  location text not null,
  location_lat double precision,
  location_lng double precision,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  image_url text,
  created_by uuid references auth.users(id) on delete set null,
  posted_by_name text,
  status public.content_status not null default 'draft',
  is_spotlight boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure required columns also exist for existing deployments.
alter table if exists public.profiles add column if not exists role public.contributor_role not null default 'contributor';
alter table if exists public.profiles add column if not exists status text not null default 'pending';
alter table if exists public.profiles add column if not exists organization_name text;
alter table if exists public.profiles add column if not exists display_name text;
alter table if exists public.profiles add column if not exists first_name text;
alter table if exists public.profiles add column if not exists middle_name text;
alter table if exists public.profiles add column if not exists last_name text;
alter table if exists public.profiles add column if not exists email text;
alter table if exists public.profiles add column if not exists phone text;
alter table if exists public.profiles add column if not exists created_at timestamptz not null default now();
alter table if exists public.profiles add column if not exists updated_at timestamptz not null default now();

alter table if exists public.resources add column if not exists name text;
alter table if exists public.resources add column if not exists category text;
alter table if exists public.resources add column if not exists description text;
alter table if exists public.resources add column if not exists full_description text;
alter table if exists public.resources add column if not exists address text;
alter table if exists public.resources add column if not exists phone text;
alter table if exists public.resources add column if not exists website text;
alter table if exists public.resources add column if not exists hours text;
alter table if exists public.resources add column if not exists tags text[] not null default '{}'::text[];
alter table if exists public.resources add column if not exists image_url text;
alter table if exists public.resources add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table if exists public.resources add column if not exists posted_by_name text;
alter table if exists public.resources add column if not exists status public.content_status not null default 'draft';
alter table if exists public.resources add column if not exists is_spotlight boolean not null default false;
alter table if exists public.resources add column if not exists spotlight_subtitle text;
alter table if exists public.resources add column if not exists created_at timestamptz not null default now();
alter table if exists public.resources add column if not exists updated_at timestamptz not null default now();

alter table if exists public.events add column if not exists title text;
alter table if exists public.events add column if not exists category text;
alter table if exists public.events add column if not exists description text;
alter table if exists public.events add column if not exists location text;
alter table if exists public.events add column if not exists location_lat double precision;
alter table if exists public.events add column if not exists location_lng double precision;
alter table if exists public.events add column if not exists starts_at timestamptz not null default now();
alter table if exists public.events add column if not exists ends_at timestamptz;
alter table if exists public.events add column if not exists image_url text;
alter table if exists public.events add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table if exists public.events add column if not exists posted_by_name text;
alter table if exists public.events add column if not exists status public.content_status not null default 'draft';
alter table if exists public.events add column if not exists is_spotlight boolean not null default false;
alter table if exists public.events add column if not exists created_at timestamptz not null default now();
alter table if exists public.events add column if not exists updated_at timestamptz not null default now();

alter table if exists public.resources alter column created_by set default auth.uid();
alter table if exists public.events alter column created_by set default auth.uid();

alter table if exists public.profiles drop constraint if exists profiles_role_check;
alter table if exists public.profiles
add constraint profiles_role_check check (role in ('contributor', 'moderator'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.display_name_for(user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(p.display_name, ''),
    nullif(p.organization_name, ''),
    nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    'Community Contributor'
  )
  from public.profiles p
  where p.id = user_id;
$$;

create or replace function public.apply_content_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;

  if new.posted_by_name is null or trim(new.posted_by_name) = '' then
    new.posted_by_name = public.display_name_for(new.created_by);
  end if;

  new.updated_at = now();
  return new;
end;
$$;

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    organization_name,
    display_name,
    first_name,
    middle_name,
    last_name,
    phone,
    role,
    status
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'contributor',
    'pending'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists resources_defaults on public.resources;
create trigger resources_defaults
before insert or update on public.resources
for each row execute function public.apply_content_defaults();

drop trigger if exists events_defaults on public.events;
create trigger events_defaults
before insert or update on public.events
for each row execute function public.apply_content_defaults();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists resources_status_idx on public.resources(status);
create index if not exists resources_created_by_idx on public.resources(created_by);
create index if not exists resources_spotlight_idx on public.resources(is_spotlight);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_created_by_idx on public.events(created_by);
create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists events_spotlight_idx on public.events(is_spotlight);
create index if not exists events_location_coords_idx on public.events(location_lat, location_lng);

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;

drop policy if exists "profiles_select_own_or_moderator" on public.profiles;
drop policy if exists "profiles_update_own_or_moderator" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_select_own_or_elevated" on public.profiles;
drop policy if exists "profiles_update_own_or_elevated" on public.profiles;

create policy "profiles_select_own_or_moderator"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_moderator());

create policy "profiles_update_own_or_moderator"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_moderator())
with check (id = auth.uid() or public.is_moderator());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_moderator());

drop policy if exists "resources_public_read" on public.resources;
drop policy if exists "public read resources" on public.resources;
drop policy if exists "resources_authenticated_read" on public.resources;
drop policy if exists "resources_insert_own" on public.resources;
drop policy if exists "resources_update_own_or_moderator" on public.resources;
drop policy if exists "resources_delete_own_or_moderator" on public.resources;
drop policy if exists "resources_update_own_or_elevated" on public.resources;
drop policy if exists "resources_delete_own_or_elevated" on public.resources;

create policy "resources_public_read"
on public.resources
for select
to public
using (status = 'published');

create policy "resources_authenticated_read"
on public.resources
for select
to authenticated
using (created_by = auth.uid() or public.is_moderator());

create policy "resources_insert_contributor"
on public.resources
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  )
  and (
    public.is_moderator()
    or status in ('draft', 'pending', 'archived')
  )
);

create policy "resources_update_own_or_moderator"
on public.resources
for update
to authenticated
using (
  (created_by = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and status = 'approved'))
  or public.is_moderator()
)
with check (
  (
    (created_by = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and status = 'approved'))
    or public.is_moderator()
  )
  and (
    public.is_moderator()
    or status in ('draft', 'pending', 'archived')
  )
);

create policy "resources_delete_own_or_moderator"
on public.resources
for delete
to authenticated
using (created_by = auth.uid() or public.is_moderator());

drop policy if exists "events_public_read" on public.events;
drop policy if exists "public read events" on public.events;
drop policy if exists "events_authenticated_read" on public.events;
drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_update_own_or_moderator" on public.events;
drop policy if exists "events_delete_own_or_moderator" on public.events;
drop policy if exists "events_update_own_or_elevated" on public.events;
drop policy if exists "events_delete_own_or_elevated" on public.events;

create policy "events_public_read"
on public.events
for select
to public
using (status = 'published');

create policy "events_authenticated_read"
on public.events
for select
to authenticated
using (created_by = auth.uid() or public.is_moderator());

create policy "events_insert_contributor"
on public.events
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  )
  and (
    public.is_moderator()
    or status in ('draft', 'pending', 'archived')
  )
);

create policy "events_update_own_or_moderator"
on public.events
for update
to authenticated
using (
  (created_by = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and status = 'approved'))
  or public.is_moderator()
)
with check (
  (
    (created_by = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and status = 'approved'))
    or public.is_moderator()
  )
  and (
    public.is_moderator()
    or status in ('draft', 'pending', 'archived')
  )
);

create policy "events_delete_own_or_moderator"
on public.events
for delete
to authenticated
using (created_by = auth.uid() or public.is_moderator());
