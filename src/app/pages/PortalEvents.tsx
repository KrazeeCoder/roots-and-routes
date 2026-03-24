import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { PortalShell } from "../components/portal/PortalShell";
import { useAuth } from "../auth/AuthProvider";
import {
  createEvent,
  deleteEvent,
  isModerator,
  listPortalEvents,
  updateEvent,
} from "../data/portalApi";
import type { ContentStatus, EventRecord } from "../types/portal";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADER_OPTIONS } from "../../utils/googleMaps";
import { validateProfanity } from "../../utils/profanityFilter";
import { validateUrl, validateRequired, validateMaxLength } from "../../utils/validation";

interface EventFormState {
  title: string;
  category: string;
  description: string;
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  startsAt: string;
  endsAt: string;
  imageUrl: string;
  status: ContentStatus;
  isSpotlight: boolean;
}

const defaultForm: EventFormState = {
  title: "",
  category: "",
  description: "",
  location: "",
  locationLat: null,
  locationLng: null,
  startsAt: "",
  endsAt: "",
  imageUrl: "",
  status: "published",
  isSpotlight: false,
};

const contributorStatuses: ContentStatus[] = ["draft", "published", "archived"];
const moderatorStatuses: ContentStatus[] = ["draft", "pending", "published", "rejected", "archived"];

function normalizeHttpUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed.toString();
}

function hasPlaceholderHost(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "example.com"
      || hostname.endsWith(".example.com")
      || hostname === "localhost"
      || hostname.endsWith(".localhost");
  } catch {
    return true;
  }
}

function toInputDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
}

