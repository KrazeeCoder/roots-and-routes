import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, FileText, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { PortalShell } from "../components/portal/PortalShell";
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

const resourceModerationStatuses: ContentStatus[] = ["draft", "published", "rejected", "archived", "pending"];
const eventModerationStatuses: ContentStatus[] = ["draft", "published", "rejected", "archived", "pending"];
const CONTENT_PAGE_SIZE = 12;
type StatusFilter = "all" | ContentStatus;

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
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<StatusFilter>("all");
  const [resourcePage, setResourcePage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [resourceSearch, resourceStatusFilter]);

  useEffect(() => {
    setEventPage(1);
  }, [eventSearch, eventStatusFilter]);

  const filteredResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesStatus = resourceStatusFilter === "all" || resource.status === resourceStatusFilter;
      const matchesQuery = !query || [
        resource.name,
        resource.category,
        resource.description,
        resource.address,
        resource.posted_by_name ?? "",
      ].join(" ").toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [resources, resourceSearch, resourceStatusFilter]);

  const filteredEvents = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    return events.filter((event) => {
      const matchesStatus = eventStatusFilter === "all" || event.status === eventStatusFilter;
      const matchesQuery = !query || [
        event.title,
        event.category ?? "",
        event.location,
        event.description ?? "",
        event.posted_by_name ?? "",
      ].join(" ").toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [events, eventSearch, eventStatusFilter]);

  const resourceTotalPages = Math.max(1, Math.ceil(filteredResources.length / CONTENT_PAGE_SIZE));
  const eventTotalPages = Math.max(1, Math.ceil(filteredEvents.length / CONTENT_PAGE_SIZE));

  useEffect(() => {
    if (resourcePage > resourceTotalPages) setResourcePage(resourceTotalPages);
  }, [resourcePage, resourceTotalPages]);

  useEffect(() => {
    if (eventPage > eventTotalPages) setEventPage(eventTotalPages);
  }, [eventPage, eventTotalPages]);

  const paginatedResources = useMemo(() => {
    const start = (resourcePage - 1) * CONTENT_PAGE_SIZE;
    return filteredResources.slice(start, start + CONTENT_PAGE_SIZE);
  }, [filteredResources, resourcePage]);

  const paginatedEvents = useMemo(() => {
    const start = (eventPage - 1) * CONTENT_PAGE_SIZE;
    return filteredEvents.slice(start, start + CONTENT_PAGE_SIZE);
  }, [filteredEvents, eventPage]);

  const resourceStart = filteredResources.length === 0 ? 0 : (resourcePage - 1) * CONTENT_PAGE_SIZE + 1;
  const resourceEnd = Math.min(resourcePage * CONTENT_PAGE_SIZE, filteredResources.length);
  const eventStart = filteredEvents.length === 0 ? 0 : (eventPage - 1) * CONTENT_PAGE_SIZE + 1;
  const eventEnd = Math.min(eventPage * CONTENT_PAGE_SIZE, filteredEvents.length);

  const handleResourceStatus = async (id: string, status: ContentStatus) => {
    const target = resources.find((item) => item.id === id);
    if (!target) return;

    try {
      await updateResource(id, { ...mapResourceRecordToPayload(target), status });
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not update resource status.");
    }
  };

  const handleEventStatus = async (id: string, status: ContentStatus) => {
    const target = events.find((item) => item.id === id);
    if (!target) return;

    try {
      await updateEvent(id, { ...mapEventRecordToPayload(target), status });
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not update event status.");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this resource permanently?")) return;

    try {
      await deleteResource(id);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not delete this resource.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Delete this event permanently?")) return;

    try {
      await deleteEvent(id);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not delete this event.");
    }
  };

  const handleProfileStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateProfileStatus(id, status);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError(`Could not ${status} that contributor account.`);
    }
  };

  const handleApproveResourceSubmission = async (id: string) => {
    try {
      await approveResourceSubmission(id);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not approve this resource submission.");
    }
  };

  const handleRejectResourceSubmission = async (id: string) => {
    try {
      await rejectResourceSubmission(id, resourceNotes[id]);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not reject this resource submission.");
    }
  };

  const handleApproveEventSubmission = async (id: string) => {
    try {
      await approveEventSubmission(id);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not approve this event submission.");
    }
  };

  const handleRejectEventSubmission = async (id: string) => {
    try {
      await rejectEventSubmission(id, eventNotes[id]);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not reject this event submission.");
    }
  };

  return (
    <PortalShell
      title="Admin Moderation"
      description="Review public submissions, approve contributor accounts, and manage live site content."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="bg-[#E7D9C3]/30 p-1">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-white">
            Pending Accounts
            {pendingProfiles.length > 0 ? (
              <span className="ml-2 rounded-full bg-[#B36A4C] px-1.5 py-0.5 text-[10px] text-white">
                {pendingProfiles.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="resource-submissions" className="data-[state=active]:bg-white">
            Resource Proposals
            {resourceSubmissions.length > 0 ? (
              <span className="ml-2 rounded-full bg-[#B36A4C] px-1.5 py-0.5 text-[10px] text-white">
                {resourceSubmissions.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="event-submissions" className="data-[state=active]:bg-white">
            Event Proposals
            {eventSubmissions.length > 0 ? (
              <span className="ml-2 rounded-full bg-[#B36A4C] px-1.5 py-0.5 text-[10px] text-white">
                {eventSubmissions.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="content-library" className="data-[state=active]:bg-white">
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
                <p className="text-sm text-[#6F7553]">Loading account queue...</p>
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
              {loading ? <p className="text-sm text-[#6F7553]">Loading resource proposals...</p> : null}
              {!loading && resourceSubmissions.length === 0 ? (
                <p className="text-sm text-[#6F7553]">No pending resource proposals.</p>
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
                        <Button size="sm" onClick={() => void handleApproveResourceSubmission(submission.id)}>
                          Approve & Publish
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void handleRejectResourceSubmission(submission.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              {!loading && eventSubmissions.length === 0 ? (
                <p className="text-sm text-[#6F7553]">No pending event proposals.</p>
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
                        <Button size="sm" onClick={() => void handleApproveEventSubmission(submission.id)}>
                          Approve & Publish
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void handleRejectEventSubmission(submission.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-library" className="space-y-8">
          <Tabs defaultValue="event-library" className="space-y-6">
            <TabsList className="bg-[#E7D9C3]/30 p-1">
              <TabsTrigger value="event-library" className="data-[state=active]:bg-white">
                Event Library
              </TabsTrigger>
              <TabsTrigger value="resource-library" className="data-[state=active]:bg-white">
                Resource Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="event-library">
              <Card className="border-[#E7D9C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-[#B36A4C]" />
                    Event Library
                  </CardTitle>
                  <CardDescription>
                    Search, filter, and page through published, draft, and archived events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Search events
                      </label>
                      <Input
                        value={eventSearch}
                        onChange={(event) => setEventSearch(event.target.value)}
                        placeholder="Title, category, location, organizer..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Status filter
                      </label>
                      <select
                        value={eventStatusFilter}
                        onChange={(event) => setEventStatusFilter(event.target.value as StatusFilter)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="all">All statuses</option>
                        {eventModerationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {loading ? <p className="text-sm text-[#6F7553]">Loading event records...</p> : null}
                  {!loading && filteredEvents.length === 0 ? (
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
                            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
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

                  {!loading && filteredEvents.length > 0 ? (
                    <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-4 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Showing {eventStart}-{eventEnd} of {filteredEvents.length} events
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEventPage((prev) => Math.max(prev - 1, 1))}
                          disabled={eventPage <= 1}
                        >
                          Previous
                        </Button>
                        <span className="text-xs uppercase tracking-wide text-[#6F7553]">
                          Page {eventPage} of {eventTotalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEventPage((prev) => Math.min(prev + 1, eventTotalPages))}
                          disabled={eventPage >= eventTotalPages}
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
              <Card className="border-[#E7D9C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#B36A4C]" />
                    Resource Library
                  </CardTitle>
                  <CardDescription>
                    Search, filter, and page through published, draft, and archived resources.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Search resources
                      </label>
                      <Input
                        value={resourceSearch}
                        onChange={(event) => setResourceSearch(event.target.value)}
                        placeholder="Name, category, address, posted by..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6F7553]">
                        Status filter
                      </label>
                      <select
                        value={resourceStatusFilter}
                        onChange={(event) => setResourceStatusFilter(event.target.value as StatusFilter)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="all">All statuses</option>
                        {resourceModerationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {loading ? <p className="text-sm text-[#6F7553]">Loading resource records...</p> : null}
                  {!loading && filteredResources.length === 0 ? (
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
                            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
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

                  {!loading && filteredResources.length > 0 ? (
                    <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-4 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Showing {resourceStart}-{resourceEnd} of {filteredResources.length} resources
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResourcePage((prev) => Math.max(prev - 1, 1))}
                          disabled={resourcePage <= 1}
                        >
                          Previous
                        </Button>
                        <span className="text-xs uppercase tracking-wide text-[#6F7553]">
                          Page {resourcePage} of {resourceTotalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResourcePage((prev) => Math.min(prev + 1, resourceTotalPages))}
                          disabled={resourcePage >= resourceTotalPages}
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
