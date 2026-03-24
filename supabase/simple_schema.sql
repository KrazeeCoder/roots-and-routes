create extension if not exists pgcrypto;

do $$
begin
  create type public.contributor_role as enum ('contributor', 'moderator', 'super_admin');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.content_status as enum ('draft', 'pending', 'published', 'rejected', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.submission_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.contributor_role not null default 'contributor',
  status text not null default 'pending',
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
  email text,
  website text,
  hours text,
  tags text[] not null default '{}'::text[],
  image_url text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
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
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  posted_by_name text,
  status public.content_status not null default 'draft',
  is_spotlight boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  legacy_suggestion_id uuid,
  resource_name text not null,
  organization_name text,
  category text not null,
  description text not null,
  full_description text,
  website text,
  address text not null,
  hours text,
  contact_email text,
  contact_phone text,
  tags text[] not null default '{}'::text[],
  image_url text,
  submitter_name text not null,
  submitter_email text not null,
  submitter_connection text,
  status public.submission_status not null default 'pending',
  moderator_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_resource_id uuid references public.resources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  location text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  image_url text,
  organizer_name text,
  organizer_email text,
  organizer_phone text,
  submitter_name text not null,
  submitter_email text not null,
  submitter_connection text,
  status public.submission_status not null default 'pending',
  moderator_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
alter table if exists public.resources add column if not exists email text;
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

alter table if exists public.resource_submissions add column if not exists legacy_suggestion_id uuid;
alter table if exists public.resource_submissions add column if not exists resource_name text;
alter table if exists public.resource_submissions add column if not exists organization_name text;
alter table if exists public.resource_submissions add column if not exists category text;
alter table if exists public.resource_submissions add column if not exists description text;
alter table if exists public.resource_submissions add column if not exists full_description text;
alter table if exists public.resource_submissions add column if not exists website text;
alter table if exists public.resource_submissions add column if not exists address text;
alter table if exists public.resource_submissions add column if not exists hours text;
alter table if exists public.resource_submissions add column if not exists contact_email text;
alter table if exists public.resource_submissions add column if not exists contact_phone text;
alter table if exists public.resource_submissions add column if not exists tags text[] not null default '{}'::text[];
alter table if exists public.resource_submissions add column if not exists image_url text;
alter table if exists public.resource_submissions add column if not exists submitter_name text;
alter table if exists public.resource_submissions add column if not exists submitter_email text;
alter table if exists public.resource_submissions add column if not exists submitter_connection text;
alter table if exists public.resource_submissions add column if not exists status public.submission_status not null default 'pending';
alter table if exists public.resource_submissions add column if not exists moderator_notes text;
alter table if exists public.resource_submissions add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table if exists public.resource_submissions add column if not exists reviewed_at timestamptz;
alter table if exists public.resource_submissions add column if not exists approved_resource_id uuid references public.resources(id) on delete set null;
alter table if exists public.resource_submissions add column if not exists created_at timestamptz not null default now();
alter table if exists public.resource_submissions add column if not exists updated_at timestamptz not null default now();

alter table if exists public.event_submissions add column if not exists title text;
alter table if exists public.event_submissions add column if not exists category text;
alter table if exists public.event_submissions add column if not exists description text;
alter table if exists public.event_submissions add column if not exists location text;
alter table if exists public.event_submissions add column if not exists starts_at timestamptz not null default now();
alter table if exists public.event_submissions add column if not exists ends_at timestamptz;
alter table if exists public.event_submissions add column if not exists image_url text;
alter table if exists public.event_submissions add column if not exists organizer_name text;
alter table if exists public.event_submissions add column if not exists organizer_email text;
alter table if exists public.event_submissions add column if not exists organizer_phone text;
alter table if exists public.event_submissions add column if not exists submitter_name text;
alter table if exists public.event_submissions add column if not exists submitter_email text;
alter table if exists public.event_submissions add column if not exists submitter_connection text;
alter table if exists public.event_submissions add column if not exists status public.submission_status not null default 'pending';
alter table if exists public.event_submissions add column if not exists moderator_notes text;
alter table if exists public.event_submissions add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table if exists public.event_submissions add column if not exists reviewed_at timestamptz;
alter table if exists public.event_submissions add column if not exists approved_event_id uuid references public.events(id) on delete set null;
alter table if exists public.event_submissions add column if not exists created_at timestamptz not null default now();
alter table if exists public.event_submissions add column if not exists updated_at timestamptz not null default now();

alter table if exists public.resources alter column created_by set default auth.uid();
alter table if exists public.events alter column created_by set default auth.uid();

alter table if exists public.profiles drop constraint if exists profiles_role_check;
alter table if exists public.profiles
add constraint profiles_role_check check (role in ('contributor', 'moderator', 'super_admin'));

alter table if exists public.profiles drop constraint if exists profiles_status_check;
alter table if exists public.profiles
add constraint profiles_status_check check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.resources drop constraint if exists resources_category_waypoint_check;
alter table if exists public.resources
add constraint resources_category_waypoint_check
check (
  category in (
    'Food Assistance',
    'Health & Wellness',
    'Housing Support',
    'Youth Programs',
    'Job Help',
    'Community Events'
  )
) not valid;

alter table if exists public.resource_submissions drop constraint if exists resource_submissions_category_check;
alter table if exists public.resource_submissions
add constraint resource_submissions_category_check
check (
  category in (
    'Food Assistance',
    'Health & Wellness',
    'Housing Support',
    'Youth Programs',
    'Job Help',
    'Community Events'
  )
) not valid;

alter table if exists public.resources drop constraint if exists resources_website_not_placeholder;
alter table if exists public.resources
add constraint resources_website_not_placeholder
check (
  website is null
  or (
    lower(website) not like '%example.com%'
    and lower(website) not like '%localhost%'
  )
) not valid;

alter table if exists public.resources drop constraint if exists resources_image_url_not_placeholder;
alter table if exists public.resources
add constraint resources_image_url_not_placeholder
check (
  image_url is null
  or (
    lower(image_url) not like '%example.com%'
    and lower(image_url) not like '%localhost%'
  )
) not valid;

alter table if exists public.events drop constraint if exists events_image_url_not_placeholder;
alter table if exists public.events
add constraint events_image_url_not_placeholder
check (
  image_url is null
  or (
    lower(image_url) not like '%example.com%'
    and lower(image_url) not like '%localhost%'
  )
) not valid;

alter table if exists public.resource_submissions drop constraint if exists resource_submissions_website_not_placeholder;
alter table if exists public.resource_submissions
add constraint resource_submissions_website_not_placeholder
check (
  website is null
  or (
    lower(website) not like '%example.com%'
    and lower(website) not like '%localhost%'
  )
) not valid;

alter table if exists public.resource_submissions drop constraint if exists resource_submissions_image_url_not_placeholder;
alter table if exists public.resource_submissions
add constraint resource_submissions_image_url_not_placeholder
check (
  image_url is null
  or (
    lower(image_url) not like '%example.com%'
    and lower(image_url) not like '%localhost%'
  )
) not valid;

alter table if exists public.event_submissions drop constraint if exists event_submissions_image_url_not_placeholder;
alter table if exists public.event_submissions
add constraint event_submissions_image_url_not_placeholder
check (
  image_url is null
  or (
    lower(image_url) not like '%example.com%'
    and lower(image_url) not like '%localhost%'
  )
) not valid;

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

create or replace function public.stamp_submission_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('approved', 'rejected') and new.status is distinct from old.status then
    if new.reviewed_at is null then
      new.reviewed_at = now();
    end if;

    if new.reviewed_by is null then
      new.reviewed_by = auth.uid();
    end if;
  elsif new.status = 'pending' then
    new.reviewed_at = null;
    new.reviewed_by = null;
  end if;

  new.updated_at = now();
  return new;
end;
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

create or replace function public.approve_resource_submission(submission_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.resource_submissions%rowtype;
  reviewer_id uuid := auth.uid();
  new_resource_id uuid;
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can approve submissions.';
  end if;

  select *
  into submission_row
  from public.resource_submissions
  where id = submission_id
  for update;

  if not found then
    raise exception 'Resource submission not found.';
  end if;

  if submission_row.status <> 'pending' then
    raise exception 'Resource submission has already been reviewed.';
  end if;

  insert into public.resources (
    name,
    category,
    description,
    full_description,
    address,
    phone,
    email,
    website,
    hours,
    tags,
    image_url,
    created_by,
    posted_by_name,
    status,
    is_spotlight,
    spotlight_subtitle
  )
  values (
    submission_row.resource_name,
    submission_row.category,
    submission_row.description,
    submission_row.full_description,
    submission_row.address,
    submission_row.contact_phone,
    submission_row.contact_email,
    submission_row.website,
    submission_row.hours,
    coalesce(submission_row.tags, '{}'::text[]),
    submission_row.image_url,
    reviewer_id,
    coalesce(
      nullif(submission_row.organization_name, ''),
      nullif(submission_row.submitter_name, ''),
      'Community Submission'
    ),
    'published',
    false,
    null
  )
  returning id into new_resource_id;

  update public.resource_submissions
  set
    status = 'approved',
    approved_resource_id = new_resource_id,
    reviewed_by = reviewer_id,
    reviewed_at = now()
  where id = submission_id;

  return new_resource_id;
end;
$$;

create or replace function public.approve_event_submission(submission_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.event_submissions%rowtype;
  reviewer_id uuid := auth.uid();
  new_event_id uuid;
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can approve submissions.';
  end if;

  select *
  into submission_row
  from public.event_submissions
  where id = submission_id
  for update;

  if not found then
    raise exception 'Event submission not found.';
  end if;

  if submission_row.status <> 'pending' then
    raise exception 'Event submission has already been reviewed.';
  end if;

  insert into public.events (
    title,
    category,
    description,
    location,
    starts_at,
    ends_at,
    image_url,
    created_by,
    posted_by_name,
    status,
    is_spotlight
  )
  values (
    submission_row.title,
    submission_row.category,
    submission_row.description,
    submission_row.location,
    submission_row.starts_at,
    submission_row.ends_at,
    submission_row.image_url,
    reviewer_id,
    coalesce(
      nullif(submission_row.organizer_name, ''),
      nullif(submission_row.submitter_name, ''),
      'Community Submission'
    ),
    'published',
    false
  )
  returning id into new_event_id;

  update public.event_submissions
  set
    status = 'approved',
    approved_event_id = new_event_id,
    reviewed_by = reviewer_id,
    reviewed_at = now()
  where id = submission_id;

  return new_event_id;
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

drop trigger if exists resource_submissions_set_review_state on public.resource_submissions;
create trigger resource_submissions_set_review_state
before update on public.resource_submissions
for each row execute function public.stamp_submission_review();

drop trigger if exists event_submissions_set_review_state on public.event_submissions;
create trigger event_submissions_set_review_state
before update on public.event_submissions
for each row execute function public.stamp_submission_review();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists resources_status_idx on public.resources(status);
create index if not exists resources_created_by_idx on public.resources(created_by);
create index if not exists resources_spotlight_idx on public.resources(is_spotlight);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_created_by_idx on public.events(created_by);
create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists events_spotlight_idx on public.events(is_spotlight);
create index if not exists events_location_coords_idx on public.events(location_lat, location_lng);
create index if not exists resource_submissions_status_idx on public.resource_submissions(status);
create index if not exists resource_submissions_created_at_idx on public.resource_submissions(created_at desc);
create unique index if not exists resource_submissions_legacy_suggestion_id_idx
on public.resource_submissions(legacy_suggestion_id);
create index if not exists event_submissions_status_idx on public.event_submissions(status);
create index if not exists event_submissions_starts_at_idx on public.event_submissions(starts_at);

alter table if exists public.resource_suggestions add column if not exists id uuid default gen_random_uuid();
alter table if exists public.resource_suggestions add column if not exists resource_name text;
alter table if exists public.resource_suggestions add column if not exists name text;
alter table if exists public.resource_suggestions add column if not exists title text;
alter table if exists public.resource_suggestions add column if not exists organization_name text;
alter table if exists public.resource_suggestions add column if not exists category text;
alter table if exists public.resource_suggestions add column if not exists description text;
alter table if exists public.resource_suggestions add column if not exists website text;
alter table if exists public.resource_suggestions add column if not exists address text;
alter table if exists public.resource_suggestions add column if not exists contact_email text;
alter table if exists public.resource_suggestions add column if not exists contact_phone text;
alter table if exists public.resource_suggestions add column if not exists submitter_name text;
alter table if exists public.resource_suggestions add column if not exists submitter_email text;
alter table if exists public.resource_suggestions add column if not exists submitter_connection text;
alter table if exists public.resource_suggestions add column if not exists status text;
alter table if exists public.resource_suggestions add column if not exists created_at timestamptz default now();
alter table if exists public.resource_suggestions add column if not exists updated_at timestamptz default now();

do $$
begin
  if to_regclass('public.resource_suggestions') is not null then
    insert into public.resource_submissions (
      legacy_suggestion_id,
      resource_name,
      organization_name,
      category,
      description,
      website,
      address,
      contact_email,
      contact_phone,
      submitter_name,
      submitter_email,
      submitter_connection,
      status,
      created_at,
      updated_at
    )
    select
      (
        substr(md5(rs.id::text), 1, 8) || '-' ||
        substr(md5(rs.id::text), 9, 4) || '-' ||
        substr(md5(rs.id::text), 13, 4) || '-' ||
        substr(md5(rs.id::text), 17, 4) || '-' ||
        substr(md5(rs.id::text), 21, 12)
      )::uuid,
      coalesce(
        nullif(btrim(rs.resource_name), ''),
        nullif(btrim(rs.name), ''),
        nullif(btrim(rs.title), ''),
        'Community Resource Suggestion'
      ),
      rs.organization_name,
      case
        when rs.category in (
          'Food Assistance',
          'Health & Wellness',
          'Housing Support',
          'Youth Programs',
          'Job Help',
          'Community Events'
        ) then rs.category
        else 'Community Events'
      end,
      coalesce(nullif(btrim(rs.description), ''), 'Imported from legacy resource suggestion'),
      nullif(btrim(rs.website), ''),
      coalesce(nullif(btrim(rs.address), ''), 'Address pending moderator confirmation'),
      nullif(btrim(rs.contact_email), ''),
      nullif(btrim(rs.contact_phone), ''),
      coalesce(nullif(btrim(rs.submitter_name), ''), 'Unknown submitter'),
      coalesce(nullif(btrim(rs.submitter_email), ''), 'unknown@example.com'),
      nullif(btrim(rs.submitter_connection), ''),
      case
        when rs.status = 'rejected' then 'rejected'::public.submission_status
        when rs.status in ('reviewed', 'converted') then 'approved'::public.submission_status
        else 'pending'::public.submission_status
      end,
      coalesce(rs.created_at, now()),
      coalesce(rs.updated_at, coalesce(rs.created_at, now()))
    from public.resource_suggestions rs
    on conflict do nothing;
  end if;
end
$$;

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;
alter table public.resource_submissions enable row level security;
alter table public.event_submissions enable row level security;

drop policy if exists "profiles_select_own_or_moderator" on public.profiles;
drop policy if exists "profiles_update_own_or_moderator" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

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
drop policy if exists "resources_authenticated_read" on public.resources;
drop policy if exists "resources_insert_contributor" on public.resources;
drop policy if exists "resources_update_own_or_moderator" on public.resources;
drop policy if exists "resources_delete_own_or_moderator" on public.resources;
drop policy if exists "public read resources" on public.resources;
drop policy if exists "resources_insert_own" on public.resources;
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
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  )
  and (
    public.is_moderator()
    or status in ('draft', 'published', 'archived')
  )
);

create policy "resources_update_own_or_moderator"
on public.resources
for update
to authenticated
using (
  (
    created_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and status = 'approved'
    )
  )
  or public.is_moderator()
)
with check (
  (
    (
      created_by = auth.uid()
      and exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and status = 'approved'
      )
    )
    or public.is_moderator()
  )
  and (
    public.is_moderator()
    or status in ('draft', 'published', 'archived')
  )
);

