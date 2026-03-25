-- Template for adding essential waypoints to the resources table
-- These resources will be featured on the homepage in the "Essential Waypoints" section
-- Mapped to the existing 6 waypoint categories

INSERT INTO public.resources (
  name, 
  category, 
  description, 
  full_description, 
  address, 
  website, 
  status, 
  posted_by_name
) VALUES
('Hopelink Bothell/Shoreline', 'Food Assistance', 'Food bank and financial assistance center.', 'Hopelink provides a variety of services including a food bank, energy assistance, housing, and financial coaching for low-income residents in the Bothell area.', '18105 102nd Ave NE, Bothell, WA 98011', 'https://www.hopelink.org/', 'published', 'Community Admin'),

('EvergreenHealth Bothell', 'Health & Wellness', 'Urgent care and primary medical services.', 'A key medical hub providing immediate care, laboratory services, and primary care physicians right in the Canyon Park area.', '19015 119th Ave NE, Bothell, WA 98011', 'https://www.evergreenhealth.com/', 'published', 'Health Dept'),

('Northshore Senior Center', 'Youth Programs', 'One of the largest senior centers in the country.', 'Providing fitness classes, social connection, and health services for seniors and people with disabilities. It is a vital resource for the Northshore community.', '10201 E Riverside Dr, Bothell, WA 98011', 'https://www.northshoreseniorcenter.org/', 'published', 'City of Bothell'),

('WorkSource Snohomish County', 'Job Help', 'Free job placement, resume writing workshops, interview coaching, and career training programs for adults seeking employment.', 'WorkSource provides comprehensive employment services including job search assistance, skills training, and direct connections to local employers. They offer specialized programs for various industries and experience levels.', '728 134th St SW #100, Everett, WA', 'https://www.worksourcewa.com/', 'published', 'WorkSource Admin'),

('Bothell Community Farmers Market', 'Community Events', 'Weekly farmers market with local produce, crafts, and community gatherings.', 'The Bothell Farmers Market brings together local farmers, artisans, and community members every week. Features fresh produce, handmade goods, live music, and special events throughout the season.', '9919 NE 180th St, Bothell, WA 98011', 'https://beginatbothell.com/events/making-local-markets/', 'published', 'City of Bothell'),

('Northshore Housing Stability Fund', 'Housing Support', 'Emergency rental assistance for families in crisis.', 'A city-backed fund providing up to two months of emergency rental assistance for Bothell families facing eviction. Applications processed within 72 hours with case manager support.', 'Bothell City Hall, 18415 101st Ave NE, Bothell, WA 98011', 'https://www.bothellwa.gov/2375/Housing-Choices', 'published', 'City of Bothell');

-- Optional: Add tags to help categorize these resources for better filtering
UPDATE public.resources 
SET tags = CASE 
  WHEN name = 'Hopelink Bothell/Shoreline' THEN ARRAY['food', 'financial-assistance', 'basic-needs', 'emergency-help']
  WHEN name = 'EvergreenHealth Bothell' THEN ARRAY['healthcare', 'urgent-care', 'primary-care', 'medical', 'laboratory']
  WHEN name = 'Northshore Senior Center' THEN ARRAY['seniors', 'fitness', 'social-connection', 'health-services', 'disability-services']
  WHEN name = 'WorkSource Snohomish County' THEN ARRAY['jobs', 'employment', 'resume-help', 'training', 'career']
  WHEN name = 'Bothell Community Farmers Market' THEN ARRAY['events', 'community', 'farmers-market', 'local-produce', 'gatherings']
  WHEN name = 'Northshore Housing Stability Fund' THEN ARRAY['housing', 'rental-assistance', 'emergency-help', 'eviction-prevention']
  ELSE ARRAY[]::text[]
END
WHERE name IN (
  'Hopelink Bothell/Shoreline',
  'EvergreenHealth Bothell',
  'Northshore Senior Center',
  'WorkSource Snohomish County',
  'Bothell Community Farmers Market',
  'Northshore Housing Stability Fund'
);
