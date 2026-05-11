begin;

drop function if exists public.list_directory_resources_page(
  integer,
  integer,
  text,
  text,
  numeric
);

create function public.list_directory_resources_page(
  p_page integer default 1,
  p_page_size integer default 8,
  p_query text default null,
  p_category text default null,
  p_min_rating numeric default 0
)
returns table (
  id uuid,
  name text,
  category text,
  description text,
  full_description text,
  address text,
  phone text,
  email text,
  website text,
  hours text,
  tags text[],
  image_url text,
  status text,
  is_spotlight boolean,
  spotlight_subtitle text,
  posted_by_name text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language plpgsql
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 8), 1), 100);
  v_offset integer := (v_page - 1) * v_page_size;
  v_query text := lower(coalesce(trim(p_query), ''));
  v_category text := nullif(trim(coalesce(p_category, '')), '');
  v_min_rating numeric := greatest(coalesce(p_min_rating, 0), 0);
begin
  return query
  with filtered as (
    select r.*
    from public.resources r
    left join public.resource_engagement_summary summary
      on summary.resource_id = r.id
    where r.status = 'published'
      and r.name <> all (array['Nutritional Program Free Trial'])
      and (
        v_category is null
        or lower(r.category::text) = lower(v_category)
      )
      and (
        v_min_rating <= 0
        or coalesce(summary.average_rating, 0) >= v_min_rating
      )
      and (
        v_query = ''
        or lower(r.name) like '%' || v_query || '%'
        or lower(coalesce(r.category::text, '')) like '%' || v_query || '%'
        or lower(coalesce(r.description, '')) like '%' || v_query || '%'
        or lower(coalesce(r.address, '')) like '%' || v_query || '%'
        or exists (
          select 1
          from unnest(coalesce(r.tags, '{}'::text[])) as tag
          where lower(tag) like '%' || v_query || '%'
        )
      )
  ),
  paged as (
    select
      f.*,
      count(*) over () as total_count
    from filtered f
    order by f.updated_at desc
    offset v_offset
    limit v_page_size
  )
  select
    p.id,
    p.name,
    p.category::text,
    p.description,
    p.full_description,
    p.address,
    p.phone,
    p.email,
    p.website,
    p.hours,
    p.tags,
    p.image_url,
    p.status::text,
    p.is_spotlight,
    p.spotlight_subtitle,
    p.posted_by_name,
    p.created_by,
    p.created_at,
    p.updated_at,
    p.total_count
  from paged p;
end;
$$;

grant execute on function public.list_directory_resources_page(integer, integer, text, text, numeric)
to anon, authenticated;

drop function if exists public.approve_resource_submission(uuid);

create function public.approve_resource_submission(submission_id uuid)
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

drop function if exists public.approve_event_submission(uuid);

create function public.approve_event_submission(submission_id uuid)
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

drop index if exists idx_resources_image_backfill_pending;
drop index if exists idx_events_image_backfill_pending;
drop index if exists idx_resource_submissions_image_backfill_pending;
drop index if exists idx_event_submissions_image_backfill_pending;

alter table if exists public.resources drop column if exists image_asset_path;
alter table if exists public.events drop column if exists image_asset_path;
alter table if exists public.resource_submissions drop column if exists image_asset_path;
alter table if exists public.event_submissions drop column if exists image_asset_path;

commit;
