# Roots & Routes - Comprehensive Feature Overview

**Current Date:** May 20, 2026  
**Application Purpose:** A community resource and event discovery platform for the Bothell/Kenmore area focused on connecting residents with local services, programs, and community gatherings.

---

## Table of Contents

1. [Architecture & Technology Stack](#architecture--technology-stack)
2. [Page Structure & User-Facing Features](#page-structure--user-facing-features)
3. [User Workflows](#user-workflows)
4. [Forms & Data Collection](#forms--data-collection)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Contributor/Admin Functionalities](#contributoradmin-functionalities)
8. [Engagement Features](#engagement-features)
9. [Component Organization](#component-organization)

---

## Architecture & Technology Stack

### Frontend Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS with custom theme
- **Animations:** Framer Motion (motion/react)
- **UI Components:** Custom shadcn/ui-based components
- **Maps Integration:** Google Maps JavaScript API
- **Backend:** Supabase (PostgreSQL + Auth)
- **Date Handling:** date-fns

### Key Architecture Patterns
- **Dual-Trust Submission Model:** Approved contributors publish immediately; public submissions go to moderator review queue
- **Row-Level Security (RLS):** Database policies control access based on user authentication
- **Engagement Tracking:** Anonymous and authenticated user engagement with resources/events
- **Image Proxying:** ImageWithFallback component for reliable image loading

---

## Page Structure & User-Facing Features

### Public Pages (No Authentication Required)

#### 1. **Home Page** (`/`)
- **Purpose:** Landing page showcasing the platform
- **Components:**
  - Hero section with call-to-action
  - Featured resources section
  - Spotlight section (featured high-rated resources)
  - Testimonials section
  - Email signup section
- **User Action:** Browse featured content, subscribe to email list

#### 2. **Directory** (`/directory`)
- **Purpose:** Primary search & discovery hub for resources
- **Key Features:**
  - Full-text search across resource names and descriptions
  - Filter by category (Food Assistance, Health & Wellness, Housing Support, Youth Programs, Job Help, Community Events)
  - Advanced filters:
    - Minimum rating threshold
    - Has website/phone/email available
    - Open now
    - Operating hours (weekdays, weekends, evenings, 24/7)
    - Sort by: relevance, rating, name
  - Pagination (8 results per page)
  - Sticky header for persistent navigation
  - Resource cards with ratings, engagement buttons
  - Click through to resource detail page
- **Components Used:** RatingComponent, EngagementButtons, ResourceListSkeleton

#### 3. **Resource Detail** (`/resources/:resourceId`)
- **Purpose:** Full page view of a single resource
- **Displays:**
  - Large hero image
  - Name, category badge, organization
  - Short and full descriptions
  - Contact information (phone, email, website)
  - Operating hours
  - Tags/keywords
  - Breadcrumb navigation
  - User engagement metrics (views, likes, ratings, favorites)
  - Current user's rating and like status
- **Interactions:**
  - Rate the resource (1-5 stars with reason)
  - Like/unlike
  - View count increments on page load
  - Link to website and contact options

#### 4. **Events** (`/events`)
- **Purpose:** Browse and discover upcoming community events
- **View Modes:**
  - **List View:** Paginated list of events (3 per page) with search/filter
  - **Map View:** Google Map showing event locations with distance calculations
  - **Calendar View:** Calendar interface for date-based browsing
- **Features:**
  - Search events by title
  - Filter by category (suggestions: Community Gathering, Workshop/Class, Festival, Fundraiser, Sports & Recreation, Kids & Family, Arts & Culture, Food & Markets, Government/Civic, Volunteer Opportunity)
  - Distance radius filter (1, 5, 10, 25 miles from Bothell)
  - Separate "upcoming" vs "past" events
  - Add to external calendar (Google Calendar, Apple Calendar, etc.)
- **Components:** Google Map integration with markers, interactive info windows
- **Location:** Event location stored with lat/lng coordinates for mapping

#### 5. **Calendar** (`/calendar`)
- **Purpose:** Visual calendar interface for event browsing
- **Features:**
  - Month navigation (previous/next month)
  - Display day of week headers
  - Highlight today's date
  - Clickable dates show all events on that day
  - Auto-jumps to next upcoming event on page load
  - Responsive design

#### 6. **Spotlights** (`/spotlights`)
- **Purpose:** Showcase featured high-performing resources
- **Features:**
  - Featured banner resource with full details
  - Grid of additional spotlight resources
  - Category filter with smooth scrolling
  - Dynamic category list derived from spotlight data
  - Engagement metrics (ratings, views, likes, favorites)
  - User can interact with rating and like buttons
  - Featured distinction for premium spotlight
  - Decorative animations and route visualizations

#### 7. **Suggest** (`/suggest`)
- **Purpose:** Public-facing form for community submissions
- **Features:**
  - Multi-step form wizard (3 steps)
  - Two submission types: Resource or Event
  - **Resource submission collects:**
    - Basic info: Name, organization, category (select from 6 options)
    - Description (short), full description, address
    - Hours (visual time selector or text), website, phone, email
    - Tags (chip-based input)
    - Image URL
    - Submitter info (name, email, connection/relationship to org)
  - **Event submission collects:**
    - Title, category (select or free text), description, location
    - Start/end dates and times
    - Image URL
    - Organizer info (name, email, phone)
    - Submitter info
  - Form validation:
    - Required fields enforcement
    - Email/phone/URL format validation
    - Profanity filter on all text fields
    - Max length validation per field
    - Address autocomplete via Google Places
  - Success confirmation with confetti animation
  - All public submissions enter "pending" moderation queue
- **Data Flow:** Submissions stored in `resource_submissions` or `event_submissions` tables

#### 8. **Help** (`/help`)
- **Purpose:** FAQ and quick reference for new users
- **Content:**
  - Quick action cards (Search directory, Browse events, Suggest resource, Open portal)
  - FAQ accordion with common questions:
    - How to find help nearby
    - Filtering events by time
    - What to include in suggestions
    - How to manage listings (portal)
  - Links to resource pages

#### 9. **About** (`/about`)
- **Purpose:** Information about the platform and partners
- **Sections:**
  - Mission and vision statements
  - Community partner logos (10+ organizations)
  - Statistics with animated count-up:
    - Number of resources
    - Number of events
    - Number of community partners
  - How the platform works
  - Testimonials from community members

#### 10. **Reference** (`/reference`)
- **Purpose:** Documentation and attributions page
- **Content:**
  - Development resources and links
  - License sources (Wikimedia Commons, Unsplash, shadcn/ui, Google Fonts)
  - Research and accessibility sources
  - Judge's quick-check items for assessment
  - Image citations with source links
  - Wikimedia Commons reference images gallery

---

### Authenticated Pages (Contributor/Admin Only)

#### 11. **Contributor Login** (`/contributor-login`)
- **Purpose:** Authentication gateway for contributors and moderators
- **Features:**
  - **Sign In Mode:**
    - Email and password
    - Redirects to portal on success
    - Friendly error messages for failed auth
  - **Sign Up Mode:**
    - Organization name
    - Display name
    - First, middle, last name
    - Email, phone
    - Password (with confirmation)
    - Validation of all required fields
    - Profanity filter on text fields
    - New account starts with "pending" approval status
  - **Forgot Password Mode:**
    - Email-based password reset flow
    - Redirects to `/reset-password` page
- **Data:** User data stored in Supabase Auth + contributor profiles table

#### 12. **Reset Password** (`/reset-password`)
- **Purpose:** Password recovery page
- **Features:** Standard password reset workflow via Supabase Auth

#### 13. **Portal Overview** (`/portal`)
- **Purpose:** Dashboard hub for authenticated contributors
- **Displays:**
  - Contributor account status (pending/approved/rejected)
  - Account details: organization, status, contact name, role
  - Status-specific banners:
    - "Pending Approval" if account not yet reviewed
    - "Account Not Approved" if application rejected
  - Three main sections:
    - **Resources Card:** Manage resource listings (draft/publish/archive)
    - **Events Card:** Manage event listings
    - **Moderation Card:** (Only for moderators) Review submissions and manage contributors
  - Explanation of dual-trust workflow:
    - Approved contributors can publish immediately
    - Public users' submissions go to moderation queue
    - Moderators review and approve
- **Role-Based Access:**
  - Approved contributors and moderators can access Resources/Events
  - Only moderators can access Moderation

#### 14. **Portal Resources** (`/portal/resources`)
- **Purpose:** Contributor resource management dashboard
- **Features:**
  - **List View:**
    - Search/filter resources created by logged-in user
    - Pagination (12 items per page)
    - Status filter (all/draft/published/rejected/pending)
    - Edit and delete buttons for each resource
  - **Create/Edit Dialog:**
    - Form fields match database schema:
      - Name, category (validated dropdown), description, full description
      - Address (with autocomplete), phone, email, website
      - Hours (visual selector), tags (chips), image URL
      - Status: draft/published (contributors), draft/pending/published/rejected (moderators)
      - Spotlight toggle (moderators only) with optional subtitle
    - Validation: All fields follow profanity, format, and max-length rules
    - Submit creates or updates resource record
  - **Delete Action:**
    - Confirmation dialog before permanent deletion
  - **Rating Feedback:**
    - Moderators can see user feedback on resource ratings
    - Displays reason users gave for ratings
- **Access Control:** RequireAuth + RequireApproved guards (moderators bypass approval check)

#### 15. **Portal Events** (`/portal/events`)
- **Purpose:** Contributor event management dashboard
- **Features:**
  - Similar structure to Resources:
    - List view with search/filter
    - Create/edit dialog
    - Delete action with confirmation
  - **Form Fields:**
    - Title, category (free text with suggestions), description, location
    - Start/end dates and times (with timezone handling)
    - Location coordinates (auto-populated from Google Maps)
    - Image URL
    - Spotlight toggle (moderators)
    - Status options per role
  - **Date/Time Handling:**
    - Converts between user timezone and ISO format
    - Automatically calculates end time as 1 hour after start if not specified
  - **URL Validation:** Rejects placeholder URLs (example.com, localhost)

#### 16. **Portal Moderation** (`/portal/moderation`)
- **Purpose:** Moderation dashboard for reviewing submissions and managing contributors
- **Access:** RequireModerator guard (only moderators)
- **Tabs:**
  - **Public Resource Submissions:**
    - List of pending resource submissions
    - Search/filter by name or status (pending/approved/rejected)
    - For each submission:
      - View all resource details
      - Approve button: Creates official resource record, links to submission
      - Reject button: With optional moderator notes
      - Edit submission details before approving
      - Delete submission
      - Moderator notes field (for rejection reasons)
    - Pagination (12 per page)
  - **Public Event Submissions:**
    - Same workflow as resources for events
  - **Resources:**
    - List all published resources
    - Edit or delete as needed
    - Manage spotlight status
  - **Events:**
    - List all published events
    - Edit or delete as needed
  - **Contributor Profiles:**
    - Pending profile approvals
    - Approve/reject contributor accounts
    - Moderator notes on decisions
    - View organization and contact details

---

## User Workflows

### Workflow 1: Discovery (New/Anonymous User)
1. Land on Home page
2. Browse featured resources or explore spotlights
3. Search Directory for specific resource type
4. Click on resource to see full details, ratings, and user engagement
5. Apply filters to narrow down results
6. Optional: View events on map or calendar
7. Click external links to visit resource websites or call

### Workflow 2: Public Submission
1. Click "Suggest" from navigation
2. Choose resource or event submission
3. Fill out multi-step form with validation
4. Submit with submitter contact info
5. See success confirmation
6. Submission enters moderation queue (status: pending)
7. Receive email when approved/rejected by moderator

### Workflow 3: Contributor Onboarding
1. Click "Contributor Portal" or navigate to `/contributor-login`
2. Sign up with organization and contact details
3. Account created with status: "pending"
4. Wait for moderator approval (see notification on portal)
5. Once approved (status: "approved"), unlock resource/event management

### Workflow 4: Contributor Publishing (Approved)
1. Log in to portal
2. Click "Manage Resources" or "Manage Events"
3. Create new resource/event via dialog form
4. Save as draft (review before publish) OR publish immediately
5. Resource/event appears in public directory with status: "published"
6. Can edit or delete from portal anytime
7. View engagement metrics (views, ratings, likes)
8. See user feedback on ratings

### Workflow 5: Moderation
1. Moderator logs in and navigates to `/portal/moderation`
2. Reviews pending resource/event submissions
3. For each submission:
   - Can view full details
   - Can edit before approving
   - Approve: Creates official record linked to submission
   - Reject: With optional notes sent to submitter
4. Can manually manage published resources/events
5. Can approve pending contributor accounts
6. Can add moderation notes for context

### Workflow 6: User Engagement
1. Browse resources or spotlights
2. View engagement metrics (ratings, likes, favorites, views)
3. Click "Like" button to toggle favorite status
4. Click rating stars to rate (1-5) with reason
5. Engagement persists with user account (or anonymously by device)
6. View updated metrics in real-time

---

## Forms & Data Collection

### Form 1: Resource Suggestion Form (Public Submission)
**Location:** `/suggest` page, resource tab

**Steps:**
1. **Basics (Step 1):**
   - Resource name (required, ≤200 chars, no profanity)
   - Organization name (optional)
   - Category (required, select from 6 approved options)
   - Short description (required, ≤500 chars, no profanity)

2. **Details (Step 2):**
   - Full description (optional, ≤2000 chars, no profanity)
   - Address (required, autocomplete from Google Places)
   - Hours (optional, visual selector or text, no profanity)
   - Website (optional, URL format validation, no placeholder domains)
   - Phone (optional, format validation)
   - Email (optional, format validation)
   - Tags (optional, chip-based input, max validated)
   - Image URL (optional, must be valid URL, no placeholder domains)

3. **Submitter (Step 3):**
   - Submitter name (required, no profanity, ≤200 chars)
   - Submitter email (required, format validation)
   - Submitter connection (optional, how they know the organization)

**Validation Logic:**
- Required field checks
- Profanity filtering on all text fields
- Email/phone/URL format validation
- Max length enforcement
- No placeholder URLs (example.com, localhost)
- Address must autocomplete successfully

**Storage:** Inserted into `resource_submissions` table with status: "pending"

---

### Form 2: Event Suggestion Form (Public Submission)
**Location:** `/suggest` page, event tab

**Steps:**
1. **Basics (Step 1):**
   - Event title (required, ≤200 chars, no profanity)
   - Category (optional, select from suggestions or free text)
   - Short description (required, ≤1000 chars, no profanity)

2. **Details (Step 2):**
   - Location (required, autocomplete from Google Places, no profanity, ≤500 chars)
   - Start date & time (required, date/time input)
   - End date & time (optional)
   - Image URL (optional, URL validation, no placeholder domains)

3. **Submitter (Step 3):**
   - Organizer name (optional)
   - Organizer email (optional, format validation)
   - Organizer phone (optional, format validation)
   - Submitter name (required, no profanity, ≤200 chars)
   - Submitter email (required, format validation)
   - Submitter connection (optional)

**Storage:** Inserted into `event_submissions` table with status: "pending"

---

### Form 3: Contributor Resource Management Form
**Location:** `/portal/resources` page

**Create/Edit Dialog:**
- Name (required, ≤200 chars)
- Category (required, select from 6 options)
- Short description (required, ≤500 chars)
- Full description (optional, ≤2000 chars)
- Address (required, autocomplete)
- Phone, email, website (optional with validation)
- Hours (optional, text input)
- Tags (optional, chip input)
- Image URL (optional, URL validation)
- Status (draft/published for contributors; draft/pending/published/rejected for moderators)
- Spotlight toggle (moderators only)
- Spotlight subtitle (if spotlight enabled)

**Features:**
- All fields include profanity filtering
- Edit existing resources or create new
- Delete with confirmation
- View list with search and status filtering

---

### Form 4: Contributor Event Management Form
**Location:** `/portal/events` page

**Create/Edit Dialog:**
- Title (required, ≤200 chars)
- Category (optional, free text with suggestions)
- Description (optional, ≤1000 chars)
- Location (required, autocomplete from Google)
- Location latitude/longitude (auto-populated)
- Start date/time (required)
- End date/time (optional)
- Image URL (optional)
- Status (draft/published or moderator options)
- Spotlight toggle (moderators)

---

### Form 5: Rating Dialog
**Location:** Appears on resource/event detail pages when user clicks rating stars

**Fields:**
- Star rating selector (1-5 stars)
- Optional reason text area
- Submit button
- Validates:
  - Rating between 1-5
  - Reason required (not empty)

**Features:**
- Prefills with existing user rating if already rated
- Replaces or updates previous rating
- Stores rating reason in database

---

### Form 6: Contributor Sign-Up Form
**Location:** `/contributor-login`, Sign Up tab

**Fields:**
- Organization name (required, no profanity)
- Display name (optional)
- First name (required, no profanity)
- Middle name (optional)
- Last name (required, no profanity)
- Email (required, format validation)
- Phone (required, format validation)
- Password (required)
- Confirm password (required, must match)

**Validation:**
- All text fields: profanity filter, max length
- Email: format validation, no duplicates
- Phone: format validation
- Password: must meet strength requirements, must match confirmation
- On success: Account created with status "pending", awaits moderator approval

---

## Database Schema

### Core Tables

#### 1. `profiles` (User Profiles)
```
- id (UUID, primary key, references auth.users)
- role (enum: 'contributor', 'moderator', 'super_admin')
- status (enum: 'pending', 'approved', 'rejected')
- organization_name (text)
- display_name (text)
- first_name (text)
- middle_name (text)
- last_name (text)
- email (text)
- phone (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. `resources` (Published Resource Listings)
```
- id (UUID, primary key)
- name (text, required)
- category (text, required, validated against 6 categories)
- description (text, required)
- full_description (text)
- address (text, required)
- phone (text)
- email (text)
- website (text, validated no placeholder domains)
- hours (text)
- tags (text[], array of keywords)
- image_url (text, validated no placeholder domains)
- created_by (UUID, references auth.users)
- posted_by_name (text)
- status (enum: 'draft', 'pending', 'published', 'rejected', 'archived')
- is_spotlight (boolean)
- spotlight_subtitle (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. `events` (Published Event Listings)
```
- id (UUID, primary key)
- title (text, required)
- category (text, any value allowed)
- description (text)
- location (text, required)
- location_lat (double precision)
- location_lng (double precision)
- starts_at (timestamp, required)
- ends_at (timestamp)
- image_url (text)
- created_by (UUID)
- posted_by_name (text)
- status (enum: 'draft', 'pending', 'published', 'rejected', 'archived')
- is_spotlight (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. `resource_submissions` (Pending Public Resource Submissions)
```
- id (UUID, primary key)
- resource_name (text, required)
- organization_name (text)
- category (text, required, validated)
- description (text, required)
- full_description (text)
- website (text)
- address (text, required)
- hours (text)
- contact_email (text)
- contact_phone (text)
- tags (text[])
- image_url (text)
- submitter_name (text, required)
- submitter_email (text, required)
- submitter_connection (text)
- status (enum: 'pending', 'approved', 'rejected')
- moderator_notes (text)
- reviewed_by (UUID)
- reviewed_at (timestamp)
- approved_resource_id (UUID, links to created resource)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. `event_submissions` (Pending Public Event Submissions)
```
- id (UUID, primary key)
- title (text, required)
- category (text)
- description (text)
- location (text, required)
- starts_at (timestamp, required)
- ends_at (timestamp)
- image_url (text)
- organizer_name (text)
- organizer_email (text)
- organizer_phone (text)
- submitter_name (text, required)
- submitter_email (text, required)
- submitter_connection (text)
- status (enum: 'pending', 'approved', 'rejected')
- moderator_notes (text)
- reviewed_by (UUID)
- reviewed_at (timestamp)
- approved_event_id (UUID)
- created_at (timestamp)
- updated_at (timestamp)
```

### Engagement Tables

#### 6. `spotlight_ratings`
```
- id (UUID, primary key)
- spotlight_id (UUID, references resources)
- user_id (UUID, references auth.users)
- rating (integer, 1-5)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint: (spotlight_id, user_id)
```

#### 7. `spotlight_likes`
```
- id (UUID, primary key)
- spotlight_id (UUID, references resources)
- user_id (UUID, references auth.users)
- created_at (timestamp)
- UNIQUE constraint: (spotlight_id, user_id)
```

#### 8. `spotlight_comments`
```
- id (UUID, primary key)
- spotlight_id (UUID, references resources)
- user_id (UUID, nullable)
- author_name (varchar(100), required)
- author_email (varchar(255))
- content (text, required)
- parent_id (UUID, self-reference for replies)
- is_approved (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 9. `spotlight_favorites`
```
- id (UUID, primary key)
- spotlight_id (UUID, references resources)
- user_id (UUID, references auth.users)
- created_at (timestamp)
- UNIQUE constraint: (spotlight_id, user_id)
```

#### 10. `spotlight_views`
```
- id (UUID, primary key)
- spotlight_id (UUID, references resources)
- user_id (UUID, nullable)
- ip_address (inet)
- user_agent (text)
- created_at (timestamp)
```

### Database Functions

- `get_spotlight_engagement_stats(spotlight_uuid)` - Returns aggregate stats (avg rating, counts)
- `get_user_spotlight_engagement(user_uuid, spotlight_uuid)` - Returns user's personal engagement
- `is_moderator()` - Security function checking if current user is moderator
- `set_updated_at()` - Trigger function updating updated_at timestamp
- `display_name_for(user_id)` - Function to get appropriate display name for user
- `apply_content_defaults()` - Trigger setting created_by and posted_by_name
- `stamp_submission_review()` - Trigger setting reviewed_by and reviewed_at on status change
- `handle_new_user()` - Trigger creating profile on new auth user signup
- `approve_resource_submission(submission_id)` - Creates resource from submission
- `approve_event_submission(submission_id)` - Creates event from submission

### Row Level Security (RLS) Policies

**Profiles:**
- Anyone can read all profiles
- Users can only update their own

**Resources:**
- Published resources visible to all
- Draft/pending visible only to creator or moderator
- Update/delete by creator or moderator

**Engagement tables:**
- Ratings/Likes/Favorites: Users can only manage their own
- Comments: All can read approved; all can insert; can update/delete own
- Views: All can read and insert

---

## Authentication & Authorization

### Authentication System (Supabase)
- Email/password authentication via Supabase Auth
- Session persistence across page reloads
- Automatic session refresh
- Password reset via email link

### Role-Based Access Control (RBAC)
Three contributor roles:
- **Contributor:** Can create and manage own resources/events (appears in portal)
- **Moderator:** Can approve/reject submissions, manage profiles, edit all content
- **Super Admin:** Full system access

### Account Status Flow
1. **New Signup:** Status = "pending" (awaits moderator review)
2. **Approved:** Status = "approved" (can publish content immediately)
3. **Rejected:** Status = "rejected" (locked out of portal)

### Route Guards
- `RequireAuth` - User must be logged in
- `RequireApproved` - User must have status = "approved" OR be moderator
- `RequireModerator` - User role must be "moderator" or "super_admin"

### AuthProvider Context
- Session management
- Profile loading (organization, role, status)
- Session refresh on auth state changes
- Provides: `{ session, user, profile, role, loading, refreshProfile }`

---

## Contributor/Admin Functionalities

### Contributor (Approved) Powers

1. **Resource Management:**
   - Create new resource listings
   - Edit/update own resources
   - Delete own resources
   - Save as draft before publishing
   - Publish immediately
   - Cannot: Change status to "pending" or "rejected" or "archived"

2. **Event Management:**
   - Create event listings
   - Edit/update own events
   - Delete own events
   - Draft and publish workflow
   - Cannot: Manually change advanced statuses

3. **View Management:**
   - See personal dashboard with all created resources/events
   - View engagement metrics (views, ratings, likes, favorites)
   - See feedback from users on ratings
   - Search and filter own submissions

4. **No Moderation Access:**
   - Cannot approve/reject other submissions
   - Cannot manage other contributors
   - Cannot view public submissions queue

### Moderator Powers

1. **Submission Review Queue:**
   - View all pending resource submissions
   - View all pending event submissions
   - Approve submission → creates official resource/event record linked to submission
   - Reject submission → keeps pending, adds moderator notes
   - Edit submission details before approving
   - Delete submission
   - Add moderator notes (visible to admins)
   - Search/filter by name or status

2. **Content Management:**
   - View all published resources
   - Edit any resource (including status changes)
   - Delete any resource
   - Mark any resource as spotlight
   - View all published events
   - Edit any event
   - Delete any event

3. **Contributor Profile Review:**
   - View pending profile approvals
   - Approve contributor account → status = "approved"
   - Reject contributor account → status = "rejected"
   - Add rejection notes
   - View all profiles (search/view details)

4. **Status Transitions:**
   - Can set resources/events to: draft, pending, published, rejected
   - Public submissions always start pending
   - Moderator approval transitions to published
   - Moderator rejection stays pending with notes

5. **Engagement Data:**
   - View all engagement metrics (ratings, likes, comments)
   - View rating reasons/feedback
   - Can moderate comments if needed
   - See user engagement statistics

### Super Admin Powers
- All moderator powers
- All role management
- System settings (if implemented)
- Database-level access

---

## Engagement Features

### Engagement Types & User Interactions

#### 1. **Ratings System**
- **Scale:** 1-5 stars
- **Requirement:** User must provide reason/feedback
- **Storage:** One rating per user per resource (replaceable)
- **Display:** Average rating + total count visible on resource cards and detail pages
- **UI Components:** RatingComponent with star selector and reason dialog
- **Feedback:** User reasons stored and viewable by moderators

#### 2. **Likes/Hearts**
- **Functionality:** Toggle like/unlike on resources
- **Storage:** One like per user per resource
- **Display:** Total count on engagement buttons
- **UI Components:** EngagementButtons with heart icon
- **State:** Shows "liked" state with filled heart

#### 3. **Favorites**
- **Functionality:** Save resources to personal favorites list
- **Storage:** One favorite per user per resource (same table as likes in some contexts)
- **Display:** Toggleable from resource detail pages
- **Persistence:** Associated with user account

#### 4. **View Counts**
- **Tracking:** Increments when user lands on resource detail page
- **Storage:** Records user_id (anonymous if not logged in), IP, user agent, timestamp
- **Display:** Total views shown in engagement stats
- **Purpose:** Popular resource ranking

#### 5. **Comments** (Prepared but not fully featured in public UI)
- **Support:** Database structure ready for nested comments
- **Fields:** Author name, email, content, parent_id for replies
- **Moderation:** is_approved flag for admin review
- **Not Yet:** UI for comment display/submission in public pages

### Engagement Data Collection
- **Anonymous tracking:** IP and user agent for unauthenticated users
- **Authenticated tracking:** User ID stored with engagement actions
- **Automatic:** View count increments when resource page loads
- **Manual:** Ratings and likes require explicit user action
- **Real-time:** Engagement metrics refresh when user submits rating/like

### Engagement Display
- Spotlights page shows engagement metrics prominently
- Resource detail pages show full engagement summary
- Directory cards show ratings and engagement counts
- Engagement buttons in compact or expanded layouts

---

## Component Organization

### Directory Structure

#### `/src/app/components/`

**Top-level Components:**
- `BreadcrumbNav.tsx` - Breadcrumb navigation trail
- `ScrollReveal.tsx` - Scroll-triggered animations (StaggerGroup, StaggerItem)
- `TopoPattern.tsx` - Decorative topographic background pattern

**`/engagement/` - User Engagement Components:**
- `RatingComponent.tsx` - 1-5 star rating selector with reason dialog
- `EngagementButtons.tsx` - Like/heart button with count display
- `CommentComponent.tsx` - Comment display and submission (prepared)

**`/forms/` - Form Input Components:**
- `AddressAutocompleteInput.tsx` - Google Places address autocomplete
- `CategoryPicker.tsx` - Category select with visual indicators
- `ResourceHoursSelector.tsx` - Visual time/hours selector
- `TagChipInput.tsx` - Chip-based tag input with validation

**`/home/` - Home Page Sections:**
- `HeroSection.tsx` - Hero banner with CTA
- `ResourcesSection.tsx` - Featured resources grid
- `SpotlightSection.tsx` - Spotlight resources carousel/grid
- `TestimonialsSection.tsx` - User testimonials section
- `EmailSignupSection.tsx` - Email newsletter signup

**`/portal/` - Portal Components:**
- `PortalShell.tsx` - Layout wrapper for portal pages

**`/ui/` - Reusable UI Components:**
- `button.tsx` - Button component (shadcn)
- `card.tsx` - Card component
- `dialog.tsx` - Modal dialog component
- `input.tsx` - Input field component
- `label.tsx` - Form label component
- `textarea.tsx` - Text area component
- `tabs.tsx` - Tab panel component
- `accordion.tsx` - Accordion/collapse component
- `skeleton.tsx` - Loading skeletons for various layouts
- `image-with-fallback.tsx` - Image with fallback handling
- `tooltip.tsx` - Tooltip component

### Key Type Definitions

**`/src/app/types/`**
- `portal.ts` - Resource, Event, Profile, Submission record types
- `engagement.ts` - Rating, Like, Comment, Favorite, View types
- `home.ts` - ResourceItem, EventItem, DirectoryEntry, SpotlightItem types

### Utility Functions

**`/src/utils/`**
- `supabase.ts` - Supabase client initialization
- `engagementSupabase.ts` - Engagement operations (rating, like, favorite)
- `validation.ts` - Form validation functions
- `profanityFilter.ts` - Profanity detection
- `googleMaps.ts` - Google Maps integration and distance calculations
- `imageProxy.ts` - Image proxy helper
- `confetti.ts` - Celebration animation on success
- `seo.ts` - SEO metadata
- `accessibility.ts` - Accessibility utilities

### Constants

**`/src/app/constants/`**
- `resourceCategories.ts` - 6 resource categories with icons, styling, descriptions
- `eventCategorySuggestions.ts` - 10 suggested event categories (UI guidance only)

### API Integration Layer

**`/src/app/data/portalApi.ts`**
- `listPublishedResources()` - Get all published resources
- `listPublishedEvents()` - Get all published events
- `getPublishedResourceById(id)` - Get single resource
- `getPublishedEventById(id)` - Get single event
- `listSpotlightItems()` - Get featured spotlights
- `listDirectoryResourcesPage(query, filters, page)` - Paginated directory search
- `createPublicResourceSubmission(payload)` - Submit public resource suggestion
- `createPublicEventSubmission(payload)` - Submit public event suggestion
- `createResource(payload)` - Contributor creates resource
- `createEvent(payload)` - Contributor creates event
- `updateResource(id, payload)` - Contributor/moderator updates resource
- `updateEvent(id, payload)` - Contributor/moderator updates event
- `deleteResource(id)` - Delete resource
- `deleteEvent(id)` - Delete event
- `listPortalResources(filter)` - List resources for logged-in user
- `listPortalEvents(filter)` - List events for logged-in user
- `listPendingResourceSubmissions()` - Moderator view
- `listPendingEventSubmissions()` - Moderator view
- `approveResourceSubmission(id, notes)` - Moderator action
- `approveEventSubmission(id, notes)` - Moderator action
- `rejectResourceSubmission(id, notes)` - Moderator action
- `rejectEventSubmission(id, notes)` - Moderator action
- `listPendingProfiles()` - Moderator view of pending contributors
- `updateProfileStatus(id, status)` - Moderator approve/reject contributors
- Plus many more...

---

## Key Features Summary

### Public Features
- ✅ Full-text search directory with advanced filters
- ✅ Map-based event discovery with distance calculations
- ✅ Calendar view for events
- ✅ Spotlights page for featured resources
- ✅ User engagement (ratings, likes, view tracking)
- ✅ Public suggestion forms (moderation queue)
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.2 compliance)

### Contributor Features
- ✅ Multi-step resource/event creation forms
- ✅ Draft & publish workflow
- ✅ Management dashboard with search/filter
- ✅ Engagement metrics visibility
- ✅ User feedback on ratings
- ✅ Edit/delete own content

### Moderator Features
- ✅ Submission review queue (approve/reject/notes)
- ✅ Contributor account approval workflow
- ✅ Full content management (edit/delete/status)
- ✅ Spotlight management
- ✅ Engagement data viewing
- ✅ Moderator notes for records

### System Features
- ✅ Dual-trust publishing model
- ✅ Role-based access control
- ✅ Form validation and profanity filtering
- ✅ Google Places integration
- ✅ Google Maps integration with routing
- ✅ Email validation and password reset
- ✅ Lighthouse optimization (animations, performance)
- ✅ Row-level security in database
- ✅ Image fallback handling
- ✅ Timezone-aware date handling

---

## Color Scheme & Design System

### Core Colors
- **Primary Dark:** #334233 (forest green)
- **Primary Light:** #F6F1E7 (cream/off-white)
- **Accent:** #B36A4C (warm rust/terracotta)
- **Secondary:** #5B473A (dark brown), #6F7553 (sage green), #A7AE8A (muted green)
- **Neutral:** #E7D9C3 (light tan), #C2B99E (medium tan)

### Typography
- **Serif:** Cormorant Garamond (headings)
- **Sans:** Public Sans (body text)

### Category-Specific Badge Colors
- Food Assistance: Sage green (#A7AE8A)
- Health & Wellness: Rust (#B36A4C)
- Housing Support: Forest green (#334233)
- Youth Programs: Cream (#E7D9C3)
- Job Help: Sage gray (#6F7553)
- Community Events: Cream (#F6F1E7)

---

## Integration Points & External Services

1. **Google Maps API** - Event location mapping, distance calculations, address autocomplete
2. **Google Places API** - Address autocomplete for resources/events
3. **Google Fonts** - Cormorant Garamond, Public Sans
4. **Supabase** - PostgreSQL database, authentication, real-time subscriptions
5. **Cloudinary** (implied) - Image hosting and optimization
6. **Unsplash** - Sample images in seed data
7. **Sonner** - Toast notifications
8. **Date-fns** - Date manipulation and formatting
9. **Framer Motion** - Smooth animations and transitions

---

## Performance & Optimization

- **Lazy Loading:** Components lazy-loaded via ScrollReveal animations
- **Image Optimization:** ImageWithFallback component prevents broken images
- **Pagination:** Large lists paginated (8-12 items per page)
- **Search Optimization:** Debounced search with efficient filtering
- **Database Indexing:** Indexes on frequently queried columns
- **RLS Policies:** Security at database level (not just frontend)
- **Skeleton Loading:** Visual feedback while loading data
- **Confetti Animation:** requestAnimationFrame for smooth animation

---

## Accessibility Features

- **WCAG 2.2 Compliance:** Referenced in development
- **Semantic HTML:** Proper heading structure, landmarks
- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Focus Management:** Visible focus indicators
- **ARIA Labels:** Buttons and interactive controls have proper labels
- **Color Contrast:** Sufficient contrast ratios
- **Alternative Text:** Images have fallback handling
- **Reduced Motion:** Respects `prefers-reduced-motion` preference

---

## This Document was Generated by Comprehensive Workspace Exploration

Explore complete file listings in the workspace for more details on any specific component, utility, or feature.
