-- rebalance_resource_ratings_v3.sql
-- Use this AFTER running your previous engagement seed scripts.
-- Outcome:
-- - Most published resources average above 4.0
-- - Some published resources average between 3.5 and 4.0
-- - Only 1-2 published resources average below 3.5
-- - Every published resource has ratings

begin;

-- Remove synthetic ratings created by prior demo scripts so we can rebalance cleanly.
delete from public.resource_ratings rr
using public.resources r
where rr.resource_id = r.id
  and r.status = 'published'
  and (
    rr.actor_hash like 'demo\_%' escape '\'
    or rr.actor_hash like 'baseline\_%' escape '\'
    or rr.actor_hash like 'tier\_%' escape '\'
  );

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
resource_counts as (
  select count(*)::int as total_resources
  from published_resources
),
targets as (
  select
    case
      when rc.total_resources >= 12 then 2
      when rc.total_resources >= 1 then 1
      else 0
    end as low_count,
    case
      when rc.total_resources >= 12 then 3
      when rc.total_resources >= 7 then 2
      when rc.total_resources >= 2 then 1
      else 0
    end as mid_count
  from resource_counts rc
),
-- Lower-rating candidates prefer non-featured resources first.
lower_candidates as (
  select
    pr.id,
    pr.name,
    pr.is_featured,
    row_number() over (order by pr.is_featured asc, pr.name asc) as rn
  from published_resources pr
),
low_resources as (
  select lc.id
  from lower_candidates lc
  cross join targets t
  where lc.rn <= t.low_count
),
mid_resources as (
  select lc.id
  from lower_candidates lc
  cross join targets t
  where lc.rn > t.low_count
    and lc.rn <= (t.low_count + t.mid_count)
),
tiered_resources as (
  select
    pr.id,
    pr.name,
    case
      when pr.id in (select id from low_resources) then 'low'
      when pr.id in (select id from mid_resources) then 'mid'
      else 'high'
    end as tier
  from published_resources pr
),
high_actors(actor_hash, rating) as (
  values
    ('tier_high_01', 5::smallint),
    ('tier_high_02', 5::smallint),
    ('tier_high_03', 4::smallint),
    ('tier_high_04', 5::smallint),
    ('tier_high_05', 4::smallint),
    ('tier_high_06', 5::smallint),
    ('tier_high_07', 4::smallint),
    ('tier_high_08', 5::smallint)
),
mid_actors(actor_hash, rating) as (
  values
    ('tier_mid_01', 4::smallint),
    ('tier_mid_02', 4::smallint),
    ('tier_mid_03', 4::smallint),
    ('tier_mid_04', 3::smallint),
    ('tier_mid_05', 4::smallint)
),
low_actors(actor_hash, rating) as (
  values
    ('tier_low_01', 4::smallint),
    ('tier_low_02', 3::smallint),
    ('tier_low_03', 3::smallint),
    ('tier_low_04', 3::smallint)
),
rating_payload as (
  select tr.id as resource_id, ha.actor_hash, ha.rating
  from tiered_resources tr
  join high_actors ha on tr.tier = 'high'
  union all
  select tr.id as resource_id, ma.actor_hash, ma.rating
  from tiered_resources tr
  join mid_actors ma on tr.tier = 'mid'
  union all
  select tr.id as resource_id, la.actor_hash, la.rating
  from tiered_resources tr
  join low_actors la on tr.tier = 'low'
)
insert into public.resource_ratings (resource_id, actor_hash, rating, reason)
select
  rp.resource_id,
  rp.actor_hash,
  rp.rating,
  case
    when rp.rating = 5 then 'Excellent local resource. Clear, useful, and reliable.'
    when rp.rating = 4 then 'Helpful local resource with solid details.'
    else 'Useful resource, but some information could be clearer.'
  end as reason
from rating_payload rp
on conflict (resource_id, actor_hash)
do update
set
  rating = excluded.rating,
  reason = excluded.reason,
  updated_at = now();

commit;

-- Verification summary
with rating_stats as (
  select
    r.id,
    r.name,
    coalesce(avg(rr.rating), 0)::numeric(4,2) as avg_rating,
    count(rr.*)::int as total_ratings
  from public.resources r
  left join public.resource_ratings rr on rr.resource_id = r.id
  where r.status = 'published'
  group by r.id, r.name
)
select
  count(*) filter (where avg_rating > 4.0) as resources_over_4_0,
  count(*) filter (where avg_rating >= 3.5 and avg_rating <= 4.0) as resources_3_5_to_4_0,
  count(*) filter (where avg_rating < 3.5) as resources_below_3_5,
  count(*) filter (where total_ratings = 0) as resources_with_no_ratings
from rating_stats;

with rating_stats as (
  select
    r.name,
    coalesce(avg(rr.rating), 0)::numeric(4,2) as avg_rating,
    count(rr.*)::int as total_ratings
  from public.resources r
  left join public.resource_ratings rr on rr.resource_id = r.id
  where r.status = 'published'
  group by r.id, r.name
)
select
  name,
  avg_rating,
  total_ratings
from rating_stats
order by avg_rating asc, total_ratings asc, name asc;
