import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { PortalShell } from "../components/portal/PortalShell";
import { useAuth } from "../auth/AuthProvider";
import {
  createEvent,
  deleteEvent,
  isModerator,
  listPortalEvents,
  updateEvent,
} from "../data/portalApi";
import type { ContentStatus, EventPayload, EventRecord } from "../types/portal";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADER_OPTIONS } from "../../utils/googleMaps";
import { EVENT_CATEGORY_SUGGESTIONS } from "../constants/eventCategorySuggestions";
import { AddressAutocompleteInput } from "../components/forms/AddressAutocompleteInput";
import { CategoryPicker } from "../components/forms/CategoryPicker";
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

const contributorStatuses: ContentStatus[] = ["draft", "published"];
const moderatorStatuses: ContentStatus[] = ["draft", "pending", "published", "rejected"];

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

function mapEventToForm(event: EventRecord, canModerate: boolean): EventFormState {
  const allowedStatuses = canModerate ? moderatorStatuses : contributorStatuses;
  return {
    title: event.title,
    category: event.category ?? "",
    description: event.description ?? "",
    location: event.location,
    locationLat: event.location_lat,
    locationLng: event.location_lng,
    startsAt: toInputDate(event.starts_at),
    endsAt: event.ends_at ? toInputDate(event.ends_at) : "",
    imageUrl: event.image_url ?? "",
    status: allowedStatuses.includes(event.status)
      ? event.status
      : "draft",
    isSpotlight: event.is_spotlight,
  };
}

function validateEventForm(form: EventFormState): string | null {
  return validateRequired(form.title, "Event title")
    || validateRequired(form.location, "Location")
    || validateProfanity(form.title, "Event title")
    || validateProfanity(form.category, "Category")
    || validateProfanity(form.description, "Description")
    || validateProfanity(form.location, "Location")
    || validateUrl(form.imageUrl)
    || validateMaxLength(form.title, "Event title", 200)
    || validateMaxLength(form.category, "Category", 100)
    || validateMaxLength(form.description, "Description", 1000)
    || validateMaxLength(form.location, "Location", 500);
}

interface EventFormFieldsProps {
  form: EventFormState;
  setForm: Dispatch<SetStateAction<EventFormState>>;
  statuses: ContentStatus[];
  canModerate: boolean;
  idPrefix: string;
}

function EventFormFields({
  form,
  setForm,
  statuses,
  canModerate,
  idPrefix,
}: EventFormFieldsProps) {
  const titleId = `${idPrefix}-title`;
  const categoryId = `${idPrefix}-category`;
  const descriptionId = `${idPrefix}-description`;
  const locationId = `${idPrefix}-location`;
  const imageId = `${idPrefix}-image`;
  const startsAtId = `${idPrefix}-starts`;
  const endsAtId = `${idPrefix}-ends`;
  const statusId = `${idPrefix}-status`;
  const spotlightId = `${idPrefix}-spotlight`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={titleId}>Title</Label>
          <Input
            id={titleId}
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor={categoryId}>Category</Label>
          <CategoryPicker
            id={categoryId}
            value={form.category}
            onChange={(next) => setForm((prev) => ({ ...prev, category: next }))}
            options={EVENT_CATEGORY_SUGGESTIONS}
            allowCustom
            placeholder="Choose or enter a category"
            label="Event category"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={descriptionId}>Description</Label>
        <Textarea
          id={descriptionId}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={locationId}>Location</Label>
          <AddressAutocompleteInput
            id={locationId}
            value={form.location}
            onChange={(next) =>
              setForm((prev) => ({
                ...prev,
                location: next,
                locationLat: null,
                locationLng: null,
              }))
            }
            onPlaceResolved={(detail) => {
              setForm((prev) => ({
                ...prev,
                location: detail.formattedAddress,
                locationLat: detail.lat,
                locationLng: detail.lng,
              }));
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor={imageId}>Image URL</Label>
          <Input
            id={imageId}
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={startsAtId}>Starts at</Label>
          <Input
            id={startsAtId}
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor={endsAtId}>Ends at (optional)</Label>
          <Input
            id={endsAtId}
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={statusId}>Status</Label>
          <select
            id={statusId}
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
              id={spotlightId}
              type="checkbox"
              checked={form.isSpotlight}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isSpotlight: event.target.checked }))
              }
            />
            <Label htmlFor={spotlightId} className="font-normal mb-0">
              Include in spotlight
            </Label>
          </div>
        ) : null}
      </div>
    </>
  );
}

