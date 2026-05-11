import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthProvider";
import { TopoPattern } from "../components/TopoPattern";
import { ScrollReveal } from "../components/ScrollReveal";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  createPublicEventSubmission,
  createPublicResourceSubmission,
  isModerator,
} from "../data/portalApi";
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
  type ResourceCategory,
} from "../constants/resourceCategories";
import { EVENT_CATEGORY_SUGGESTIONS } from "../constants/eventCategorySuggestions";
import { AddressAutocompleteInput } from "../components/forms/AddressAutocompleteInput";
import { CategoryPicker } from "../components/forms/CategoryPicker";
import { ResourceHoursSelector } from "../components/forms/ResourceHoursSelector";
import { TagChipInput, joinTagsForValidation } from "../components/forms/TagChipInput";
import { validateProfanity } from "../../utils/profanityFilter";
import { validateEmail, validatePhone, validateRequired, validateUrl, validateMaxLength } from "../../utils/validation";

type SubmissionKind = "resource" | "event";

interface ResourceFormState {
  resourceName: string;
  organizationName: string;
  category: ResourceCategory | "";
  description: string;
  fullDescription: string;
  address: string;
  hours: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  tags: string[];
  imageUrl: string;
  submitterName: string;
  submitterEmail: string;
  submitterConnection: string;
}

interface EventFormState {
  title: string;
  category: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  imageUrl: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  submitterName: string;
  submitterEmail: string;
  submitterConnection: string;
}

const defaultResourceForm: ResourceFormState = {
  resourceName: "",
  organizationName: "",
  category: "",
  description: "",
  fullDescription: "",
  address: "",
  hours: "",
  website: "",
  contactEmail: "",
  contactPhone: "",
  tags: [],
  imageUrl: "",
  submitterName: "",
  submitterEmail: "",
  submitterConnection: "",
};

const defaultEventForm: EventFormState = {
  title: "",
  category: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: "",
  imageUrl: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: "",
  submitterName: "",
  submitterEmail: "",
  submitterConnection: "",
};

function normalizeHttpUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
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

