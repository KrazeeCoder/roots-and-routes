import type { ResourceCategory } from "../constants/resourceCategories";

export type ContributorRole = "contributor" | "moderator" | "super_admin";

export type ContentStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected";

export interface ContributorProfile {
  id: string;
  role: ContributorRole;
  status: "pending" | "approved" | "rejected";
  organization_name: string | null;
  display_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceRecord {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  full_description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  tags: string[];
  image_url: string | null;
  status: ContentStatus;
  is_spotlight: boolean;
  spotlight_subtitle: string | null;
  posted_by_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventRecord {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  location: string;
  location_lat: number | null;
  location_lng: number | null;
  starts_at: string;
  ends_at: string | null;
  image_url: string | null;
  status: ContentStatus;
  is_spotlight: boolean;
  posted_by_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ResourcePayload {
  name: string;
  category: ResourceCategory;
  description: string;
  full_description?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  hours?: string | null;
  tags?: string[];
  image_url?: string | null;
  status: ContentStatus;
  is_spotlight?: boolean;
  spotlight_subtitle?: string | null;
}

export interface EventPayload {
  title: string;
  category?: string | null;
  description?: string | null;
  location: string;
  location_lat?: number | null;
  location_lng?: number | null;
  starts_at: string;
  ends_at?: string | null;
  image_url?: string | null;
  status: ContentStatus;
  is_spotlight?: boolean;
}

export interface SignUpContributorInput {
  organizationName: string;
  displayName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface ResourceSubmissionRecord {
  id: string;
  resource_name: string;
  organization_name: string | null;
  category: ResourceCategory;
  description: string;
  full_description: string | null;
  website: string | null;
  address: string | null;
  hours: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tags: string[];
  image_url: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_connection: string | null;
  status: SubmissionStatus;
  moderator_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_resource_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceRatingFeedback {
  rating: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceSubmissionPayload {
  resource_name: string;
  organization_name?: string | null;
  category: ResourceCategory;
  description: string;
  full_description?: string | null;
  website?: string | null;
  address?: string | null;
  hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  tags?: string[];
  image_url?: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_connection?: string | null;
}

export interface EventSubmissionRecord {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  location: string;
  starts_at: string;
  ends_at: string | null;
  image_url: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_connection: string | null;
  status: SubmissionStatus;
  moderator_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventSubmissionPayload {
  title: string;
  category?: string | null;
  description?: string | null;
  location: string;
  starts_at: string;
  ends_at?: string | null;
  image_url?: string | null;
  organizer_name?: string | null;
  organizer_email?: string | null;
  organizer_phone?: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_connection?: string | null;
}
