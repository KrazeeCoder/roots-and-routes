-- seed.sql
-- Run this script in your Supabase SQL Editor to populate sample data!
-- Make sure to clear existing data before running this if you want a fresh start:
-- TRUNCATE TABLE public.resources CASCADE;
-- TRUNCATE TABLE public.events CASCADE;

INSERT INTO public.resources (
  name, 
  category, 
  description, 
  full_description, 
  address, 
  phone, 
  email,
  website, 
  hours, 
  tags, 
  image_url, 
  status, 
  is_spotlight, 
  spotlight_subtitle,
  posted_by_name
) VALUES 
('Downtown Community Center', 'Community Support', 'A vibrant hub for community gatherings and local events.', 'The Downtown Community Center offers a safe, inclusive space for everyone. We host weekly workshops, provide access to computer labs, and organize community outreach programs to support local families. Come join our growing network of volunteers!', '123 Main St, Springfield, IL', '(555) 123-4567', 'info@downtowncommunitycenter.org', 'https://www.bothellwa.gov/148/Your-Community', 'Mon-Fri: 9AM-8PM, Sat: 10AM-4PM', '{"community", "workshops", "support", "volunteering"}', 'https://images.unsplash.com/photo-1576267423048-15c0040fec78?q=80&w=800', 'published', false, null, 'Jane Doe'),

('Green Valley Food Pantry', 'Food', 'Providing nutritious meals and groceries for families in need.', 'Green Valley Food Pantry partners with local farms and supermarkets to provide fresh, healthy food options to those facing food insecurity. We operate a drive-through pantry every Tuesday and Thursday.', '456 Oak Avenue, Springfield, IL', '(555) 987-6543', 'contact@greenvalleyfoodpantry.org', 'https://www.hopelink.org/', 'Tue & Thu: 10AM-2PM', '{"food", "pantry", "groceries"}', 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'published', true, 'Nourishing our community, one meal at a time', 'Mark Johnson'),

('Riverside Health Clinic', 'Healthcare', 'Affordable medical care and wellness checkups for the uninsured.', 'Riverside Health Clinic is dedicated to providing high-quality, free, or low-cost medical assistance to underserved populations. We offer general checkups, vaccinations, and mental health counseling by certified professionals.', '789 River Road, Springfield, IL', '(555) 456-7890', 'appointments@riversidehealthclinic.org', 'https://healthpointchc.org/', 'Mon-Wed-Fri: 8AM-5PM', '{"healthcare", "clinic", "wellness", "mental-health"}', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800', 'published', true, 'Your health is our priority', 'Dr. Sarah Lee'),

('Springfield Pathways Housing', 'Housing', 'Emergency shelter and long-term housing assistance programs.', 'Springfield Pathways provides emergency overnight shelter as well as resources to help individuals transition into permanent housing. We also offer financial counseling and job placement assistance.', '101 Shelter Blvd, Springfield, IL', '(555) 222-3333', 'support@springfieldpathways.org', 'https://www.ywcaworks.org/', 'Open 24/7', '{"housing", "shelter", "assistance"}', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=800', 'published', false, null, 'Community Admin'),

('Tech Forward Youth Program', 'Education', 'After-school coding and robotics program for teens.', 'Tech Forward aims to bridge the digital divide by offering free after-school technology classes for high school students. Students learn Python, web development, and build their own robots.', '202 Innovation Park, Springfield, IL', '(555) 555-0199', 'hello@techforwardyouth.org', 'https://www.bgcsc.org/', 'Mon-Fri: 3PM-6PM', '{"education", "technology", "youth"}', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800', 'published', false, null, 'Alice Rivera');


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
('Annual Spring Community Picnic', 'Community', 'Join us for our annual spring picnic! Free food, games, and live music for all ages. Bring your family and friends to celebrate the changing seasons.', 'Springfield Central Park', now() + interval '10 days', now() + interval '10 days' + interval '4 hours', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800', 'published', true, 'Jane Doe'),

('Tech Forward Open House', 'Education', 'Curious about our youth coding programs? Come to our open house to see student projects, meet our instructors, and sign up for the fall semester.', '202 Innovation Park, Springfield, IL', now() + interval '14 days', now() + interval '14 days' + interval '2 hours', 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=800', 'published', false, 'Alice Rivera'),

('Free Dental Clinic Day', 'Healthcare', 'Riverside Health is partnering with local dentists to provide free cleanings and basic dental work on a first-come, first-served basis.', '789 River Road, Springfield, IL', now() + interval '5 days', now() + interval '5 days' + interval '6 hours', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800', 'published', true, 'Dr. Sarah Lee'),

('Food Drive & Volunteer Training', 'Food', 'Help us sort donations and pack boxes for the upcoming month. New volunteers will receive a 30-minute orientation before the shift begins.', '456 Oak Avenue, Springfield, IL', now() + interval '2 days', now() + interval '2 days' + interval '3 hours', 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'published', false, 'Mark Johnson'),

('Housing Rights Workshop', 'Housing', 'Learn about your rights as a tenant. Legal experts will be present to answer questions about evictions, lease agreements, and affordable housing options.', 'Downtown Community Center', now() + interval '20 days', now() + interval '20 days' + interval '2 hours', 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=800', 'published', false, 'Community Admin');
