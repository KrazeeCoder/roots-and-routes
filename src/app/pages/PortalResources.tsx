import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Pencil, PlusCircle, Star, Trash2 } from "lucide-react";
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
  createResource,
  deleteResource,
  isModerator,
  listResourceRatingFeedback,
  listPortalResources,
  uploadResourceImage,
  updateResource,
} from "../data/portalApi";
import type {
  ContentStatus,
  ResourcePayload,
  ResourceRatingFeedback,
  ResourceRecord,
} from "../types/portal";
import { validateProfanity } from "../../utils/profanityFilter";
import { validateEmail, validatePhone, validateUrl, validateRequired, validateMaxLength } from "../../utils/validation";
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
  type ResourceCategory,
} from "../constants/resourceCategories";
import { AddressAutocompleteInput } from "../components/forms/AddressAutocompleteInput";
import { CategoryPicker } from "../components/forms/CategoryPicker";
import { ResourceHoursSelector } from "../components/forms/ResourceHoursSelector";
import { TagChipInput, joinTagsForValidation } from "../components/forms/TagChipInput";
import { TableSkeleton, FormSkeleton } from "../components/ui/skeleton";

interface ResourceFormState {
  name: string;
  category: ResourceCategory | "";
  description: string;
  fullDescription: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  tags: string[];
  imageUrl: string;
  status: ContentStatus;
  isSpotlight: boolean;
  spotlightSubtitle: string;
}

const defaultForm: ResourceFormState = {
  name: "",
  category: "",
  description: "",
  fullDescription: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  hours: "",
  tags: [],
  imageUrl: "",
  status: "published",
  isSpotlight: false,
  spotlightSubtitle: "",
};

const contributorStatuses: ContentStatus[] = ["draft", "published"];
const moderatorStatuses: ContentStatus[] = ["draft", "pending", "published", "rejected"];
const RESOURCE_LIST_PAGE_SIZE = 6;
const FEEDBACK_PAGE_SIZE = 5;
type StatusFilter = "all" | ContentStatus;
type ResourceSortOption = "updated_desc" | "updated_asc" | "name_asc" | "name_desc";
type FeedbackSortOption = "recent_desc" | "recent_asc" | "rating_desc" | "rating_asc";
type FeedbackRatingFilter = "all" | "1" | "2" | "3" | "4" | "5";
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

function mapResourceToForm(resource: ResourceRecord, canModerate: boolean): ResourceFormState {
  const allowedStatuses = canModerate ? moderatorStatuses : contributorStatuses;
  return {
    name: resource.name,
    category: resource.category,
    description: resource.description,
    fullDescription: resource.full_description ?? "",
    address: resource.address,
    phone: resource.phone ?? "",
    email: resource.email ?? "",
    website: resource.website ?? "",
    hours: resource.hours ?? "",
    tags: [...resource.tags],
    imageUrl: resource.image_url ?? "",
    status: allowedStatuses.includes(resource.status)
      ? resource.status
      : "draft",
    isSpotlight: resource.is_spotlight,
    spotlightSubtitle: resource.spotlight_subtitle ?? "",
  };
}