export function Suggest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, role } = useAuth();
  const [kind, setKind] = useState<SubmissionKind>(searchParams.get("type") === "event" ? "event" : "resource");
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(defaultResourceForm);
  const [eventForm, setEventForm] = useState<EventFormState>(defaultEventForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasDirectPublishingAccess = isModerator(role) || profile?.status === "approved";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const nextKind = searchParams.get("type") === "event" ? "event" : "resource";
    setKind(nextKind);
  }, [searchParams]);

  const switchKind = (nextKind: SubmissionKind) => {
    setKind(nextKind);
    setError(null);
    setSuccessMessage(null);
    setSearchParams(nextKind === "event" ? { type: "event" } : { type: "resource" });
  };

  const handleResourceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const firstError =
      validateRequired(resourceForm.resourceName, "Resource name")
      || validateRequired(resourceForm.category, "Category")
      || validateRequired(resourceForm.description, "Description")
      || validateRequired(resourceForm.address, "Address")
      || validateRequired(resourceForm.submitterName, "Your name")
      || validateRequired(resourceForm.submitterEmail, "Your email")
      || validateProfanity(resourceForm.resourceName, "Resource name")
      || validateProfanity(resourceForm.organizationName, "Organization name")
      || validateProfanity(resourceForm.description, "Description")
      || validateProfanity(resourceForm.fullDescription, "Full description")
      || validateProfanity(resourceForm.address, "Address")
      || validateProfanity(resourceForm.hours, "Hours")
      || validateProfanity(joinTagsForValidation(resourceForm.tags), "Tags")
      || validateProfanity(resourceForm.submitterName, "Your name")
      || validateProfanity(resourceForm.submitterConnection, "Connection")
      || validateEmail(resourceForm.submitterEmail)
      || validateEmail(resourceForm.contactEmail)
      || validatePhone(resourceForm.contactPhone)
      || validateUrl(resourceForm.website)
      || validateUrl(resourceForm.imageUrl)
      || validateMaxLength(resourceForm.resourceName, "Resource name", 200)
      || validateMaxLength(resourceForm.organizationName, "Organization name", 200)
      || validateMaxLength(resourceForm.description, "Description", 500)
      || validateMaxLength(resourceForm.fullDescription, "Full description", 2000)
      || validateMaxLength(resourceForm.address, "Address", 500)
      || validateMaxLength(resourceForm.hours, "Hours", 200)
      || validateMaxLength(joinTagsForValidation(resourceForm.tags), "Tags", 300);

    if (firstError) {
      setError(firstError);
      setSubmitting(false);
      return;
    }

    if (!resourceForm.category || !isResourceCategory(resourceForm.category)) {
      setError("Category must be one of the approved resource categories.");
      setSubmitting(false);
      return;
    }

    const toastId = toast.loading("Submitting resource proposal...");

    try {
      await createPublicResourceSubmission({
        resource_name: resourceForm.resourceName.trim(),
        organization_name: resourceForm.organizationName.trim() || null,
        category: resourceForm.category,
        description: resourceForm.description.trim(),
        full_description: resourceForm.fullDescription.trim() || null,
        address: resourceForm.address.trim(),
        hours: resourceForm.hours.trim() || null,
        website: normalizeHttpUrl(resourceForm.website),
        contact_email: resourceForm.contactEmail.trim() || null,
        contact_phone: resourceForm.contactPhone.trim() || null,
        tags: resourceForm.tags,
        image_url: normalizeHttpUrl(resourceForm.imageUrl),
        submitter_name: resourceForm.submitterName.trim(),
        submitter_email: resourceForm.submitterEmail.trim(),
        submitter_connection: resourceForm.submitterConnection.trim() || null,
      });

      setResourceForm(defaultResourceForm);
      const nextMessage = "Resource proposal received. It is pending moderator review and is not live on the site yet.";
      setSuccessMessage(nextMessage);
      toast.success("Resource proposal submitted for review.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not submit this resource proposal right now.");
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const firstError =
      validateRequired(eventForm.title, "Event title")
      || validateRequired(eventForm.location, "Location")
      || validateRequired(eventForm.startsAt, "Start date and time")
      || validateRequired(eventForm.submitterName, "Your name")
      || validateRequired(eventForm.submitterEmail, "Your email")
      || validateProfanity(eventForm.title, "Event title")
      || validateProfanity(eventForm.category, "Category")
      || validateProfanity(eventForm.description, "Description")
      || validateProfanity(eventForm.location, "Location")
      || validateProfanity(eventForm.organizerName, "Organizer name")
      || validateProfanity(eventForm.submitterName, "Your name")
      || validateProfanity(eventForm.submitterConnection, "Connection")
      || validateEmail(eventForm.submitterEmail)
      || validateEmail(eventForm.organizerEmail)
      || validatePhone(eventForm.organizerPhone)
      || validateUrl(eventForm.imageUrl)
      || validateMaxLength(eventForm.title, "Event title", 200)
      || validateMaxLength(eventForm.category, "Category", 100)
      || validateMaxLength(eventForm.description, "Description", 1000)
      || validateMaxLength(eventForm.location, "Location", 500);

    if (firstError) {
      setError(firstError);
      setSubmitting(false);
      return;
    }

    const startsAtIso = toIso(eventForm.startsAt);
    if (!startsAtIso) {
      setError("Start date and time is required.");
      setSubmitting(false);
      return;
    }

    const endsAtCandidate = toIso(eventForm.endsAt);
    const endsAtIso = endsAtCandidate && new Date(endsAtCandidate).getTime() > new Date(startsAtIso).getTime()
      ? endsAtCandidate
      : plusOneHour(startsAtIso);

    const toastId = toast.loading("Submitting event proposal...");

    try {
      await createPublicEventSubmission({
        title: eventForm.title.trim(),
        category: eventForm.category.trim() || null,
        description: eventForm.description.trim() || null,
        location: eventForm.location.trim(),
        starts_at: startsAtIso,
        ends_at: endsAtIso,
        image_url: normalizeHttpUrl(eventForm.imageUrl),
        organizer_name: eventForm.organizerName.trim() || null,
        organizer_email: eventForm.organizerEmail.trim() || null,
        organizer_phone: eventForm.organizerPhone.trim() || null,
        submitter_name: eventForm.submitterName.trim(),
        submitter_email: eventForm.submitterEmail.trim(),
        submitter_connection: eventForm.submitterConnection.trim() || null,
      });

      setEventForm(defaultEventForm);
      const nextMessage = "Event proposal received. It is pending moderator review and is not live on the site yet.";
      setSuccessMessage(nextMessage);
      toast.success("Event proposal submitted for review.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not submit this event proposal right now.");
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] pb-28 pt-20 text-[#F6F1E7]">
        <div className="absolute inset-0 pointer-events-none opacity-70"><TopoPattern opacity={0.12} /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/75 via-[#334233]/45 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <ScrollReveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B36A4C]/40 bg-[#B36A4C]/20 px-3 py-1.5 text-sm font-medium text-[#E7D9C3]">
                <Sparkles className="h-4 w-4 text-[#B36A4C]" />
                Community Resource Hub Submissions
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="mb-6 font-['Cormorant_Garamond',serif] text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
                Submit to the <span className="text-[#B36A4C] italic">Community Hub</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="max-w-3xl text-lg font-light leading-relaxed text-[#A7AE8A]">
                Anyone can propose a community resource or event. Public submissions stay pending until a moderator reviews them, while approved contributors can publish official listings directly from the portal.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <Button asChild><Link to="/contributor-login">Contributor Portal</Link></Button>
                  <Button asChild variant="outline" className="border-[#E7D9C3] bg-transparent text-[#F6F1E7] hover:bg-[#F6F1E7] hover:text-[#334233]">
                    <Link to="/directory">Browse Resources</Link>
                  </Button>
                </div>
                <h1 className="mt-6 text-base sm:text-lg text-[#FFFFFF]">
                  TSA judges: contributor login information is on the Login page.
                </h1>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {hasDirectPublishingAccess ? (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
            <p className="font-semibold">You already have direct publishing access.</p>
            <p className="mt-1 text-sm">Approved contributors and moderators can create official resources/events in the portal without waiting for public-submission approval.</p>
            <p className="mt-1 text-sm">Approved contributors can also review rating feedback for their own resources in the portal.</p>
            <Button asChild className="mt-4"><Link to="/portal">Open Portal</Link></Button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-[#E7D9C3] lg:col-span-2">
            <CardHeader>
              <CardTitle>Public proposal form</CardTitle>
              <CardDescription>Choose whether you are proposing a resource or an event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="inline-flex rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-1" role="tablist" aria-label="Submission type">
                <button type="button" onClick={() => switchKind("resource")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${kind === "resource" ? "bg-[#334233] text-white" : "text-[#334233]"}`} role="tab" aria-selected={kind === "resource"} aria-controls="resource-panel">
                  Resource
                </button>
                <button type="button" onClick={() => switchKind("event")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${kind === "event" ? "bg-[#334233] text-white" : "text-[#334233]"}`} role="tab" aria-selected={kind === "event"} aria-controls="event-panel">
                  Event
                </button>
              </div>

              {error ? <div role="alert" aria-live="polite" className="text-sm text-red-600">{error}</div> : null}
              {successMessage ? <div role="status" aria-live="polite" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{successMessage}</div> : null}

              {kind === "resource" ? (
                <form className="space-y-4" onSubmit={handleResourceSubmit} role="tabpanel" id="resource-panel" aria-labelledby="resource-tab">
                  <fieldset>
                    <legend className="sr-only">Resource Information</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><Label htmlFor="resource-name">Resource name</Label><Input id="resource-name" value={resourceForm.resourceName} onChange={(event) => setResourceForm((prev) => ({ ...prev, resourceName: event.target.value }))} required aria-describedby="resource-name-help" /><span id="resource-name-help" className="sr-only">Enter the name of the resource you want to submit</span></div>
                      <div><Label htmlFor="resource-organization">Organization name</Label><Input id="resource-organization" value={resourceForm.organizationName} onChange={(event) => setResourceForm((prev) => ({ ...prev, organizationName: event.target.value }))} aria-describedby="resource-organization-help" /><span id="resource-organization-help" className="sr-only">Optional: Enter the organization name</span></div>
                    </div>
                    <div>
                      <Label htmlFor="resource-category">Category</Label>
                      <CategoryPicker
                        id="resource-category"
                        value={resourceForm.category}
                        onChange={(next) =>
                          setResourceForm((prev) => ({ ...prev, category: next as ResourceCategory | "" }))
                        }
                        options={RESOURCE_CATEGORIES}
                        allowCustom={false}
                        placeholder="Choose a category"
                        label="Resource category"
                        aria-describedby="resource-category-help"
                      />
                      <span id="resource-category-help" className="sr-only">Select the appropriate category for this resource</span>
                    </div>
                    <div><Label htmlFor="resource-description">Short description</Label><Textarea id="resource-description" value={resourceForm.description} onChange={(event) => setResourceForm((prev) => ({ ...prev, description: event.target.value }))} required aria-describedby="resource-description-help" /><span id="resource-description-help" className="sr-only">Provide a brief description of the resource (required)</span></div>
                    <div><Label htmlFor="resource-full-description">Full description</Label><Textarea id="resource-full-description" value={resourceForm.fullDescription} onChange={(event) => setResourceForm((prev) => ({ ...prev, fullDescription: event.target.value }))} aria-describedby="resource-full-description-help" /><span id="resource-full-description-help" className="sr-only">Optional: Provide detailed information about the resource</span></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="resource-address">Address</Label>
                        <AddressAutocompleteInput
                          id="resource-address"
                          value={resourceForm.address}
                          onChange={(next) => setResourceForm((prev) => ({ ...prev, address: next }))}
                          required
                          aria-describedby="resource-address-help"
                        />
                        <span id="resource-address-help" className="sr-only">Enter the physical address where this resource is located</span>
                      </div>
                      <div>
                        <Label htmlFor="resource-hours">Hours</Label>
                        <ResourceHoursSelector
                          id="resource-hours"
                          value={resourceForm.hours}
                          onChange={(next) => setResourceForm((prev) => ({ ...prev, hours: next }))}
                          aria-describedby="resource-hours-help"
                        />
                        <span id="resource-hours-help" className="sr-only">Optional: Enter operating hours</span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div><Label htmlFor="resource-website">Website</Label><Input id="resource-website" value={resourceForm.website} onChange={(event) => setResourceForm((prev) => ({ ...prev, website: event.target.value }))} aria-describedby="resource-website-help" /><span id="resource-website-help" className="sr-only">Optional: Enter website URL</span></div>
                      <div><Label htmlFor="resource-contact-email">Contact email</Label><Input id="resource-contact-email" type="email" value={resourceForm.contactEmail} onChange={(event) => setResourceForm((prev) => ({ ...prev, contactEmail: event.target.value }))} aria-describedby="resource-contact-email-help" /><span id="resource-contact-email-help" className="sr-only">Optional: Enter contact email address</span></div>
                      <div><Label htmlFor="resource-contact-phone">Contact phone</Label><Input id="resource-contact-phone" value={resourceForm.contactPhone} onChange={(event) => setResourceForm((prev) => ({ ...prev, contactPhone: event.target.value }))} aria-describedby="resource-contact-phone-help" /><span id="resource-contact-phone-help" className="sr-only">Optional: Enter contact phone number</span></div>
                      <div><Label htmlFor="resource-image-url">Image URL</Label><Input id="resource-image-url" value={resourceForm.imageUrl} onChange={(event) => setResourceForm((prev) => ({ ...prev, imageUrl: event.target.value }))} aria-describedby="resource-image-url-help" /><span id="resource-image-url-help" className="sr-only">Optional: Enter image URL</span></div>
                    </div>
                    <div>
                      <Label htmlFor="resource-tags">Tags</Label>
                      <TagChipInput
                        id="resource-tags"
                        values={resourceForm.tags}
                        onChange={(next) => setResourceForm((prev) => ({ ...prev, tags: next }))}
                        maxChars={300}
                        placeholder="Type a tag, then press Enter"
                        aria-describedby="resource-tags-help"
                      />
                      <span id="resource-tags-help" className="sr-only">Optional: Add relevant tags separated by commas</span>
                    </div>
                    <fieldset>
                      <legend className="text-sm font-medium mb-2">Your Information</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="resource-submitter-name">Your name</Label><Input id="resource-submitter-name" value={resourceForm.submitterName} onChange={(event) => setResourceForm((prev) => ({ ...prev, submitterName: event.target.value }))} required aria-describedby="resource-submitter-name-help" /><span id="resource-submitter-name-help" className="sr-only">Enter your full name (required)</span></div>
                        <div><Label htmlFor="resource-submitter-email">Your email</Label><Input id="resource-submitter-email" type="email" value={resourceForm.submitterEmail} onChange={(event) => setResourceForm((prev) => ({ ...prev, submitterEmail: event.target.value }))} required aria-describedby="resource-submitter-email-help" /><span id="resource-submitter-email-help" className="sr-only">Enter your email address (required)</span></div>
                      </div>
                      <div><Label htmlFor="resource-connection">Your connection to this resource</Label><Textarea id="resource-connection" value={resourceForm.submitterConnection} onChange={(event) => setResourceForm((prev) => ({ ...prev, submitterConnection: event.target.value }))} aria-describedby="resource-connection-help" /><span id="resource-connection-help" className="sr-only">Optional: Describe your relationship to this resource</span></div>
                    </fieldset>
                    <Button type="submit" disabled={submitting} aria-describedby="submit-status">{submitting ? "Submitting..." : "Submit Resource Proposal"}</Button>
                    <span id="submit-status" className="sr-only">{submitting ? "Form is being submitted, please wait" : "Ready to submit"}</span>
                  </fieldset>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleEventSubmit} role="tabpanel" id="event-panel" aria-labelledby="event-tab">
                  <fieldset>
                    <legend className="sr-only">Event Information</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><Label htmlFor="event-title">Event title</Label><Input id="event-title" value={eventForm.title} onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))} required aria-describedby="event-title-help" /><span id="event-title-help" className="sr-only">Enter the title of the event (required)</span></div>
                      <div>
                        <Label htmlFor="event-category">Category</Label>
                        <CategoryPicker
                          id="event-category"
                          value={eventForm.category}
                          onChange={(next) => setEventForm((prev) => ({ ...prev, category: next }))}
                          options={EVENT_CATEGORY_SUGGESTIONS}
                          allowCustom
                          placeholder="Choose or enter a category"
                          label="Event category"
                          aria-describedby="event-category-help"
                        />
                        <span id="event-category-help" className="sr-only">Select or enter event category</span>
                      </div>
                    </div>
                    <div><Label htmlFor="event-description">Description</Label><Textarea id="event-description" value={eventForm.description} onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))} aria-describedby="event-description-help" /><span id="event-description-help" className="sr-only">Optional: Provide detailed event description</span></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="event-location">Location</Label>
                        <AddressAutocompleteInput
                          id="event-location"
                          value={eventForm.location}
                          onChange={(next) => setEventForm((prev) => ({ ...prev, location: next }))}
                          required
                          aria-describedby="event-location-help"
                        />
                        <span id="event-location-help" className="sr-only">Enter the event location (required)</span>
                      </div>
                      <div><Label htmlFor="event-image-url">Image URL</Label><Input id="event-image-url" value={eventForm.imageUrl} onChange={(event) => setEventForm((prev) => ({ ...prev, imageUrl: event.target.value }))} aria-describedby="event-image-url-help" /><span id="event-image-url-help" className="sr-only">Optional: Enter event image URL</span></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><Label htmlFor="event-starts-at">Starts at</Label><Input id="event-starts-at" type="datetime-local" value={eventForm.startsAt} onChange={(event) => setEventForm((prev) => ({ ...prev, startsAt: event.target.value }))} required aria-describedby="event-starts-at-help" /><span id="event-starts-at-help" className="sr-only">Enter event start date and time (required)</span></div>
                      <div><Label htmlFor="event-ends-at">Ends at</Label><Input id="event-ends-at" type="datetime-local" value={eventForm.endsAt} onChange={(event) => setEventForm((prev) => ({ ...prev, endsAt: event.target.value }))} aria-describedby="event-ends-at-help" /><span id="event-ends-at-help" className="sr-only">Optional: Enter event end date and time</span></div>
                    </div>
                    <fieldset>
                      <legend className="text-sm font-medium mb-2">Organizer Information</legend>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div><Label htmlFor="event-organizer-name">Organizer name</Label><Input id="event-organizer-name" value={eventForm.organizerName} onChange={(event) => setEventForm((prev) => ({ ...prev, organizerName: event.target.value }))} aria-describedby="event-organizer-name-help" /><span id="event-organizer-name-help" className="sr-only">Optional: Enter organizer name</span></div>
                        <div><Label htmlFor="event-organizer-email">Organizer email</Label><Input id="event-organizer-email" value={eventForm.organizerEmail} onChange={(event) => setEventForm((prev) => ({ ...prev, organizerEmail: event.target.value }))} aria-describedby="event-organizer-email-help" /><span id="event-organizer-email-help" className="sr-only">Optional: Enter organizer email</span></div>
                        <div><Label htmlFor="event-organizer-phone">Organizer phone</Label><Input id="event-organizer-phone" value={eventForm.organizerPhone} onChange={(event) => setEventForm((prev) => ({ ...prev, organizerPhone: event.target.value }))} aria-describedby="event-organizer-phone-help" /><span id="event-organizer-phone-help" className="sr-only">Optional: Enter organizer phone</span></div>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="text-sm font-medium mb-2">Your Information</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="event-submitter-name">Your name</Label><Input id="event-submitter-name" value={eventForm.submitterName} onChange={(event) => setEventForm((prev) => ({ ...prev, submitterName: event.target.value }))} required aria-describedby="event-submitter-name-help" /><span id="event-submitter-name-help" className="sr-only">Enter your full name (required)</span></div>
                        <div><Label htmlFor="event-submitter-email">Your email</Label><Input id="event-submitter-email" type="email" value={eventForm.submitterEmail} onChange={(event) => setEventForm((prev) => ({ ...prev, submitterEmail: event.target.value }))} required aria-describedby="event-submitter-email-help" /><span id="event-submitter-email-help" className="sr-only">Enter your email address (required)</span></div>
                      </div>
                      <div><Label htmlFor="event-connection">Your connection to this event</Label><Textarea id="event-connection" value={eventForm.submitterConnection} onChange={(event) => setEventForm((prev) => ({ ...prev, submitterConnection: event.target.value }))} aria-describedby="event-connection-help" /><span id="event-connection-help" className="sr-only">Optional: Describe your relationship to this event</span></div>
                    </fieldset>
                    <Button type="submit" disabled={submitting} aria-describedby="event-submit-status">{submitting ? "Submitting..." : "Submit Event Proposal"}</Button>
                    <span id="event-submit-status" className="sr-only">{submitting ? "Form is being submitted, please wait" : "Ready to submit"}</span>
                  </fieldset>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-[#E7D9C3]">
              <CardHeader>
                <CardTitle>How this workflow works</CardTitle>
                <CardDescription>Two trust levels keep the hub open and accurate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#5B473A]">
                <div className="flex gap-3">
                  <ClipboardList className="mt-0.5 h-5 w-5 text-[#B36A4C]" />
                  <p><span className="font-semibold text-[#334233]">Public proposals:</span> Anyone can submit a resource or event, but it stays pending until a moderator reviews it.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#B36A4C]" />
                  <p><span className="font-semibold text-[#334233]">Approved contributors:</span> Verified organizations can manage official resources and events directly in the portal.</p>
                </div>
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-[#B36A4C]" />
                  <p><span className="font-semibold text-[#334233]">Official content:</span> Only approved contributor content and moderator-approved public proposals appear on public pages.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E7D9C3]">
              <CardHeader>
                <CardTitle>Need direct publishing access?</CardTitle>
                <CardDescription>Contributor accounts are for verified organizations and repeat contributors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#5B473A]">
                <p>Contributors can save drafts, publish official listings immediately, and manage their resources/events over time.</p>
                <p>Approved contributors can also view rating feedback for resources they own.</p>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/contributor-login">
                    Apply for Contributor Access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-between text-[#334233]">
                  <Link to="/events">
                    Browse Public Events
                    <CalendarDays className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