create policy "resources_delete_own_or_moderator"
on public.resources
for delete
to authenticated
using (created_by = auth.uid() or public.is_moderator());

drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_authenticated_read" on public.events;
drop policy if exists "events_insert_contributor" on public.events;
drop policy if exists "events_update_own_or_moderator" on public.events;
drop policy if exists "events_delete_own_or_moderator" on public.events;
drop policy if exists "public read events" on public.events;
drop policy if exists "events_insert_own" on public.events;
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
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  )
  and (
    public.is_moderator()
    or status in ('draft', 'published', 'archived')
  )
);

create policy "events_update_own_or_moderator"
on public.events
for update
to authenticated
using (
  (
    created_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and status = 'approved'
    )
  )
  or public.is_moderator()
)
with check (
  (
    (
      created_by = auth.uid()
      and exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and status = 'approved'
      )
    )
    or public.is_moderator()
  )
  and (
    public.is_moderator()
    or status in ('draft', 'published', 'archived')
  )
);

create policy "events_delete_own_or_moderator"
on public.events
for delete
to authenticated
using (created_by = auth.uid() or public.is_moderator());

drop policy if exists "resource_submissions_public_insert" on public.resource_submissions;
drop policy if exists "resource_submissions_moderator_read" on public.resource_submissions;
drop policy if exists "resource_submissions_moderator_update" on public.resource_submissions;

create policy "resource_submissions_public_insert"
on public.resource_submissions
for insert
to public
with check (status = 'pending');

create policy "resource_submissions_moderator_read"
on public.resource_submissions
for select
to authenticated
using (public.is_moderator());

create policy "resource_submissions_moderator_update"
on public.resource_submissions
for update
to authenticated
using (public.is_moderator())
with check (public.is_moderator());

drop policy if exists "event_submissions_public_insert" on public.event_submissions;
drop policy if exists "event_submissions_moderator_read" on public.event_submissions;
drop policy if exists "event_submissions_moderator_update" on public.event_submissions;

create policy "event_submissions_public_insert"
on public.event_submissions
for insert
to public
with check (status = 'pending');

create policy "event_submissions_moderator_read"
on public.event_submissions
for select
to authenticated
using (public.is_moderator());

create policy "event_submissions_moderator_update"
on public.event_submissions
for update
to authenticated
using (public.is_moderator())
with check (public.is_moderator());
