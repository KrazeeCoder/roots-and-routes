import { Wheat, HeartPulse, Home, Users, Briefcase, Calendar, Search, Filter, HandHeart } from "lucide-react";
import { EventItem, Step, Waypoint } from "../types/home";

export const heroFilters = ["Food", "Housing", "Health", "Youth", "Jobs", "Legal", "Events"];

export const waypoints: Waypoint[] = [
  { name: "Food Assistance", icon: Wheat, desc: "Pantries, meal programs, and fresh produce." },
  { name: "Health & Wellness", icon: HeartPulse, desc: "Clinics, mental health support, and care." },
  { name: "Housing Support", icon: Home, desc: "Shelters, rent help, and utility assistance." },
  { name: "Youth Programs", icon: Users, desc: "After-school activities, mentorship, childcare." },
  { name: "Job Help", icon: Briefcase, desc: "Resume building, training, and open roles." },
  { name: "Community Events", icon: Calendar, desc: "Gatherings, workshops, and local markets." },
];

export const findPathSteps: Step[] = [
  { icon: Search, title: "Search & Discover", desc: "Use our directory to search for specific needs or browse by category." },
  { icon: Filter, title: "Filter Your Options", desc: "Narrow down resources by location, eligibility, and current availability." },
  { icon: HandHeart, title: "Connect to Support", desc: "Get contact info, directions, and next steps to access the help you need." },
];

export const events: EventItem[] = [
  {
    date: "Oct 15",
    title: "Autumn Farmer's Market & Resource Fair",
    time: "9:00 AM - 1:00 PM",
    location: "Main Street, Bothell",
    category: "Community Gathering",
    image:
      "https://images.unsplash.com/photo-1767274101063-a735a6849afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwY29tbXVuaXR5JTIwZXZlbnR8ZW58MXx8fHwxNzczNzM0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    date: "Oct 18",
    title: "Free Legal Aid Clinic",
    time: "4:00 PM - 7:00 PM",
    location: "Bothell Library",
    category: "Legal Support",
    image: null,
  },
  {
    date: "Oct 22",
    title: "Youth Outdoor Leadership Workshop",
    time: "10:00 AM - 3:00 PM",
    location: "Blyth Park",
    category: "Youth Programs",
    image: null,
  },
];