interface ResolvedEventLocation {
  lat: number | null;
  lng: number | null;
  geoNotice: string | null;
}

export function PortalEvents() {
  const { user, role } = useAuth();
  const { isLoaded: isMapsLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<EventFormState>(defaultForm);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createGeoNotice, setCreateGeoNotice] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(defaultForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editGeoNotice, setEditGeoNotice] = useState<string | null>(null);
  const [editOriginalLocation, setEditOriginalLocation] = useState<string | null>(null);

  const canModerate = isModerator(role);
  const statuses = canModerate ? moderatorStatuses : contributorStatuses;

  const loadEvents = async () => {
    if (!user || !role) return;

    setLoading(true);
    setListError(null);
    try {
      const data = await listPortalEvents(role, user.id);
      setEvents(data);
    } catch (nextError) {
      console.error(nextError);
      setListError("Could not load events right now.");
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

  const closeEditDialog = () => {
    setEditOpen(false);
    setEditId(null);
    setEditForm(defaultForm);
    setEditError(null);
    setEditGeoNotice(null);
    setEditOriginalLocation(null);
  };

  const startEdit = (event: EventRecord) => {
    setEditId(event.id);
    setEditForm(mapEventToForm(event, canModerate));
    setEditOriginalLocation(event.location);
    setEditError(null);
    setEditGeoNotice(null);
    setEditOpen(true);
  };

  const resolveLocationForSave = async (
    form: EventFormState,
    isEdit: boolean,
    originalLocation: string | null,
  ): Promise<ResolvedEventLocation> => {
    const locationText = form.location.trim();
    let lat = form.locationLat;
    let lng = form.locationLng;
    let geoNotice: string | null = null;

    const shouldGeocodeFallback =
      Boolean(locationText)
      && (lat == null || lng == null)
      && isMapsLoaded
      && Boolean(window.google?.maps?.Geocoder);

    if (shouldGeocodeFallback) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const geocode = await geocoder.geocode({ address: locationText });
        const location = geocode.results[0]?.geometry?.location;
        if (location) {
          lat = location.lat();
          lng = location.lng();
        } else {
          if (!isEdit || locationText !== (originalLocation ?? "")) {
            lat = null;
            lng = null;
          }
          geoNotice = "Saved without map coordinates. Please double-check the location text if map placement looks off.";
        }
      } catch (geoError) {
        console.error("Could not geocode event location", geoError);
        if (!isEdit || locationText !== (originalLocation ?? "")) {
          lat = null;
          lng = null;
        }
        geoNotice = "Saved without map coordinates. Please double-check the location text if map placement looks off.";
      }
    } else if (!GOOGLE_MAPS_API_KEY && locationText && (lat == null || lng == null)) {
      geoNotice = "Saved without map coordinates because the Google Maps API key is missing.";
    } else if (locationText && !isMapsLoaded && (lat == null || lng == null)) {
      geoNotice = "Saved without map coordinates because the map service is still loading. You can edit and resave shortly.";
    }

    return { lat, lng, geoNotice };
  };

  const buildPayload = (
    form: EventFormState,
    locationLat: number | null,
    locationLng: number | null,
  ): EventPayload | null => {
    const normalizedImageUrl = normalizeHttpUrl(form.imageUrl);
    if (form.imageUrl.trim() && !normalizedImageUrl) {
      return null;
    }
    if (normalizedImageUrl && hasPlaceholderHost(normalizedImageUrl)) {
      return null;
    }

    const startsAtIso = toIso(form.startsAt) || new Date().toISOString();
    const endsAtCandidate = toIso(form.endsAt);
    const endsAtIso = endsAtCandidate && new Date(endsAtCandidate).getTime() > new Date(startsAtIso).getTime()
      ? endsAtCandidate
      : plusOneHour(startsAtIso);

    return {
      title: form.title.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      location: form.location.trim(),
      location_lat: locationLat,
      location_lng: locationLng,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      image_url: normalizedImageUrl,
      status: form.status,
      is_spotlight: canModerate ? form.isSpotlight : false,
    };
  };

  const handleCreate = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!user) return;

    setCreateSaving(true);
    setCreateError(null);
    setCreateGeoNotice(null);

    const validationError = validateEventForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      setCreateSaving(false);
      return;
    }

    const resolvedLocation = await resolveLocationForSave(createForm, false, null);
    setCreateGeoNotice(resolvedLocation.geoNotice);

    const normalizedImageUrl = normalizeHttpUrl(createForm.imageUrl);
    if (createForm.imageUrl.trim() && !normalizedImageUrl) {
      setCreateSaving(false);
      setCreateError("Image URL must be a valid URL (for example: https://images.unsplash.com/...).");
      return;
    }
    if (normalizedImageUrl && hasPlaceholderHost(normalizedImageUrl)) {
      setCreateSaving(false);
      setCreateError("Image URL cannot use placeholder domains like example.com or localhost.");
      return;
    }

    const payload = buildPayload(createForm, resolvedLocation.lat, resolvedLocation.lng);
    if (!payload) {
      setCreateSaving(false);
      setCreateError("Image URL must be a valid URL.");
      return;
    }

    try {
      await createEvent(payload);
      setCreateForm(defaultForm);
      await loadEvents();
    } catch (nextError) {
      console.error(nextError);
      setCreateError("Could not create this event. Check the required fields and try again.");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleEditSave = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!editId) return;

    setEditSaving(true);
    setEditError(null);
    setEditGeoNotice(null);

    const validationError = validateEventForm(editForm);
    if (validationError) {
      setEditError(validationError);
      setEditSaving(false);
      return;
    }

    const resolvedLocation = await resolveLocationForSave(editForm, true, editOriginalLocation);
    setEditGeoNotice(resolvedLocation.geoNotice);

    const normalizedImageUrl = normalizeHttpUrl(editForm.imageUrl);
    if (editForm.imageUrl.trim() && !normalizedImageUrl) {
      setEditSaving(false);
      setEditError("Image URL must be a valid URL (for example: https://images.unsplash.com/...).");
      return;
    }
    if (normalizedImageUrl && hasPlaceholderHost(normalizedImageUrl)) {
      setEditSaving(false);
      setEditError("Image URL cannot use placeholder domains like example.com or localhost.");
      return;
    }

    const payload = buildPayload(editForm, resolvedLocation.lat, resolvedLocation.lng);
    if (!payload) {
      setEditSaving(false);
      setEditError("Image URL must be a valid URL.");
      return;
    }

    try {
      await updateEvent(editId, payload);
      closeEditDialog();
      await loadEvents();
    } catch (nextError) {
      console.error(nextError);
      setEditError("Could not save this event. Check the required fields and try again.");
    } finally {
      setEditSaving(false);
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
      setListError("Could not delete this event.");
    }
  };

  return (
    <PortalShell
      title="Manage Events"
      description="Create and update upcoming events. Approved contributors can publish events immediately or save drafts."
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-8">
        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Create event</CardTitle>
            <CardDescription>
              Use clear location/time details so attendees can plan confidently.
              {!canModerate ? " Draft stays private and published goes live immediately." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              {createError ? <p className="text-sm text-red-600">{createError}</p> : null}
              {createGeoNotice ? <p className="text-sm text-amber-700">{createGeoNotice}</p> : null}
              <EventFormFields
                form={createForm}
                setForm={setCreateForm}
                statuses={statuses}
                canModerate={canModerate}
                idPrefix="event-create"
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={createSaving}>
                  <PlusCircle className="w-4 h-4" /> {createSaving ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Your event listings</CardTitle>
            <CardDescription>Published events go live immediately for approved contributors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-[#6F7553]">Loading events...</p> : null}
            {!loading && listError ? <p className="text-sm text-red-600">{listError}</p> : null}
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

      <Dialog
        open={editOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeEditDialog();
            return;
          }
          setEditOpen(true);
        }}
      >
        <DialogContent
          className="max-h-[85vh] overflow-hidden border-[#E7D9C3] p-0 sm:max-w-4xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader className="border-b border-[#E7D9C3] px-6 pt-6 pb-4 pr-16">
            <DialogTitle>Edit event</DialogTitle>
            <DialogDescription>
              Update this event and click save to confirm your edits.
            </DialogDescription>
          </DialogHeader>
          <form className="flex max-h-[calc(85vh-96px)] min-h-0 flex-col" onSubmit={handleEditSave}>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {editError ? <p className="text-sm text-red-600">{editError}</p> : null}
              {editGeoNotice ? <p className="text-sm text-amber-700">{editGeoNotice}</p> : null}
              <EventFormFields
                form={editForm}
                setForm={setEditForm}
                statuses={statuses}
                canModerate={canModerate}
                idPrefix="event-edit"
              />
            </div>
            <div className="border-t border-[#E7D9C3] bg-[#F6F1E7] px-6 py-3">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={closeEditDialog}>
                  Close
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
