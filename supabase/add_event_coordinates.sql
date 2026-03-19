alter table if exists public.events
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision;

create index if not exists events_location_coords_idx
  on public.events(location_lat, location_lng);
