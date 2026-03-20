-- cleanup_dummy_links.sql
-- Run in Supabase SQL Editor to replace/remove placeholder links in existing data.

begin;

-- 1) Replace known seed placeholder websites with real URLs.
update public.resources
set website = 'https://www.bothellwa.gov/148/Your-Community'
where name = 'Downtown Community Center'
  and website ilike '%example.com%';

update public.resources
set website = 'https://www.hopelink.org/'
where name = 'Green Valley Food Pantry'
  and website ilike '%example.com%';

update public.resources
set website = 'https://healthpointchc.org/'
where name = 'Riverside Health Clinic'
  and website ilike '%example.com%';

update public.resources
set website = 'https://www.ywcaworks.org/'
where name = 'Springfield Pathways Housing'
  and website ilike '%example.com%';

update public.resources
set website = 'https://www.bgcsc.org/'
where name = 'Tech Forward Youth Program'
  and website ilike '%example.com%';

-- Any remaining placeholder websites are nulled so broken links are not shown.
update public.resources
set website = null
where website ilike '%example.com%'
   or website ilike '%localhost%';

-- 2) Replace known broken Unsplash image URLs.
update public.resources
set image_url = 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
where image_url = 'https://images.unsplash.com/photo-1593113592332-6e2ee791ef60?q=80&w=800';

update public.resources
set image_url = 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
where image_url ilike '%photo-1576091160399-112ba8d25d1f%';

update public.resources
set image_url = 'https://images.unsplash.com/photo-1767274101063-a735a6849afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
where image_url ilike '%photo-1579952363873-27d3bfad9c0d%';

update public.events
set image_url = 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
where image_url = 'https://images.unsplash.com/photo-1593113592332-6e2ee791ef60?q=80&w=800';

update public.events
set image_url = 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
where image_url ilike '%photo-1576091160399-112ba8d25d1f%';

update public.events
set image_url = 'https://images.unsplash.com/photo-1767274101063-a735a6849afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
where image_url ilike '%photo-1579952363873-27d3bfad9c0d%';

commit;

-- 3) Verification queries.
select id, name, website
from public.resources
where website ilike '%example.com%'
   or website ilike '%localhost%';

select id, name, image_url
from public.resources
where image_url ilike '%photo-1576091160399-112ba8d25d1f%'
   or image_url ilike '%photo-1579952363873-27d3bfad9c0d%'
   or image_url = 'https://images.unsplash.com/photo-1593113592332-6e2ee791ef60?q=80&w=800';

select id, title, image_url
from public.events
where image_url ilike '%photo-1576091160399-112ba8d25d1f%'
   or image_url ilike '%photo-1579952363873-27d3bfad9c0d%'
   or image_url = 'https://images.unsplash.com/photo-1593113592332-6e2ee791ef60?q=80&w=800';
