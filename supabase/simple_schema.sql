create extension if not exists pgcrypto;

create table if not exists public.hero_filters (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order int not null default 0
);

create table if not exists public.waypoints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_key text not null,
  description text not null,
  sort_order int not null default 0
);

create table if not exists public.find_path_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon_key text not null,
  description text not null,
  sort_order int not null default 0
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  title text not null,
  time text not null,
  location text not null,
  category text not null,
  image text,
  sort_order int not null default 0
);

create table if not exists public.directory_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  address text not null,
  phone text,
  website text,
  hours text,
  tags text[] not null default '{}',
  image text
);

create table if not exists public.spotlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  category text not null,
  description text not null,
  full_description text not null,
  audience text not null,
  location text not null,
  featured boolean not null default false,
  image text,
  sort_order int not null default 0
);

create table if not exists public.resource_suggestions (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  contact_name text,
  email text,
  phone text,
  category text,
  description text not null,
  website text,
  address text,
  created_at timestamptz not null default now()
);

alter table public.hero_filters enable row level security;
alter table public.waypoints enable row level security;
alter table public.find_path_steps enable row level security;
alter table public.events enable row level security;
alter table public.directory_entries enable row level security;
alter table public.spotlights enable row level security;
alter table public.resource_suggestions enable row level security;

drop policy if exists "public read hero_filters" on public.hero_filters;
create policy "public read hero_filters"
on public.hero_filters for select
using (true);

drop policy if exists "public read waypoints" on public.waypoints;
create policy "public read waypoints"
on public.waypoints for select
using (true);

drop policy if exists "public read find_path_steps" on public.find_path_steps;
create policy "public read find_path_steps"
on public.find_path_steps for select
using (true);

drop policy if exists "public read events" on public.events;
create policy "public read events"
on public.events for select
using (true);

drop policy if exists "public read directory_entries" on public.directory_entries;
create policy "public read directory_entries"
on public.directory_entries for select
using (true);

drop policy if exists "public read spotlights" on public.spotlights;
create policy "public read spotlights"
on public.spotlights for select
using (true);

drop policy if exists "public insert resource_suggestions" on public.resource_suggestions;
create policy "public insert resource_suggestions"
on public.resource_suggestions for insert
to anon
with check (true);
