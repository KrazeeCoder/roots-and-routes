begin;

create extension if not exists pgcrypto;

create or replace function public.current_actor_hash()
returns text
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  headers jsonb;
  forwarded_for text;
  client_ip text;
  user_agent text;
begin
  headers := coalesce(current_setting('request.headers', true), '{}')::jsonb;
  forwarded_for := coalesce(headers ->> 'x-forwarded-for', '');

  if forwarded_for <> '' then
    client_ip := btrim(split_part(forwarded_for, ',', 1));
  else
    client_ip := coalesce(nullif(headers ->> 'x-real-ip', ''), 'unknown_ip');
  end if;

  user_agent := coalesce(nullif(headers ->> 'user-agent', ''), 'unknown_ua');

  return encode(digest(client_ip || '|' || user_agent, 'sha256'), 'hex');
exception
  when others then
    return encode(digest('unknown_ip|unknown_ua', 'sha256'), 'hex');
end;
$$;

create table if not exists public.resource_ratings (
  resource_id uuid not null references public.resources(id) on delete cascade,
  actor_hash text not null default public.current_actor_hash(),
  rating smallint not null,
  reason text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (resource_id, actor_hash)
);

alter table public.resource_ratings
  alter column actor_hash set default public.current_actor_hash();

alter table public.resource_ratings
  drop constraint if exists resource_ratings_rating_check;

alter table public.resource_ratings
  add constraint resource_ratings_rating_check
  check (rating between 1 and 5);

alter table public.resource_ratings
  drop constraint if exists resource_ratings_reason_check;

alter table public.resource_ratings
  add constraint resource_ratings_reason_check
  check (char_length(btrim(reason)) between 1 and 500);

create table if not exists public.resource_likes (
  resource_id uuid not null references public.resources(id) on delete cascade,
  actor_hash text not null default public.current_actor_hash(),
  created_at timestamptz not null default now(),
  primary key (resource_id, actor_hash)
);

alter table public.resource_likes
  alter column actor_hash set default public.current_actor_hash();

create index if not exists resource_ratings_resource_id_idx on public.resource_ratings(resource_id);
create index if not exists resource_likes_resource_id_idx on public.resource_likes(resource_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resource_ratings_set_updated_at on public.resource_ratings;
create trigger resource_ratings_set_updated_at
before update on public.resource_ratings
for each row execute function public.set_updated_at();

alter table public.resource_ratings enable row level security;
alter table public.resource_likes enable row level security;

revoke all on table public.resource_ratings from anon, authenticated;
revoke all on table public.resource_likes from anon, authenticated;

create or replace function public.get_resource_engagement(p_resource_id uuid)
returns table(
  average_rating numeric(4,2),
  total_ratings integer,
  total_likes integer,
  user_rating integer,
  user_has_liked boolean,
  user_reason text
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_actor_hash text := public.current_actor_hash();
begin
  return query
  with rating_stats as (
    select
      coalesce(avg(rr.rating), 0)::numeric(4,2) as average_rating,
      count(*)::int as total_ratings
    from public.resource_ratings rr
    where rr.resource_id = p_resource_id
  ),
  like_stats as (
    select count(*)::int as total_likes
    from public.resource_likes rl
    where rl.resource_id = p_resource_id
  ),
  user_rating_row as (
    select rr.rating::int as user_rating, rr.reason as user_reason
    from public.resource_ratings rr
    where rr.resource_id = p_resource_id
      and rr.actor_hash = v_actor_hash
    limit 1
  ),
  user_like_row as (
    select exists (
      select 1
      from public.resource_likes rl
      where rl.resource_id = p_resource_id
        and rl.actor_hash = v_actor_hash
    ) as user_has_liked
  )
  select
    rs.average_rating,
    rs.total_ratings,
    ls.total_likes,
    urr.user_rating,
    ulr.user_has_liked,
    urr.user_reason
  from rating_stats rs
  cross join like_stats ls
  cross join user_like_row ulr
  left join user_rating_row urr on true;
end;
$$;

create or replace function public.upsert_resource_rating(
  p_resource_id uuid,
  p_rating integer,
  p_reason text
)
returns table(
  average_rating numeric(4,2),
  total_ratings integer,
  total_likes integer,
  user_rating integer,
  user_has_liked boolean,
  user_reason text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor_hash text := public.current_actor_hash();
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  if char_length(v_reason) = 0 then
    raise exception 'Reason is required';
  end if;

  if char_length(v_reason) > 500 then
    raise exception 'Reason must be at most 500 characters';
  end if;

  insert into public.resource_ratings (resource_id, actor_hash, rating, reason)
  values (p_resource_id, v_actor_hash, p_rating::smallint, v_reason)
  on conflict (resource_id, actor_hash)
  do update
  set rating = excluded.rating,
      reason = excluded.reason,
      updated_at = now();

  return query
  select * from public.get_resource_engagement(p_resource_id);
end;
$$;

create or replace function public.remove_resource_rating(p_resource_id uuid)
returns table(
  average_rating numeric(4,2),
  total_ratings integer,
  total_likes integer,
  user_rating integer,
  user_has_liked boolean,
  user_reason text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor_hash text := public.current_actor_hash();
begin
  delete from public.resource_ratings rr
  where rr.resource_id = p_resource_id
    and rr.actor_hash = v_actor_hash;

  return query
  select * from public.get_resource_engagement(p_resource_id);
end;
$$;

create or replace function public.toggle_resource_like(p_resource_id uuid)
returns table(
  is_liked boolean,
  total_likes integer
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor_hash text := public.current_actor_hash();
  v_deleted integer;
begin
  delete from public.resource_likes rl
  where rl.resource_id = p_resource_id
    and rl.actor_hash = v_actor_hash;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    insert into public.resource_likes (resource_id, actor_hash)
    values (p_resource_id, v_actor_hash)
    on conflict (resource_id, actor_hash) do nothing;

    return query
    select true as is_liked,
           (select count(*)::int from public.resource_likes where resource_id = p_resource_id) as total_likes;
  else
    return query
    select false as is_liked,
           (select count(*)::int from public.resource_likes where resource_id = p_resource_id) as total_likes;
  end if;
end;
$$;

create or replace view public.resource_engagement_summary as
select
  r.id as resource_id,
  coalesce(rr.average_rating, 0)::numeric(4,2) as average_rating,
  coalesce(rr.total_ratings, 0)::int as total_ratings,
  coalesce(rl.total_likes, 0)::int as total_likes
from public.resources r
left join (
  select resource_id, avg(rating)::numeric(4,2) as average_rating, count(*)::int as total_ratings
  from public.resource_ratings
  group by resource_id
) rr on rr.resource_id = r.id
left join (
  select resource_id, count(*)::int as total_likes
  from public.resource_likes
  group by resource_id
) rl on rl.resource_id = r.id;

grant execute on function public.get_resource_engagement(uuid) to anon, authenticated;
grant execute on function public.upsert_resource_rating(uuid, integer, text) to anon, authenticated;
grant execute on function public.remove_resource_rating(uuid) to anon, authenticated;
grant execute on function public.toggle_resource_like(uuid) to anon, authenticated;
grant select on public.resource_engagement_summary to anon, authenticated;

commit;

-- Post-run validation
select
  (select count(*) from public.resource_ratings) as rating_rows,
  (select count(*) from public.resource_likes) as like_rows;

select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'current_actor_hash',
    'get_resource_engagement',
    'upsert_resource_rating',
    'remove_resource_rating',
    'toggle_resource_like'
  )
order by proname;
