-- Allow authenticated resource owners (and moderators) to read rating reasons for their own resources.

create or replace function public.list_resource_rating_feedback(p_resource_id uuid)
returns table(
  rating integer,
  reason text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_owner boolean;
  v_is_moderator boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select exists (
    select 1
    from public.resources r
    where r.id = p_resource_id
      and r.created_by = v_user_id
  ) into v_is_owner;

  select exists (
    select 1
    from public.profiles p
    where p.id = v_user_id
      and p.role in ('moderator', 'super_admin')
  ) into v_is_moderator;

  if not (v_is_owner or v_is_moderator) then
    raise exception 'Not authorized to view rating feedback for this resource';
  end if;

  return query
  select
    rr.rating::int,
    rr.reason,
    rr.created_at,
    rr.updated_at
  from public.resource_ratings rr
  where rr.resource_id = p_resource_id
  order by rr.updated_at desc, rr.created_at desc;
end;
$$;

grant execute on function public.list_resource_rating_feedback(uuid) to authenticated;
