import { createClient } from "@supabase/supabase-js";
import type { DirectoryEntry, EventItem, SpotlightItem } from "../app/types/home";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface WaypointData {
  id: string;
  name: string;
  iconKey: string;
  desc: string;
}

export interface FindPathStepData {
  id: string;
  title: string;
  iconKey: string;
  desc: string;
}

export interface ResourceSuggestionInput {
  org_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  category?: string;
  description: string;
  website?: string;
  address?: string;
}

export async function getHeroFilters(): Promise<string[]> {
  const { data, error } = await supabase
    .from("hero_filters")
    .select("label")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => row.label as string);
}

export async function getWaypoints(): Promise<WaypointData[]> {
  const { data, error } = await supabase
    .from("waypoints")
    .select("id, name, icon_key, description")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    iconKey: row.icon_key as string,
    desc: row.description as string,
  }));
}

export async function getFindPathSteps(): Promise<FindPathStepData[]> {
  const { data, error } = await supabase
    .from("find_path_steps")
    .select("id, title, icon_key, description")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    iconKey: row.icon_key as string,
    desc: row.description as string,
  }));
}

export async function getEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("date, title, time, location, category, image")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as EventItem[];
}

export async function getDirectoryEntries(): Promise<DirectoryEntry[]> {
  const { data, error } = await supabase
    .from("directory_entries")
    .select("id, name, category, description, address, phone, website, hours, tags, image")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []) as DirectoryEntry[];
}

export async function getSpotlights(): Promise<SpotlightItem[]> {
  const { data, error } = await supabase
    .from("spotlights")
    .select("id, title, subtitle, category, description, full_description, audience, location, image, featured")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string,
    category: row.category as string,
    description: row.description as string,
    fullDescription: row.full_description as string,
    audience: row.audience as string,
    location: row.location as string,
    image: (row.image as string | null) ?? null,
    featured: (row.featured as boolean) ?? false,
  }));
}

export async function submitResourceSuggestion(input: ResourceSuggestionInput) {
  const { error } = await supabase.from("resource_suggestions").insert(input);

  if (error) throw error;
}
