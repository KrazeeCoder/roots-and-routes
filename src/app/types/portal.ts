export type ContributorRole = "contributor" | "moderator";

export type ContentStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived";

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
  category: string;
  description: string;
  full_description: string | null;
  address: string;
  phone: string | null;
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
  category: string;
  description: string;
  full_description?: string | null;
  address: string;
  phone?: string | null;
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
