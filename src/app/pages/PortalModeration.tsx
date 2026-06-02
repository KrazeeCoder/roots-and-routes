import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ClipboardList, FileText, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { PortalShell } from "../components/portal/PortalShell";
import { TableSkeleton } from "../components/ui/skeleton";
import {
  approveEventSubmission,
  approveResourceSubmission,
  deleteEvent,
  deleteResource,
  listModerationEvents,
  listModerationResources,
  listPendingEventSubmissions,
  listPendingProfiles,
  listPendingResourceSubmissions,
  mapEventRecordToPayload,
  mapResourceRecordToPayload,
  rejectEventSubmission,
  rejectResourceSubmission,
  updateEvent,
  updateProfileStatus,
  updateResource,
} from "../data/portalApi";
import type {
  ContentStatus,
  ContributorProfile,
  EventRecord,
  EventSubmissionRecord,
  ResourceRecord,
  ResourceSubmissionRecord,
} from "../types/portal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const resourceModerationStatuses: ContentStatus[] = ["draft", "published", "rejected", "pending"];
const eventModerationStatuses: ContentStatus[] = ["draft", "published", "rejected", "pending"];
const CONTENT_PAGE_SIZE = 12;
type StatusFilter = "all" | ContentStatus;
type ResourceSortOption = "updated_desc" | "updated_asc" | "name_asc" | "name_desc";
type EventSortOption =
  | "starts_soonest"
  | "starts_latest"
  | "updated_desc"
  | "updated_asc"
  | "title_asc"
  | "title_desc";
type EventTimeFilter = "all" | "upcoming" | "past";
const DROPDOWN_CONTROL_CLASS =
  "h-10 w-full rounded-md border border-[#D9D0C1] bg-white px-3 text-sm text-[#334233] focus:outline-none focus:ring-2 focus:ring-[#B36A4C]/20";
const DROPDOWN_COMPACT_CLASS =
  "h-9 rounded-md border border-[#D9D0C1] bg-white px-3 text-sm text-[#334233] focus:outline-none focus:ring-2 focus:ring-[#B36A4C]/20";

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) items.push("ellipsis");
  for (let page = left; page <= right; page += 1) {
    items.push(page);
  }
  if (right < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) return "";
  if (!("message" in error)) return "";
  const maybeMessage = (error as { message?: unknown }).message;
  return typeof maybeMessage === "string" ? maybeMessage : "";
}

function isAlreadyReviewedError(error: unknown) {
  return getErrorMessage(error).toLowerCase().includes("already been reviewed");
}

