import { useEffect, useMemo, useState } from "react";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { PortalShell } from "../components/portal/PortalShell";
import { useAuth } from "../auth/AuthProvider";
import {
  createResource,
  deleteResource,
  isModerator,
  listPortalResources,
  updateResource,
} from "../data/portalApi";
import type { ContentStatus, ResourceRecord } from "../types/portal";
import { validateProfanity } from "../../utils/profanityFilter";

interface ResourceFormState {
  name: string;
  category: string;
  description: string;
  fullDescription: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  tags: string;
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
  tags: "",
  imageUrl: "",
  status: "pending",
  isSpotlight: false,
  spotlightSubtitle: "",
};

const contributorStatuses: ContentStatus[] = ["draft", "pending", "archived"];
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

function normalizeEmail(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return null;
  }

  return trimmed.toLowerCase();
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

export function PortalResources() {
  const { user, role } = useAuth();
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [form, setForm] = useState<ResourceFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canModerate = isModerator(role);
  const statuses = canModerate ? moderatorStatuses : contributorStatuses;

  const loadResources = async () => {
    if (!user || !role) return;
    setLoading(true);
    setError(null);

    try {
      const data = await listPortalResources(role, user.id);
      setResources(data);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load resources right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResources();
  }, [role, user]);

  const sortedResources = useMemo(
    () =>
      [...resources]
        .filter(resource => canModerate ? resource.status !== "archived" : true)
        .sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    [resources, canModerate],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const startEdit = (resource: ResourceRecord) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      category: resource.category,
      description: resource.description,
      fullDescription: resource.full_description ?? "",
      address: resource.address,
      phone: resource.phone ?? "",
      email: resource.email ?? "",
      website: resource.website ?? "",
      hours: resource.hours ?? "",
      tags: resource.tags.join(", "),
      imageUrl: resource.image_url ?? "",
      status: resource.status,
      isSpotlight: resource.is_spotlight,
      spotlightSubtitle: resource.spotlight_subtitle ?? "",
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    // Validate profanity in text fields
    const nameError = validateProfanity(form.name, "Resource name");
    const categoryError = validateProfanity(form.category, "Category");
    const descriptionError = validateProfanity(form.description, "Description");
    const fullDescriptionError = validateProfanity(form.fullDescription, "Full description");
    const addressError = validateProfanity(form.address, "Address");
    const hoursError = validateProfanity(form.hours, "Hours");
    const tagsError = validateProfanity(form.tags, "Tags");
    const spotlightError = validateProfanity(form.spotlightSubtitle, "Spotlight subtitle");

    if (nameError || categoryError || descriptionError || fullDescriptionError || 
        addressError || hoursError || tagsError || spotlightError) {
      setError(nameError || categoryError || descriptionError || fullDescriptionError || 
               addressError || hoursError || tagsError || spotlightError);
      setSaving(false);
      return;
    }

    const normalizedWebsite = normalizeHttpUrl(form.website);
    if (form.website.trim() && !normalizedWebsite) {
      setSaving(false);
      setError("Website must be a valid URL (for example: https://example.org).");
      return;
    }
    if (normalizedWebsite && hasPlaceholderHost(normalizedWebsite)) {
      setSaving(false);
      setError("Website cannot use placeholder domains like example.com or localhost.");
      return;
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

    const normalizedEmail = normalizeEmail(form.email);
    if (form.email.trim() && !normalizedEmail) {
      setSaving(false);
      setError("Email must be valid (for example: hello@organization.org).");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      full_description: form.fullDescription.trim() || null,
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      email: normalizedEmail,
      website: normalizedWebsite,
      hours: form.hours.trim() || null,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      image_url: normalizedImageUrl,
      status: canModerate ? form.status : ("pending" as const),
      is_spotlight: canModerate ? form.isSpotlight : false,
      spotlight_subtitle: canModerate ? form.spotlightSubtitle.trim() || null : null,
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
      } else {
        await createResource(payload);
      }
      resetForm();
      await loadResources();
    } catch (nextError) {
      console.error(nextError);
      setError("Could not save this resource. Please check required fields and try again.");
    } finally {
      setSaving(false);
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
      setError("Could not delete this resource.");
    }
  };

  return (
    <PortalShell
      title="Manage Resources"
      description="Create and manage directory listings. Contributor updates are reviewed before they go public."
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-8">
        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle>{editingId ? "Edit resource" : "Create resource"}</CardTitle>
            <CardDescription>
              Keep listing details clear and current so residents can find help quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource-name">Name</Label>
                  <Input
                    id="resource-name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="resource-category">Category</Label>
                  <Input
                    id="resource-category"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resource-description">Short description</Label>
                <Textarea
                  id="resource-description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="resource-full-description">Full description (optional)</Label>
                <Textarea
                  id="resource-full-description"
                  value={form.fullDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullDescription: event.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource-address">Address</Label>
                  <Input
                    id="resource-address"
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="resource-hours">Hours</Label>
                  <Input
                    id="resource-hours"
                    value={form.hours}
                    onChange={(event) => setForm((prev) => ({ ...prev, hours: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="resource-phone">Phone</Label>
                  <Input
                    id="resource-phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="resource-email">Email</Label>
                  <Input
                    id="resource-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="resource-website">Website</Label>
                  <Input
                    id="resource-website"
                    value={form.website}
                    onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="resource-image">Image URL</Label>
                  <Input
                    id="resource-image"
                    value={form.imageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resource-tags">Tags (comma-separated)</Label>
                <Input
                  id="resource-tags"
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource-status">Status</Label>
                  <select
                    id="resource-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as ContentStatus }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    disabled={!canModerate}
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
                      id="resource-spotlight"
                      type="checkbox"
                      checked={form.isSpotlight}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, isSpotlight: event.target.checked }))
                      }
                    />
                    <Label htmlFor="resource-spotlight" className="font-normal mb-0">
                      Include in spotlight
                    </Label>
                  </div>
                ) : null}
              </div>

              {canModerate && form.isSpotlight ? (
                <div>
                  <Label htmlFor="resource-spotlight-subtitle">Spotlight subtitle</Label>
                  <Input
                    id="resource-spotlight-subtitle"
                    value={form.spotlightSubtitle}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, spotlightSubtitle: event.target.value }))
                    }
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  <PlusCircle className="w-4 h-4" /> {saving ? "Saving..." : editingId ? "Update Resource" : "Create Resource"}
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
            <CardTitle>Your resource submissions</CardTitle>
            <CardDescription>Status and visibility are controlled by workflow + role permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-[#6F7553]">Loading resources...</p> : null}
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
    </PortalShell>
  );
}
