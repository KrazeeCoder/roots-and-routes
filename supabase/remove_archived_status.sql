-- remove_archived_status.sql
-- Converts archived content into draft and blocks archived from being written again.

update public.resources
set status = 'draft'
where status = 'archived';

update public.events
set status = 'draft'
where status = 'archived';

alter table if exists public.resources
  drop constraint if exists resources_status_not_archived;
alter table if exists public.resources
  add constraint resources_status_not_archived
  check (status <> 'archived');

alter table if exists public.events
  drop constraint if exists events_status_not_archived;
alter table if exists public.events
  add constraint events_status_not_archived
  check (status <> 'archived');
