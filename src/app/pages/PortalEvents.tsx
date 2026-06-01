import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Pencil, PlusCircle, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
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
  uploadEventImage,
  updateEvent,
} from "../data/portalApi";
import type { ContentStatus, EventPayload, EventRecord } from "../types/portal";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADER_OPTIONS } from "../../utils/googleMaps";
import { EVENT_CATEGORY_SUGGESTIONS } from "../constants/eventCategorySuggestions";
import { AddressAutocompleteInput } from "../components/forms/AddressAutocompleteInput";
import { CategoryPicker } from "../components/forms/CategoryPicker";
import { validateProfanity } from "../../utils/profanityFilter";
import { getEventDateBounds, validateEventDateRange, validateMaxLength, validateRequired, validateUrl } from "../../utils/validation";

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
const EVENT_LIST_PAGE_SIZE = 6;
type StatusFilter = "all" | ContentStatus;
type EventTimeFilter = "all" | "upcoming" | "past";
type EventSortOption =
  | "starts_soonest"
  | "starts_latest"
  | "updated_desc"
  | "updated_asc"
  | "title_asc"
  | "title_desc";
const DROPDOWN_CONTROL_CLASS =
  "h-10 w-full rounded-md border border-[#D9D0C1] bg-white px-3 text-sm text-[#334233] focus:outline-none focus:ring-2 focus:ring-[#B36A4C]/20";

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

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
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
    || validateEventDateRange(form.startsAt, form.endsAt)
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
  isUploadingImage: boolean;
  imageUploadError: string | null;
  imageFileName: string;
  hasUploadedImage: boolean;
  onImageUpload: (file: File) => void;
  onClearImageUpload: () => void;
}

