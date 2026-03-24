-- Resource curation rollback
-- Purpose:
-- Restore selected rows from public.resources_retired back into public.resources.
-- This script supports either:
-- 1) Restore by retired_reason (default), or
-- 2) Restore only specific resource IDs.

begin;

-- If archived rows are restored, this constraint must be removed first.
alter table public.resources
  drop constraint if exists resources_status_not_archivable;

-- 1) Choose reasons to restore (default: all curation reasons).
create temporary table _restore_reasons (
  reason text primary key
) on commit drop;

insert into _restore_reasons (reason) values
  ('archived_status_cleanup'),
  ('duplicate_exact_name'),
  ('duplicate_near_match'),
  ('non_fit_service_civic_scope');

-- 2) Optional: restore specific IDs instead of reason-based restore.
-- If this table has rows, only these IDs are restored.
create temporary table _restore_ids (
  id uuid primary key
) on commit drop;

-- Example:
-- insert into _restore_ids (id) values
--   ('00000000-0000-0000-0000-000000000000');

with candidates as (
  select rr.*
  from public.resources_retired rr
  where rr.retired_source = 'resource_curation_runbook'
    and (
      exists (select 1 from _restore_ids rid where rid.id = rr.id)
      or (
        not exists (select 1 from _restore_ids)
        and exists (
          select 1
          from _restore_reasons rrn
          where rrn.reason = rr.retired_reason
        )
      )
    )
), ins as (
  insert into public.resources (
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at
  )
  select
    id, name, category, description, full_description, address, phone, email, website, hours,
    tags, image_url, created_by, posted_by_name, status, is_spotlight, spotlight_subtitle,
    created_at, updated_at
  from candidates
  on conflict (id) do update
  set
    name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    full_description = excluded.full_description,
    address = excluded.address,
    phone = excluded.phone,
    email = excluded.email,
    website = excluded.website,
    hours = excluded.hours,
    tags = excluded.tags,
    image_url = excluded.image_url,
    created_by = excluded.created_by,
    posted_by_name = excluded.posted_by_name,
    status = excluded.status,
    is_spotlight = excluded.is_spotlight,
    spotlight_subtitle = excluded.spotlight_subtitle,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at
  returning id
)
delete from public.resources_retired rr
using ins
where rr.id = ins.id;

commit;

-- Optional: re-enable non-archivable rule only if you do not want archived rows
-- in public.resources anymore.
-- alter table public.resources
--   add constraint resources_status_not_archivable
--   check (status <> 'archived');

-- Verification
select status, count(*) as resource_count
from public.resources
group by status
order by status;

select retired_reason, count(*) as retired_count
from public.resources_retired
group by retired_reason
order by retired_count desc, retired_reason;
