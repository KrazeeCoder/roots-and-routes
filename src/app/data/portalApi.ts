import { AuthError } from "@supabase/supabase-js";
import { supabase } from "../../utils/supabase";
import type { DirectoryEntry, EventItem, SpotlightItem } from "../types/home";
import type {
  ContributorProfile,
  ContributorRole,
  EventPayload,
  EventRecord,
  EventSubmissionPayload,
  EventSubmissionRecord,
  ResourcePayload,
  ResourceRatingFeedback,
  ResourceRecord,
  ResourceSubmissionPayload,
  ResourceSubmissionRecord,
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

const RESOURCE_WEBSITE_OVERRIDES: Record<string, string> = {
  "Bothell Community Farmers Market": "https://beginatbothell.com/events/making-local-markets/",
  "Northshore Housing Stability Fund": "https://www.bothellwa.gov/2375/Housing-Choices",
  "Bothell Landing Park": "https://www.bothellwa.gov/1007/Park-at-Bothell-Landing",
};

const RESOURCE_NAMES_TO_EXCLUDE = new Set<string>([
  "Nutritional Program Free Trial",
]);

interface DirectoryResourcesPageRpcRow extends ResourceRecord {
  total_count: number | string;
}

export interface DirectoryResourcesPageParams {
  page: number;
  pageSize: number;
  query?: string;
  category?: string | null;
  minRating?: number;
}

export interface DirectoryResourcesPage {
  resources: ResourceRecord[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

function applyPublicResourceOverrides(resources: ResourceRecord[]): ResourceRecord[] {
  return resources
    .filter((resource) => !RESOURCE_NAMES_TO_EXCLUDE.has(resource.name))
    .map((resource) => {
      const nextWebsite = RESOURCE_WEBSITE_OVERRIDES[resource.name];
      if (!nextWebsite) return resource;
      return { ...resource, website: nextWebsite };
    });
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
  return applyPublicResourceOverrides((data ?? []) as ResourceRecord[]);
}

export async function listDirectoryResourcesPage(
  params: DirectoryResourcesPageParams,
): Promise<DirectoryResourcesPage> {
  const page = Number.isFinite(params.page) ? Math.max(1, Math.trunc(params.page)) : 1;
  const pageSize = Number.isFinite(params.pageSize)
    ? Math.min(100, Math.max(1, Math.trunc(params.pageSize)))
    : 8;
  const query = params.query?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const minRating = Number.isFinite(params.minRating ?? 0)
    ? Math.max(0, params.minRating ?? 0)
    : 0;

  const { data, error } = await supabase.rpc("list_directory_resources_page", {
    p_page: page,
    p_page_size: pageSize,
    p_query: query,
    p_category: category.length > 0 && category !== "All" ? category : null,
    p_min_rating: minRating,
  });

  if (error) throw error;

  const rows = ((data ?? []) as DirectoryResourcesPageRpcRow[]).map((row) => {
    const { total_count, ...resource } = row;
    return { totalCount: Number(total_count) || 0, resource: resource as ResourceRecord };
  });

  const totalCount = rows[0]?.totalCount ?? 0;
  const resources = applyPublicResourceOverrides(rows.map((row) => row.resource));
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;

  return {
    resources,
    totalCount,
    totalPages,
    page,
    pageSize,
  };
}

export async function getPublishedResourceById(resourceId: string): Promise<ResourceRecord | null> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .eq("status", "published")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  const resource = (data as ResourceRecord | null) ?? null;
  if (!resource) return null;
  const next = applyPublicResourceOverrides([resource]);
  return next[0] ?? null;
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

export async function getPublishedEventById(eventId: string): Promise<EventRecord | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("status", "published")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return (data as EventRecord | null) ?? null;
}

export async function listSpotlightItems(): Promise<SpotlightItem[]> {
  const { data: spotlightData, error: spotlightError } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .eq("is_spotlight", true)
    .order("updated_at", { ascending: false });

  if (spotlightError) throw spotlightError;

  let resources = applyPublicResourceOverrides((spotlightData ?? []) as ResourceRecord[]);

  // Fallback: if no explicit spotlight rows are set, show the newest published resources.
  if (resources.length === 0) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(12);

    if (fallbackError) throw fallbackError;
    resources = applyPublicResourceOverrides((fallbackData ?? []) as ResourceRecord[]);
  }

  return resources.map((resource, index) => ({
    id: resource.id,
    title: resource.name,
    subtitle: resource.spotlight_subtitle ?? "Community Spotlight",
    category: resource.category,
    description: resource.description,
    fullDescription: resource.full_description ?? resource.description,
    audience: resource.posted_by_name?.trim() || "Community Contributor",
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

export async function listResourceRatingFeedback(resourceId: string): Promise<ResourceRatingFeedback[]> {
  const { data, error } = await supabase.rpc("list_resource_rating_feedback", {
    p_resource_id: resourceId,
  });

  if (error) throw error;
  return (data ?? []) as ResourceRatingFeedback[];
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
    .in("status", ["draft", "pending", "published", "rejected", "archived"])
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResourceRecord[];
}

export async function listModerationEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .in("status", ["draft", "pending", "published", "rejected", "archived"])
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

export async function listPendingProfiles(): Promise<ContributorProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "contributor")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ContributorProfile[];
}

export async function updateProfileStatus(userId: string, status: "approved" | "rejected") {
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  if (error) throw error;
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

export async function createPublicResourceSubmission(payload: ResourceSubmissionPayload) {
  const { error } = await supabase.from("resource_submissions").insert({
    ...payload,
    tags: payload.tags ?? [],
  });

  if (error) throw error;
}

export async function createPublicEventSubmission(payload: EventSubmissionPayload) {
  const { error } = await supabase.from("event_submissions").insert({
    ...payload,
  });

  if (error) throw error;
}

export async function listPendingResourceSubmissions(): Promise<ResourceSubmissionRecord[]> {
  const { data, error } = await supabase
    .from("resource_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ResourceSubmissionRecord[];
}

export async function listPendingEventSubmissions(): Promise<EventSubmissionRecord[]> {
  const { data, error } = await supabase
    .from("event_submissions")
    .select("*")
    .eq("status", "pending")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventSubmissionRecord[];
}

export async function approveResourceSubmission(submissionId: string) {
  const { error } = await supabase.rpc("approve_resource_submission", {
    submission_id: submissionId,
  });

  if (error) throw error;
}

export async function approveEventSubmission(submissionId: string) {
  const { error } = await supabase.rpc("approve_event_submission", {
    submission_id: submissionId,
  });

  if (error) throw error;
}

export async function rejectResourceSubmission(submissionId: string, moderatorNotes?: string) {
  const { error } = await supabase
    .from("resource_submissions")
    .update({
      status: "rejected",
      moderator_notes: moderatorNotes?.trim() || null,
    })
    .eq("id", submissionId);

  if (error) throw error;
}

export async function rejectEventSubmission(submissionId: string, moderatorNotes?: string) {
  const { error } = await supabase
    .from("event_submissions")
    .update({
      status: "rejected",
      moderator_notes: moderatorNotes?.trim() || null,
    })
    .eq("id", submissionId);

  if (error) throw error;
}

export function mapResourceRecordToPayload(resource: ResourceRecord): ResourcePayload {
  return {
    name: resource.name,
    category: resource.category,
    description: resource.description,
    full_description: resource.full_description,
    address: resource.address,
    phone: resource.phone,
    email: resource.email,
    website: resource.website,
    hours: resource.hours,
    tags: resource.tags,
    image_url: resource.image_url,
    status: resource.status,
    is_spotlight: resource.is_spotlight,
    spotlight_subtitle: resource.spotlight_subtitle,
  };
}

export function mapEventRecordToPayload(event: EventRecord): EventPayload {
  return {
    title: event.title,
    category: event.category,
    description: event.description,
    location: event.location,
    location_lat: event.location_lat,
    location_lng: event.location_lng,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    image_url: event.image_url,
    status: event.status,
    is_spotlight: event.is_spotlight,
  };
}

export function isModerator(role: ContributorRole | null | undefined) {
  return role === "moderator" || role === "super_admin";
}

export function mapResourceToDirectoryEntry(resource: ResourceRecord): DirectoryEntry {
  return {
    id: resource.id,
    name: resource.name,
    category: resource.category,
    description: resource.description,
    address: resource.address,
    phone: resource.phone ?? undefined,
    email: resource.email ?? undefined,
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
    startsAt: event.starts_at,
    endsAt: event.ends_at ?? undefined,
    category: event.category ?? "Community Event",
    image: event.image_url,
    postedByName: event.posted_by_name ?? "Community Contributor",
    locationLat: event.location_lat,
    locationLng: event.location_lng,
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
