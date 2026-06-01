-- Enables image uploads for:
-- 1) Authenticated portal users:
--    - resources/<auth.uid()>/...
--    - events/<auth.uid()>/...
-- 2) Anonymous public suggestions:
--    - suggestions/resources/anonymous/...
--    - suggestions/events/anonymous/...
--
-- The frontend persists only image_url strings in existing tables.

insert into storage.buckets (id, name, public)
values ('resource-images', 'resource-images', true)
on conflict (id) do update
set public = true;

drop policy if exists "resource_images_insert_authenticated_scoped" on storage.objects;
create policy "resource_images_insert_authenticated_scoped"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resource-images'
  and (
    (
      (storage.foldername(name))[1] = 'resources'
      and (storage.foldername(name))[2] = auth.uid()::text
    )
    or
    (
      (storage.foldername(name))[1] = 'events'
      and (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

drop policy if exists "resource_images_insert_anon_suggestions_scoped" on storage.objects;
create policy "resource_images_insert_anon_suggestions_scoped"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'resource-images'
  and (storage.foldername(name))[1] = 'suggestions'
  and (
    (
      (storage.foldername(name))[2] = 'resources'
      and (storage.foldername(name))[3] = 'anonymous'
    )
    or
    (
      (storage.foldername(name))[2] = 'events'
      and (storage.foldername(name))[3] = 'anonymous'
    )
  )
);
