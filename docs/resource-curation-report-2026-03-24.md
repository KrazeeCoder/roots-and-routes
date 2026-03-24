# Resource Curation Report (2026-03-24)

## Scope
- Dataset analyzed: `C:\Users\tgsha\Downloads\resources_rows.json`
- Goal: curate to a service/civic-focused resource set, retain removed content in `public.resources_retired`, and ensure all published resources have image URLs.
- SQL runbook: `supabase/resources_curation_runbook.sql`
- Rollback script: `supabase/resources_curation_rollback.sql`

## Before/After Counts
- Before total rows: `50`
- Before published rows: `38`
- Before archived rows: `12`
- After rows in `public.resources`: `24`
- After published rows in `public.resources`: `24`
- Rows moved to `public.resources_retired`: `26`

Reconciliation:
- `24 (resources) + 26 (resources_retired) = 50` rows preserved.

## Moves to `resources_retired` by Reason

### `archived_status_cleanup` (12)
- `06e8faf4-4364-458b-8d07-f8a81ff72b6c` Bothell Arts Council
- `9090cae6-46f0-4071-9a2d-ffa0c4ceddea` Bothell Arts Council
- `e7132916-be6d-4acd-848a-b8411271a62d` Bothell Arts Council
- `206abbf4-4023-4038-936c-26fbf0e64459` Cascadia College
- `6ead08f1-c84c-4822-a595-1515da3b2966` Cascadia College
- `ea4f6508-e80a-410a-af6e-a16397ace250` Cascadia College
- `38c3c2ad-42f8-4f61-993b-8357e94ebc6e` EvergreenHealth Bothell
- `4ed748b0-368e-4f74-a333-9531af8387f0` EvergreenHealth Bothell
- `c35899ba-fb93-4a9c-b03b-6e90b59bdf65` EvergreenHealth Bothell
- `8df1d426-9381-4788-922a-188cce0255f0` Hopelink Bothell/Shoreline
- `a1a2a874-e3b2-42fe-b63a-3aec6d55b2d7` Hopelink Bothell/Shoreline
- `c50b2bcd-79b6-4ae9-970c-49c06424efbc` Hopelink Bothell/Shoreline

### `duplicate_exact_name` (2)
- `a1643457-81ea-403c-827e-9651201a50be` EvergreenHealth Bothell
- `95766e53-b47a-428a-983a-4c63c3e89156` Hopelink Bothell/Shoreline

### `duplicate_near_match` (2)
- `95dc8bb9-806d-4928-89cb-6390fa46d166` Bothell Library
- `deb8165b-45c0-4925-8fd9-a5e086a4fab7` Park at Bothell Landing

### `non_fit_service_civic_scope` (10)
- `c2a5d2ea-0502-42bb-b04c-a1c8481b9a8c` Blyth Park
- `1d6e2a41-0361-4acf-b0bf-ec71ebafb6e3` Centennial Park
- `4aea7734-37f5-45a4-81ab-b48d82d68190` Country Village (Legacy Site)
- `426fdf46-f9d4-46d8-a499-4260232a4ef6` Downtown Bothell Way
- `04fd33e2-3db8-4dfa-a0c8-0dbb6dc27de4` Former Wayne Golf Course (Park)
- `ec59f135-d9a5-46fe-9763-dd6d80a829ff` McMenamins Anderson School
- `8bf20bff-e629-405c-8f16-016bc298dcf4` North Creek Forest
- `0a1f9567-50ad-49e0-828b-46fb89ae6b72` Pop Keeney Stadium
- `dc65b910-6895-4ffb-8989-538fe43eebb5` Sammamish River Corridor
- `6252183a-9d45-41f4-a53a-8bb8da895f1a` Zulu's Board Game Cafe

## Dedupe Decisions
- Exact duplicate keepers:
- Keep `eebce1b4-5618-4cdc-96e2-d8ce4fa57d08` for **EvergreenHealth Bothell**
- Keep `ae376f16-dd86-40a4-871d-cf2814d18918` for **Hopelink Bothell/Shoreline**
- Near duplicate keepers:
- Keep **Bothell Library (KCLS)**, move **Bothell Library**
- Keep **Bothell Landing Park**, move **Park at Bothell Landing**

## Category Changes
- `Cascadia College` recategorized:
- from `Youth Programs`
- to `Job Help`

Final category distribution:
- `Community Events`: `5`
- `Health & Wellness`: `7`
- `Youth Programs`: `4`
- `Food Assistance`: `3`
- `Housing Support`: `3`
- `Job Help`: `2`

