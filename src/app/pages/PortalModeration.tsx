import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PortalShell } from "../components/portal/PortalShell";
import {
  listModerationEvents,
  listModerationResources,
  updateEvent,
  updateResource,
  deleteResource,
  deleteEvent,
  listPendingProfiles,
  updateProfileStatus,
} from "../data/portalApi";
import type { ContentStatus, ContributorProfile, EventRecord, ResourceRecord } from "../types/portal";
import { Trash2, UserCheck, UserX, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const resourceModerationStatuses: ContentStatus[] = ["pending", "published", "rejected", "draft"];
const eventModerationStatuses: ContentStatus[] = ["pending", "published", "rejected", "archived", "draft"];

export function PortalModeration() {
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<ContributorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resourceData, eventData, profileData] = await Promise.all([
        listModerationResources(),
        listModerationEvents(),
        listPendingProfiles(),
      ]);
      setResources(resourceData);
      setEvents(eventData);
      setPendingProfiles(profileData);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load moderation queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  const handleResourceStatus = async (id: string, status: ContentStatus) => {
    const target = resources.find((item) => item.id === id);
    if (!target) return;
    await updateResource(id, {
      ...target,
      status,
    });
    await loadQueue();
  };

  const handleEventStatus = async (id: string, status: ContentStatus) => {
    const target = events.find((item) => item.id === id);
    if (!target) return;
    await updateEvent(id, {
      ...target,
      status,
    });
    await loadQueue();
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this resource?")) return;
    try {
      await deleteResource(id);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      alert("Failed to delete resource.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this event?")) return;
    try {
      await deleteEvent(id);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      alert("Failed to delete event.");
    }
  };

  const handleProfileStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateProfileStatus(id, status);
      await loadQueue();
    } catch (nextError) {
      console.error(nextError);
      alert(`Failed to ${status} account.`);
    }
  };

  return (
    <PortalShell
      title="Admin Moderation"
      description="Manage community content and user accounts. Review submissions and approve new contributors."
    >
      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
      
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-[#E7D9C3]/30 p-1">
          <TabsTrigger value="content" className="data-[state=active]:bg-white">
            Content Queue
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-white flex gap-2 items-center">
            <Users className="w-4 h-4" />
            Pending Accounts
            {pendingProfiles.length > 0 && (
              <span className="bg-[#B36A4C] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {pendingProfiles.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          {loading ? <p className="text-sm text-[#6F7553]">Loading content library...</p> : null}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-[#E7D9C3]">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>All resource entries across all contributors and statuses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!loading && resources.length === 0 ? (
                  <p className="text-sm text-[#6F7553]">No resources found.</p>
                ) : null}

                {resources.map((resource) => (
                  <div key={resource.id} className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-[#334233]">{resource.name}</h3>
                        <p className="text-xs text-[#6F7553] mt-1">
                          by {resource.posted_by_name || "Contributor"} • <span className="font-medium uppercase">{resource.status}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => void handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-[#5B473A] mt-2 line-clamp-2">{resource.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resourceModerationStatuses.map((status) => (
                        <Button
                          key={`${resource.id}-${status}`}
                          type="button"
                          size="sm"
                          variant={resource.status === status ? "default" : "outline"}
                          onClick={() => {
                            void handleResourceStatus(resource.id, status);
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#E7D9C3]">
              <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>All events across all contributors and statuses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!loading && events.length === 0 ? (
                  <p className="text-sm text-[#6F7553]">No events found.</p>
                ) : null}

                {events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-[#334233]">{event.title}</h3>
                        <p className="text-xs text-[#6F7553] mt-1">
                          by {event.posted_by_name || "Contributor"} • <span className="font-medium uppercase">{event.status}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => void handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-[#5B473A] mt-2">
                      {new Date(event.starts_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      • {event.location}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {eventModerationStatuses.map((status) => (
                        <Button
                          key={`${event.id}-${status}`}
                          type="button"
                          size="sm"
                          variant={event.status === status ? "default" : "outline"}
                          onClick={() => {
                            void handleEventStatus(event.id, status);
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-[#E7D9C3]">
            <CardHeader>
              <CardTitle>Pending Accounts</CardTitle>
              <CardDescription>New contributors awaiting approval to post community content.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[#6F7553]">Loading account queue...</p>
              ) : pendingProfiles.length === 0 ? (
                <div className="text-center py-12 bg-[#F6F1E7] rounded-xl border border-dashed border-[#E7D9C3]">
                  <Users className="w-12 h-12 text-[#E7D9C3] mx-auto mb-3" />
                  <p className="text-[#334233] font-medium">No accounts awaiting approval</p>
                  <p className="text-sm text-[#6F7553] mt-1">All new contributors have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProfiles.map((profile) => (
                    <div key={profile.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E7D9C3] bg-[#F6F1E7]">
                      <div>
                        <h4 className="font-bold text-[#334233] text-lg">
                          {profile.organization_name}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-[#5B473A]">
                          <p><span className="text-[#6F7553]">Contact:</span> {profile.first_name} {profile.last_name}</p>
                          <p><span className="text-[#6F7553]">Email:</span> {profile.email}</p>
                          {profile.phone && <p><span className="text-[#6F7553]">Phone:</span> {profile.phone}</p>}
                        </div>
                        <p className="text-[10px] text-[#6F7553] mt-2 uppercase tracking-wider">
                          Applied on {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => void handleProfileStatus(profile.id, "rejected")}
                          variant="outline"
                          size="sm"
                          className="flex gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-600"
                        >
                          <UserX className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => void handleProfileStatus(profile.id, "approved")}
                          size="sm"
                          className="flex gap-2 bg-[#334233] hover:bg-[#B36A4C]"
                        >
                          <UserCheck className="w-4 h-4" />
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
      </Tabs>
    </PortalShell>
  );
}
