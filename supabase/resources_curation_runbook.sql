-- Resource curation runbook
-- Purpose:
-- 1) Move archived/non-kept rows out of public.resources into public.resources_retired
-- 2) Deduplicate published rows (exact + near duplicate)
-- 3) Curate to service/civic set and rebalance categories
-- 4) Fill missing images for retained published resources
-- 5) Enforce resources table cannot keep archived rows

begin;

create table if not exists public.resources_retired (
  id uuid primary key,
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
  created_by uuid references auth.users(id) on delete set null,
  posted_by_name text,
  status public.content_status not null,
  is_spotlight boolean not null default false,
  spotlight_subtitle text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  retired_at timestamptz not null default now(),
  retired_reason text not null,
  retired_from_status public.content_status not null,
  retired_by uuid references auth.users(id) on delete set null,
  retired_source text not null default 'resource_curation_runbook'
);

create index if not exists resources_retired_retired_at_idx on public.resources_retired(retired_at desc);
create index if not exists resources_retired_reason_idx on public.resources_retired(retired_reason);
create index if not exists resources_retired_name_idx on public.resources_retired(name);

-- 1) Move existing archived rows out of main table.
with to_move as (
  select r.*, 'archived_status_cleanup'::text as reason
  from public.resources r
  where r.status = 'archived'
), ins as (
  insert into public.resources_retired (
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, retired_at, retired_reason, retired_from_status, retired_by
  )
  select
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, now(), reason, status, auth.uid()
  from to_move
  on conflict (id) do update
  set
    retired_at = excluded.retired_at,
    retired_reason = excluded.retired_reason,
    retired_from_status = excluded.retired_from_status,
    retired_by = excluded.retired_by,
    retired_source = 'resource_curation_runbook'
  returning id
)
delete from public.resources r
using ins
where r.id = ins.id;

-- 2) Move exact-name published duplicates (keep best row per name).
with ranked as (
  select
    r.id,
    row_number() over (
      partition by lower(trim(r.name))
      order by
        case when r.image_url is not null and btrim(r.image_url) <> '' then 1 else 0 end desc,
        r.is_spotlight desc,
        r.updated_at desc,
        r.created_at desc,
        r.id desc
    ) as rn
  from public.resources r
  where r.status = 'published'
), to_move as (
  select r.*, 'duplicate_exact_name'::text as reason
  from public.resources r
  join ranked x on x.id = r.id
  where x.rn > 1
), ins as (
  insert into public.resources_retired (
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, retired_at, retired_reason, retired_from_status, retired_by
  )
  select
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, now(), reason, status, auth.uid()
  from to_move
  on conflict (id) do update
  set
    retired_at = excluded.retired_at,
    retired_reason = excluded.retired_reason,
    retired_from_status = excluded.retired_from_status,
    retired_by = excluded.retired_by,
    retired_source = 'resource_curation_runbook'
  returning id
)
delete from public.resources r
using ins
where r.id = ins.id;

-- 3) Move explicit near-duplicate records.
with to_move as (
  select r.*, 'duplicate_near_match'::text as reason
  from public.resources r
  where r.status = 'published'
    and r.name in ('Bothell Library', 'Park at Bothell Landing')
), ins as (
  insert into public.resources_retired (
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, retired_at, retired_reason, retired_from_status, retired_by
  )
  select
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, now(), reason, status, auth.uid()
  from to_move
  on conflict (id) do update
  set
    retired_at = excluded.retired_at,
    retired_reason = excluded.retired_reason,
    retired_from_status = excluded.retired_from_status,
    retired_by = excluded.retired_by,
    retired_source = 'resource_curation_runbook'
  returning id
)
delete from public.resources r
using ins
where r.id = ins.id;

