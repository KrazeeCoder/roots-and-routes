import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ClipboardList, FileText, Sparkles, Upload, X } from "lucide-react";
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
  uploadSuggestionImage,
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
import { getEventDateBounds, validateEmail, validateEventDateRange, validateMaxLength, validatePhone, validateRequired, validateUrl } from "../../utils/validation";
import { launchSuccessConfetti } from "../../utils/confetti";

type SubmissionKind = "resource" | "event";
type StepId = 1 | 2 | 3;
type FieldErrors = Record<string, string>;

const STEP_LABELS: Record<StepId, string> = {
  1: "Basics",
  2: "Details",
  3: "Submitter",
};

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
  const [resourceStep, setResourceStep] = useState<StepId>(1);
  const [eventStep, setEventStep] = useState<StepId>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resourceFieldErrors, setResourceFieldErrors] = useState<FieldErrors>({});
  const [eventFieldErrors, setEventFieldErrors] = useState<FieldErrors>({});
  const [resourceImageUploading, setResourceImageUploading] = useState(false);
  const [resourceImageUploadError, setResourceImageUploadError] = useState<string | null>(null);
  const [resourceImageFileName, setResourceImageFileName] = useState("");
  const [resourceUploadedImageUrl, setResourceUploadedImageUrl] = useState("");
  const [eventImageUploading, setEventImageUploading] = useState(false);
  const [eventImageUploadError, setEventImageUploadError] = useState<string | null>(null);
  const [eventImageFileName, setEventImageFileName] = useState("");
  const [eventUploadedImageUrl, setEventUploadedImageUrl] = useState("");

  const hasDirectPublishingAccess = isModerator(role) || profile?.status === "approved";
  const currentStep = kind === "resource" ? resourceStep : eventStep;
  const isCurrentKindImageUploading = kind === "resource" ? resourceImageUploading : eventImageUploading;
  const eventDateBounds = getEventDateBounds();
  const hasInlineErrors = kind === "resource"
    ? Object.keys(resourceFieldErrors).length > 0 || Boolean(resourceImageUploadError)
    : Object.keys(eventFieldErrors).length > 0 || Boolean(eventImageUploadError);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const nextKind = searchParams.get("type") === "event" ? "event" : "resource";
    setKind(nextKind);
  }, [searchParams]);

  const setCurrentKindStep = (step: StepId) => {
    if (kind === "resource") {
      setResourceStep(step);
      return;
    }
    setEventStep(step);
  };

  const getFieldErrorId = (fieldId: string) => `${fieldId}-error`;
  const focusFieldById = (fieldId: string) => {
    window.requestAnimationFrame(() => {
      const node = document.getElementById(fieldId);
      node?.focus();
    });
  };
  const getResourceStepForField = (fieldId: string): StepId => {
    if (["resource-name", "resource-category", "resource-description"].includes(fieldId)) return 1;
    if (
      [
        "resource-organization",
        "resource-image-url",
        "resource-full-description",
        "resource-address",
        "resource-hours",
        "resource-website",
        "resource-contact-email",
        "resource-contact-phone",
        "resource-tags",
      ].includes(fieldId)
    ) {
      return 2;
    }
    return 3;
  };
  const getEventStepForField = (fieldId: string): StepId => {
    if (["event-title", "event-category", "event-location", "event-starts-at"].includes(fieldId)) return 1;
    if (
      [
        "event-description",
        "event-ends-at",
        "event-image-url",
        "event-organizer-name",
        "event-organizer-email",
        "event-organizer-phone",
      ].includes(fieldId)
    ) {
      return 2;
    }
    return 3;
  };

  const clearKindFieldErrors = (nextKind: SubmissionKind) => {
    if (nextKind === "resource") {
      setResourceFieldErrors({});
      return;
    }
    setEventFieldErrors({});
  };

  const switchKind = (nextKind: SubmissionKind) => {
    setKind(nextKind);
    if (nextKind === "resource") {
      setResourceStep(1);
    } else {
      setEventStep(1);
    }
    setError(null);
    setSuccessMessage(null);
    setResourceImageUploadError(null);
    setEventImageUploadError(null);
    setResourceImageFileName("");
    setEventImageFileName("");
    setResourceUploadedImageUrl("");
    setEventUploadedImageUrl("");
    clearKindFieldErrors(nextKind);
    setSearchParams(nextKind === "event" ? { type: "event" } : { type: "resource" });
  };

  const validateResourceStep = (step: StepId, form: ResourceFormState = resourceForm) => {
    const errors: FieldErrors = {};
    let firstInvalidFieldId: string | null = null;

    const markError = (fieldId: string, message: string | null) => {
      if (!message) return;
      errors[fieldId] = message;
      if (!firstInvalidFieldId) firstInvalidFieldId = fieldId;
    };

    if (step === 1) {
      markError("resource-name", validateRequired(form.resourceName, "Resource name"));
      markError("resource-category", validateRequired(form.category, "Category"));
      markError("resource-description", validateRequired(form.description, "Description"));
    }

    if (step === 2) {
      markError("resource-address", validateRequired(form.address, "Address"));
    }

    setResourceFieldErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      firstInvalidFieldId,
      firstError: Object.values(errors)[0] ?? null,
    };
  };

  const validateEventStep = (step: StepId, form: EventFormState = eventForm) => {
    const errors: FieldErrors = {};
    let firstInvalidFieldId: string | null = null;

    const markError = (fieldId: string, message: string | null) => {
      if (!message) return;
      errors[fieldId] = message;
      if (!firstInvalidFieldId) firstInvalidFieldId = fieldId;
    };

    if (step === 1) {
      markError("event-title", validateRequired(form.title, "Event title"));
      markError("event-location", validateRequired(form.location, "Location"));
      markError("event-starts-at", validateEventDateRange(form.startsAt, ""));
    }

    if (step === 2) {
      markError("event-ends-at", validateEventDateRange(form.startsAt, form.endsAt));
    }

    setEventFieldErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      firstInvalidFieldId,
      firstError: Object.values(errors)[0] ?? null,
    };
  };

  const goToNextStep = () => {
    if (isCurrentKindImageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    const validation = kind === "resource"
      ? (() => {
          const form = getResourceStepSnapshot(currentStep);
          setResourceForm(form);
          return validateResourceStep(currentStep, form);
        })()
      : (() => {
          const form = getEventStepSnapshot(currentStep);
          setEventForm(form);
          return validateEventStep(currentStep, form);
        })();
    if (!validation.isValid) {
      setError(validation.firstError);
      if (validation.firstInvalidFieldId) focusFieldById(validation.firstInvalidFieldId);
      return;
    }

    if (currentStep < 3) {
      setError(null);
      clearKindFieldErrors(kind);
      setCurrentKindStep((currentStep + 1) as StepId);
    }
  };

  const goToPreviousStep = () => {
    if (isCurrentKindImageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    if (currentStep > 1) {
      setError(null);
      setCurrentKindStep((currentStep - 1) as StepId);
    }
  };

  const goToStep = (step: StepId) => {
    if (step >= currentStep) return;
    if (isCurrentKindImageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    setError(null);
    clearKindFieldErrors(kind);
    setCurrentKindStep(step);
  };

  const handleResourceImageUpload = async (file: File) => {
    setResourceImageUploading(true);
    setResourceImageUploadError(null);
    setResourceImageFileName(file.name);
    setError(null);
    const toastId = toast.loading("Uploading image...");

    try {
      const imageUrl = await uploadSuggestionImage(file, "resource");
      setResourceUploadedImageUrl(imageUrl);
      setResourceForm((prev) => ({ ...prev, imageUrl: "" }));
      toast.success("Image uploaded.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not upload this image right now.");
      setResourceImageUploadError(nextMessage);
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setResourceImageUploading(false);
    }
  };

  const handleEventImageUpload = async (file: File) => {
    setEventImageUploading(true);
    setEventImageUploadError(null);
    setEventImageFileName(file.name);
    setError(null);
    const toastId = toast.loading("Uploading image...");

    try {
      const imageUrl = await uploadSuggestionImage(file, "event");
      setEventUploadedImageUrl(imageUrl);
      setEventForm((prev) => ({ ...prev, imageUrl: "" }));
      toast.success("Image uploaded.", { id: toastId });
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not upload this image right now.");
      setEventImageUploadError(nextMessage);
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setEventImageUploading(false);
    }
  };

  const preventUnexpectedFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const getLiveFieldValue = (fieldId: string, fallback: string) => {
    const node = document.getElementById(fieldId);
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      return node.value;
    }
    return fallback;
  };

  const getLiveTags = (fieldId: string, fallback: string[]) => {
    const draft = getLiveFieldValue(fieldId, "").trim();
    if (!draft) return fallback;

    const nextTags = [...fallback];
    for (const tag of draft.split(",").map((value) => value.trim()).filter(Boolean)) {
      if (!nextTags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
        nextTags.push(tag);
      }
    }
    return nextTags;
  };

  const getResourceStepSnapshot = (step: StepId): ResourceFormState => {
    if (step === 1) {
      return {
        ...resourceForm,
        resourceName: getLiveFieldValue("resource-name", resourceForm.resourceName),
        description: getLiveFieldValue("resource-description", resourceForm.description),
      };
    }

    if (step === 2) {
      return {
        ...resourceForm,
        organizationName: getLiveFieldValue("resource-organization", resourceForm.organizationName),
        fullDescription: getLiveFieldValue("resource-full-description", resourceForm.fullDescription),
        address: getLiveFieldValue("resource-address", resourceForm.address),
        website: getLiveFieldValue("resource-website", resourceForm.website),
        contactEmail: getLiveFieldValue("resource-contact-email", resourceForm.contactEmail),
        contactPhone: getLiveFieldValue("resource-contact-phone", resourceForm.contactPhone),
        imageUrl: getLiveFieldValue("resource-image-url", resourceForm.imageUrl),
        tags: getLiveTags("resource-tags", resourceForm.tags),
      };
    }

    return {
      ...resourceForm,
      submitterName: getLiveFieldValue("resource-submitter-name", resourceForm.submitterName),
      submitterEmail: getLiveFieldValue("resource-submitter-email", resourceForm.submitterEmail),
      submitterConnection: getLiveFieldValue("resource-connection", resourceForm.submitterConnection),
    };
  };

  const getEventStepSnapshot = (step: StepId): EventFormState => {
    if (step === 1) {
      return {
        ...eventForm,
        title: getLiveFieldValue("event-title", eventForm.title),
        location: getLiveFieldValue("event-location", eventForm.location),
        startsAt: getLiveFieldValue("event-starts-at", eventForm.startsAt),
      };
    }

    if (step === 2) {
      return {
        ...eventForm,
        description: getLiveFieldValue("event-description", eventForm.description),
        endsAt: getLiveFieldValue("event-ends-at", eventForm.endsAt),
        imageUrl: getLiveFieldValue("event-image-url", eventForm.imageUrl),
        organizerName: getLiveFieldValue("event-organizer-name", eventForm.organizerName),
        organizerEmail: getLiveFieldValue("event-organizer-email", eventForm.organizerEmail),
        organizerPhone: getLiveFieldValue("event-organizer-phone", eventForm.organizerPhone),
      };
    }

    return {
      ...eventForm,
      submitterName: getLiveFieldValue("event-submitter-name", eventForm.submitterName),
      submitterEmail: getLiveFieldValue("event-submitter-email", eventForm.submitterEmail),
      submitterConnection: getLiveFieldValue("event-connection", eventForm.submitterConnection),
    };
  };

  const getResourceSubmitSnapshot = (): ResourceFormState => ({
    ...getResourceStepSnapshot(3),
  });

  const getEventSubmitSnapshot = (): EventFormState => ({
    ...getEventStepSnapshot(3),
  });

  const handleResourceSubmit = async () => {
    if (currentStep !== 3 || submitting) return;

    if (resourceImageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setResourceFieldErrors({});
    setResourceImageUploadError(null);

    const errors: FieldErrors = {};
    let firstInvalidFieldId: string | null = null;
    const form = getResourceSubmitSnapshot();
    setResourceForm(form);
    const effectiveImageUrl = resourceUploadedImageUrl || form.imageUrl;
    const markError = (fieldId: string, message: string | null) => {
      if (!message) return;
      if (!errors[fieldId]) errors[fieldId] = message;
      if (!firstInvalidFieldId) firstInvalidFieldId = fieldId;
    };

    markError("resource-name", validateRequired(form.resourceName, "Resource name"));
    markError("resource-name", validateProfanity(form.resourceName, "Resource name"));
    markError("resource-name", validateMaxLength(form.resourceName, "Resource name", 200));
    markError("resource-category", validateRequired(form.category, "Category"));
    markError("resource-category", form.category && !isResourceCategory(form.category) ? "Category must be one of the approved resource categories." : null);
    markError("resource-description", validateRequired(form.description, "Description"));
    markError("resource-description", validateProfanity(form.description, "Description"));
    markError("resource-description", validateMaxLength(form.description, "Description", 500));
    markError("resource-organization", validateProfanity(form.organizationName, "Organization name"));
    markError("resource-organization", validateMaxLength(form.organizationName, "Organization name", 200));
    markError("resource-full-description", validateProfanity(form.fullDescription, "Full description"));
    markError("resource-full-description", validateMaxLength(form.fullDescription, "Full description", 2000));
    markError("resource-address", validateRequired(form.address, "Address"));
    markError("resource-address", validateProfanity(form.address, "Address"));
    markError("resource-address", validateMaxLength(form.address, "Address", 500));
    markError("resource-hours", validateProfanity(form.hours, "Hours"));
    markError("resource-hours", validateMaxLength(form.hours, "Hours", 200));
    markError("resource-tags", validateProfanity(joinTagsForValidation(form.tags), "Tags"));
    markError("resource-tags", validateMaxLength(joinTagsForValidation(form.tags), "Tags", 300));
    markError("resource-submitter-name", validateRequired(form.submitterName, "Your name"));
    markError("resource-submitter-name", validateProfanity(form.submitterName, "Your name"));
    markError("resource-submitter-email", validateRequired(form.submitterEmail, "Your email"));
    markError("resource-submitter-email", validateEmail(form.submitterEmail));
    markError("resource-connection", validateProfanity(form.submitterConnection, "Connection"));
    markError("resource-contact-email", validateEmail(form.contactEmail));
    markError("resource-contact-phone", validatePhone(form.contactPhone));
    markError("resource-website", validateUrl(form.website));
    markError("resource-image-url", validateUrl(effectiveImageUrl));

    const firstError =
      validateRequired(form.resourceName, "Resource name")
      || validateRequired(form.category, "Category")
      || validateRequired(form.description, "Description")
      || validateRequired(form.address, "Address")
      || validateRequired(form.submitterName, "Your name")
      || validateRequired(form.submitterEmail, "Your email")
      || validateProfanity(form.resourceName, "Resource name")
      || validateProfanity(form.organizationName, "Organization name")
      || validateProfanity(form.description, "Description")
      || validateProfanity(form.fullDescription, "Full description")
      || validateProfanity(form.address, "Address")
      || validateProfanity(form.hours, "Hours")
      || validateProfanity(joinTagsForValidation(form.tags), "Tags")
      || validateProfanity(form.submitterName, "Your name")
      || validateProfanity(form.submitterConnection, "Connection")
      || validateEmail(form.submitterEmail)
      || validateEmail(form.contactEmail)
      || validatePhone(form.contactPhone)
      || validateUrl(form.website)
      || validateUrl(effectiveImageUrl)
      || validateMaxLength(form.resourceName, "Resource name", 200)
      || validateMaxLength(form.organizationName, "Organization name", 200)
      || validateMaxLength(form.description, "Description", 500)
      || validateMaxLength(form.fullDescription, "Full description", 2000)
      || validateMaxLength(form.address, "Address", 500)
      || validateMaxLength(form.hours, "Hours", 200)
      || validateMaxLength(joinTagsForValidation(form.tags), "Tags", 300);

    if (Object.keys(errors).length > 0) {
      setResourceFieldErrors(errors);
      if (firstInvalidFieldId) {
        setResourceStep(getResourceStepForField(firstInvalidFieldId));
        focusFieldById(firstInvalidFieldId);
      }
      setSubmitting(false);
      return;
    }

    if (firstError) {
      setError(firstError);
      setSubmitting(false);
      return;
    }

    if (!form.category || !isResourceCategory(form.category)) {
      setError("Category must be one of the approved resource categories.");
      setSubmitting(false);
      return;
    }

    const toastId = toast.loading("Submitting resource proposal...");

    try {
      await createPublicResourceSubmission({
        resource_name: form.resourceName.trim(),
        organization_name: form.organizationName.trim() || null,
        category: form.category,
        description: form.description.trim(),
        full_description: form.fullDescription.trim() || null,
        address: form.address.trim(),
        hours: form.hours.trim() || null,
        website: normalizeHttpUrl(form.website),
        contact_email: form.contactEmail.trim() || null,
        contact_phone: form.contactPhone.trim() || null,
        tags: form.tags,
        image_url: normalizeHttpUrl(effectiveImageUrl),
        submitter_name: form.submitterName.trim(),
        submitter_email: form.submitterEmail.trim(),
        submitter_connection: form.submitterConnection.trim() || null,
      });

      setResourceForm(defaultResourceForm);
      setResourceStep(1);
      setResourceFieldErrors({});
      setResourceImageFileName("");
      setResourceUploadedImageUrl("");
      const nextMessage = "Resource proposal received. It is pending moderator review and is not live on the site yet.";
      setSuccessMessage(nextMessage);
      toast.success("Resource proposal submitted for review.", { id: toastId });
      launchSuccessConfetti();
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not submit this resource proposal right now.");
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSubmit = async () => {
    if (currentStep !== 3 || submitting) return;

    if (eventImageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setEventFieldErrors({});
    setEventImageUploadError(null);

    const errors: FieldErrors = {};
    let firstInvalidFieldId: string | null = null;
    const form = getEventSubmitSnapshot();
    setEventForm(form);
    const effectiveImageUrl = eventUploadedImageUrl || form.imageUrl;
    const markError = (fieldId: string, message: string | null) => {
      if (!message) return;
      if (!errors[fieldId]) errors[fieldId] = message;
      if (!firstInvalidFieldId) firstInvalidFieldId = fieldId;
    };

    markError("event-title", validateRequired(form.title, "Event title"));
    markError("event-title", validateProfanity(form.title, "Event title"));
    markError("event-title", validateMaxLength(form.title, "Event title", 200));
    markError("event-category", validateProfanity(form.category, "Category"));
    markError("event-category", validateMaxLength(form.category, "Category", 100));
    markError("event-description", validateProfanity(form.description, "Description"));
    markError("event-description", validateMaxLength(form.description, "Description", 1000));
    markError("event-location", validateRequired(form.location, "Location"));
    markError("event-location", validateProfanity(form.location, "Location"));
    markError("event-location", validateMaxLength(form.location, "Location", 500));
    markError("event-starts-at", validateEventDateRange(form.startsAt, form.endsAt));
    markError("event-organizer-name", validateProfanity(form.organizerName, "Organizer name"));
    markError("event-submitter-name", validateRequired(form.submitterName, "Your name"));
    markError("event-submitter-name", validateProfanity(form.submitterName, "Your name"));
    markError("event-submitter-email", validateRequired(form.submitterEmail, "Your email"));
    markError("event-submitter-email", validateEmail(form.submitterEmail));
    markError("event-connection", validateProfanity(form.submitterConnection, "Connection"));
    markError("event-organizer-email", validateEmail(form.organizerEmail));
    markError("event-organizer-phone", validatePhone(form.organizerPhone));
    markError("event-image-url", validateUrl(effectiveImageUrl));

    const firstError =
      validateRequired(form.title, "Event title")
      || validateRequired(form.location, "Location")
      || validateEventDateRange(form.startsAt, form.endsAt)
      || validateRequired(form.submitterName, "Your name")
      || validateRequired(form.submitterEmail, "Your email")
      || validateProfanity(form.title, "Event title")
      || validateProfanity(form.category, "Category")
      || validateProfanity(form.description, "Description")
      || validateProfanity(form.location, "Location")
      || validateProfanity(form.organizerName, "Organizer name")
      || validateProfanity(form.submitterName, "Your name")
      || validateProfanity(form.submitterConnection, "Connection")
      || validateEmail(form.submitterEmail)
      || validateEmail(form.organizerEmail)
      || validatePhone(form.organizerPhone)
      || validateUrl(effectiveImageUrl)
      || validateMaxLength(form.title, "Event title", 200)
      || validateMaxLength(form.category, "Category", 100)
      || validateMaxLength(form.description, "Description", 1000)
      || validateMaxLength(form.location, "Location", 500);

    if (Object.keys(errors).length > 0) {
      setEventFieldErrors(errors);
      if (firstInvalidFieldId) {
        setEventStep(getEventStepForField(firstInvalidFieldId));
        focusFieldById(firstInvalidFieldId);
      }
      setSubmitting(false);
      return;
    }

    if (firstError) {
      setError(firstError);
      setSubmitting(false);
      return;
    }

    const startsAtIso = toIso(form.startsAt);
    if (!startsAtIso) {
      setError("Start date and time is required.");
      setSubmitting(false);
      return;
    }

    const endsAtCandidate = toIso(form.endsAt);
    const endsAtIso = endsAtCandidate && new Date(endsAtCandidate).getTime() > new Date(startsAtIso).getTime()
      ? endsAtCandidate
      : plusOneHour(startsAtIso);

    const toastId = toast.loading("Submitting event proposal...");

    try {
      await createPublicEventSubmission({
        title: form.title.trim(),
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        location: form.location.trim(),
        starts_at: startsAtIso,
        ends_at: endsAtIso,
        image_url: normalizeHttpUrl(effectiveImageUrl),
        organizer_name: form.organizerName.trim() || null,
        organizer_email: form.organizerEmail.trim() || null,
        organizer_phone: form.organizerPhone.trim() || null,
        submitter_name: form.submitterName.trim(),
        submitter_email: form.submitterEmail.trim(),
        submitter_connection: form.submitterConnection.trim() || null,
      });

      setEventForm(defaultEventForm);
      setEventStep(1);
      setEventFieldErrors({});
      setEventImageFileName("");
      setEventUploadedImageUrl("");
      const nextMessage = "Event proposal received. It is pending moderator review and is not live on the site yet.";
      setSuccessMessage(nextMessage);
      toast.success("Event proposal submitted for review.", { id: toastId });
      launchSuccessConfetti();
    } catch (nextError) {
      console.error(nextError);
      const nextMessage = toErrorMessage(nextError, "Could not submit this event proposal right now.");
      setError(nextMessage);
      toast.error(nextMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepProgress = () => {
    const steps: StepId[] = [1, 2, 3];

    return (
      <div className="grid grid-cols-3 gap-2" role="list" aria-label="Submission steps">
        {steps.map((step) => {
          const isActive = currentStep === step;
          const isDone = currentStep > step;
          const canGoBackToStep = isDone && !submitting && !isCurrentKindImageUploading;

          return (
            <button
              key={step}
              type="button"
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              disabled={!canGoBackToStep}
              onClick={() => goToStep(step)}
              className={`rounded-xl border px-3 py-2 text-center transition-colors ${
                isActive
                  ? "border-[#B36A4C] bg-[#FFF8EE] text-[#334233]"
                  : isDone
                    ? "border-[#A7AE8A] bg-[#EEF4E4] text-[#334233]"
                    : "border-[#E7D9C3] bg-white text-[#6F7553]"
              } ${canGoBackToStep ? "cursor-pointer hover:border-[#7F8A5F] hover:bg-[#E5EED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B36A4C] focus-visible:ring-offset-2" : "cursor-default disabled:opacity-100"}`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide">Step {step}</div>
              <div className="text-sm font-medium mt-0.5">{STEP_LABELS[step]}</div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderNavigation = (submitLabel: string, onSubmit: () => void) => (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={goToPreviousStep}
        disabled={currentStep === 1 || submitting || isCurrentKindImageUploading}
        className="inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {currentStep < 3 ? (
        <Button
          type="button"
          onClick={goToNextStep}
          disabled={submitting || isCurrentKindImageUploading}
          className="inline-flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" onClick={onSubmit} disabled={submitting || isCurrentKindImageUploading}>
          {submitting ? "Submitting..." : submitLabel}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] pb-16 pt-20 text-[#F6F1E7]">
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

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
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
                <button id="resource-tab" type="button" onClick={() => switchKind("resource")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${kind === "resource" ? "bg-[#334233] text-white" : "text-[#334233]"}`} role="tab" aria-selected={kind === "resource"} aria-controls="resource-panel">
                  Resource
                </button>
                <button id="event-tab" type="button" onClick={() => switchKind("event")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${kind === "event" ? "bg-[#334233] text-white" : "text-[#334233]"}`} role="tab" aria-selected={kind === "event"} aria-controls="event-panel">
                  Event
                </button>
              </div>

              {renderStepProgress()}

              {error && !hasInlineErrors ? <div role="alert" aria-live="polite" className="text-sm text-red-600">{error}</div> : null}
              {successMessage ? <div role="status" aria-live="polite" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{successMessage}</div> : null}

              {kind === "resource" ? (
                <form className="space-y-4" onSubmit={preventUnexpectedFormSubmit} role="tabpanel" id="resource-panel" aria-labelledby="resource-tab">
                  {currentStep === 1 ? (
                    <fieldset>
                      <legend className="sr-only">Resource Basics</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="resource-name">Resource name</Label>
                          <Input
                            id="resource-name"
                            value={resourceForm.resourceName}
                            onChange={(event) => setResourceForm((prev) => ({ ...prev, resourceName: event.target.value }))}
                            aria-invalid={!!resourceFieldErrors["resource-name"]}
                            aria-describedby={resourceFieldErrors["resource-name"] ? getFieldErrorId("resource-name") : undefined}
                            required
                          />
                          {resourceFieldErrors["resource-name"] ? <p id={getFieldErrorId("resource-name")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-name"]}</p> : null}
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
                            aria-invalid={!!resourceFieldErrors["resource-category"]}
                            aria-describedby={resourceFieldErrors["resource-category"] ? getFieldErrorId("resource-category") : undefined}
                          />
                          {resourceFieldErrors["resource-category"] ? <p id={getFieldErrorId("resource-category")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-category"]}</p> : null}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="resource-description">Short description</Label>
                        <Textarea
                          id="resource-description"
                          value={resourceForm.description}
                          onChange={(event) => setResourceForm((prev) => ({ ...prev, description: event.target.value }))}
                          aria-invalid={!!resourceFieldErrors["resource-description"]}
                          aria-describedby={resourceFieldErrors["resource-description"] ? getFieldErrorId("resource-description") : undefined}
                          required
                        />
                        {resourceFieldErrors["resource-description"] ? <p id={getFieldErrorId("resource-description")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-description"]}</p> : null}
                      </div>
                    </fieldset>
                  ) : null}

                  {currentStep === 2 ? (
                    <fieldset>
                      <legend className="sr-only">Resource Details</legend>
                      <div>
                        <Label htmlFor="resource-organization">Organization name</Label>
                        <Input id="resource-organization" value={resourceForm.organizationName} onChange={(event) => setResourceForm((prev) => ({ ...prev, organizationName: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-organization"]} aria-describedby={resourceFieldErrors["resource-organization"] ? getFieldErrorId("resource-organization") : undefined} />
                        {resourceFieldErrors["resource-organization"] ? <p id={getFieldErrorId("resource-organization")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-organization"]}</p> : null}
                      </div>
                      <fieldset>
                        <legend className="sr-only">Image</legend>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
                          <div>
                            <Label htmlFor="resource-image-upload">Upload image</Label>
                            <input
                              id="resource-image-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                              disabled={resourceImageUploading}
                              className="sr-only"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                void handleResourceImageUpload(file);
                                event.currentTarget.value = "";
                              }}
                            />
                            <div className="mt-1 flex gap-2">
                              <label
                                htmlFor="resource-image-upload"
                                title={resourceImageFileName || "Choose file"}
                                className={`inline-flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border border-[#D9D0C1] bg-white px-3 text-sm font-medium text-[#334233] transition-colors hover:border-[#B36A4C] hover:bg-[#F6F1E7] ${resourceImageUploading ? "pointer-events-none opacity-70" : ""}`}
                              >
                                <Upload className="h-4 w-4 shrink-0" aria-hidden />
                                <span className="block min-w-0 max-w-full truncate">{resourceImageUploading ? "Uploading..." : (resourceImageFileName || "Choose file")}</span>
                              </label>
                              {resourceUploadedImageUrl ? (
                                <button
                                  type="button"
                                  aria-label="Remove uploaded image"
                                  onClick={() => {
                                    setResourceUploadedImageUrl("");
                                    setResourceImageFileName("");
                                    setResourceImageUploadError(null);
                                  }}
                                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#D9D0C1] bg-white text-[#334233] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" aria-hidden />
                                </button>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="resource-image-url">Image URL</Label>
                            <Input
                              id="resource-image-url"
                              className="mt-1"
                              disabled={Boolean(resourceUploadedImageUrl)}
                              value={resourceForm.imageUrl}
                              onChange={(event) => setResourceForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                              aria-invalid={!!resourceFieldErrors["resource-image-url"]}
                              aria-describedby={resourceFieldErrors["resource-image-url"] ? getFieldErrorId("resource-image-url") : undefined}
                            />
                          </div>
                          {resourceFieldErrors["resource-image-url"] ? <p id={getFieldErrorId("resource-image-url")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-image-url"]}</p> : null}
                          {resourceImageUploadError ? <p className="mt-1 text-xs text-red-600">{resourceImageUploadError}</p> : null}
                        </div>
                      </fieldset>
                      <div><Label htmlFor="resource-full-description">Full description</Label><Textarea id="resource-full-description" value={resourceForm.fullDescription} onChange={(event) => setResourceForm((prev) => ({ ...prev, fullDescription: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-full-description"]} aria-describedby={resourceFieldErrors["resource-full-description"] ? getFieldErrorId("resource-full-description") : undefined} />{resourceFieldErrors["resource-full-description"] ? <p id={getFieldErrorId("resource-full-description")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-full-description"]}</p> : null}</div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="resource-address">Address</Label>
                          <AddressAutocompleteInput
                            id="resource-address"
                            value={resourceForm.address}
                            onChange={(next) => setResourceForm((prev) => ({ ...prev, address: next }))}
                            aria-invalid={!!resourceFieldErrors["resource-address"]}
                            aria-describedby={resourceFieldErrors["resource-address"] ? getFieldErrorId("resource-address") : undefined}
                            required
                          />
                          {resourceFieldErrors["resource-address"] ? <p id={getFieldErrorId("resource-address")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-address"]}</p> : null}
                        </div>
                        <div>
                          <Label htmlFor="resource-hours">Hours</Label>
                          <ResourceHoursSelector
                            id="resource-hours"
                            value={resourceForm.hours}
                            onChange={(next) => setResourceForm((prev) => ({ ...prev, hours: next }))}
                          />
                          {resourceFieldErrors["resource-hours"] ? <p id={getFieldErrorId("resource-hours")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-hours"]}</p> : null}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div><Label htmlFor="resource-website">Website</Label><Input id="resource-website" value={resourceForm.website} onChange={(event) => setResourceForm((prev) => ({ ...prev, website: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-website"]} aria-describedby={resourceFieldErrors["resource-website"] ? getFieldErrorId("resource-website") : undefined} />{resourceFieldErrors["resource-website"] ? <p id={getFieldErrorId("resource-website")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-website"]}</p> : null}</div>
                        <div><Label htmlFor="resource-contact-email">Contact email</Label><Input id="resource-contact-email" type="email" value={resourceForm.contactEmail} onChange={(event) => setResourceForm((prev) => ({ ...prev, contactEmail: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-contact-email"]} aria-describedby={resourceFieldErrors["resource-contact-email"] ? getFieldErrorId("resource-contact-email") : undefined} />{resourceFieldErrors["resource-contact-email"] ? <p id={getFieldErrorId("resource-contact-email")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-contact-email"]}</p> : null}</div>
                        <div><Label htmlFor="resource-contact-phone">Contact phone</Label><Input id="resource-contact-phone" value={resourceForm.contactPhone} onChange={(event) => setResourceForm((prev) => ({ ...prev, contactPhone: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-contact-phone"]} aria-describedby={resourceFieldErrors["resource-contact-phone"] ? getFieldErrorId("resource-contact-phone") : undefined} />{resourceFieldErrors["resource-contact-phone"] ? <p id={getFieldErrorId("resource-contact-phone")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-contact-phone"]}</p> : null}</div>
                      </div>
                      <div>
                        <Label htmlFor="resource-tags">Tags</Label>
                        <TagChipInput
                          id="resource-tags"
                          values={resourceForm.tags}
                          onChange={(next) => setResourceForm((prev) => ({ ...prev, tags: next }))}
                          maxChars={300}
                          placeholder="Type a tag, then press Enter"
                        />
                        {resourceFieldErrors["resource-tags"] ? <p id={getFieldErrorId("resource-tags")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-tags"]}</p> : null}
                      </div>
                    </fieldset>
                  ) : null}

                  {currentStep === 3 ? (
                    <fieldset>
                      <legend className="sr-only">Submitter Information</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="resource-submitter-name">Your name</Label><Input id="resource-submitter-name" value={resourceForm.submitterName} onChange={(event) => setResourceForm((prev) => ({ ...prev, submitterName: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-submitter-name"]} aria-describedby={resourceFieldErrors["resource-submitter-name"] ? getFieldErrorId("resource-submitter-name") : undefined} required />{resourceFieldErrors["resource-submitter-name"] ? <p id={getFieldErrorId("resource-submitter-name")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-submitter-name"]}</p> : null}</div>
                        <div><Label htmlFor="resource-submitter-email">Your email</Label><Input id="resource-submitter-email" type="email" value={resourceForm.submitterEmail} onChange={(event) => setResourceForm((prev) => ({ ...prev, submitterEmail: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-submitter-email"]} aria-describedby={resourceFieldErrors["resource-submitter-email"] ? getFieldErrorId("resource-submitter-email") : undefined} required />{resourceFieldErrors["resource-submitter-email"] ? <p id={getFieldErrorId("resource-submitter-email")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-submitter-email"]}</p> : null}</div>
                      </div>
                      <div><Label htmlFor="resource-connection">Your connection to this resource</Label><Textarea id="resource-connection" value={resourceForm.submitterConnection} onChange={(event) => setResourceForm((prev) => ({ ...prev, submitterConnection: event.target.value }))} aria-invalid={!!resourceFieldErrors["resource-connection"]} aria-describedby={resourceFieldErrors["resource-connection"] ? getFieldErrorId("resource-connection") : undefined} />{resourceFieldErrors["resource-connection"] ? <p id={getFieldErrorId("resource-connection")} className="mt-1 text-sm text-red-600">{resourceFieldErrors["resource-connection"]}</p> : null}</div>
                    </fieldset>
                  ) : null}

                  {renderNavigation("Submit Resource Proposal", () => { void handleResourceSubmit(); })}
                </form>
              ) : (
                <form className="space-y-4" onSubmit={preventUnexpectedFormSubmit} role="tabpanel" id="event-panel" aria-labelledby="event-tab">
                  {currentStep === 1 ? (
                    <fieldset>
                      <legend className="sr-only">Event Basics</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="event-title">Event title</Label><Input id="event-title" value={eventForm.title} onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))} aria-invalid={!!eventFieldErrors["event-title"]} aria-describedby={eventFieldErrors["event-title"] ? getFieldErrorId("event-title") : undefined} required />{eventFieldErrors["event-title"] ? <p id={getFieldErrorId("event-title")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-title"]}</p> : null}</div>
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
                            aria-invalid={!!eventFieldErrors["event-category"]}
                            aria-describedby={eventFieldErrors["event-category"] ? getFieldErrorId("event-category") : undefined}
                          />
                          {eventFieldErrors["event-category"] ? <p id={getFieldErrorId("event-category")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-category"]}</p> : null}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="event-location">Location</Label>
                          <AddressAutocompleteInput
                            id="event-location"
                            value={eventForm.location}
                            onChange={(next) => setEventForm((prev) => ({ ...prev, location: next }))}
                            aria-invalid={!!eventFieldErrors["event-location"]}
                            aria-describedby={eventFieldErrors["event-location"] ? getFieldErrorId("event-location") : undefined}
                            required
                          />
                          {eventFieldErrors["event-location"] ? <p id={getFieldErrorId("event-location")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-location"]}</p> : null}
                      </div>
                      <div><Label htmlFor="event-starts-at">Starts at</Label><Input id="event-starts-at" type="datetime-local" min={eventDateBounds.minInput} max={eventDateBounds.maxInput} value={eventForm.startsAt} onChange={(event) => setEventForm((prev) => ({ ...prev, startsAt: event.target.value }))} aria-invalid={!!eventFieldErrors["event-starts-at"]} aria-describedby={eventFieldErrors["event-starts-at"] ? getFieldErrorId("event-starts-at") : undefined} required />{eventFieldErrors["event-starts-at"] ? <p id={getFieldErrorId("event-starts-at")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-starts-at"]}</p> : null}</div>
                    </fieldset>
                  ) : null}

                  {currentStep === 2 ? (
                    <fieldset>
                      <legend className="sr-only">Event Details</legend>
                      <div><Label htmlFor="event-description">Description</Label><Textarea id="event-description" value={eventForm.description} onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))} aria-invalid={!!eventFieldErrors["event-description"]} aria-describedby={eventFieldErrors["event-description"] ? getFieldErrorId("event-description") : undefined} />{eventFieldErrors["event-description"] ? <p id={getFieldErrorId("event-description")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-description"]}</p> : null}</div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="event-ends-at">Ends at</Label><Input id="event-ends-at" type="datetime-local" min={eventForm.startsAt || eventDateBounds.minInput} max={eventDateBounds.maxInput} value={eventForm.endsAt} onChange={(event) => setEventForm((prev) => ({ ...prev, endsAt: event.target.value }))} aria-invalid={!!eventFieldErrors["event-ends-at"]} aria-describedby={eventFieldErrors["event-ends-at"] ? getFieldErrorId("event-ends-at") : undefined} />{eventFieldErrors["event-ends-at"] ? <p id={getFieldErrorId("event-ends-at")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-ends-at"]}</p> : null}</div>
                      </div>
                      <fieldset>
                        <legend className="sr-only">Image</legend>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
                          <div>
                            <Label htmlFor="event-image-upload">Upload image</Label>
                            <input
                              id="event-image-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                              disabled={eventImageUploading}
                              className="sr-only"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                void handleEventImageUpload(file);
                                event.currentTarget.value = "";
                              }}
                            />
                            <div className="mt-1 flex gap-2">
                              <label
                                htmlFor="event-image-upload"
                                title={eventImageFileName || "Choose file"}
                                className={`inline-flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border border-[#D9D0C1] bg-white px-3 text-sm font-medium text-[#334233] transition-colors hover:border-[#B36A4C] hover:bg-[#F6F1E7] ${eventImageUploading ? "pointer-events-none opacity-70" : ""}`}
                              >
                                <Upload className="h-4 w-4 shrink-0" aria-hidden />
                                <span className="block min-w-0 max-w-full truncate">{eventImageUploading ? "Uploading..." : (eventImageFileName || "Choose file")}</span>
                              </label>
                              {eventUploadedImageUrl ? (
                                <button
                                  type="button"
                                  aria-label="Remove uploaded image"
                                  onClick={() => {
                                    setEventUploadedImageUrl("");
                                    setEventImageFileName("");
                                    setEventImageUploadError(null);
                                  }}
                                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#D9D0C1] bg-white text-[#334233] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" aria-hidden />
                                </button>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="event-image-url">Image URL</Label>
                            <Input
                              id="event-image-url"
                              className="mt-1"
                              disabled={Boolean(eventUploadedImageUrl)}
                              value={eventForm.imageUrl}
                              onChange={(event) => setEventForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                              aria-invalid={!!eventFieldErrors["event-image-url"]}
                              aria-describedby={eventFieldErrors["event-image-url"] ? getFieldErrorId("event-image-url") : undefined}
                            />
                          </div>
                          {eventFieldErrors["event-image-url"] ? <p id={getFieldErrorId("event-image-url")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-image-url"]}</p> : null}
                          {eventImageUploadError ? <p className="mt-1 text-xs text-red-600">{eventImageUploadError}</p> : null}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="text-sm font-medium mb-2">Organizer Information</legend>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div><Label htmlFor="event-organizer-name">Organizer name</Label><Input id="event-organizer-name" value={eventForm.organizerName} onChange={(event) => setEventForm((prev) => ({ ...prev, organizerName: event.target.value }))} aria-invalid={!!eventFieldErrors["event-organizer-name"]} aria-describedby={eventFieldErrors["event-organizer-name"] ? getFieldErrorId("event-organizer-name") : undefined} />{eventFieldErrors["event-organizer-name"] ? <p id={getFieldErrorId("event-organizer-name")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-organizer-name"]}</p> : null}</div>
                          <div><Label htmlFor="event-organizer-email">Organizer email</Label><Input id="event-organizer-email" value={eventForm.organizerEmail} onChange={(event) => setEventForm((prev) => ({ ...prev, organizerEmail: event.target.value }))} aria-invalid={!!eventFieldErrors["event-organizer-email"]} aria-describedby={eventFieldErrors["event-organizer-email"] ? getFieldErrorId("event-organizer-email") : undefined} />{eventFieldErrors["event-organizer-email"] ? <p id={getFieldErrorId("event-organizer-email")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-organizer-email"]}</p> : null}</div>
                          <div><Label htmlFor="event-organizer-phone">Organizer phone</Label><Input id="event-organizer-phone" value={eventForm.organizerPhone} onChange={(event) => setEventForm((prev) => ({ ...prev, organizerPhone: event.target.value }))} aria-invalid={!!eventFieldErrors["event-organizer-phone"]} aria-describedby={eventFieldErrors["event-organizer-phone"] ? getFieldErrorId("event-organizer-phone") : undefined} />{eventFieldErrors["event-organizer-phone"] ? <p id={getFieldErrorId("event-organizer-phone")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-organizer-phone"]}</p> : null}</div>
                        </div>
                      </fieldset>
                    </fieldset>
                  ) : null}

                  {currentStep === 3 ? (
                    <fieldset>
                      <legend className="sr-only">Submitter Information</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="event-submitter-name">Your name</Label><Input id="event-submitter-name" value={eventForm.submitterName} onChange={(event) => setEventForm((prev) => ({ ...prev, submitterName: event.target.value }))} aria-invalid={!!eventFieldErrors["event-submitter-name"]} aria-describedby={eventFieldErrors["event-submitter-name"] ? getFieldErrorId("event-submitter-name") : undefined} required />{eventFieldErrors["event-submitter-name"] ? <p id={getFieldErrorId("event-submitter-name")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-submitter-name"]}</p> : null}</div>
                        <div><Label htmlFor="event-submitter-email">Your email</Label><Input id="event-submitter-email" type="email" value={eventForm.submitterEmail} onChange={(event) => setEventForm((prev) => ({ ...prev, submitterEmail: event.target.value }))} aria-invalid={!!eventFieldErrors["event-submitter-email"]} aria-describedby={eventFieldErrors["event-submitter-email"] ? getFieldErrorId("event-submitter-email") : undefined} required />{eventFieldErrors["event-submitter-email"] ? <p id={getFieldErrorId("event-submitter-email")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-submitter-email"]}</p> : null}</div>
                      </div>
                      <div><Label htmlFor="event-connection">Your connection to this event</Label><Textarea id="event-connection" value={eventForm.submitterConnection} onChange={(event) => setEventForm((prev) => ({ ...prev, submitterConnection: event.target.value }))} aria-invalid={!!eventFieldErrors["event-connection"]} aria-describedby={eventFieldErrors["event-connection"] ? getFieldErrorId("event-connection") : undefined} />{eventFieldErrors["event-connection"] ? <p id={getFieldErrorId("event-connection")} className="mt-1 text-sm text-red-600">{eventFieldErrors["event-connection"]}</p> : null}</div>
                    </fieldset>
                  ) : null}

                  {renderNavigation("Submit Event Proposal", () => { void handleEventSubmit(); })}
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
                  <ClipboardList className="mt-0.5 h-6 w-6 text-[#B36A4C]" />
                  <p><span className="font-semibold text-[#334233]">Public proposals:</span> Anyone can submit a resource or event, but it stays pending until a moderator reviews it.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 text-[#B36A4C]" />
                  <p><span className="font-semibold text-[#334233]">Approved contributors:</span> Verified organizations can manage official resources and events directly in the portal.</p>
                </div>
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-6 w-6 text-[#B36A4C]" />
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
