-- seed_engagement_after_old_seed.sql
-- Run this AFTER seed_engagement_demo.sql.
-- Goals:
-- 1) Every published resource has at least a few ratings.
-- 2) No published resource average rating falls below 3.5.
-- 3) Less-prominent resources get fewer ratings/likes than featured ones.

begin;

with featured_names(name) as (
  values
    ('Bothell Community Farmers Market'),
    ('Northshore Housing Stability Fund'),
    ('Bothell Landing Park'),
    ('Hopelink Bothell/Shoreline'),
    ('EvergreenHealth Bothell'),
    ('WorkSource Snohomish County'),
    ('HealthPoint Bothell'),
    ('Northshore YMCA')
),
published_resources as (
  select
    r.id,
    r.name,
    exists (
      select 1
      from featured_names fn
      where fn.name = r.name
    ) as is_featured
  from public.resources r
  where r.status = 'published'
),
rating_actors(actor_hash) as (
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
    ('demo_actor_012'),
    ('demo_actor_013'),
    ('demo_actor_014'),
    ('demo_actor_015'),
    ('demo_actor_016')
),
base_rating_rows as (
  -- Guarantees every published resource has at least two ratings.
  select pr.id as resource_id, 'baseline_actor_001'::text as actor_hash, 4::smallint as rating
  from published_resources pr
  union all
  select pr.id as resource_id, 'baseline_actor_002'::text as actor_hash, 5::smallint as rating
  from published_resources pr
),
extra_rating_rows as (
  -- Featured resources get more volume; others still get some.
  select
    pr.id as resource_id,
    ra.actor_hash,
    case
      when (abs(hashtext(pr.id::text || ':' || ra.actor_hash || ':score')) % 100) < 58 then 4::smallint
      else 5::smallint
    end as rating
  from published_resources pr
  join rating_actors ra
    on (
      abs(hashtext(pr.id::text || ':' || ra.actor_hash || ':include_rating')) % 100
    ) < (case when pr.is_featured then 80 else 28 end)
),
rating_payload as (
  select resource_id, actor_hash, rating from base_rating_rows
  union all
  select resource_id, actor_hash, rating from extra_rating_rows
)
insert into public.resource_ratings (resource_id, actor_hash, rating, reason)
select
  rp.resource_id,
  rp.actor_hash,
  rp.rating,
  case
    when rp.rating = 5 then 'Excellent local resource. Easy to find and use.'
    else 'Helpful local resource with reliable information.'
  end as reason
from rating_payload rp
on conflict (resource_id, actor_hash)
do update
set
  rating = excluded.rating,
  reason = excluded.reason,
  updated_at = now();

-- If old seed inserted low ratings, lift them so averages cannot fall below 3.5.
with published_resources as (
  select id
  from public.resources
  where status = 'published'
)
update public.resource_ratings rr
set
  rating = 4,
  reason = case
    when coalesce(trim(rr.reason), '') = '' then 'Helpful local resource with reliable information.'
    else rr.reason
  end,
  updated_at = now()
from published_resources pr
where rr.resource_id = pr.id
  and rr.rating < 4;

with featured_names(name) as (
  values
    ('Bothell Community Farmers Market'),
    ('Northshore Housing Stability Fund'),
    ('Bothell Landing Park'),
    ('Hopelink Bothell/Shoreline'),
    ('EvergreenHealth Bothell'),
    ('WorkSource Snohomish County'),
    ('HealthPoint Bothell'),
    ('Northshore YMCA')
),
published_resources as (
  select
    r.id,
    r.name,
    exists (
      select 1
      from featured_names fn
      where fn.name = r.name
    ) as is_featured
  from public.resources r
  where r.status = 'published'
),
like_actors(actor_hash) as (
  values
    ('demo_like_001'),
    ('demo_like_002'),
    ('demo_like_003'),
    ('demo_like_004'),
    ('demo_like_005'),
    ('demo_like_006'),
    ('demo_like_007'),
    ('demo_like_008'),
    ('demo_like_009'),
    ('demo_like_010'),
    ('demo_like_011'),
    ('demo_like_012'),
    ('demo_like_013'),
    ('demo_like_014'),
    ('demo_like_015'),
    ('demo_like_016'),
    ('demo_like_017'),
    ('demo_like_018')
),
base_like_rows as (
  -- Guarantees every published resource has at least one like.
  select pr.id as resource_id, 'baseline_like_001'::text as actor_hash
  from published_resources pr
),
extra_like_rows as (
  select
    pr.id as resource_id,
    la.actor_hash
  from published_resources pr
  join like_actors la
    on (
      abs(hashtext(pr.id::text || ':' || la.actor_hash || ':include_like')) % 100
    ) < (case when pr.is_featured then 86 else 36 end)
),
like_payload as (
  select resource_id, actor_hash from base_like_rows
  union all
  select resource_id, actor_hash from extra_like_rows
)
insert into public.resource_likes (resource_id, actor_hash)
select lp.resource_id, lp.actor_hash
from like_payload lp
on conflict (resource_id, actor_hash) do nothing;

commit;

-- Verification:
-- 1) no resource average below 3.5
-- 2) no published resource missing ratings
with rating_stats as (
  select
    r.id,
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
)
select
  name,
  avg_rating,
  total_ratings,
  total_likes
from rating_stats
order by avg_rating asc, total_ratings asc, name asc;

with rating_stats as (
  select
    r.id,
    coalesce(avg(rr.rating), 0)::numeric(4,2) as avg_rating,
    count(rr.*)::int as total_ratings
  from public.resources r
  left join public.resource_ratings rr on rr.resource_id = r.id
  where r.status = 'published'
  group by r.id
)
select
  count(*) filter (where avg_rating < 3.5) as resources_below_3_5,
  count(*) filter (where total_ratings = 0) as resources_with_no_ratings
from rating_stats;