function validateResourceForm(form: ResourceFormState): string | null {
  const categoryError = validateRequired(form.category, "Category");
  const invalidCategoryError =
    form.category && !isResourceCategory(form.category)
      ? "Category must be one of the approved resource categories."
      : null;

  const firstError =
    validateRequired(form.name, "Resource name")
    || categoryError
    || invalidCategoryError
    || validateRequired(form.description, "Description")
    || validateRequired(form.address, "Address")
    || validateProfanity(form.name, "Resource name")
    || validateProfanity(form.category, "Category")
    || validateProfanity(form.description, "Description")
    || validateProfanity(form.fullDescription, "Full description")
    || validateProfanity(form.address, "Address")
    || validateProfanity(form.hours, "Hours")
    || validateProfanity(joinTagsForValidation(form.tags), "Tags")
    || validateProfanity(form.spotlightSubtitle, "Spotlight subtitle")
    || validateEmail(form.email)
    || validatePhone(form.phone)
    || validateUrl(form.website)
    || validateUrl(form.imageUrl)
    || validateMaxLength(form.name, "Resource name", 200)
    || validateMaxLength(form.category, "Category", 100)
    || validateMaxLength(form.description, "Description", 500)
    || validateMaxLength(form.fullDescription, "Full description", 2000)
    || validateMaxLength(form.address, "Address", 500)
    || validateMaxLength(form.hours, "Hours", 200)
    || validateMaxLength(joinTagsForValidation(form.tags), "Tags", 300)
    || validateMaxLength(form.spotlightSubtitle, "Spotlight subtitle", 200);

  return firstError;
}

function toResourcePayload(form: ResourceFormState, canModerate: boolean): ResourcePayload {
  return {
    name: form.name.trim(),
    category: form.category,
    description: form.description.trim(),
    full_description: form.fullDescription.trim() || null,
    address: form.address.trim(),
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    website: normalizeHttpUrl(form.website),
    hours: form.hours.trim() || null,
    tags: form.tags,
    image_url: normalizeHttpUrl(form.imageUrl),
    status: form.status,
    is_spotlight: canModerate ? form.isSpotlight : false,
    spotlight_subtitle: canModerate ? form.spotlightSubtitle.trim() || null : null,
  };
}

function formatDateTime(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString();
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function renderRatingStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${safeRating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < safeRating;
        return (
          <Star
            key={`rating-star-${safeRating}-${index}`}
            className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-500" : "fill-transparent text-[#C9B79D]"}`}
          />
        );
      })}
    </div>
  );
}

interface ResourceFormFieldsProps {
  form: ResourceFormState;
  setForm: Dispatch<SetStateAction<ResourceFormState>>;
  statuses: ContentStatus[];
  canModerate: boolean;
  idPrefix: string;
  isUploadingImage: boolean;
  imageUploadError: string | null;
  imageFileName: string;
  onImageUpload: (file: File) => void;
}

