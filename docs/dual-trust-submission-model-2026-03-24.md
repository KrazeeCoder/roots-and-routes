# Dual-Trust Submission Model Migration

Run [simple_schema.sql](/c:/Users/tgsha/github_tsa2526/TSA-Web-Development-2526/roots-and-routes/supabase/simple_schema.sql) in the Supabase SQL editor for the latest full schema state.

This update does all of the following:

- Adds the `submission_status` enum.
- Adds `resource_submissions` and `event_submissions`.
- Backfills legacy `resource_suggestions` rows into `resource_submissions` when that old table exists.
- Adds moderator RPCs:
  - `approve_resource_submission(submission_id uuid)`
  - `approve_event_submission(submission_id uuid)`
- Updates RLS so approved contributors can create/update canonical `resources` and `events` with `draft`, `published`, or `archived`.
- Keeps public reads limited to `published` canonical content.
- Keeps public submissions insert-only for the new submission queue tables.

Supabase objects the app now depends on:

- Tables:
  - `profiles`
  - `resources`
  - `events`
  - `resource_submissions`
  - `event_submissions`
- Enums:
  - `content_status`
  - `submission_status`
  - `contributor_role`
- Functions:
  - `is_moderator()`
  - `approve_resource_submission(uuid)`
  - `approve_event_submission(uuid)`

After running the SQL:

1. Confirm the new tables appear in Supabase.
2. Confirm the two approval RPCs appear under database functions.
3. Test one anonymous resource submission and one anonymous event submission.
4. Sign in as a moderator and approve one of each from the portal.
5. Sign in as an approved contributor and verify a newly published resource/event appears immediately without moderation.
