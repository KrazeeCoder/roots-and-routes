-- add_profile_status.sql
-- 1. Add status column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Update existing profiles to 'approved' (so current users aren't locked out)
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';

-- 3. Update the handle_new_user trigger to explicitly set 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    organization_name,
    display_name,
    first_name,
    middle_name,
    last_name,
    phone,
    role,
    status
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'contributor',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies to require 'approved' status for creating/updating content
-- We need to check the profile status in our policies.

-- Policy for creating resources
DROP POLICY IF EXISTS "resources_insert_contributor" ON public.resources;
CREATE POLICY "resources_insert_contributor"
ON public.resources
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'approved'
  )
);

-- Policy for updating resources
DROP POLICY IF EXISTS "resources_update_own_or_moderator" ON public.resources;
CREATE POLICY "resources_update_own_or_moderator"
ON public.resources
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'approved'))
  OR public.is_moderator()
)
WITH CHECK (
  (
    (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'approved'))
    OR public.is_moderator()
  )
  AND (
    public.is_moderator()
    OR status IN ('draft', 'pending')
  )
);

-- Similar for events
DROP POLICY IF EXISTS "events_insert_contributor" ON public.events;
CREATE POLICY "events_insert_contributor"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'approved'
  )
);

DROP POLICY IF EXISTS "events_update_own_or_moderator" ON public.events;
CREATE POLICY "events_update_own_or_moderator"
ON public.events
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'approved'))
  OR public.is_moderator()
)
WITH CHECK (
  (
    (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'approved'))
    OR public.is_moderator()
  )
  AND (
    public.is_moderator()
    OR status IN ('draft', 'pending')
  )
);
