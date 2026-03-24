begin;

-- 1) Backup current categories so nothing is lost
create table if not exists public.resource_category_backup (
  resource_id uuid primary key references public.resources(id) on delete cascade,
  old_category text not null,
  backed_up_at timestamptz not null default now()
);

insert into public.resource_category_backup (resource_id, old_category)
select id, category
from public.resources
on conflict (resource_id) do update
set old_category = excluded.old_category,
    backed_up_at = now();

-- 2) Normalize to the 6 waypoint categories (auto-map + deterministic fallback)
update public.resources
set category = case
  when category is null or btrim(category) = '' then 'Community Events'

  -- direct known mappings
  when lower(btrim(category)) in ('food assistance', 'food', 'basic needs', 'financial assistance') then 'Food Assistance'
  when lower(btrim(category)) in ('health & wellness', 'health', 'healthcare', 'seniors') then 'Health & Wellness'
  when lower(btrim(category)) in ('housing support', 'housing') then 'Housing Support'
  when lower(btrim(category)) in ('youth programs', 'youth', 'education') then 'Youth Programs'
  when lower(btrim(category)) in ('job help', 'jobs') then 'Job Help'
  when lower(btrim(category)) in ('community events', 'community', 'community support', 'civic', 'arts', 'culture', 'parks & recreation', 'places', 'shopping', 'legal') then 'Community Events'

  -- keyword fallback mapping
  when lower(btrim(category)) ~ '(food|pantry|meal|nutrition|grocery)' then 'Food Assistance'
  when lower(btrim(category)) ~ '(health|wellness|medical|clinic|mental|senior|care)' then 'Health & Wellness'
  when lower(btrim(category)) ~ '(housing|shelter|rent|tenant|homeless)' then 'Housing Support'
  when lower(btrim(category)) ~ '(youth|education|school|student|child|teen|family|mentor)' then 'Youth Programs'
  when lower(btrim(category)) ~ '(job|work|career|employment|resume|workforce|training)' then 'Job Help'

  -- deterministic final fallback
  else 'Community Events'
end;

-- 3) Enforce category contract in DB
alter table public.resources
  drop constraint if exists resources_category_waypoint_check;

alter table public.resources
  add constraint resources_category_waypoint_check
  check (category in (
    'Food Assistance',
    'Health & Wellness',
    'Housing Support',
    'Youth Programs',
    'Job Help',
    'Community Events'
  ));

commit;

-- 4) Post-migration audit
select category, count(*) as resource_count
from public.resources
group by category
order by category;

-- Optional: inspect original values that were converted
select old_category, count(*) as original_count
from public.resource_category_backup
group by old_category
order by original_count desc, old_category;