function EventFormFields({
  form,
  setForm,
  statuses,
  canModerate,
  idPrefix,
  isUploadingImage,
  imageUploadError,
  imageFileName,
  hasUploadedImage,
  onImageUpload,
  onClearImageUpload,
}: EventFormFieldsProps) {
  const titleId = `${idPrefix}-title`;
  const categoryId = `${idPrefix}-category`;
  const descriptionId = `${idPrefix}-description`;
  const locationId = `${idPrefix}-location`;
  const imageId = `${idPrefix}-image`;
  const imageUploadId = `${idPrefix}-image-upload`;
  const startsAtId = `${idPrefix}-starts`;
  const endsAtId = `${idPrefix}-ends`;
  const statusId = `${idPrefix}-status`;
  const spotlightId = `${idPrefix}-spotlight`;
  const eventDateBounds = getEventDateBounds();

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
        <div className="sm:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
            <div>
              <Label htmlFor={imageUploadId}>Upload image</Label>
              <input
                id={imageUploadId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                disabled={isUploadingImage}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  onImageUpload(file);
                  event.currentTarget.value = "";
                }}
              />
              <div className="mt-1 flex gap-2">
                <label
                  htmlFor={imageUploadId}
                  title={imageFileName || "Choose file"}
                  className={`inline-flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border border-[#D9D0C1] bg-white px-3 text-sm font-medium text-[#334233] transition-colors hover:border-[#B36A4C] hover:bg-[#F6F1E7] ${isUploadingImage ? "pointer-events-none opacity-70" : ""}`}
                >
                  <Upload className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="block min-w-0 max-w-full truncate">{isUploadingImage ? "Uploading..." : (imageFileName || "Choose file")}</span>
                </label>
                {hasUploadedImage ? (
                  <button
                    type="button"
                    aria-label="Remove uploaded image"
                    onClick={onClearImageUpload}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#D9D0C1] bg-white text-[#334233] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <Label htmlFor={imageId}>Image URL</Label>
              <Input
                id={imageId}
                className="mt-1"
                disabled={hasUploadedImage}
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </div>
          </div>
          {imageUploadError ? <p className="mt-2 text-xs text-red-600">{imageUploadError}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={startsAtId}>Starts at</Label>
          <Input
            id={startsAtId}
            type="datetime-local"
            min={eventDateBounds.minInput}
            max={eventDateBounds.maxInput}
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
            min={form.startsAt || eventDateBounds.minInput}
            max={eventDateBounds.maxInput}
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
            className="w-full h-9 rounded-md border border-[#D9D0C1] bg-white px-3 text-sm text-[#334233] focus:outline-none focus:ring-2 focus:ring-[#B36A4C]/20"
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
  const [createImageUploading, setCreateImageUploading] = useState(false);
  const [createImageUploadError, setCreateImageUploadError] = useState<string | null>(null);
  const [createImageFileName, setCreateImageFileName] = useState("");
  const [createUploadedImageUrl, setCreateUploadedImageUrl] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(defaultForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editGeoNotice, setEditGeoNotice] = useState<string | null>(null);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editImageUploadError, setEditImageUploadError] = useState<string | null>(null);
  const [editImageFileName, setEditImageFileName] = useState("");
  const [editUploadedImageUrl, setEditUploadedImageUrl] = useState("");
  const [editOriginalLocation, setEditOriginalLocation] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<StatusFilter>("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");
  const [eventTimeFilter, setEventTimeFilter] = useState<EventTimeFilter>("all");
  const [eventSort, setEventSort] = useState<EventSortOption>("starts_soonest");
  const [eventPage, setEventPage] = useState(1);

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

  useEffect(() => {
    setEventPage(1);
  }, [eventSearch, eventStatusFilter, eventCategoryFilter, eventTimeFilter, eventSort]);

  const eventCategories = useMemo(
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

  const filteredAndSortedEvents = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    const now = Date.now();
    const filtered = events.filter((event) => {
      const startsAt = new Date(event.starts_at).getTime();
      const matchesStatus = eventStatusFilter === "all" || event.status === eventStatusFilter;
      const matchesCategory = eventCategoryFilter === "all" || (event.category ?? "") === eventCategoryFilter;
      const matchesTime = eventTimeFilter === "all"
        || (eventTimeFilter === "upcoming" ? startsAt >= now : startsAt < now);
      const matchesQuery = !query
        || [
          event.title,
          event.category ?? "",
          event.location,
          event.description ?? "",
          event.status,
        ].join(" ").toLowerCase().includes(query);
      return matchesStatus && matchesCategory && matchesTime && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
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
  }, [events, eventSearch, eventStatusFilter, eventCategoryFilter, eventTimeFilter, eventSort]);

  const eventTotalPages = Math.max(1, Math.ceil(filteredAndSortedEvents.length / EVENT_LIST_PAGE_SIZE));
  const safeEventPage = Math.min(eventPage, eventTotalPages);

  useEffect(() => {
    if (eventPage > eventTotalPages) {
      setEventPage(eventTotalPages);
    }
  }, [eventPage, eventTotalPages]);

  const paginatedEvents = useMemo(() => {
    const start = (safeEventPage - 1) * EVENT_LIST_PAGE_SIZE;
    return filteredAndSortedEvents.slice(start, start + EVENT_LIST_PAGE_SIZE);
  }, [filteredAndSortedEvents, safeEventPage]);

  const eventStart = filteredAndSortedEvents.length === 0
    ? 0
    : (safeEventPage - 1) * EVENT_LIST_PAGE_SIZE + 1;
  const eventEnd = Math.min(safeEventPage * EVENT_LIST_PAGE_SIZE, filteredAndSortedEvents.length);

  const scrollPageToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToEventPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(nextPage, eventTotalPages));
    if (bounded === eventPage) return;
    setEventPage(bounded);
    scrollPageToTop();
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setEditId(null);
    setEditForm(defaultForm);
    setEditError(null);
    setEditGeoNotice(null);
    setEditImageUploading(false);
    setEditImageUploadError(null);
    setEditImageFileName("");
    setEditUploadedImageUrl("");
    setEditOriginalLocation(null);
  };

  const startEdit = (event: EventRecord) => {
    setEditId(event.id);
    setEditForm(mapEventToForm(event, canModerate));
    setEditOriginalLocation(event.location);
    setEditError(null);
    setEditGeoNotice(null);
    setEditImageUploadError(null);
    setEditImageFileName("");
    setEditUploadedImageUrl("");
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

    const startsAtIso = toIso(form.startsAt);
    if (!startsAtIso) {
      return null;
    }
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
    setCreateImageUploadError(null);

    if (createImageUploading) {
      const nextMessage = "Please wait for the image upload to finish.";
      setCreateSaving(false);
      setCreateError(nextMessage);
      return;
    }

    const createPayloadForm = {
      ...createForm,
      imageUrl: createUploadedImageUrl || createForm.imageUrl,
    };
    const validationError = validateEventForm(createPayloadForm);
    if (validationError) {
      setCreateError(validationError);
      setCreateSaving(false);
      return;
    }

    const toastId = toast.loading("Creating event...");
    const resolvedLocation = await resolveLocationForSave(createForm, false, null);
    setCreateGeoNotice(resolvedLocation.geoNotice);

    const normalizedImageUrl = normalizeHttpUrl(createPayloadForm.imageUrl);
    if (createPayloadForm.imageUrl.trim() && !normalizedImageUrl) {
      const nextMessage = "Image URL must be a valid URL (for example: https://images.unsplash.com/...).";
      setCreateSaving(false);
      setCreateError(nextMessage);
      toast.error(nextMessage, { id: toastId });
      return;
    }
    if (normalizedImageUrl && hasPlaceholderHost(normalizedImageUrl)) {
      const nextMessage = "Image URL cannot use placeholder domains like example.com or localhost.";
      setCreateSaving(false);
      setCreateError(nextMessage);
      toast.error(nextMessage, { id: toastId });
      return;
    }

    const payload = buildPayload(createPayloadForm, resolvedLocation.lat, resolvedLocation.lng);
    if (!payload) {
      const nextMessage = "Image URL must be a valid URL.";
      setCreateSaving(false);
      setCreateError(nextMessage);
      toast.error(nextMessage, { id: toastId });
      return;
    }

    try {
      await createEvent(payload);
      setCreateForm(defaultForm);
      setCreateImageFileName("");
      setCreateUploadedImageUrl("");
      await loadEvents();
      toast.success("Event created.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not create this event. Check the required fields and try again.");
      setCreateError(nextMessage);
      toast.error(nextMessage, { id: toastId });
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
    setEditImageUploadError(null);

    if (editImageUploading) {
      const nextMessage = "Please wait for the image upload to finish.";
      setEditSaving(false);
      setEditError(nextMessage);
      return;
    }

    const editPayloadForm = {
      ...editForm,
      imageUrl: editUploadedImageUrl || editForm.imageUrl,
    };
    const validationError = validateEventForm(editPayloadForm);
    if (validationError) {
      setEditError(validationError);
      setEditSaving(false);
      return;
    }

    const toastId = toast.loading("Saving event changes...");
    const resolvedLocation = await resolveLocationForSave(editForm, true, editOriginalLocation);
    setEditGeoNotice(resolvedLocation.geoNotice);

    const normalizedImageUrl = normalizeHttpUrl(editPayloadForm.imageUrl);
    if (editPayloadForm.imageUrl.trim() && !normalizedImageUrl) {
      const nextMessage = "Image URL must be a valid URL (for example: https://images.unsplash.com/...).";
      setEditSaving(false);
      setEditError(nextMessage);
      toast.error(nextMessage, { id: toastId });
      return;
    }
    if (normalizedImageUrl && hasPlaceholderHost(normalizedImageUrl)) {
      const nextMessage = "Image URL cannot use placeholder domains like example.com or localhost.";
      setEditSaving(false);
      setEditError(nextMessage);
      toast.error(nextMessage, { id: toastId });
      return;
    }

    const payload = buildPayload(editPayloadForm, resolvedLocation.lat, resolvedLocation.lng);
    if (!payload) {
      const nextMessage = "Image URL must be a valid URL.";
      setEditSaving(false);
      setEditError(nextMessage);
      toast.error(nextMessage, { id: toastId });
      return;
    }

    try {
      await updateEvent(editId, payload);
      closeEditDialog();
      await loadEvents();
      toast.success("Event changes saved.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not save this event. Check the required fields and try again.");
      setEditError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;

    const toastId = toast.loading("Deleting event...");

    try {
      await deleteEvent(eventId);
      await loadEvents();
      toast.success("Event deleted.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = "Could not delete this event.";
      setListError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    }
  };

  const handleCreateImageUpload = async (file: File) => {
    if (!user) return;

    setCreateImageUploading(true);
    setCreateImageUploadError(null);
    setCreateImageFileName(file.name);
    const toastId = toast.loading("Uploading image...");

    try {
      const imageUrl = await uploadEventImage(file, user.id);
      setCreateUploadedImageUrl(imageUrl);
      setCreateForm((prev) => ({ ...prev, imageUrl: "" }));
      toast.success("Image uploaded.", { id: toastId });
    } catch (error) {
      console.error(error);
      const nextMessage = toErrorMessage(error, "Could not upload this image.");
      setCreateImageUploadError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setCreateImageUploading(false);
    }
  };

  const handleEditImageUpload = async (file: File) => {
    if (!user) return;

    setEditImageUploading(true);
    setEditImageUploadError(null);
    setEditImageFileName(file.name);
    const toastId = toast.loading("Uploading image...");

    try {
      const imageUrl = await uploadEventImage(file, user.id);
      setEditUploadedImageUrl(imageUrl);
      setEditForm((prev) => ({ ...prev, imageUrl: "" }));
      toast.success("Image uploaded.", { id: toastId });
    } catch (error) {
      console.error(error);
      const nextMessage = toErrorMessage(error, "Could not upload this image.");
      setEditImageUploadError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setEditImageUploading(false);
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
                isUploadingImage={createImageUploading}
                imageUploadError={createImageUploadError}
                imageFileName={createImageFileName}
                hasUploadedImage={Boolean(createUploadedImageUrl)}
                onImageUpload={(file) => {
                  void handleCreateImageUpload(file);
                }}
                onClearImageUpload={() => {
                  setCreateUploadedImageUrl("");
                  setCreateImageFileName("");
                  setCreateImageUploadError(null);
                }}
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={createSaving || createImageUploading}>
                  <PlusCircle className="w-4 h-4" /> {createSaving ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Your event listings</CardTitle>
            <CardDescription>
              Published events go live immediately for approved contributors.
              Use filters, sorting, and pages to manage event updates faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-[#6F7553]">Loading events...</p> : null}
            {!loading && listError ? <p className="text-sm text-red-600">{listError}</p> : null}

            {events.length > 0 ? (
              <div className="rounded-xl border border-[#E7D9C3] bg-white p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="min-w-0 md:col-span-2">
                    <Label htmlFor="event-search">Search</Label>
                    <Input
                      id="event-search"
                      value={eventSearch}
                      onChange={(event) => setEventSearch(event.target.value)}
                      placeholder="Enter keywords"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="event-status-filter">Status</Label>
                    <select
                      id="event-status-filter"
                      value={eventStatusFilter}
                      onChange={(event) => setEventStatusFilter(event.target.value as StatusFilter)}
                      className={DROPDOWN_CONTROL_CLASS}
                    >
                      <option value="all">All statuses</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="event-category-filter">Category</Label>
                    <select
                      id="event-category-filter"
                      value={eventCategoryFilter}
                      onChange={(event) => setEventCategoryFilter(event.target.value)}
                      className={DROPDOWN_CONTROL_CLASS}
                    >
                      <option value="all">All categories</option>
                      {eventCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="event-time-filter">Time window</Label>
                    <select
                      id="event-time-filter"
                      value={eventTimeFilter}
                      onChange={(event) => setEventTimeFilter(event.target.value as EventTimeFilter)}
                      className={DROPDOWN_CONTROL_CLASS}
                    >
                      <option value="all">All events</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="event-sort">Sort by</Label>
                    <select
                      id="event-sort"
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
              </div>
            ) : null}

            {!loading && filteredAndSortedEvents.length === 0 ? (
              <p className="text-sm text-[#6F7553]">
                {events.length === 0
                  ? "No events yet. Create one to get started."
                  : "No events match the current filters."}
              </p>
            ) : null}

            {paginatedEvents.map((event) => (
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
                      {event.is_spotlight ? " | Spotlighted" : ""}
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

            {!loading && filteredAndSortedEvents.length > 0 ? (
              <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-4 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {eventStart}-{eventEnd} of {filteredAndSortedEvents.length} events
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
                        <span key={`event-ellipsis-${index}`} className="px-2 text-xs text-[#6F7553]">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`event-page-${item}`}
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
                isUploadingImage={editImageUploading}
                imageUploadError={editImageUploadError}
                imageFileName={editImageFileName}
                hasUploadedImage={Boolean(editUploadedImageUrl)}
                onImageUpload={(file) => {
                  void handleEditImageUpload(file);
                }}
                onClearImageUpload={() => {
                  setEditUploadedImageUrl("");
                  setEditImageFileName("");
                  setEditImageUploadError(null);
                }}
              />
            </div>
            <div className="border-t border-[#E7D9C3] bg-[#F6F1E7] px-6 py-3">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={editSaving || editImageUploading}>
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
