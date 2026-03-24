# Anonymous Engagement Migration (Likes/Ratings)

Date: 2026-03-24

## What Changed
- Likes and ratings are now intended to be global via Supabase RPCs instead of browser-local storage.
- Rating reason ("explain rating") is persisted server-side and returned only for the current anonymous actor.
- Frontend integration now reads/writes engagement through RPC in `src/utils/engagementSupabase.ts`.

## SQL To Run
- Run the full script in: `supabase/anonymous_engagement_runbook.sql`
- Execute it once in Supabase SQL Editor.

## New Database Objects
- Tables:
  - `public.resource_ratings`
  - `public.resource_likes`
- Functions:
  - `public.current_actor_hash()`
  - `public.get_resource_engagement(uuid)`
  - `public.upsert_resource_rating(uuid, integer, text)`
  - `public.remove_resource_rating(uuid)`
  - `public.toggle_resource_like(uuid)`
- View:
  - `public.resource_engagement_summary`

## Rollback
- If you need to revert quickly, drop the new RPC functions first, then tables/view:
```sql
begin;

drop view if exists public.resource_engagement_summary;
drop function if exists public.toggle_resource_like(uuid);
drop function if exists public.remove_resource_rating(uuid);
drop function if exists public.upsert_resource_rating(uuid, integer, text);
drop function if exists public.get_resource_engagement(uuid);
drop function if exists public.current_actor_hash();

drop table if exists public.resource_likes;
drop table if exists public.resource_ratings;

commit;
```

## Notes
- Anonymous identity is derived from request `IP + user-agent` hash.
- Legacy localStorage likes/ratings are not migrated.
