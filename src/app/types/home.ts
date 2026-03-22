import type { ComponentType, SVGProps } from "react";

export interface DirectoryEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  tags: string[];
  image?: string | null;
  postedByName?: string;
  status?: "draft" | "pending" | "published" | "rejected" | "archived";
}

export interface SpotlightItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  fullDescription: string;
  audience: string;
  location: string;
  image?: string | null;
  featured?: boolean;
}

export interface Waypoint {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  desc: string;
}

export interface Step {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}

export interface EventItem {
  id?: string;
  date: string;
  title: string;
  time: string;
  location: string;
  startsAt?: string;
  endsAt?: string;
  category: string;
  image?: string | null;
  postedByName?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  status?: "draft" | "pending" | "published" | "rejected" | "archived";
}