## Image Completion Updates
Updated image URLs for retained published resources:
- Bothell Arts Council: `https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
- Bothell Community Farmers Market: `https://images.unsplash.com/photo-1488459716781-31db52582fe9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
- Hopelink Bothell/Shoreline: `https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
- EvergreenHealth Bothell: `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
- Northshore Housing Stability Fund: `https://images.unsplash.com/photo-1460317442991-0ec209397118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
- WorkSource Snohomish County: `https://images.unsplash.com/photo-1521737711867-e3b97375f902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
- Cascadia College: `https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`

Post-curation image completeness target:
- Published rows with null/blank `image_url`: `0`

## Final Published Roster (24)
- `07eb4897-a673-4285-8804-6f904e46abda` Alyssa Burnett Adult Life Center (`Health & Wellness`)
- `5c09946e-8d07-43bb-b652-d99ff3c21523` ARCH Housing (`Housing Support`)
- `875f48a4-8c09-4164-984f-b4f8887d52b8` Bothell Arts Council (`Community Events`)
- `600064f5-f192-44e7-b5c2-3a89572d1c64` Bothell City Hall (`Community Events`)
- `a040f6e4-7395-4288-85fc-828861f17c1b` Bothell Community Farmers Market (`Community Events`)
- `6c7e682d-b114-49ef-afbc-2fd16aca2901` Bothell Community Hub (`Health & Wellness`)
- `54734e3f-e2db-4e05-ada0-7765c7845da3` Bothell Landing Park (`Community Events`)
- `7203c12f-d9f7-4433-b2a2-3cb6d823e30a` Bothell Library (KCLS) (`Youth Programs`)
- `4cd6138d-eee4-4bea-b2d5-6a12c3b06cc9` Cascadia College (`Job Help`)
- `581126b6-6aeb-4f9c-ab6a-38e0544c8b19` Community Homes Inc. (`Housing Support`)
- `eebce1b4-5618-4cdc-96e2-d8ce4fa57d08` EvergreenHealth Bothell (`Health & Wellness`)
- `b75c2bb5-ac62-41ab-8042-9606f3a058aa` Family Engagement and Resource Center (`Youth Programs`)
- `64341476-b7da-4079-904a-b0cedc7040c4` HealthPoint Bothell (`Health & Wellness`)
- `ae376f16-dd86-40a4-871d-cf2814d18918` Hopelink Bothell/Shoreline (`Food Assistance`)
- `dfd1a3a8-f2a6-4497-9ac1-e9821edcc1c3` Hopelink Kirkland/Northshore Market and Service Center (`Food Assistance`)
- `16671ebc-d8a8-4af1-84f0-b4780ab811bb` Kenmore Library (`Community Events`)
- `a821cdef-2250-45e7-aeb3-382261ca04f3` Kindering Bothell (`Health & Wellness`)
- `5b065979-dd34-4bc6-9360-201ad156f9a8` North Creek PTSA & Skyview PTSA Food Pantry (`Food Assistance`)
- `5238cb89-2bcd-4a43-b107-89b05d3deafa` Northshore Health & Wellness Center (`Health & Wellness`)
- `2f9cc28a-df93-4b77-9c5f-4d1d021c933c` Northshore Housing Stability Fund (`Housing Support`)
- `9aad9af9-4da7-4175-a0f1-0eff8e9926ec` Northshore Senior Center (`Health & Wellness`)
- `d4b54d9b-003c-4f4f-9db6-928c2d685866` Northshore YMCA (`Youth Programs`)
- `b5e02371-0b9f-45c3-8909-fc2bfe8cb0be` University of Washington Bothell (`Youth Programs`)
- `8a7ad46a-8483-4178-ac2a-319584e5dbf3` WorkSource Snohomish County (`Job Help`)

## Run Instructions
- Open Supabase SQL Editor.
- Run `supabase/resources_curation_runbook.sql` as one script.
- Confirm quality gate and verification query output at script end.

## Rollback Instructions
- Open Supabase SQL Editor.
- Run `supabase/resources_curation_rollback.sql`.
- Default behavior restores all rows moved by the runbook.
- To restore only specific IDs, add rows to `_restore_ids` in the rollback script and leave `_restore_reasons` unchanged.
- If you need to re-enforce non-archivable resource statuses after partial restore, run the optional constraint block at the bottom of the rollback script.
