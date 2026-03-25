-- fix_outbound_links.sql
-- Run in Supabase SQL Editor with an account that can update/delete public.resources.

begin;

update public.resources
set website = 'https://beginatbothell.com/events/making-local-markets/'
where name = 'Bothell Community Farmers Market';

update public.resources
set website = 'https://www.bothellwa.gov/2375/Housing-Choices'
where name = 'Northshore Housing Stability Fund';

update public.resources
set website = 'https://www.bothellwa.gov/1007/Park-at-Bothell-Landing'
where name = 'Bothell Landing Park';

delete from public.resources
where name = 'Nutritional Program Free Trial'
   or website = 'https://worldofwowfitness.org/';

commit;
