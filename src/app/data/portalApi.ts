import { AuthError } from "@supabase/supabase-js";
import { supabase } from "../../utils/supabase";
import type { DirectoryEntry, EventItem, SpotlightItem } from "../types/home";
import type {
  ContributorProfile,
  ContributorRole,
  EventPayload,
  EventRecord,
  ResourcePayload,
  ResourceRecord,
  SignUpContributorInput,
} from "../types/portal";

function displayDateRange(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  const date = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = end
    ? end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : null;

  return {
    date,
    time: endTime ? `${startTime} - ${endTime}` : startTime,
  };
}

export async function signInContributor(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
  return result.data;
}

export async function signUpContributor(input: SignUpContributorInput) {
  const result = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/contributor-login`,
      data: {
        organization_name: input.organizationName,
        display_name: input.displayName,
        first_name: input.firstName,
        middle_name: input.middleName ?? "",
        last_name: input.lastName,
        phone: input.phone,
      },
    },
  });

  if (result.error) throw result.error;
  return result.data;
}

export async function sendContributorPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

export async function updateContributorPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOutContributor() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<ContributorProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return (data as ContributorProfile | null) ?? null;
}

export async function listPublishedResources(): Promise<ResourceRecord[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResourceRecord[];
}

export async function listPublishedEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

export async function listSpotlightItems(): Promise<SpotlightItem[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .eq("is_spotlight", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as ResourceRecord[]).map((resource, index) => ({
    id: resource.id,
    title: resource.name,
    subtitle: resource.spotlight_subtitle ?? "Community Spotlight",
    category: resource.category,
    description: resource.description,
    fullDescription: resource.full_description ?? resource.description,
    audience: "Bothell Residents",
    location: resource.address,
    image: resource.image_url,
    featured: index === 0,
  }));
}

export async function listPortalResources(
  role: ContributorRole,
  userId: string,
): Promise<ResourceRecord[]> {
  let query = supabase.from("resources").select("*").order("updated_at", { ascending: false });
  if (role === "contributor") {
    query = query.eq("created_by", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as ResourceRecord[];
}

export async function listPortalEvents(
  role: ContributorRole,
  userId: string,
): Promise<EventRecord[]> {
  let query = supabase.from("events").select("*").order("starts_at", { ascending: true });
  if (role === "contributor") {
    query = query.eq("created_by", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as EventRecord[];
}

export async function listModerationResources(): Promise<ResourceRecord[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .in("status", ["draft", "pending", "rejected"])
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResourceRecord[];
}

export async function listModerationEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .in("status", ["draft", "pending", "rejected"])
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

export async function createResource(payload: ResourcePayload) {
  const { error } = await supabase.from("resources").insert({
    ...payload,
    tags: payload.tags ?? [],
  });

  if (error) throw error;
}

export async function updateResource(resourceId: string, payload: ResourcePayload) {
  const { error } = await supabase.from("resources").update(payload).eq("id", resourceId);
  if (error) throw error;
}

export async function deleteResource(resourceId: string) {
  const { error } = await supabase.from("resources").delete().eq("id", resourceId);
  if (error) throw error;
}

export async function createEvent(payload: EventPayload) {
  const { error } = await supabase.from("events").insert({
    ...payload,
  });

  if (error) throw error;
}

export async function updateEvent(eventId: string, payload: EventPayload) {
  const { error } = await supabase.from("events").update(payload).eq("id", eventId);
  if (error) throw error;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
}

export function isModerator(role: ContributorRole | null | undefined) {
  return role === "moderator";
}

export function mapResourceToDirectoryEntry(resource: ResourceRecord): DirectoryEntry {
  return {
    id: resource.id,
    name: resource.name,
    category: resource.category,
    description: resource.description,
    address: resource.address,
    phone: resource.phone ?? undefined,
    website: resource.website ?? undefined,
    hours: resource.hours ?? undefined,
    tags: resource.tags ?? [],
    image: resource.image_url,
    postedByName: resource.posted_by_name ?? "Community Contributor",
    status: resource.status,
  };
}

export function mapEventToEventItem(event: EventRecord): EventItem {
  const display = displayDateRange(event.starts_at, event.ends_at);

  return {
    id: event.id,
    date: display.date,
    title: event.title,
    time: display.time,
    location: event.location,
    category: event.category ?? "Community Event",
    image: event.image_url,
    postedByName: event.posted_by_name ?? "Community Contributor",
    status: event.status,
  };
}

export function getFriendlyAuthError(error: unknown) {
  const fallback = "Something went wrong. Please try again.";
  if (!(error instanceof AuthError)) return fallback;

  if (error.message.includes("Invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (error.message.includes("Email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  return error.message || fallback;
}
