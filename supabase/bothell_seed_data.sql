-- ============================================
-- 1. DIRECTORY (Resources)
-- Main directory items for the Bothell portal.
-- ============================================

INSERT INTO public.resources (
  name,
  category,
  description,
  full_description,
  address,
  phone,
  website,
  hours,
  tags,
  image_url,
  status,
  is_spotlight,
  spotlight_subtitle,
  posted_by_name
) VALUES
('Bothell Landing Park', 'Community Events', 'The historic heart of Bothell, where the city meets the Sammamish River.', 'A lush, riverside sanctuary that serves as Bothell’s premier gathering spot. Home to the city’s historical museum and original pioneer buildings, the park offers a perfect blend of history, expansive play areas, and a picturesque bridge that connects directly to the Sammamish River Trail.', '9919 NE 180th St, Bothell, WA 98011', '(425) 806-6700', 'https://www.bothellwa.gov/1007/Park-at-Bothell-Landing', 'Dawn to Dusk Daily', '{"park", "river", "trails", "history"}', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Bothell_Landing_04.jpg', 'published', false, null, 'City of Bothell'),

('Sammamish River Corridor', 'Community Events', 'A scenic waterway perfect for paddling, cycling, and bird-watching.', 'Winding through the heart of the city, the Sammamish River is Bothell’s natural lifeline. Whether you’re launching a kayak at the Landing or cycling along the paved trail that follows its banks, the river offers a peaceful escape and a front-row seat to Pacific Northwest wildlife.', '9919 NE 180th St, Bothell, WA 98011', null, 'https://www.bothellwa.gov', 'Open 24/7', '{"river", "nature", "scenic"}', 'https://upload.wikimedia.org/wikipedia/commons/7/7f/SammamishRiverviewBothellLanding.jpg', 'published', false, null, 'Local Contributor'),

('North Creek Forest', 'Community Events', 'A 64-acre "hidden" urban forest providing a vital wildlife corridor.', 'Escape into a towering canopy of Douglas firs and Western Red Cedars. This protected forest is a living classroom for conservation, offering rugged trails and a rare glimpse into the region’s original old-growth ecology right on the edge of the city.', '11224 Juanita Drive NE, Bothell, WA 98011', null, 'https://www.friendsnorthcreekforest.org/', 'Dawn to Dusk Daily', '{"forest", "hiking", "conservation"}', 'https://upload.wikimedia.org/wikipedia/commons/1/15/Snohomish_County_portion_of_North_Creek_Forest_in_Bothell%2C_WA%2C_just_north_of_King_County_border%2C_with_sign_in_foreground.JPG', 'published', false, null, 'Eco-Volunteer'),

('Centennial Park', 'Community Events', 'A quiet neighborhood retreat overlooking the North Creek valley.', 'Tucked away from the downtown bustle, Centennial Park offers wide-open green spaces and panoramic views of the North Creek area. It’s a local favorite for a quiet afternoon picnic or a game of catch under the big Washington sky.', 'Bothell, WA 98011', null, 'https://www.bothellwa.gov', 'Dawn to Dusk Daily', '{"park", "north-creek", "neighborhood"}', 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Centennial_Park_under_a_blue_sky_in_Bothell.jpg', 'published', false, null, 'City of Bothell'),

('Bothell Library (KCLS)', 'Youth Programs', 'A modern knowledge hub with a massive collection and community focus.', 'More than just a place for books, the Bothell Library is a community anchor. With its soaring ceilings, quiet study nooks, and robust program of workshops and children’s storytimes, it is the intellectual living room of the city.', '18215 98th Ave NE, Bothell, WA 98011', '(425) 486-7811', 'https://kcls.org/locations/bothell', 'Mon-Thu: 10AM-9PM, Fri-Sat: 10AM-5PM, Sun: 11AM-6PM', '{"library", "community"}', 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Bothell_Library.jpg', 'published', false, null, 'KCLS'),

('University of Washington Bothell', 'Youth Programs', 'A world-class university known for its stunning architecture and 58-acre wetland.', 'Combining rigorous academics with a beautiful campus design, UW Bothell is a leader in innovation. The campus is famous for its award-winning wetland restoration project, which serves as both a research site and a serene backdrop for student life.', '18115 Campus Way NE, Bothell, WA 98011', '(425) 352-5000', 'https://www.uwb.edu', 'Mon-Fri: 8AM-5PM', '{"university", "campus"}', 'https://upload.wikimedia.org/wikipedia/commons/d/d3/U.W._Bothell_01.jpg', 'published', false, null, 'UW Bothell');


-- ============================================
-- 2. SPOTLIGHT (Featured Content)
-- High-profile items marked with is_spotlight = true.
-- ============================================

INSERT INTO public.resources (
  name,
  category,
  description,
  full_description,
  address,
  phone,
  website,
  hours,
  tags,
  image_url,
  status,
  is_spotlight,
  spotlight_subtitle,
  posted_by_name
) VALUES
('Downtown Bothell Way', 'Community Events', 'A vibrant mix of historic charm and modern Pacific Northwest lifestyle.', 'Bothell’s revitalized downtown core is where heritage buildings meet trendy eateries. From the iconic neon signs to the pedestrian-friendly sidewalks of Main Street, this is the hub for local shopping, dining, and community festivities.', 'Bothell Way NE & Main St, Bothell, WA 98011', null, 'https://www.bothellwa.gov', 'Open 24/7', '{"downtown", "main-street", "streetscape"}', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bothell_Way_northbound_from_Main_Street_in_Bothell%2C_WA.jpg', 'published', true, 'The heartbeat of the city', 'Main Street Association'),

('Country Village (Legacy Site)', 'Community Events', 'A nostalgic landmark known for its wandering paths and artisan shops.', 'Though its footprint has changed over the years, Country Village remains a beloved part of Bothell’s identity. Once a destination for local crafts, unique gifts, and the famous wandering chickens, it holds a special place in the hearts of long-time residents.', '23718 Bothell Everett Hwy, Bothell, WA 98021', null, 'https://www.bothellwa.gov', 'Store hours vary', '{"shopping", "local", "history"}', 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Bothell%2C_WA_-_Country_Village_09_-_in_front_of_Clock_Tower_Building.jpg', 'published', true, 'Bothell’s whimsical landmark', 'Local Historian');


-- ============================================
-- 3. EVENTS
-- Community happenings and scheduled activities.
-- ============================================

INSERT INTO public.events (
  title,
  category,
  description,
  location,
  starts_at,
  ends_at,
  image_url,
  status,
  is_spotlight,
  posted_by_name
) VALUES
('Bothell Block Party & BrewFest', 'Community', 'The ultimate summer bash! Join us for a massive celebration featuring live local bands, over 20 craft breweries, and the city’s best food trucks. It’s an afternoon of sun, suds, and community spirit on Main Street.', 'Main Street, Downtown Bothell', now() + interval '90 days', now() + interval '90 days' + interval '8 hours', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bothell_Way_northbound_from_Main_Street_in_Bothell%2C_WA.jpg', 'published', false, 'Bothell Chamber'),

('Summertime Music at the Landing', 'Entertainment', 'Unwind by the river with our free summer concert series. Grab a blanket, pack a picnic, and enjoy everything from upbeat jazz to classic rock as the sun sets over Bothell Landing Park.', 'Park at Bothell Landing', now() + interval '75 days', now() + interval '75 days' + interval '3 hours', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Bothell_Landing_04.jpg', 'published', false, 'Bothell Parks Dept'),

('Bothell Farmers Market', 'Food', 'Taste the best of the PNW! Our weekly market brings you farm-fresh produce, hand-crafted artisan goods, and delicious prepared foods. Support local growers and makers in the heart of the city.', 'Park at Bothell Landing', now() + interval '40 days', now() + interval '40 days' + interval '5 hours', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Bothell_Landing_04.jpg', 'published', false, 'Farmers Market Assoc'),

('Riverfest Celebration', 'Community', 'A tribute to the Sammamish River! Dive into a day of paddleboard demos, salmon education, and riverside conservation activities. Perfect for families looking to learn and play by the water.', 'Sammamish River Trail', now() + interval '60 days', now() + interval '60 days' + interval '6 hours', 'https://upload.wikimedia.org/wikipedia/commons/7/7f/SammamishRiverviewBothellLanding.jpg', 'published', true, 'Sammamish River Alliance'),

('Salmon Watch at the River', 'Education', 'Witness the incredible journey of the salmon as they return to their spawning grounds. Join expert naturalists for a guided walk to learn about these amazing creatures and how we can protect their habitat.', 'Sammamish River Trail', now() + interval '240 days', now() + interval '240 days' + interval '2 hours', 'https://upload.wikimedia.org/wikipedia/commons/7/7f/SammamishRiverviewBothellLanding.jpg', 'published', true, 'Eco-Watch'),

('Bothell Historical Walking Tour', 'Education', 'Guided 90-minute walking tour through historic downtown Bothell. Learn about the city''s logging origins, early settlers, and the Great Fire of 1906. Tours depart from the Historical Museum at Bothell Landing.', 'Starts at Bothell Historical Museum', now() + interval '14 days', now() + interval '14 days' + interval '2 hours', 'https://upload.wikimedia.org/wikipedia/commons/1/13/Bothell_Landing_pano_01.jpg', 'published', false, 'Bothell Historical Society'),

('Northshore Art Walk', 'Arts', 'Monthly evening art walk featuring local artists, gallery openings, and live demonstrations at venues along Main Street and Country Village. Meet artists, enjoy wine and appetizers, and support the local arts scene.', 'Various Downtown & Country Village Locations', now() + interval '30 days', now() + interval '30 days' + interval '3 hours', 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Bothell%2C_WA_-_Country_Village_09_-_in_front_of_Clock_Tower_Building.jpg', 'published', false, 'Northshore Arts Alliance'),

('Bridge Dedication Anniversary', 'Community', 'Annual celebration of the Bothell Landing Bridge. Includes a symbolic walk across the bridge, historical presentations about Bothell''s river crossings, and community refreshments at the park.', 'Bothell Landing Bridge', now() + interval '45 days', now() + interval '45 days' + interval '2 hours', 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Bothell_Landing_Bridge_01.jpg', 'published', false, 'Bothell Historical Society'),

('Riverfront Sunset Photography Workshop', 'Arts', 'Join local photographers for a sunset session at Bothell Landing. Learn tips for capturing the Sammamish River and the iconic bridge during the golden hour. All skill levels and camera types welcome.', 'Park at Bothell Landing', now() + interval '12 days', now() + interval '12 days' + interval '2 hours', 'https://upload.wikimedia.org/wikipedia/commons/9/91/Bothell_Landing_05.jpg', 'published', false, 'Bothell Arts Council'),

('UWB Campus Nature Walk', 'Environment', 'A guided exploration of the UW Bothell campus, focusing on the native plants, the campus farm, and the wetlands restoration area. Learn about urban ecology and sustainable campus initiatives.', 'UW Bothell Campus Farm', now() + interval '18 days', now() + interval '18 days' + interval '1.5 hours', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/University_of_Washington_Bothell_-_Campus_Farm_01.jpg', 'published', false, 'UWB Environmental Club');