function toIso(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function plusOneHour(iso: string) {
  return new Date(new Date(iso).getTime() + 60 * 60 * 1000).toISOString();
}

export function PortalEvents() {
  const { user, role } = useAuth();
  const { isLoaded: isMapsLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [form, setForm] = useState<EventFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalLocation, setOriginalLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const canModerate = isModerator(role);
  const statuses = canModerate ? moderatorStatuses : contributorStatuses;

  const loadEvents = async () => {
    if (!user || !role) return;

    setLoading(true);
    setError(null);
    try {
      const data = await listPortalEvents(role, user.id);
      setEvents(data);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load events right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [role, user]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [events],
  );

  const resetForm = () => {
    setEditingId(null);
    setOriginalLocation(null);
    setForm(defaultForm);
  };

  const startEdit = (event: EventRecord) => {
    setEditingId(event.id);
    setOriginalLocation(event.location);
    setForm({
      title: event.title,
      category: event.category ?? "",
      description: event.description ?? "",
      location: event.location,
      locationLat: event.location_lat,
      locationLng: event.location_lng,
      startsAt: toInputDate(event.starts_at),
      endsAt: event.ends_at ? toInputDate(event.ends_at) : "",
      imageUrl: event.image_url ?? "",
      status: canModerate || contributorStatuses.includes(event.status)
        ? event.status
        : "draft",
      isSpotlight: event.is_spotlight,
    });
  };

  const handleSave = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setGeoNotice(null);

    // Validate required fields
    const titleError = validateRequired(form.title, "Event title");
    const locationError = validateRequired(form.location, "Location");

    // Validate profanity in text fields
    const profanityTitleError = validateProfanity(form.title, "Event title");
    const profanityCategoryError = validateProfanity(form.category, "Category");
    const profanityDescriptionError = validateProfanity(form.description, "Description");
    const profanityLocationError = validateProfanity(form.location, "Location");

    // Validate input formats
    const imageError = validateUrl(form.imageUrl);

    // Validate length constraints
    const titleLengthError = validateMaxLength(form.title, "Event title", 200);
    const categoryLengthError = validateMaxLength(form.category, "Category", 100);
    const descriptionLengthError = validateMaxLength(form.description, "Description", 1000);
    const locationLengthError = validateMaxLength(form.location, "Location", 500);

    // Check for any validation errors
    const firstError = titleError || locationError ||
                       profanityTitleError || profanityCategoryError || profanityDescriptionError || profanityLocationError ||
                       imageError ||
                       titleLengthError || categoryLengthError || descriptionLengthError || locationLengthError;

    if (firstError) {
      setError(firstError);
      setSaving(false);
      return;
    }

    const locationText = form.location.trim();
    let locationLat = form.locationLat;
    let locationLng = form.locationLng;

    if (locationText && isMapsLoaded && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const geocode = await geocoder.geocode({ address: locationText });
        const location = geocode.results[0]?.geometry?.location;
        if (location) {
          locationLat = location.lat();
          locationLng = location.lng();
        } else {
          if (!editingId || locationText !== (originalLocation ?? "")) {
            locationLat = null;
            locationLng = null;
          }
          setGeoNotice("Saved without map coordinates. Please double-check the location text if map placement looks off.");
        }
      } catch (geoError) {
        console.error("Could not geocode event location", geoError);
        if (!editingId || locationText !== (originalLocation ?? "")) {
          locationLat = null;
          locationLng = null;
        }
        setGeoNotice("Saved without map coordinates. Please double-check the location text if map placement looks off.");
      }
    } else if (!GOOGLE_MAPS_API_KEY) {
      setGeoNotice("Saved without map coordinates because the Google Maps API key is missing.");
    } else if (locationText && !isMapsLoaded) {
      setGeoNotice("Saved without map coordinates because the map service is still loading. You can edit and resave shortly.");
    }

    const normalizedImageUrl = normalizeHttpUrl(form.imageUrl);
    if (form.imageUrl.trim() && !normalizedImageUrl) {
      setSaving(false);
      setError("Image URL must be a valid URL (for example: https://images.unsplash.com/...).");
      return;
    }
    if (normalizedImageUrl && hasPlaceholderHost(normalizedImageUrl)) {
      setSaving(false);
      setError("Image URL cannot use placeholder domains like example.com or localhost.");
      return;
    }

    const startsAtIso = toIso(form.startsAt) || new Date().toISOString();
    const endsAtCandidate = toIso(form.endsAt);
    const endsAtIso = endsAtCandidate && new Date(endsAtCandidate).getTime() > new Date(startsAtIso).getTime()
      ? endsAtCandidate
      : plusOneHour(startsAtIso);

    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      location: locationText,
      location_lat: locationLat,
      location_lng: locationLng,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      image_url: normalizedImageUrl,
      status: canModerate ? form.status : form.status,
      is_spotlight: canModerate ? form.isSpotlight : false,
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
      } else {
        await createEvent(payload);
      }

      resetForm();
      await loadEvents();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not save this event. Check the required fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;
    try {
      await deleteEvent(eventId);
      await loadEvents();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not delete this event.");
    }
  };

  return (
    <PortalShell
      title="Manage Events"
      description="Create and update upcoming events. Approved contributors can publish events immediately, save drafts, or archive old listings."
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-8">
        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>{editingId ? "Edit event" : "Create event"}</CardTitle>
            <CardDescription>
              Use clear location/time details so attendees can plan confidently.
              {!canModerate ? " Draft stays private, published goes live immediately, and archived removes the event from public pages." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {geoNotice ? <p className="text-sm text-amber-700">{geoNotice}</p> : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-category">Category</Label>
                  <Input
                    id="event-category"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={form.location}
                    onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-image">Image URL</Label>
                  <Input
                    id="event-image"
                    value={form.imageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-starts">Starts at</Label>
                  <Input
                    id="event-starts"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-ends">Ends at (optional)</Label>
                  <Input
                    id="event-ends"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-status">Status</Label>
                  <select
                    id="event-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as ContentStatus }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                {canModerate ? (
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      id="event-spotlight"
                      type="checkbox"
                      checked={form.isSpotlight}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, isSpotlight: event.target.checked }))
                      }
                    />
                    <Label htmlFor="event-spotlight" className="font-normal mb-0">
                      Include in spotlight
                    </Label>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  <PlusCircle className="w-4 h-4" /> {saving ? "Saving..." : editingId ? "Update Event" : "Create Event"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Your event listings</CardTitle>
            <CardDescription>Published events go live immediately for approved contributors. Archived events remain available here for maintenance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-[#6F7553]">Loading events...</p> : null}
            {!loading && sortedEvents.length === 0 ? (
              <p className="text-sm text-[#6F7553]">No events yet. Create one to get started.</p>
            ) : null}

            {sortedEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#6F7553]">{event.category || "Community Event"}</p>
                    <h3 className="font-semibold text-[#334233]">{event.title}</h3>
                    <p className="text-sm text-[#5B473A]">
                      {new Date(event.starts_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-[#6F7553] mt-2">
                      Status: <span className="font-semibold">{event.status}</span>
                      {event.is_spotlight ? " • Spotlighted" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(event)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void handleDelete(event.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
