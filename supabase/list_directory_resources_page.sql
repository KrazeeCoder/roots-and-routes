begin;

create or replace function public.list_directory_resources_page(
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

commit;