function ResourceFormFields({
  form,
  setForm,
  statuses,
  canModerate,
  idPrefix,
  isUploadingImage,
  imageUploadError,
  imageFileName,
  onImageUpload,
}: ResourceFormFieldsProps) {
  const nameId = `${idPrefix}-name`;
  const categoryId = `${idPrefix}-category`;
  const descriptionId = `${idPrefix}-description`;
  const fullDescriptionId = `${idPrefix}-full-description`;
  const addressId = `${idPrefix}-address`;
  const hoursId = `${idPrefix}-hours`;
  const phoneId = `${idPrefix}-phone`;
  const emailId = `${idPrefix}-email`;
  const websiteId = `${idPrefix}-website`;
  const imageId = `${idPrefix}-image`;
  const imageUploadId = `${idPrefix}-image-upload`;
  const tagsId = `${idPrefix}-tags`;
  const statusId = `${idPrefix}-status`;
  const spotlightId = `${idPrefix}-spotlight`;
  const spotlightSubtitleId = `${idPrefix}-spotlight-subtitle`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={nameId}>Name</Label>
          <Input
            id={nameId}
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor={categoryId}>Category</Label>
          <CategoryPicker
            id={categoryId}
            value={form.category}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, category: next as ResourceCategory | "" }))
            }
            options={RESOURCE_CATEGORIES}
            allowCustom={false}
            placeholder="Choose a category"
            label="Resource category"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={descriptionId}>Short description</Label>
        <Textarea
          id={descriptionId}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor={fullDescriptionId}>Full description (optional)</Label>
        <Textarea
          id={fullDescriptionId}
          value={form.fullDescription}
          onChange={(event) => setForm((prev) => ({ ...prev, fullDescription: event.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={addressId}>Address</Label>
          <AddressAutocompleteInput
            id={addressId}
            value={form.address}
            onChange={(next) => setForm((prev) => ({ ...prev, address: next }))}
            required
          />
        </div>
        <div>
          <Label htmlFor={hoursId}>Hours</Label>
          <ResourceHoursSelector
            id={hoursId}
            value={form.hours}
            onChange={(next) => setForm((prev) => ({ ...prev, hours: next }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor={phoneId}>Phone</Label>
          <Input
            id={phoneId}
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor={websiteId}>Website</Label>
          <Input
            id={websiteId}
            value={form.website}
            onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <div>
              <Label htmlFor={imageId}>Image URL</Label>
              <Input
                id={imageId}
                className="mt-1"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor={imageUploadId}>Upload image</Label>
              <input
                id={imageUploadId}
                type="file"
                accept="image/*"
                disabled={isUploadingImage}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  onImageUpload(file);
                  event.currentTarget.value = "";
                }}
              />
              <label
                htmlFor={imageUploadId}
                title={imageFileName || "Choose file"}
                className={`mt-1 inline-flex h-9 w-full min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[#D9D0C1] bg-white px-3 text-sm font-medium text-[#334233] transition-colors hover:border-[#B36A4C] hover:bg-[#F6F1E7] ${isUploadingImage ? "pointer-events-none opacity-70" : ""}`}
              >
                <span className="block min-w-0 max-w-full truncate">{isUploadingImage ? "Uploading..." : (imageFileName || "Choose file")}</span>
              </label>
            </div>
          </div>
          {imageUploadError ? <p className="mt-2 text-xs text-red-600">{imageUploadError}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor={tagsId}>Tags</Label>
        <TagChipInput
          id={tagsId}
          values={form.tags}
          onChange={(next) => setForm((prev) => ({ ...prev, tags: next }))}
          maxChars={300}
          placeholder="Type a tag, then press Enter"
        />
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

      {canModerate && form.isSpotlight ? (
        <div>
          <Label htmlFor={spotlightSubtitleId}>Spotlight subtitle</Label>
          <Input
            id={spotlightSubtitleId}
            value={form.spotlightSubtitle}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, spotlightSubtitle: event.target.value }))
            }
          />
        </div>
      ) : null}
    </>
  );
}

