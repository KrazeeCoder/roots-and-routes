import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PortalShell } from "../components/portal/PortalShell";
import {
  listModerationEvents,
  listModerationResources,
  updateEvent,
  updateResource,
} from "../data/portalApi";
import type { ContentStatus, EventRecord, ResourceRecord } from "../types/portal";

const moderationStatuses: ContentStatus[] = ["pending", "published", "rejected", "archived"];

export function PortalModeration() {
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resourceData, eventData] = await Promise.all([
        listModerationResources(),
        listModerationEvents(),
      ]);
      setResources(resourceData);
      setEvents(eventData);
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
      name: target.name,
      category: target.category,
      description: target.description,
      full_description: target.full_description,
      address: target.address,
      phone: target.phone,
      website: target.website,
      hours: target.hours,
      tags: target.tags,
      image_url: target.image_url,
      is_spotlight: target.is_spotlight,
      spotlight_subtitle: target.spotlight_subtitle,
      status,
    });
    await loadQueue();
  };

  const handleEventStatus = async (id: string, status: ContentStatus) => {
    const target = events.find((item) => item.id === id);
    if (!target) return;
    await updateEvent(id, {
      title: target.title,
      category: target.category,
      description: target.description,
      location: target.location,
      starts_at: target.starts_at,
      ends_at: target.ends_at,
      image_url: target.image_url,
      is_spotlight: target.is_spotlight,
      status,
    });
    await loadQueue();
  };

  return (
    <PortalShell
      title="Moderation Queue"
      description="Review pending submissions and control public publication status."
    >
      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
      {loading ? <p className="text-sm text-[#6F7553]">Loading moderation queue...</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Resource submissions</CardTitle>
            <CardDescription>Draft/pending/rejected resource entries across contributors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && resources.length === 0 ? (
              <p className="text-sm text-[#6F7553]">No resources in queue.</p>
            ) : null}

            {resources.map((resource) => (
              <div key={resource.id} className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                <h3 className="font-semibold text-[#334233]">{resource.name}</h3>
                <p className="text-xs text-[#6F7553] mt-1">
                  by {resource.posted_by_name || "Contributor"} • {resource.status}
                </p>
                <p className="text-sm text-[#5B473A] mt-2 line-clamp-2">{resource.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {moderationStatuses.map((status) => (
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
            <CardTitle>Event submissions</CardTitle>
            <CardDescription>Draft/pending/rejected events across contributors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && events.length === 0 ? (
              <p className="text-sm text-[#6F7553]">No events in queue.</p>
            ) : null}

            {events.map((event) => (
              <div key={event.id} className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                <h3 className="font-semibold text-[#334233]">{event.title}</h3>
                <p className="text-xs text-[#6F7553] mt-1">
                  by {event.posted_by_name || "Contributor"} • {event.status}
                </p>
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
                  {moderationStatuses.map((status) => (
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
    </PortalShell>
  );
}
