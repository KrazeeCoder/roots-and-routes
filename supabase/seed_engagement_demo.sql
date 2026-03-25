-- seed_engagement_demo.sql
-- Adds realistic demo ratings + likes for published resources.
-- Note: current schema supports engagement on resources (resource_ratings/resource_likes).
-- If your project later adds event-specific engagement tables, seed those separately.

begin;

with preferred_resources as (
  select r.id, r.name, r.updated_at
  from public.resources r
  where r.status = 'published'
    and r.name in (
      'Bothell Community Farmers Market',
      'Northshore Housing Stability Fund',
      'Bothell Landing Park',
      'Hopelink Bothell/Shoreline',
      'EvergreenHealth Bothell',
      'WorkSource Snohomish County',
      'HealthPoint Bothell',
      'Northshore YMCA'
    )
),
fallback_resources as (
  select r.id, r.name, r.updated_at
  from public.resources r
  where r.status = 'published'
    and r.id not in (select id from preferred_resources)
  order by r.updated_at desc
  limit greatest(0, 8 - (select count(*) from preferred_resources))
),
target_resources as (
  select id, name from preferred_resources
  union all
  select id, name from fallback_resources
),
demo_actors(actor_hash) as (
  values
    ('demo_actor_001'),
    ('demo_actor_002'),
    ('demo_actor_003'),
    ('demo_actor_004'),
    ('demo_actor_005'),
    ('demo_actor_006'),
    ('demo_actor_007'),
    ('demo_actor_008'),
    ('demo_actor_009'),
    ('demo_actor_010'),
    ('demo_actor_011'),
    ('demo_actor_012')
),
rating_candidates as (
  select
    tr.id as resource_id,
    da.actor_hash,
    ((abs(hashtext(tr.id::text || ':' || da.actor_hash || ':rating')) % 5) + 1)::smallint as rating_value
  from target_resources tr
  join demo_actors da
    on (abs(hashtext(tr.id::text || ':' || da.actor_hash || ':include_rating')) % 100) < 62
),
rating_payload as (
  select
    rc.resource_id,
    rc.actor_hash,
    rc.rating_value as rating,
    case
      when rc.rating_value = 5 then 'Excellent resource with clear value for local residents.'
      when rc.rating_value = 4 then 'Very helpful and easy to use.'
      when rc.rating_value = 3 then 'Solid resource overall, but details could be clearer.'
      when rc.rating_value = 2 then 'Useful idea, but had trouble finding what I needed quickly.'
      else 'Limited fit for my situation, but still worth listing.'
    end as reason
  from rating_candidates rc
)
insert into public.resource_ratings (resource_id, actor_hash, rating, reason)
select resource_id, actor_hash, rating, reason
from rating_payload
on conflict (resource_id, actor_hash)
do update
set
  rating = excluded.rating,
  reason = excluded.reason,
  updated_at = now();

with preferred_resources as (
  select r.id, r.name, r.updated_at
  from public.resources r
  where r.status = 'published'
    and r.name in (
      'Bothell Community Farmers Market',
      'Northshore Housing Stability Fund',
      'Bothell Landing Park',
      'Hopelink Bothell/Shoreline',
      'EvergreenHealth Bothell',
      'WorkSource Snohomish County',
      'HealthPoint Bothell',
      'Northshore YMCA'
    )
),
fallback_resources as (
  select r.id, r.name, r.updated_at
  from public.resources r
  where r.status = 'published'
    and r.id not in (select id from preferred_resources)
  order by r.updated_at desc
  limit greatest(0, 8 - (select count(*) from preferred_resources))
),
target_resources as (
  select id, name from preferred_resources
  union all
  select id, name from fallback_resources
),
demo_actors(actor_hash) as (
  values
    ('demo_actor_001'),
    ('demo_actor_002'),
    ('demo_actor_003'),
    ('demo_actor_004'),
    ('demo_actor_005'),
    ('demo_actor_006'),
    ('demo_actor_007'),
    ('demo_actor_008'),
    ('demo_actor_009'),
    ('demo_actor_010'),
    ('demo_actor_011'),
    ('demo_actor_012')
)
insert into public.resource_likes (resource_id, actor_hash)
select tr.id, da.actor_hash
from target_resources tr
join demo_actors da
  on (abs(hashtext(tr.id::text || ':' || da.actor_hash || ':include_like')) % 100) < 74
on conflict (resource_id, actor_hash) do nothing;

commit;

-- Quick verification output
select
  r.name,
  coalesce(avg(rr.rating), 0)::numeric(4,2) as avg_rating,
  count(rr.*)::int as total_ratings,
  (
    select count(*)::int
    from public.resource_likes rl
    where rl.resource_id = r.id
  ) as total_likes
from public.resources r
left join public.resource_ratings rr on rr.resource_id = r.id
where r.status = 'published'
group by r.id, r.name
order by total_likes desc, total_ratings desc, avg_rating desc
limit 12;
