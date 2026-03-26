import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
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
  createResource,
  deleteResource,
  isModerator,
  listResourceRatingFeedback,
  listPortalResources,
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

interface ResourceFormFieldsProps {
  form: ResourceFormState;
  setForm: Dispatch<SetStateAction<ResourceFormState>>;
  statuses: ContentStatus[];
  canModerate: boolean;
  idPrefix: string;
}

function ResourceFormFields({
  form,
  setForm,
  statuses,
  canModerate,
  idPrefix,
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
        <div>
          <Label htmlFor={imageId}>Image URL</Label>
          <Input
            id={imageId}
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
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
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ResourceFormState>(defaultForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<ResourceRatingFeedback[]>([]);
  const [feedbackResourceName, setFeedbackResourceName] = useState("");

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

  const sortedResources = useMemo(
    () =>
      [...resources].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [resources],
  );

  const closeEditDialog = () => {
    setEditOpen(false);
    setEditId(null);
    setEditForm(defaultForm);
    setEditError(null);
  };

  const startEdit = (resource: ResourceRecord) => {
    setEditId(resource.id);
    setEditForm(mapResourceToForm(resource, canModerate));
    setEditError(null);
    setEditOpen(true);
  };

  const closeFeedbackDialog = () => {
    setFeedbackOpen(false);
    setFeedbackLoading(false);
    setFeedbackError(null);
    setFeedbackItems([]);
    setFeedbackResourceName("");
  };

  const openFeedbackDialog = async (resource: ResourceRecord) => {
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    setFeedbackError(null);
    setFeedbackItems([]);
    setFeedbackResourceName(resource.name);

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

    const validationError = validateResourceForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      setCreateSaving(false);
      return;
    }

    try {
      await createResource(toResourcePayload(createForm, canModerate));
      setCreateForm(defaultForm);
      await loadResources();
    } catch (nextError) {
      console.error(nextError);
      setCreateError("Could not create this resource. Please check required fields and try again.");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleEditSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editId) return;

    setEditSaving(true);
    setEditError(null);

    const validationError = validateResourceForm(editForm);
    if (validationError) {
      setEditError(validationError);
      setEditSaving(false);
      return;
    }

    try {
      await updateResource(editId, toResourcePayload(editForm, canModerate));
      closeEditDialog();
      await loadResources();
    } catch (nextError) {
      console.error(nextError);
      setEditError("Could not save this resource. Please check required fields and try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) return;

    try {
      await deleteResource(resourceId);
      await loadResources();
    } catch (nextError) {
      console.error(nextError);
      setListError("Could not delete this resource.");
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
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={createSaving}>
                  <PlusCircle className="w-4 h-4" /> {createSaving ? "Creating..." : "Create Resource"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>Your resource listings</CardTitle>
            <CardDescription>Published listings are live right away for approved contributors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-[#6F7553]">Loading resources...</p> : null}
            {!loading && listError ? <p className="text-sm text-red-600">{listError}</p> : null}
            {!loading && sortedResources.length === 0 ? (
              <p className="text-sm text-[#6F7553]">No resources yet. Create your first listing.</p>
            ) : null}

            {sortedResources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#6F7553]">{resource.category}</p>
                    <h3 className="font-semibold text-[#334233]">{resource.name}</h3>
                    <p className="text-sm text-[#5B473A] line-clamp-2">{resource.description}</p>
                    <p className="text-xs text-[#6F7553] mt-2">
                      Status: <span className="font-semibold">{resource.status}</span>
                      {resource.is_spotlight ? " • Spotlighted" : ""}
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
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {feedbackLoading ? (
              <p className="text-sm text-[#6F7553]">Loading feedback...</p>
            ) : null}
            {!feedbackLoading && feedbackError ? (
              <p className="text-sm text-red-600">{feedbackError}</p>
            ) : null}
            {!feedbackLoading && !feedbackError && feedbackItems.length === 0 ? (
              <p className="text-sm text-[#6F7553]">No rating feedback yet.</p>
            ) : null}
            {!feedbackLoading && !feedbackError
              ? feedbackItems.map((item, index) => (
                <div
                  key={`${item.updated_at}-${index}`}
                  className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-3"
                >
                  <p className="text-sm font-semibold text-[#334233]">{item.rating}/5</p>
                  <p className="text-sm text-[#5B473A] mt-1">{item.reason}</p>
                  <p className="text-xs text-[#6F7553] mt-2">
                    Updated {formatDateTime(item.updated_at)}
                  </p>
                </div>
              ))
              : null}
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