export function PortalModeration() {
  const [resourceSubmissions, setResourceSubmissions] = useState<ResourceSubmissionRecord[]>([]);
  const [eventSubmissions, setEventSubmissions] = useState<EventSubmissionRecord[]>([]);
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<ContributorProfile[]>([]);
  const [resourceNotes, setResourceNotes] = useState<Record<string, string>>({});
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceStatusFilter, setResourceStatusFilter] = useState<StatusFilter>("all");
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState("all");
  const [resourceSort, setResourceSort] = useState<ResourceSortOption>("updated_desc");
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<StatusFilter>("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");
  const [eventTimeFilter, setEventTimeFilter] = useState<EventTimeFilter>("all");
  const [eventSort, setEventSort] = useState<EventSortOption>("starts_soonest");
  const [resourcePage, setResourcePage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [resourceSubmissionBusy, setResourceSubmissionBusy] = useState<Record<string, boolean>>({});
  const [eventSubmissionBusy, setEventSubmissionBusy] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resourceLibraryTopRef = useRef<HTMLDivElement | null>(null);
  const eventLibraryTopRef = useRef<HTMLDivElement | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        resourceSubmissionData,
        eventSubmissionData,
        resourceData,
        eventData,
        profileData,
      ] = await Promise.all([
        listPendingResourceSubmissions(),
        listPendingEventSubmissions(),
        listModerationResources(),
        listModerationEvents(),
        listPendingProfiles(),
      ]);

      setResourceSubmissions(resourceSubmissionData);
      setEventSubmissions(eventSubmissionData);
      setResources(resourceData);
      setEvents(eventData);
      setPendingProfiles(profileData);
      setResourceNotes(
        Object.fromEntries(
          resourceSubmissionData.map((item) => [item.id, item.moderator_notes ?? ""]),
        ),
      );
      setEventNotes(
        Object.fromEntries(
          eventSubmissionData.map((item) => [item.id, item.moderator_notes ?? ""]),
        ),
      );
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load moderation queues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  useEffect(() => {
    setResourcePage(1);
  }, [resourceSearch, resourceStatusFilter, resourceCategoryFilter, resourceSort]);

  useEffect(() => {
    setEventPage(1);
  }, [eventSearch, eventStatusFilter, eventCategoryFilter, eventTimeFilter, eventSort]);

  const resourceCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          resources
            .map((resource) => resource.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [resources],
  );

  const eventCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .map((event) => event.category)
            .filter((category): category is string => Boolean(category?.trim())),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const filteredResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesStatus = resourceStatusFilter === "all" || resource.status === resourceStatusFilter;
      const matchesCategory = resourceCategoryFilter === "all" || resource.category === resourceCategoryFilter;
      const matchesQuery = !query || [
        resource.name,
        resource.category,
        resource.description,
        resource.address,
        resource.posted_by_name ?? "",
        resource.status,
      ].join(" ").toLowerCase().includes(query);
      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [resources, resourceSearch, resourceStatusFilter, resourceCategoryFilter]);

  const filteredEvents = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    const now = Date.now();
    return events.filter((event) => {
      const startsAt = new Date(event.starts_at).getTime();
      const matchesStatus = eventStatusFilter === "all" || event.status === eventStatusFilter;
      const matchesCategory = eventCategoryFilter === "all" || (event.category ?? "") === eventCategoryFilter;
      const matchesTime = eventTimeFilter === "all"
        || (eventTimeFilter === "upcoming" ? startsAt >= now : startsAt < now);
      const matchesQuery = !query || [
        event.title,
        event.category ?? "",
        event.location,
        event.description ?? "",
        event.posted_by_name ?? "",
        event.status,
      ].join(" ").toLowerCase().includes(query);
      return matchesStatus && matchesCategory && matchesTime && matchesQuery;
    });
  }, [events, eventSearch, eventStatusFilter, eventCategoryFilter, eventTimeFilter]);

  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      if (resourceSort === "updated_desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (resourceSort === "updated_asc") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      if (resourceSort === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (resourceSort === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [filteredResources, resourceSort]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (eventSort === "starts_soonest") {
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      }
      if (eventSort === "starts_latest") {
        return new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime();
      }
      if (eventSort === "updated_desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (eventSort === "updated_asc") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      if (eventSort === "title_asc") {
        return a.title.localeCompare(b.title);
      }
      if (eventSort === "title_desc") {
        return b.title.localeCompare(a.title);
      }
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });
  }, [filteredEvents, eventSort]);

  const pendingResourceContent = useMemo(
    () => resources.filter((resource) => resource.status === "pending"),
    [resources],
  );

  const pendingEventContent = useMemo(
    () => events.filter((event) => event.status === "pending"),
    [events],
  );

  const resourceTotalPages = Math.max(1, Math.ceil(sortedResources.length / CONTENT_PAGE_SIZE));
  const eventTotalPages = Math.max(1, Math.ceil(sortedEvents.length / CONTENT_PAGE_SIZE));
  const safeResourcePage = Math.min(resourcePage, resourceTotalPages);
  const safeEventPage = Math.min(eventPage, eventTotalPages);

  useEffect(() => {
    if (resourcePage > resourceTotalPages) setResourcePage(resourceTotalPages);
  }, [resourcePage, resourceTotalPages]);

  useEffect(() => {
    if (eventPage > eventTotalPages) setEventPage(eventTotalPages);
  }, [eventPage, eventTotalPages]);

  const paginatedResources = useMemo(() => {
    const start = (safeResourcePage - 1) * CONTENT_PAGE_SIZE;
    return sortedResources.slice(start, start + CONTENT_PAGE_SIZE);
  }, [sortedResources, safeResourcePage]);

  const paginatedEvents = useMemo(() => {
    const start = (safeEventPage - 1) * CONTENT_PAGE_SIZE;
    return sortedEvents.slice(start, start + CONTENT_PAGE_SIZE);
  }, [sortedEvents, safeEventPage]);

  const resourceStart = sortedResources.length === 0 ? 0 : (safeResourcePage - 1) * CONTENT_PAGE_SIZE + 1;
  const resourceEnd = Math.min(safeResourcePage * CONTENT_PAGE_SIZE, sortedResources.length);
  const eventStart = sortedEvents.length === 0 ? 0 : (safeEventPage - 1) * CONTENT_PAGE_SIZE + 1;
  const eventEnd = Math.min(safeEventPage * CONTENT_PAGE_SIZE, sortedEvents.length);

  const scrollToPageTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToResourcePage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(nextPage, resourceTotalPages));
    if (bounded === resourcePage) return;
    setResourcePage(bounded);
    scrollToPageTop();
  };

  const goToEventPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(nextPage, eventTotalPages));
    if (bounded === eventPage) return;
    setEventPage(bounded);
    scrollToPageTop();
  };

  const handleResourceStatus = async (id: string, status: ContentStatus) => {
    const target = resources.find((item) => item.id === id);
    if (!target) return;
    const toastId = toast.loading(`Updating resource to ${status}...`);
    setError(null);

    try {
      await updateResource(id, { ...mapResourceRecordToPayload(target), status });
      await loadQueue();
      toast.success(`Resource marked ${status}.`, { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = "Could not update resource status.";
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    }
  };

  const handleEventStatus = async (id: string, status: ContentStatus) => {
    const target = events.find((item) => item.id === id);
    if (!target) return;
    const toastId = toast.loading(`Updating event to ${status}...`);
    setError(null);

    try {
      await updateEvent(id, { ...mapEventRecordToPayload(target), status });
      await loadQueue();
      toast.success(`Event marked ${status}.`, { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = "Could not update event status.";
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this resource permanently?")) return;
    const toastId = toast.loading("Deleting resource...");
    setError(null);

    try {
      await deleteResource(id);
      await loadQueue();
      toast.success("Resource deleted.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = "Could not delete this resource.";
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Delete this event permanently?")) return;
    const toastId = toast.loading("Deleting event...");
    setError(null);

    try {
      await deleteEvent(id);
      await loadQueue();
      toast.success("Event deleted.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = "Could not delete this event.";
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    }
  };

  const handleProfileStatus = async (id: string, status: "approved" | "rejected") => {
    const toastId = toast.loading(status === "approved" ? "Approving contributor..." : "Rejecting contributor...");
    setError(null);

    try {
      await updateProfileStatus(id, status);
      await loadQueue();
      toast.success(status === "approved" ? "Contributor approved." : "Contributor rejected.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = `Could not ${status} that contributor account.`;
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    }
  };

  const handleApproveResourceSubmission = async (id: string) => {
    if (resourceSubmissionBusy[id]) return;
    setResourceSubmissionBusy((prev) => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Approving resource submission...");
    setError(null);

    try {
      await approveResourceSubmission(id);
      await loadQueue();
      toast.success("Resource submission approved and published.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      if (isAlreadyReviewedError(nextError)) {
        const nextMessage = "This resource submission was already reviewed. Refreshed moderation queues.";
        setError(nextMessage);
        await loadQueue();
        toast.message(nextMessage, { id: toastId });
      } else {
        const nextMessage = "Could not approve this resource submission.";
        setError(nextMessage);
        toast.error(nextMessage, { id: toastId });
      }
    } finally {
      setResourceSubmissionBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRejectResourceSubmission = async (id: string) => {
    if (resourceSubmissionBusy[id]) return;
    setResourceSubmissionBusy((prev) => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Rejecting resource submission...");
    setError(null);

    try {
      await rejectResourceSubmission(id, resourceNotes[id]);
      await loadQueue();
      toast.success("Resource submission rejected.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      if (isAlreadyReviewedError(nextError)) {
        const nextMessage = "This resource submission was already reviewed. Refreshed moderation queues.";
        setError(nextMessage);
        await loadQueue();
        toast.message(nextMessage, { id: toastId });
      } else {
        const nextMessage = "Could not reject this resource submission.";
        setError(nextMessage);
        toast.error(nextMessage, { id: toastId });
      }
    } finally {
      setResourceSubmissionBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleApproveEventSubmission = async (id: string) => {
    if (eventSubmissionBusy[id]) return;
    setEventSubmissionBusy((prev) => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Approving event submission...");
    setError(null);

    try {
      await approveEventSubmission(id);
      await loadQueue();
      toast.success("Event submission approved and published.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      if (isAlreadyReviewedError(nextError)) {
        const nextMessage = "This event submission was already reviewed. Refreshed moderation queues.";
        setError(nextMessage);
        await loadQueue();
        toast.message(nextMessage, { id: toastId });
      } else {
        const nextMessage = "Could not approve this event submission.";
        setError(nextMessage);
        toast.error(nextMessage, { id: toastId });
      }
    } finally {
      setEventSubmissionBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRejectEventSubmission = async (id: string) => {
    if (eventSubmissionBusy[id]) return;
    setEventSubmissionBusy((prev) => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Rejecting event submission...");
    setError(null);

    try {
      await rejectEventSubmission(id, eventNotes[id]);
      await loadQueue();
      toast.success("Event submission rejected.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      if (isAlreadyReviewedError(nextError)) {
        const nextMessage = "This event submission was already reviewed. Refreshed moderation queues.";
        setError(nextMessage);
        await loadQueue();
        toast.message(nextMessage, { id: toastId });
      } else {
        const nextMessage = "Could not reject this event submission.";
        setError(nextMessage);
        toast.error(nextMessage, { id: toastId });
      }
    } finally {
      setEventSubmissionBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <PortalShell
      title="Admin Moderation"
      description="Review public submissions, approve contributor accounts, and manage live site content."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="h-auto w-full flex-col items-stretch justify-start gap-1 bg-[#E7D9C3]/30 p-1 sm:h-9 sm:w-fit sm:flex-row sm:items-center sm:justify-center sm:gap-0">
          <TabsTrigger value="accounts" className="h-10 w-full flex-none justify-between data-[state=active]:bg-white sm:h-[calc(100%-1px)] sm:w-auto sm:flex-1 sm:justify-center">
            Pending Accounts
            {pendingProfiles.length > 0 ? (
              <span className="ml-auto rounded-full bg-[#B36A4C] px-1.5 py-0.5 text-[10px] text-white sm:ml-2">
                {pendingProfiles.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="resource-submissions" className="h-10 w-full flex-none justify-between data-[state=active]:bg-white sm:h-[calc(100%-1px)] sm:w-auto sm:flex-1 sm:justify-center">
            Resource Proposals
            {resourceSubmissions.length + pendingResourceContent.length > 0 ? (
              <span className="ml-auto rounded-full bg-[#B36A4C] px-1.5 py-0.5 text-[10px] text-white sm:ml-2">
                {resourceSubmissions.length + pendingResourceContent.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="event-submissions" className="h-10 w-full flex-none justify-between data-[state=active]:bg-white sm:h-[calc(100%-1px)] sm:w-auto sm:flex-1 sm:justify-center">
            Event Proposals
            {eventSubmissions.length + pendingEventContent.length > 0 ? (
              <span className="ml-auto rounded-full bg-[#B36A4C] px-1.5 py-0.5 text-[10px] text-white sm:ml-2">
                {eventSubmissions.length + pendingEventContent.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="content-library" className="h-10 w-full flex-none justify-start data-[state=active]:bg-white sm:h-[calc(100%-1px)] sm:w-auto sm:flex-1 sm:justify-center">
            Site Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card className="border-[#E7D9C3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#B36A4C]" />
                Pending Contributor Accounts
              </CardTitle>
              <CardDescription>
                Contributors must be approved before they can publish directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={3} columns={3} />
              ) : pendingProfiles.length === 0 ? (
                <p className="text-sm text-[#6F7553]">No contributor accounts are waiting for review.</p>
              ) : (
                <div className="space-y-4">
                  {pendingProfiles.map((profile) => (
                    <div key={profile.id} className="flex flex-col gap-4 rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-[#334233]">{profile.organization_name}</h4>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#5B473A]">
                          <p><span className="text-[#6F7553]">Contact:</span> {profile.first_name} {profile.last_name}</p>
                          <p><span className="text-[#6F7553]">Email:</span> {profile.email}</p>
                          {profile.phone ? <p><span className="text-[#6F7553]">Phone:</span> {profile.phone}</p> : null}
                        </div>
                        <p className="mt-2 text-[10px] uppercase tracking-wide text-[#6F7553]">
                          Applied on {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:border-red-600 hover:bg-red-50"
                          onClick={() => void handleProfileStatus(profile.id, "rejected")}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => void handleProfileStatus(profile.id, "approved")}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resource-submissions">
          <Card className="border-[#E7D9C3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#B36A4C]" />
                Public Resource Submission Queue
              </CardTitle>
              <CardDescription>
                Anonymous/public submissions stay here until an admin approves or rejects them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? <TableSkeleton rows={3} columns={4} /> : null}
              {!loading && resourceSubmissions.length === 0 && pendingResourceContent.length === 0 ? (
                <p className="text-sm text-[#6F7553]">No resources are pending moderation.</p>
              ) : null}

              {resourceSubmissions.map((submission) => (
                <div key={submission.id} className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#6F7553]">{submission.category}</p>
                        <h3 className="text-xl font-semibold text-[#334233]">{submission.resource_name}</h3>
                        <p className="mt-1 text-sm text-[#5B473A]">
                          {submission.organization_name || "Independent community recommendation"}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-[#5B473A]">{submission.description}</p>
                      {submission.full_description ? (
                        <p className="text-sm leading-relaxed text-[#5B473A]">{submission.full_description}</p>
                      ) : null}
                      <div className="grid gap-2 text-sm text-[#5B473A] sm:grid-cols-2">
                        <p><span className="font-semibold text-[#334233]">Address:</span> {submission.address}</p>
                        {submission.hours ? <p><span className="font-semibold text-[#334233]">Hours:</span> {submission.hours}</p> : null}
                        {submission.website ? <p><span className="font-semibold text-[#334233]">Website:</span> {submission.website}</p> : null}
                        {submission.contact_email ? <p><span className="font-semibold text-[#334233]">Contact email:</span> {submission.contact_email}</p> : null}
                        {submission.contact_phone ? <p><span className="font-semibold text-[#334233]">Contact phone:</span> {submission.contact_phone}</p> : null}
                      </div>
                      {submission.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {submission.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-[#D9C6A8] bg-white px-2 py-0.5 text-xs text-[#5B473A]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="min-w-[280px] rounded-xl border border-[#D9C6A8] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7553]">Submitter details</p>
                      <div className="mt-3 space-y-2 text-sm text-[#5B473A]">
                        <p><span className="font-semibold text-[#334233]">Name:</span> {submission.submitter_name}</p>
                        <p><span className="font-semibold text-[#334233]">Email:</span> {submission.submitter_email}</p>
                        {submission.submitter_connection ? (
                          <p><span className="font-semibold text-[#334233]">Connection:</span> {submission.submitter_connection}</p>
                        ) : null}
                        <p><span className="font-semibold text-[#334233]">Submitted:</span> {new Date(submission.created_at).toLocaleString()}</p>
                      </div>
                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                          Moderator notes
                        </label>
                        <Textarea
                          value={resourceNotes[submission.id] ?? ""}
                          onChange={(event) =>
                            setResourceNotes((prev) => ({ ...prev, [submission.id]: event.target.value }))
                          }
                          placeholder="Optional review notes or rejection reason"
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={Boolean(resourceSubmissionBusy[submission.id])}
                          onClick={() => void handleApproveResourceSubmission(submission.id)}
                        >
                          {resourceSubmissionBusy[submission.id] ? "Working..." : "Approve & Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={Boolean(resourceSubmissionBusy[submission.id])}
                          onClick={() => void handleRejectResourceSubmission(submission.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {pendingResourceContent.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                    Existing Resources Returned To Review
                  </p>
                  {pendingResourceContent.map((resource) => (
                    <div key={resource.id} className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#6F7553]">{resource.category}</p>
                          <h3 className="text-xl font-semibold text-[#334233]">{resource.name}</h3>
                          <p className="mt-1 text-sm text-[#5B473A]">{resource.address}</p>
                          <p className="mt-2 text-xs text-[#6F7553]">
                            Last updated {new Date(resource.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => void handleResourceStatus(resource.id, "published")}>
                            Approve & Publish
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleResourceStatus(resource.id, "rejected")}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="event-submissions">
          <Card className="border-[#E7D9C3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#B36A4C]" />
                Public Event Submission Queue
              </CardTitle>
              <CardDescription>
                Public event proposals do not go live until a moderator promotes them into the official events table.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? <p className="text-sm text-[#6F7553]">Loading event proposals...</p> : null}
              {!loading && eventSubmissions.length === 0 && pendingEventContent.length === 0 ? (
                <p className="text-sm text-[#6F7553]">No events are pending moderation.</p>
              ) : null}

              {eventSubmissions.map((submission) => (
                <div key={submission.id} className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#6F7553]">{submission.category || "Community Event"}</p>
                        <h3 className="text-xl font-semibold text-[#334233]">{submission.title}</h3>
                      </div>
                      {submission.description ? (
                        <p className="text-sm leading-relaxed text-[#5B473A]">{submission.description}</p>
                      ) : null}
                      <div className="grid gap-2 text-sm text-[#5B473A] sm:grid-cols-2">
                        <p><span className="font-semibold text-[#334233]">Location:</span> {submission.location}</p>
                        <p><span className="font-semibold text-[#334233]">Starts:</span> {new Date(submission.starts_at).toLocaleString()}</p>
                        {submission.ends_at ? (
                          <p><span className="font-semibold text-[#334233]">Ends:</span> {new Date(submission.ends_at).toLocaleString()}</p>
                        ) : null}
                        {submission.organizer_name ? <p><span className="font-semibold text-[#334233]">Organizer:</span> {submission.organizer_name}</p> : null}
                        {submission.organizer_email ? <p><span className="font-semibold text-[#334233]">Organizer email:</span> {submission.organizer_email}</p> : null}
                        {submission.organizer_phone ? <p><span className="font-semibold text-[#334233]">Organizer phone:</span> {submission.organizer_phone}</p> : null}
                      </div>
                    </div>

                    <div className="min-w-[280px] rounded-xl border border-[#D9C6A8] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7553]">Submitter details</p>
                      <div className="mt-3 space-y-2 text-sm text-[#5B473A]">
                        <p><span className="font-semibold text-[#334233]">Name:</span> {submission.submitter_name}</p>
                        <p><span className="font-semibold text-[#334233]">Email:</span> {submission.submitter_email}</p>
                        {submission.submitter_connection ? (
                          <p><span className="font-semibold text-[#334233]">Connection:</span> {submission.submitter_connection}</p>
                        ) : null}
                        <p><span className="font-semibold text-[#334233]">Submitted:</span> {new Date(submission.created_at).toLocaleString()}</p>
                      </div>
                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                          Moderator notes
                        </label>
                        <Textarea
                          value={eventNotes[submission.id] ?? ""}
                          onChange={(event) =>
                            setEventNotes((prev) => ({ ...prev, [submission.id]: event.target.value }))
                          }
                          placeholder="Optional review notes or rejection reason"
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={Boolean(eventSubmissionBusy[submission.id])}
                          onClick={() => void handleApproveEventSubmission(submission.id)}
                        >
                          {eventSubmissionBusy[submission.id] ? "Working..." : "Approve & Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={Boolean(eventSubmissionBusy[submission.id])}
                          onClick={() => void handleRejectEventSubmission(submission.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {pendingEventContent.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                    Existing Events Returned To Review
                  </p>
                  {pendingEventContent.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#6F7553]">{event.category || "Community Event"}</p>
                          <h3 className="text-xl font-semibold text-[#334233]">{event.title}</h3>
                          <p className="mt-1 text-sm text-[#5B473A]">
                            {new Date(event.starts_at).toLocaleString()} | {event.location}
                          </p>
                          <p className="mt-2 text-xs text-[#6F7553]">
                            Last updated {new Date(event.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => void handleEventStatus(event.id, "published")}>
                            Approve & Publish
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleEventStatus(event.id, "rejected")}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-library" className="space-y-8">
          <p className="text-sm text-[#6F7553]">
            Setting an existing resource/event to pending returns it to the moderation review tabs for another approve/reject cycle.
          </p>
          <Tabs defaultValue="resource-library" className="space-y-6">
            <TabsList className="h-auto w-full flex-col items-stretch justify-start gap-1 bg-[#E7D9C3]/30 p-1 sm:h-9 sm:w-fit sm:flex-row sm:items-center sm:justify-center sm:gap-0">
              <TabsTrigger value="resource-library" className="h-10 w-full flex-none justify-start data-[state=active]:bg-white sm:h-[calc(100%-1px)] sm:w-auto sm:flex-1 sm:justify-center">
                Resource Library
              </TabsTrigger>
              <TabsTrigger value="event-library" className="h-10 w-full flex-none justify-start data-[state=active]:bg-white sm:h-[calc(100%-1px)] sm:w-auto sm:flex-1 sm:justify-center">
                Event Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="event-library">
              <div ref={eventLibraryTopRef} />
              <Card className="border-[#E7D9C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-[#B36A4C]" />
                    Event Library
                  </CardTitle>
                  <CardDescription>
                    Search, filter, sort, and page through published, draft, pending, and rejected events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Search events
                      </label>
                      <Input
                        value={eventSearch}
                        onChange={(event) => setEventSearch(event.target.value)}
                        placeholder="Enter keywords"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Status
                      </label>
                      <select
                        value={eventStatusFilter}
                        onChange={(event) => setEventStatusFilter(event.target.value as StatusFilter)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="all">All statuses</option>
                        {eventModerationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Category
                      </label>
                      <select
                        value={eventCategoryFilter}
                        onChange={(event) => setEventCategoryFilter(event.target.value)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="all">All categories</option>
                        {eventCategoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Time window
                      </label>
                      <select
                        value={eventTimeFilter}
                        onChange={(event) => setEventTimeFilter(event.target.value as EventTimeFilter)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="all">All events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Sort
                      </label>
                      <select
                        value={eventSort}
                        onChange={(event) => setEventSort(event.target.value as EventSortOption)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="starts_soonest">Start date (soonest)</option>
                        <option value="starts_latest">Start date (latest)</option>
                        <option value="updated_desc">Recently updated</option>
                        <option value="updated_asc">Oldest updated</option>
                        <option value="title_asc">Title A-Z</option>
                        <option value="title_desc">Title Z-A</option>
                      </select>
                    </div>
                  </div>

                  {loading ? <p className="text-sm text-[#6F7553]">Loading event records...</p> : null}
                  {!loading && sortedEvents.length === 0 ? (
                    <p className="text-sm text-[#6F7553]">No events match the current filters.</p>
                  ) : null}

                  {paginatedEvents.map((event) => (
                    <div key={event.id} className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-[#334233]">{event.title}</h3>
                          <p className="mt-1 text-sm text-[#5B473A]">
                            {new Date(event.starts_at).toLocaleString()} | {event.location}
                          </p>
                          <p className="mt-1 text-xs text-[#6F7553]">
                            Category: {event.category || "Community Event"} | Posted by {event.posted_by_name || "Contributor"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <select
                            value={event.status}
                            onChange={(next) => void handleEventStatus(event.id, next.target.value as ContentStatus)}
                            className={DROPDOWN_COMPACT_CLASS}
                          >
                            {eventModerationStatuses.map((status) => (
                              <option key={`${event.id}-${status}`} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => void handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!loading && sortedEvents.length > 0 ? (
                    <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-4 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Showing {eventStart}-{eventEnd} of {sortedEvents.length} events
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goToEventPage(safeEventPage - 1)}
                          disabled={safeEventPage <= 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {getPaginationItems(safeEventPage, eventTotalPages).map((item, index) =>
                            item === "ellipsis" ? (
                              <span key={`moderator-event-ellipsis-${index}`} className="px-2 text-xs text-[#6F7553]">
                                ...
                              </span>
                            ) : (
                              <Button
                                key={`moderator-event-page-${item}`}
                                size="sm"
                                variant={item === safeEventPage ? "default" : "outline"}
                                onClick={() => goToEventPage(item)}
                                className="min-w-8 px-2"
                              >
                                {item}
                              </Button>
                            ),
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goToEventPage(safeEventPage + 1)}
                          disabled={safeEventPage >= eventTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resource-library">
              <div ref={resourceLibraryTopRef} />
              <Card className="border-[#E7D9C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#B36A4C]" />
                    Resource Library
                  </CardTitle>
                  <CardDescription>
                    Search, filter, sort, and page through published, draft, pending, and rejected resources.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Search resources
                      </label>
                      <Input
                        value={resourceSearch}
                        onChange={(event) => setResourceSearch(event.target.value)}
                        placeholder="Enter keywords"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Status
                      </label>
                      <select
                        value={resourceStatusFilter}
                        onChange={(event) => setResourceStatusFilter(event.target.value as StatusFilter)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="all">All statuses</option>
                        {resourceModerationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Category
                      </label>
                      <select
                        value={resourceCategoryFilter}
                        onChange={(event) => setResourceCategoryFilter(event.target.value)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="all">All categories</option>
                        {resourceCategoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Sort
                      </label>
                      <select
                        value={resourceSort}
                        onChange={(event) => setResourceSort(event.target.value as ResourceSortOption)}
                        className={DROPDOWN_CONTROL_CLASS}
                      >
                        <option value="updated_desc">Recently updated</option>
                        <option value="updated_asc">Oldest updated</option>
                        <option value="name_asc">Name A-Z</option>
                        <option value="name_desc">Name Z-A</option>
                      </select>
                    </div>
                  </div>

                  {loading ? <p className="text-sm text-[#6F7553]">Loading resource records...</p> : null}
                  {!loading && sortedResources.length === 0 ? (
                    <p className="text-sm text-[#6F7553]">No resources match the current filters.</p>
                  ) : null}

                  {paginatedResources.map((resource) => (
                    <div key={resource.id} className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-[#334233]">{resource.name}</h3>
                          <p className="mt-1 text-sm text-[#5B473A]">{resource.address}</p>
                          <p className="mt-1 text-xs text-[#6F7553]">
                            Category: {resource.category} | Posted by {resource.posted_by_name || "Contributor"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <select
                            value={resource.status}
                            onChange={(next) => void handleResourceStatus(resource.id, next.target.value as ContentStatus)}
                            className={DROPDOWN_COMPACT_CLASS}
                          >
                            {resourceModerationStatuses.map((status) => (
                              <option key={`${resource.id}-${status}`} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => void handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!loading && sortedResources.length > 0 ? (
                    <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-4 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Showing {resourceStart}-{resourceEnd} of {sortedResources.length} resources
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goToResourcePage(safeResourcePage - 1)}
                          disabled={safeResourcePage <= 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {getPaginationItems(safeResourcePage, resourceTotalPages).map((item, index) =>
                            item === "ellipsis" ? (
                              <span key={`moderator-resource-ellipsis-${index}`} className="px-2 text-xs text-[#6F7553]">
                                ...
                              </span>
                            ) : (
                              <Button
                                key={`moderator-resource-page-${item}`}
                                size="sm"
                                variant={item === safeResourcePage ? "default" : "outline"}
                                onClick={() => goToResourcePage(item)}
                                className="min-w-8 px-2"
                              >
                                {item}
                              </Button>
                            ),
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goToResourcePage(safeResourcePage + 1)}
                          disabled={safeResourcePage >= resourceTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}