export function PortalResources() {
  const { user, role } = useAuth();
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [createForm, setCreateForm] = useState<ResourceFormState>(defaultForm);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createImageUploading, setCreateImageUploading] = useState(false);
  const [createImageUploadError, setCreateImageUploadError] = useState<string | null>(null);
  const [createImageFileName, setCreateImageFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ResourceFormState>(defaultForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editImageUploadError, setEditImageUploadError] = useState<string | null>(null);
  const [editImageFileName, setEditImageFileName] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<ResourceRatingFeedback[]>([]);
  const [feedbackResourceName, setFeedbackResourceName] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceStatusFilter, setResourceStatusFilter] = useState<StatusFilter>("all");
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState("all");
  const [resourceSort, setResourceSort] = useState<ResourceSortOption>("updated_desc");
  const [resourcePage, setResourcePage] = useState(1);
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<FeedbackRatingFilter>("all");
  const [feedbackSort, setFeedbackSort] = useState<FeedbackSortOption>("recent_desc");
  const [feedbackPage, setFeedbackPage] = useState(1);
  const feedbackScrollRef = useRef<HTMLDivElement | null>(null);

  const canModerate = isModerator(role);
  const statuses = canModerate ? moderatorStatuses : contributorStatuses;

  const loadResources = async () => {
    if (!user || !role) return;
    setLoading(true);
    setListError(null);

    try {
      const data = await listPortalResources(role, user.id);
      setResources(data);
    } catch (nextError) {
      console.error(nextError);
      setListError("Could not load resources right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResources();
  }, [role, user]);

  useEffect(() => {
    setResourcePage(1);
  }, [resourceSearch, resourceStatusFilter, resourceCategoryFilter, resourceSort]);

  useEffect(() => {
    setFeedbackPage(1);
  }, [feedbackSearch, feedbackRatingFilter, feedbackSort]);

  const resourceCategories = useMemo(
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

  const filteredAndSortedResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();
    const filtered = resources.filter((resource) => {
      const matchesStatus = resourceStatusFilter === "all" || resource.status === resourceStatusFilter;
      const matchesCategory = resourceCategoryFilter === "all" || resource.category === resourceCategoryFilter;
      const matchesQuery = !query
        || [
          resource.name,
          resource.category,
          resource.description,
          resource.address,
          resource.status,
          resource.tags.join(" "),
        ].join(" ").toLowerCase().includes(query);
      return matchesStatus && matchesCategory && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
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
  }, [resources, resourceSearch, resourceStatusFilter, resourceCategoryFilter, resourceSort]);

  const resourceTotalPages = Math.max(1, Math.ceil(filteredAndSortedResources.length / RESOURCE_LIST_PAGE_SIZE));
  const safeResourcePage = Math.min(resourcePage, resourceTotalPages);

  useEffect(() => {
    if (resourcePage > resourceTotalPages) {
      setResourcePage(resourceTotalPages);
    }
  }, [resourcePage, resourceTotalPages]);

  const paginatedResources = useMemo(() => {
    const start = (safeResourcePage - 1) * RESOURCE_LIST_PAGE_SIZE;
    return filteredAndSortedResources.slice(start, start + RESOURCE_LIST_PAGE_SIZE);
  }, [filteredAndSortedResources, safeResourcePage]);

  const resourceStart = filteredAndSortedResources.length === 0
    ? 0
    : (safeResourcePage - 1) * RESOURCE_LIST_PAGE_SIZE + 1;
  const resourceEnd = Math.min(
    safeResourcePage * RESOURCE_LIST_PAGE_SIZE,
    filteredAndSortedResources.length,
  );

  const filteredAndSortedFeedback = useMemo(() => {
    const query = feedbackSearch.trim().toLowerCase();
    const filtered = feedbackItems.filter((item) => {
      const matchesRating = feedbackRatingFilter === "all" || String(item.rating) === feedbackRatingFilter;
      const matchesQuery = !query
        || [item.reason, `${item.rating}`, formatDateTime(item.updated_at)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesRating && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (feedbackSort === "recent_desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (feedbackSort === "recent_asc") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      if (feedbackSort === "rating_desc") {
        return b.rating - a.rating;
      }
      return a.rating - b.rating;
    });
  }, [feedbackItems, feedbackSearch, feedbackRatingFilter, feedbackSort]);

  const feedbackTotalPages = Math.max(1, Math.ceil(filteredAndSortedFeedback.length / FEEDBACK_PAGE_SIZE));
  const safeFeedbackPage = Math.min(feedbackPage, feedbackTotalPages);

  useEffect(() => {
    if (feedbackPage > feedbackTotalPages) {
      setFeedbackPage(feedbackTotalPages);
    }
  }, [feedbackPage, feedbackTotalPages]);

  const paginatedFeedback = useMemo(() => {
    const start = (safeFeedbackPage - 1) * FEEDBACK_PAGE_SIZE;
    return filteredAndSortedFeedback.slice(start, start + FEEDBACK_PAGE_SIZE);
  }, [filteredAndSortedFeedback, safeFeedbackPage]);

  const feedbackStart = filteredAndSortedFeedback.length === 0
    ? 0
    : (safeFeedbackPage - 1) * FEEDBACK_PAGE_SIZE + 1;
  const feedbackEnd = Math.min(
    safeFeedbackPage * FEEDBACK_PAGE_SIZE,
    filteredAndSortedFeedback.length,
  );

  const scrollPageToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToResourcePage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(nextPage, resourceTotalPages));
    if (bounded === resourcePage) return;
    setResourcePage(bounded);
    scrollPageToTop();
  };

  const goToFeedbackPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(nextPage, feedbackTotalPages));
    if (bounded === feedbackPage) return;
    setFeedbackPage(bounded);

    const feedbackScroller = feedbackScrollRef.current;
    if (feedbackScroller) {
      feedbackScroller.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    scrollPageToTop();
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setEditId(null);
    setEditForm(defaultForm);
    setEditError(null);
    setEditImageUploading(false);
    setEditImageUploadError(null);
    setEditImageFileName("");
  };

  const startEdit = (resource: ResourceRecord) => {
    setEditId(resource.id);
    setEditForm(mapResourceToForm(resource, canModerate));
    setEditError(null);
    setEditImageUploadError(null);
    setEditImageFileName("");
    setEditOpen(true);
  };

  const closeFeedbackDialog = () => {
    setFeedbackOpen(false);
    setFeedbackLoading(false);
    setFeedbackError(null);
    setFeedbackItems([]);
    setFeedbackResourceName("");
    setFeedbackSearch("");
    setFeedbackRatingFilter("all");
    setFeedbackSort("recent_desc");
    setFeedbackPage(1);
  };

  const openFeedbackDialog = async (resource: ResourceRecord) => {
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    setFeedbackError(null);
    setFeedbackItems([]);
    setFeedbackResourceName(resource.name);
    setFeedbackSearch("");
    setFeedbackRatingFilter("all");
    setFeedbackSort("recent_desc");
    setFeedbackPage(1);

    try {
      const data = await listResourceRatingFeedback(resource.id);
      setFeedbackItems(data);
    } catch (error) {
      console.error(error);
      setFeedbackError("Could not load rating feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setCreateSaving(true);
    setCreateError(null);
    setCreateImageUploadError(null);

    if (createImageUploading) {
      setCreateError("Please wait for the image upload to finish.");
      setCreateSaving(false);
      return;
    }

    const validationError = validateResourceForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      setCreateSaving(false);
      return;
    }

    const toastId = toast.loading("Creating resource...");

    try {
      await createResource(toResourcePayload(createForm, canModerate));
      setCreateForm(defaultForm);
      setCreateImageFileName("");
      await loadResources();
      toast.success("Resource created.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not create this resource. Please check required fields and try again.");
      setCreateError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setCreateSaving(false);
    }
  };

  const handleEditSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editId) return;

    setEditSaving(true);
    setEditError(null);
    setEditImageUploadError(null);

    if (editImageUploading) {
      setEditError("Please wait for the image upload to finish.");
      setEditSaving(false);
      return;
    }

    const validationError = validateResourceForm(editForm);
    if (validationError) {
      setEditError(validationError);
      setEditSaving(false);
      return;
    }

    const toastId = toast.loading("Saving resource changes...");

    try {
      await updateResource(editId, toResourcePayload(editForm, canModerate));
      closeEditDialog();
      await loadResources();
      toast.success("Resource changes saved.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not save this resource. Please check required fields and try again.");
      setEditError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) return;

    const toastId = toast.loading("Deleting resource...");

    try {
      await deleteResource(resourceId);
      await loadResources();
      toast.success("Resource deleted.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = "Could not delete this resource.";
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
      const imageUrl = await uploadResourceImage(file, user.id);
      setCreateForm((prev) => ({ ...prev, imageUrl }));
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
      const imageUrl = await uploadResourceImage(file, user.id);
      setEditForm((prev) => ({ ...prev, imageUrl }));
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
      title="Manage Resources"
      description="Create and manage directory listings. Approved contributors can publish immediately, save drafts privately, or archive outdated entries."
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-8">
        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Create resource</CardTitle>
            <CardDescription>
              Keep listing details clear and current so residents can find help quickly.
              {!canModerate ? " Draft stays private and published goes live immediately." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              {createError ? <p className="text-sm text-red-600">{createError}</p> : null}
              <ResourceFormFields
                form={createForm}
                setForm={setCreateForm}
                statuses={statuses}
                canModerate={canModerate}
                idPrefix="resource-create"
                isUploadingImage={createImageUploading}
                imageUploadError={createImageUploadError}
                imageFileName={createImageFileName}
                onImageUpload={(file) => {
                  void handleCreateImageUpload(file);
                }}
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={createSaving || createImageUploading}>
                  <PlusCircle className="w-4 h-4" /> {createSaving ? "Creating..." : "Create Resource"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Your resource listings</CardTitle>
            <CardDescription>
              Published listings are live right away for approved contributors.
              Use filters and sorting to quickly review listings and feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <TableSkeleton rows={3} columns={4} /> : null}
            {!loading && listError ? <p className="text-sm text-red-600">{listError}</p> : null}

            {resources.length > 0 ? (
              <div className="rounded-xl border border-[#E7D9C3] bg-white p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="min-w-0 md:col-span-2">
                    <Label htmlFor="resource-search">Search</Label>
                    <Input
                      id="resource-search"
                      value={resourceSearch}
                      onChange={(event) => setResourceSearch(event.target.value)}
                      placeholder="Enter keywords"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="resource-status-filter">Status</Label>
                    <select
                      id="resource-status-filter"
                      value={resourceStatusFilter}
                      onChange={(event) => setResourceStatusFilter(event.target.value as StatusFilter)}
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
                    <Label htmlFor="resource-category-filter">Category</Label>
                    <select
                      id="resource-category-filter"
                      value={resourceCategoryFilter}
                      onChange={(event) => setResourceCategoryFilter(event.target.value)}
                      className={DROPDOWN_CONTROL_CLASS}
                    >
                      <option value="all">All categories</option>
                      {resourceCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="resource-sort">Sort by</Label>
                    <select
                      id="resource-sort"
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
              </div>
            ) : null}

            {!loading && filteredAndSortedResources.length === 0 ? (
              <p className="text-sm text-[#6F7553]">
                {resources.length === 0
                  ? "No resources yet. Create your first listing."
                  : "No resources match the current filters."}
              </p>
            ) : null}

            {paginatedResources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#6F7553]">{resource.category}</p>
                    <h3 className="font-semibold text-[#334233]">{resource.name}</h3>
                    <p className="text-sm text-[#5B473A] line-clamp-2">{resource.description}</p>
                    <p className="text-xs text-[#6F7553] mt-2">
                      Status: <span className="font-semibold">{resource.status}</span>
                      {resource.is_spotlight ? " | Spotlighted" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void openFeedbackDialog(resource);
                      }}
                    >
                      Feedback
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(resource)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void handleDelete(resource.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && filteredAndSortedResources.length > 0 ? (
              <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-4 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {resourceStart}-{resourceEnd} of {filteredAndSortedResources.length} resources
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
                        <span key={`resource-ellipsis-${index}`} className="px-2 text-xs text-[#6F7553]">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`resource-page-${item}`}
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
            <DialogTitle>Edit resource</DialogTitle>
            <DialogDescription>
              Update this listing and click save to confirm your edits.
            </DialogDescription>
          </DialogHeader>
          <form className="flex max-h-[calc(85vh-96px)] min-h-0 flex-col" onSubmit={handleEditSave}>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {editError ? <p className="text-sm text-red-600">{editError}</p> : null}
              <ResourceFormFields
                form={editForm}
                setForm={setEditForm}
                statuses={statuses}
                canModerate={canModerate}
                idPrefix="resource-edit"
                isUploadingImage={editImageUploading}
                imageUploadError={editImageUploadError}
                imageFileName={editImageFileName}
                onImageUpload={(file) => {
                  void handleEditImageUpload(file);
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

      <Dialog
        open={feedbackOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeFeedbackDialog();
            return;
          }
          setFeedbackOpen(true);
        }}
      >
        <DialogContent className="border-[#E7D9C3] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rating feedback</DialogTitle>
            <DialogDescription>
              {feedbackResourceName
                ? `Feedback for "${feedbackResourceName}".`
                : "Feedback for this resource."}
            </DialogDescription>
          </DialogHeader>
          <div ref={feedbackScrollRef} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {feedbackLoading ? (
              <FormSkeleton />
            ) : null}
            {!feedbackLoading && feedbackError ? (
              <p className="text-sm text-red-600">{feedbackError}</p>
            ) : null}
            {!feedbackLoading && !feedbackError && feedbackItems.length > 0 ? (
              <div className="rounded-xl border border-[#E7D9C3] bg-white p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="feedback-search">Search feedback</Label>
                    <Input
                      id="feedback-search"
                      value={feedbackSearch}
                      onChange={(event) => setFeedbackSearch(event.target.value)}
                      placeholder="Enter keywords"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback-rating-filter">Rating</Label>
                    <select
                      id="feedback-rating-filter"
                      value={feedbackRatingFilter}
                      onChange={(event) => setFeedbackRatingFilter(event.target.value as FeedbackRatingFilter)}
                      className={DROPDOWN_CONTROL_CLASS}
                    >
                      <option value="all">All ratings</option>
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="feedback-sort">Sort by</Label>
                    <select
                      id="feedback-sort"
                      value={feedbackSort}
                      onChange={(event) => setFeedbackSort(event.target.value as FeedbackSortOption)}
                      className={DROPDOWN_CONTROL_CLASS}
                    >
                      <option value="recent_desc">Newest first</option>
                      <option value="recent_asc">Oldest first</option>
                      <option value="rating_desc">Highest rating</option>
                      <option value="rating_asc">Lowest rating</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}
            {!feedbackLoading && !feedbackError && filteredAndSortedFeedback.length === 0 ? (
              <p className="text-sm text-[#6F7553]">
                {feedbackItems.length === 0
                  ? "No rating feedback yet."
                  : "No rating feedback matches the current filters."}
              </p>
            ) : null}
            {!feedbackLoading && !feedbackError
              ? paginatedFeedback.map((item, index) => (
                <div
                  key={`${item.updated_at}-${index}`}
                  className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-3"
                >
                  <div className="flex items-center gap-2">
                    {renderRatingStars(item.rating)}
                    <span className="text-xs font-medium text-[#5B473A]">{Math.round(item.rating)} stars</span>
                  </div>
                  <p className="text-sm text-[#5B473A] mt-1">{item.reason}</p>
                  <p className="text-xs text-[#6F7553] mt-2">
                    Updated {formatDateTime(item.updated_at)}
                  </p>
                </div>
              ))
              : null}
            {!feedbackLoading && !feedbackError && filteredAndSortedFeedback.length > 0 ? (
              <div className="flex flex-col gap-3 border-t border-[#E7D9C3] pt-3 text-sm text-[#5B473A] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {feedbackStart}-{feedbackEnd} of {filteredAndSortedFeedback.length} feedback entries
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToFeedbackPage(safeFeedbackPage - 1)}
                    disabled={safeFeedbackPage <= 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {getPaginationItems(safeFeedbackPage, feedbackTotalPages).map((item, index) =>
                      item === "ellipsis" ? (
                        <span key={`feedback-ellipsis-${index}`} className="px-2 text-xs text-[#6F7553]">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`feedback-page-${item}`}
                          size="sm"
                          variant={item === safeFeedbackPage ? "default" : "outline"}
                          onClick={() => goToFeedbackPage(item)}
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
                    onClick={() => goToFeedbackPage(safeFeedbackPage + 1)}
                    disabled={safeFeedbackPage >= feedbackTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="pt-2">
            <Button type="button" variant="outline" onClick={closeFeedbackDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