-- 4) Move non-fit community-place rows out of main resources.
with to_move as (
  select r.*, 'non_fit_service_civic_scope'::text as reason
  from public.resources r
  where r.status = 'published'
    and (
      r.name in (
        'Blyth Park',
        'Centennial Park',
        'Country Village (Legacy Site)',
        'Downtown Bothell Way',
        'Former Wayne Golf Course (Park)',
        'McMenamins Anderson School',
        'North Creek Forest',
        'Pop Keeney Stadium',
        'Sammamish River Corridor'
      )
      or r.name ilike 'Zulu%Board Game Cafe%'
    )
), ins as (
  insert into public.resources_retired (
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, retired_at, retired_reason, retired_from_status, retired_by
  )
  select
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at, now(), reason, status, auth.uid()
  from to_move
  on conflict (id) do update
  set
    retired_at = excluded.retired_at,
    retired_reason = excluded.retired_reason,
    retired_from_status = excluded.retired_from_status,
    retired_by = excluded.retired_by,
    retired_source = 'resource_curation_runbook'
  returning id
)
delete from public.resources r
using ins
where r.id = ins.id;

-- 5) Moderate category rebalance: move Cascadia College to Job Help.
update public.resources
set
  category = 'Job Help',
  updated_at = now()
where status = 'published'
  and name = 'Cascadia College';

-- 6) Fill missing images for retained published resources.
update public.resources
set
  image_url = case name
    when 'Bothell Arts Council' then 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    when 'Bothell Community Farmers Market' then 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    when 'Hopelink Bothell/Shoreline' then 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    when 'EvergreenHealth Bothell' then 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    when 'Northshore Housing Stability Fund' then 'https://images.unsplash.com/photo-1460317442991-0ec209397118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    when 'WorkSource Snohomish County' then 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    when 'Cascadia College' then 'https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    else image_url
  end,
  updated_at = now()
where status = 'published'
  and (
    image_url is null
    or btrim(image_url) = ''
  )
  and name in (
    'Bothell Arts Council',
    'Bothell Community Farmers Market',
    'Hopelink Bothell/Shoreline',
    'EvergreenHealth Bothell',
    'Northshore Housing Stability Fund',
    'WorkSource Snohomish County',
    'Cascadia College'
  );

-- 7) Prevent archived resources from remaining in the main table.
alter table public.resources
  drop constraint if exists resources_status_not_archivable;

alter table public.resources
  add constraint resources_status_not_archivable
  check (status <> 'archived');

commit;

-- 8) Quality gates (raise if out of target).
do $$
declare
  published_count integer;
  missing_image_count integer;
  duplicate_name_count integer;
begin
  select count(*) into published_count
  from public.resources
  where status = 'published';

  if published_count < 24 or published_count > 28 then
    raise exception 'Published resource count out of range (24-28). Actual: %', published_count;
  end if;

  select count(*) into missing_image_count
  from public.resources
  where status = 'published'
    and (image_url is null or btrim(image_url) = '');

  if missing_image_count > 0 then
    raise exception 'Published resources still missing images: %', missing_image_count;
  end if;

  select count(*) into duplicate_name_count
  from (
    select lower(trim(name)) as normalized_name
    from public.resources
    where status = 'published'
    group by lower(trim(name))
    having count(*) > 1
  ) dupes;

  if duplicate_name_count > 0 then
    raise exception 'Published resources still have duplicate names: %', duplicate_name_count;
  end if;
end
$$;

-- 9) Verification reports.
select category, count(*) as published_count
from public.resources
where status = 'published'
group by category
order by published_count desc, category;

select retired_reason, count(*) as moved_count
from public.resources_retired
where retired_source = 'resource_curation_runbook'
group by retired_reason
order by moved_count desc, retired_reason;

select status, count(*) as current_count
from public.resources
group by status
order by status;

select
  (select count(*) from public.resources) as resources_count,
  (select count(*) from public.resources_retired where retired_source = 'resource_curation_runbook') as retired_count,
  (
    (select count(*) from public.resources)
    + (select count(*) from public.resources_retired where retired_source = 'resource_curation_runbook')
  ) as combined_count;
