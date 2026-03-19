-- promote_admin.sql
-- Use this script in the Supabase SQL Editor to promote a user to the moderator role.
-- Replace 'user@example.com' with the email of the user you want to promote.

-- 1. Find the user ID from the auth.users table
-- 2. Update their role in the public.profiles table to 'moderator'

UPDATE public.profiles
SET role = 'moderator'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'user@example.com' -- <-- REPLACE THIS EMAIL
);

-- Verification:
-- SELECT id, email, role FROM public.profiles WHERE role = 'moderator';
