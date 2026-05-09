# Roots & Routes: Bothell — Complete Documentation

> **Last Updated:** April 2026  
> **Version:** 0.0.1  
> **License:** Private  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment & Configuration](#4-environment--configuration)
5. [Routing & Page Map](#5-routing--page-map)
6. [Design System](#6-design-system)
7. [Page-by-Page Breakdown](#7-page-by-page-breakdown)
8. [Component Library](#8-component-library)
9. [Data Layer & API](#9-data-layer--api)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Database Schema](#11-database-schema)
12. [Engagement System](#12-engagement-system)
13. [Input Validation & Profanity Filter](#13-input-validation--profanity-filter)
14. [Google Maps Integration](#14-google-maps-integration)
15. [Deployment](#15-deployment)
16. [Supabase SQL Scripts](#16-supabase-sql-scripts)

---

## 1. Project Overview

**Roots & Routes: Bothell** is a community resource hub web application designed for the city of Bothell, Washington. It serves as a single front door for local residents to discover community resources (food assistance, health clinics, housing support, youth programs, job help, and community events), browse upcoming events, view spotlights on featured programs, and submit new resources or events for inclusion.

### Core Mission
> *Connecting Bothell through paths of support, opportunity, and shared growth.*

### Key Capabilities
- **Public-facing directory** of verified community resources with search, category filtering, rating, and pagination
- **Events listing** with list/map views, ZIP-code-based proximity search, Google Maps integration, and calendar export (.ics)
- **Interactive calendar** with inline event display on each day cell
- **Spotlights** section featuring in-depth community program write-ups with engagement (likes, ratings, comments)
- **Public suggestion form** — any visitor can propose a resource or event (goes to moderator review)
- **Contributor portal** — approved organizations can create and publish resources/events directly
- **Moderation dashboard** — moderators review public submissions, approve contributor accounts, and manage all content
- **Engagement features** — ratings (1–5 with reason), likes, comments, view tracking
- **Input validation** — email, phone, URL, ZIP code, required fields, max-length, and profanity filtering across all forms

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 18.3.1 |
| **Routing** | React Router | 7.13.0 |
| **Build Tool** | Vite | 6.3.5 |
| **Styling** | Tailwind CSS | 4.1.12 |
| **UI Components** | Radix UI + shadcn/ui | Various |
| **Animation** | Framer Motion (motion) | 12.23.24 |
| **Icons** | Lucide React | 0.487.0 |
| **Backend / BaaS** | Supabase | ^2.99.2 |
| **Maps** | @react-google-maps/api | ^2.20.8 |
| **Date Utilities** | date-fns | 3.6.0 |
| **Charts** | Recharts | 2.15.2 |
| **Form Utilities** | react-hook-form | 7.55.0 |
| **Profanity Filter** | profanity-filter | ^0.2.1 |
| **Confetti** | canvas-confetti | 1.9.4 |
| **Analytics** | Vercel Analytics | ^2.0.1 |
| **Deployment** | Vercel | — |
| **Language** | TypeScript | — |

### Dev Dependencies
- `@tailwindcss/vite` 4.1.12
- `@types/google.maps` ^3.58.1
- `@types/react` ^18.3.28
- `@types/react-dom` ^18.3.7
- `@vitejs/plugin-react` 4.7.0

---

## 3. Project Structure

```
roots-and-routes/
├── .env.local                    # Supabase + Google Maps API keys
├── .gitignore
├── index.html                    # SPA entry point
├── package.json
├── postcss.config.mjs
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts                # Vite config with Tailwind + React plugins, Unsplash proxy
├── vercel.json                   # SPA rewrite rule for Vercel deployment
├── public/                       # Static assets (PDFs, favicon, etc.)
│   └── StudentCopyrightChecklist.pdf
│   └── StudentWorklog.pdf
├── database/
│   ├── engagement-schema.sql     # Engagement tables (ratings, likes, comments, views)
│   └── engagement-schema-fixed.sql
├── docs/
│   ├── anonymous-engagement-migration-2026-03-24.md
│   ├── dual-trust-submission-model-2026-03-24.md
│   └── resource-curation-report-2026-03-24.md
├── supabase/
│   ├── simple_schema.sql         # Complete DB schema (tables, functions, triggers, RLS)
│   ├── seed.sql                  # Base seed data
│   ├── bothell_seed_data.sql     # Bothell-specific seed data
│   ├── import_generated_data.sql # Bulk data import script
│   ├── add_*.sql                 # Migration scripts (waypoints, coordinates, profile status, etc.)
│   ├── anonymous_engagement_runbook.sql
│   ├── resources_curation_runbook.sql
│   ├── rebalance_resource_ratings_v3.sql
│   └── ... (other migration/maintenance scripts)
└── src/
    ├── main.tsx                  # React DOM mount point
    ├── vite-env.d.ts             # Vite type declarations
    ├── styles/
    │   ├── fonts.css             # Google Fonts imports (Cormorant Garamond, Public Sans)
    │   ├── index.css             # Global CSS entry
    │   ├── tailwind.css          # Tailwind directives
    │   └── theme.css             # CSS custom properties / shadcn theme tokens
    ├── utils/
    │   ├── supabase.ts           # Supabase client initialization
    │   ├── googleMaps.ts         # Google Maps API key + loader config
    │   ├── validation.ts         # Input validation utilities
    │   ├── profanityFilter.ts    # Profanity detection/cleaning
    │   ├── engagement.ts         # Client-side engagement (localStorage fallback)
    │   └── engagementSupabase.ts # Supabase-backed engagement (production)
    └── app/
        ├── App.tsx               # Root component (AuthProvider + RouterProvider + Analytics)
        ├── Layout.tsx            # Global layout (header, nav, footer, scroll-to-top)
        ├── routes.tsx            # Route definitions with auth guards
        ├── auth/
        │   ├── AuthProvider.tsx  # Auth context (session, profile, role)
        │   └── RouteGuards.tsx   # RequireAuth, RequireApproved, RequireModerator
        ├── constants/
        │   ├── resourceCategories.ts     # 6 resource categories + metadata (icons, colors)
        │   └── eventCategorySuggestions.ts  # 10 event category suggestions
        ├── types/
        │   ├── home.ts           # DirectoryEntry, SpotlightItem, EventItem, etc.
        │   ├── portal.ts         # ContributorProfile, ResourceRecord, EventRecord, submission types
        │   └── engagement.ts     # Comment, Rating, Like, Favorite, View, engagement stats
        ├── data/
        │   ├── homeData.ts       # Static/seed data for homepage sections
        │   └── portalApi.ts      # All Supabase API calls (auth, CRUD, submissions, moderation)
        ├── components/
        │   ├── home/             # Homepage section components (8 files)
        │   ├── engagement/       # RatingComponent, EngagementButtons, CommentComponent
        │   ├── forms/            # AddressAutocompleteInput, CategoryPicker, ResourceHoursSelector, TagChipInput
        │   ├── portal/           # PortalShell (portal layout wrapper)
        │   ├── ui/               # 49 shadcn/ui primitive components
        │   ├── ScrollReveal.tsx  # Intersection Observer scroll animation
        │   └── TopoPattern.tsx   # SVG topographic pattern background
        └── pages/                # 18 page components (see below)
```

---

## 4. Environment & Configuration

### Required Environment Variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key (Places library enabled) |

### Vite Configuration (`vite.config.ts`)
- **Plugins:** `@vitejs/plugin-react`, `@tailwindcss/vite`
- **Path alias:** `@` → `./src`
- **Proxy:** `/images.unsplash.com` → `https://images.unsplash.com` (CORS workaround)
- **Asset includes:** `.svg`, `.csv`

### Vercel Configuration (`vercel.json`)
- Single rewrite rule: all routes → `index.html` (SPA client-side routing)

---

## 5. Routing & Page Map

Defined in `src/app/routes.tsx` using `createBrowserRouter`.

### Public Routes

| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page with hero, resources, spotlights, testimonials, email signup |
| `/directory` | `Directory` | Resource hub with search, category filter, rating filter, pagination (8/page) |
| `/resources` | `ResourcesRedirect` | Redirects to `/directory` (preserves query params) |
| `/resources/:resourceId` | `ResourceDetail` | Full resource detail page with engagement |
| `/spotlights` | `Spotlights` | Featured community programs with engagement |
| `/events` | `Events` | Event listings with list/map view, ZIP search, pagination (3/page) |
| `/events/:eventId` | `EventDetail` | Full event detail page |
| `/calendar` | `Calendar` | Interactive monthly calendar with inline events |
| `/suggest` | `Suggest` | Public resource/event submission form (no auth required) |
| `/about` | `About` | Mission, values, impact metrics, how-it-works |
| `/reference` | `Reference` | Sources, citations, copyright checklist, development references |
| `/contributor-login` | `ContributorLogin` | Sign in / sign up / forgot password |
| `/reset-password` | `ResetPassword` | Password reset form (post-email-link) |

### Protected Routes

| Path | Component | Guard | Description |
|---|---|---|---|
| `/portal` | `Portal` | `RequireAuth` | Portal overview (status, account info, how-it-works) |
| `/portal/resources` | `PortalResources` | `RequireAuth` + `RequireApproved` | CRUD for contributor's resources |
| `/portal/events` | `PortalEvents` | `RequireAuth` + `RequireApproved` | CRUD for contributor's events |
| `/portal/moderation` | `PortalModeration` | `RequireAuth` + `RequireModerator` | Moderation dashboard (submissions, profiles, content) |

---

## 6. Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary Background | `#F6F1E7` | Page background, warm cream |
| Primary Text | `#334233` | Headings, body text (dark forest green) |
| Accent / CTA | `#B36A4C` | Buttons, highlights, links (terracotta) |
| Secondary Text | `#5B473A` | Body copy, descriptions (warm brown) |
| Muted / Sage | `#6F7553` | Subtle text, borders (olive green) |
| Light Accent | `#A7AE8A` | Icons, muted elements (sage green) |
| Warm Neutral | `#E7D9C3` | Borders, card backgrounds, dividers |
| Dark Section BG | `#334233` | Footer, dark hero sections |
| Dark Section Text | `#F6F1E7` | Text on dark sections |

### Typography
- **Headings:** `Cormorant Garamond` (serif) — elegant, editorial feel
- **Body / UI:** `Public Sans` (sans-serif) — clean, readable
- Loaded via Google Fonts in `src/styles/fonts.css`

### UI Component Library
- **49 shadcn/ui components** in `src/app/components/ui/` — Radix UI primitives styled with Tailwind + CVA
- Includes: Button, Card, Dialog, Input, Label, Textarea, Tabs, Badge, Avatar, Accordion, Alert, Checkbox, Dropdown, Popover, Select, Slider, Switch, Table, Toast (Sonner), Tooltip, etc.
- Custom components: `ImageWithFallback`, `ScrollReveal`, `StaggerGroup`, `StaggerItem`, `TopoPattern`

### Animations
- **Scroll reveal:** `ScrollReveal` / `StaggerGroup` / `StaggerItem` — IntersectionObserver-based fade-in on scroll
- **Page transitions:** Framer Motion (`motion/react`) for card hover effects, spotlight animations
- **Smooth scroll:** `window.scrollTo({ behavior: 'smooth' })` on page mount

---

## 7. Page-by-Page Breakdown

### 7.1 Home (`/`)
Composed of 5 section components:

| Section | Component | Content |
|---|---|---|
| Hero | `HeroSection` | Tagline, CTA buttons (Explore Directory, View Events), background image |
| Resources | `ResourcesSection` | 6 resource category cards (Food, Health, Housing, Youth, Jobs, Events) with icons |
| Find Your Path | `FindPathSection` | 3-step process (Explore → Find → Connect) with "Start Your Search" → `/directory` |
| Suggest Resource | `SuggestResourceSection` | CTA to submit a resource → `/suggest` |
| Spotlights | `SpotlightSection` | Featured spotlight card from Supabase data |
| Events | `EventsSection` | Up to 5 upcoming events from Supabase |
| Testimonials | `TestimonialsSection` | 5 community testimonials with CC0-licensed portraits |
| Email Signup | `EmailSignupSection` | Mailing list signup form (anchor `#mailing-list`) |

### 7.2 Directory (`/directory`)
- **Search:** Text query with deferred value for performance
- **Filters:** Category (6 options), minimum rating (1–5), expandable filter panel
- **Pagination:** 8 resources per page, server-side via `list_directory_resources_page` RPC
- **Resource cards:** Image, name, category badge, description (truncated), tags, engagement (rating + likes)
- **Click-through:** Links to `/resources/:resourceId` for full detail
- **Sticky filter bar** on scroll

### 7.3 Resource Detail (`/resources/:resourceId`)
- Full resource info: name, category, description, full description, address, phone, email, website, hours, tags, image
- **Engagement widgets:** Rating (1–5 with reason), like button, view count
- Back navigation to directory
- Loads from Supabase via `getPublishedResourceById`

### 7.4 Spotlights (`/spotlights`)
- **Featured spotlight:** First item displayed prominently with full image
- **Category filter:** Filter by spotlight category
- **Engagement:** Ratings, likes, view tracking per spotlight
- Data sourced from `listSpotlightItems()` (resources with `is_spotlight = true`, fallback to newest published)

### 7.5 Events (`/events`)
- **View modes:** List view and Map view (toggle)
- **List view:** Paginated (3 per page), event cards with image, date, time, location, category
- **Map view:** Google Maps with markers for events with coordinates, InfoWindows on click
- **ZIP code search:** Enter ZIP + radius (5/10/25/50 mi) to filter by proximity (Haversine distance)
- **Calendar export:** Download .ics file or Google Calendar link per event
- **Category filter:** Dropdown with 10 event category suggestions
- Data from `listPublishedEvents()`

### 7.6 Event Detail (`/events/:eventId`)
- Full event info: title, category, description, location, start/end time, image
- Back navigation to events page
- Loads from `getPublishedEventById`

### 7.7 Calendar (`/calendar`)
- **Full-width monthly calendar grid** with large cells (min-h-110px)
- **Inline event display:** Up to 3 events shown per day cell with time + title; "+X more" overflow indicator
- **Month navigation:** Previous/Next month buttons
- **Selected date panel:** Click a day to see full event list for that date
- **Date parsing:** Handles `startsAt` ISO timestamps and display date formats (MMM d, MMM d yyyy, etc.)
- Smooth scroll-to-top on mount

### 7.8 Suggest (`/suggest`)
- **Dual-form:** Toggle between Resource and Event submission
- **No auth required** — public submissions go to `resource_submissions` / `event_submissions` tables
- **Resource form fields:** Resource name, organization, category (picker), description, full description, address (autocomplete), hours (selector), website, contact email/phone, tags (chip input), image URL, submitter info
- **Event form fields:** Title, category, description, location, start/end datetime, image URL, organizer info, submitter info
- **Validation:** Required fields, email/phone/URL format, max-length, profanity check
- **Success state:** Confetti animation + confirmation message

### 7.9 About (`/about`)
- **Hero section:** Dark background with topographic pattern, mission statement
- **TSA Compliance Statement:** Notes no pre-built template was used
- **Values:** 3 cards (Community First, Open & Inclusive, Practical Impact)
- **Impact metrics:** Animated CountUp numbers (27 resources, 150 community members reached)
- **How it works:** 3-step explanation (Gather → Review → Share)
- **CTA:** Explore Directory + Submit buttons

### 7.10 Reference (`/reference`)
- **Hero image:** Bothell Way (Wikimedia Commons)
- **Copyright checklist:** Embedded Google Drive preview + download link
- **Work log:** Embedded Google Drive preview + download link
- **Image attributions:** Gallery of Wikimedia/Unsplash images with license info
- **Development sources:** React, Vite, Tailwind, Supabase, React Router, Google Maps, WCAG docs
- **License sources:** Wikimedia Commons, Unsplash, shadcn/ui, Google Fonts
- **Research sources:** WCAG, WAI-ARIA, MDN, web.dev, City of Bothell links
- **Live data counts:** Fetched from Supabase (published resources + events counts)

### 7.11 Contributor Login (`/contributor-login`)
- **3 modes:** Sign In, Sign Up, Forgot Password
- **Sign In:** Email + password
- **Sign Up:** Organization name, display name, first/middle/last name, email, phone, password + confirm
- **Forgot Password:** Email input → sends reset link via Supabase
- **Validation:** Required fields, email format, phone format, max-length, profanity on name fields
- **Post-login redirect:** Returns to `location.state.from` or `/portal`

### 7.12 Reset Password (`/reset-password`)
- Accessed via email reset link from Supabase
- New password + confirm password (min 8 chars, must match)
- Calls `updateContributorPassword`

### 7.13 Portal (`/portal`) — Auth Required
- **Account status display:** Pending / Approved / Rejected with colored indicators
- **Cards:** Resources (→ `/portal/resources`), Events (→ `/portal/events`), Moderation (moderators only → `/portal/moderation`)
- **How publishing works:** Explains dual-trust model (contributors, public, moderators)
- **Account info:** Organization, status, contact name, role

### 7.14 Portal Resources (`/portal/resources`) — Approved Contributors
- **CRUD interface:** Create, edit, delete resources
- **Status management:** Draft → Published workflow; contributors can only set draft or published
- **Form fields:** Name, category, description, full description, address (autocomplete), phone, email, website, hours, tags, image URL, spotlight toggle + subtitle
- **Validation:** Required fields, format checks, max-length, profanity
- **Contributor scope:** Contributors see only their own; moderators see all

### 7.15 Portal Events (`/portal/events`) — Approved Contributors
- **CRUD interface:** Create, edit, delete events
- **Form fields:** Title, category, description, location, start/end datetime, image URL, spotlight toggle
- **Validation:** Required fields, format checks, max-length, profanity
- **Contributor scope:** Same as resources

### 7.16 Portal Moderation (`/portal/moderation`) — Moderators Only
- **Tabbed interface:** Resource Submissions | Event Submissions | Resources | Events | Contributor Accounts
- **Submissions:** Approve or reject with optional moderator notes; approve creates published resource/event via RPC
- **Content management:** Search, filter by status, publish/unpublish/delete resources and events
- **Account approvals:** Approve or reject pending contributor accounts
- **Pagination:** 12 items per page per tab

---

## 8. Component Library

### Home Section Components (`src/app/components/home/`)

| Component | Purpose |
|---|---|
| `HeroSection` | Landing hero with tagline, CTAs, background image |
| `ResourcesSection` | 6 category cards with icons and descriptions |
| `FindPathSection` | 3-step "Find Your Path" process with Link to `/directory` |
| `SuggestResourceSection` | CTA card linking to `/suggest` |
| `SpotlightSection` | Featured spotlight card |
| `EventsSection` | Up to 5 upcoming events |
| `TestimonialsSection` | 5 testimonial cards with portraits |
| `EmailSignupSection` | Mailing list email input form |

### Engagement Components (`src/app/components/engagement/`)

| Component | Purpose |
|---|---|
| `RatingComponent` | 1–5 star rating with required reason text, shows average + count |
| `EngagementButtons` | Like button + favorite button (favorites currently disabled in Supabase backend) |
| `CommentComponent` | Comment list + add comment form, threaded replies support |

### Form Components (`src/app/components/forms/`)

| Component | Purpose |
|---|---|
| `AddressAutocompleteInput` | Google Places autocomplete for address fields, extracts lat/lng |
| `CategoryPicker` | Visual category selector with icons and color-coded badges |
| `ResourceHoursSelector` | Day-of-week hours input with open/close times |
| `TagChipInput` | Tag input with chip display, comma-separated entry |

### Portal Components (`src/app/components/portal/`)

| Component | Purpose |
|---|---|
| `PortalShell` | Shared portal layout wrapper (title, description, back link, sign-out) |

### Utility Components

| Component | Purpose |
|---|---|
| `ScrollReveal` | IntersectionObserver-based fade-in animation wrapper |
| `StaggerGroup` / `StaggerItem` | Staggered reveal for groups of elements |
| `TopoPattern` | SVG topographic contour pattern for decorative backgrounds |
| `ImageWithFallback` | Image with fallback placeholder on error |

### shadcn/ui Components (49 files in `src/app/components/ui/`)
Full set of Radix UI primitives styled with Tailwind CSS and class-variance-authority (CVA). Includes: Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Combobox, Command, ContextMenu, DatePicker, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, Label, Menubar, NavigationMenu, NumberInput, OTP Input, Pagination, PasswordInput, PhoneInput, Popover, Progress, RadioGroup, Resizable, ScrollArea, Search, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner (toast), Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip.

---

## 9. Data Layer & API

### API Module (`src/app/data/portalApi.ts`)

All backend communication goes through this module using the Supabase JS client.

#### Authentication Functions
| Function | Description |
|---|---|
| `signInContributor(email, password)` | Sign in with email/password |
| `signUpContributor(input)` | Register new contributor (creates auth user + profile via trigger) |
| `sendContributorPasswordReset(email)` | Send password reset email |
| `updateContributorPassword(password)` | Update password (after reset) |
| `signOutContributor()` | Sign out |
| `getFriendlyAuthError(error)` | Map Supabase auth errors to user-friendly messages |

#### Public Read Functions
| Function | Description |
|---|---|
| `listPublishedResources()` | All published resources (ordered by updated_at desc) |
| `listDirectoryResourcesPage(params)` | Paginated directory with search, category, rating filter (RPC) |
| `getPublishedResourceById(id)` | Single published resource by ID |
| `listPublishedEvents()` | All published events (ordered by starts_at asc) |
| `getPublishedEventById(id)` | Single published event by ID |
| `listSpotlightItems()` | Resources with `is_spotlight = true` (fallback: newest 12) |

#### Portal CRUD Functions
| Function | Description |
|---|---|
| `createResource(payload)` | Insert new resource |
| `updateResource(id, payload)` | Update existing resource |
| `deleteResource(id)` | Delete resource |
| `createEvent(payload)` | Insert new event |
| `updateEvent(id, payload)` | Update existing event |
| `deleteEvent(id)` | Delete event |

#### Submission Functions
| Function | Description |
|---|---|
| `createPublicResourceSubmission(payload)` | Public resource suggestion → `resource_submissions` |
| `createPublicEventSubmission(payload)` | Public event suggestion → `event_submissions` |
| `listPendingResourceSubmissions()` | Pending resource submissions (moderator) |
| `listPendingEventSubmissions()` | Pending event submissions (moderator) |
| `approveResourceSubmission(id)` | Approve via RPC → creates published resource |
| `approveEventSubmission(id)` | Approve via RPC → creates published event |
| `rejectResourceSubmission(id, notes?)` | Reject with optional notes |
| `rejectEventSubmission(id, notes?)` | Reject with optional notes |

#### Moderation Functions
| Function | Description |
|---|---|
| `listPortalResources(role, userId)` | Contributor's own or all (moderator) resources |
| `listPortalEvents(role, userId)` | Contributor's own or all (moderator) events |
| `listModerationResources()` | All resources for moderation |
| `listModerationEvents()` | All events for moderation |
| `listPendingProfiles()` | Pending contributor accounts |
| `updateProfileStatus(userId, status)` | Approve/reject contributor account |
| `listResourceRatingFeedback(id)` | Rating reasons for a resource |

#### Utility Functions
| Function | Description |
|---|---|
| `isModerator(role)` | Check if role is moderator or super_admin |
| `mapResourceToDirectoryEntry(resource)` | Map `ResourceRecord` → `DirectoryEntry` |
| `mapEventToEventItem(event)` | Map `EventRecord` → `EventItem` (with display date formatting) |
| `mapResourceRecordToPayload(resource)` | Map record → payload for update |
| `mapEventRecordToPayload(event)` | Map record → payload for update |

#### Website Overrides
Specific resources have their website URLs overridden client-side for accuracy:
- Bothell Community Farmers Market → `beginatbothell.com`
- Northshore Housing Stability Fund → `bothellwa.gov`
- Bothell Landing Park → `bothellwa.gov`

---

## 10. Authentication & Authorization

### Auth Provider (`src/app/auth/AuthProvider.tsx`)
- React Context providing: `session`, `user`, `profile`, `role`, `loading`, `refreshProfile`
- On mount: fetches existing session + profile from Supabase
- Subscribes to `onAuthStateChange` for real-time session updates
- Profile loaded from `profiles` table via `getProfile(userId)`

### Route Guards (`src/app/auth/RouteGuards.tsx`)

| Guard | Logic |
|---|---|
| `RequireAuth` | Redirects to `/contributor-login` if no session |
| `RequireApproved` | Redirects to `/portal` if profile status ≠ "approved" (moderators bypass) |
| `RequireModerator` | Redirects to `/portal` if role ≠ moderator/super_admin |

### Role Hierarchy

| Role | Capabilities |
|---|---|
| `contributor` | Create/edit own resources & events (draft/published only), view portal |
| `moderator` | All contributor capabilities + moderation dashboard, review submissions, approve accounts |
| `super_admin` | Same as moderator (elevated access for future use) |

### Account Lifecycle
1. User signs up → auth user created → `handle_new_user()` trigger creates profile with `status = 'pending'`
2. Moderator approves → `status = 'approved'` → contributor can publish
3. Moderator rejects → `status = 'rejected'` → contributor locked out of publishing

---

## 11. Database Schema

### Core Tables

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | References `auth.users.id`, cascade delete |
| role | `contributor_role` | Enum: contributor, moderator, super_admin |
| status | text | Check: pending, approved, rejected |
| organization_name | text | Nullable |
| display_name | text | Nullable |
| first_name | text | Nullable |
| middle_name | text | Nullable |
| last_name | text | Nullable |
| email | text | Nullable |
| phone | text | Nullable |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Auto-updated via trigger |

#### `resources`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| name | text | Not null |
| category | text | Check constraint: 6 valid categories |
| description | text | Not null |
| full_description | text | Nullable |
| address | text | Not null |
| phone | text | Nullable |
| email | text | Nullable |
| website | text | Nullable, check: no placeholder domains |
| hours | text | Nullable |
| tags | text[] | Default '{}' |
| image_url | text | Nullable, check: no placeholder domains |
| created_by | uuid | References auth.users, default auth.uid() |
| posted_by_name | text | Auto-filled via `apply_content_defaults()` |
| status | `content_status` | Enum: draft, pending, published, rejected, archived |
| is_spotlight | boolean | Default false |
| spotlight_subtitle | text | Nullable |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Auto-updated via trigger |

#### `events`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| title | text | Not null |
| category | text | Nullable |
| description | text | Nullable |
| location | text | Not null |
| location_lat | double precision | Nullable (for map markers) |
| location_lng | double precision | Nullable (for map markers) |
| starts_at | timestamptz | Not null, default now() |
| ends_at | timestamptz | Nullable |
| image_url | text | Nullable, check: no placeholder domains |
| created_by | uuid | References auth.users, default auth.uid() |
| posted_by_name | text | Auto-filled |
| status | `content_status` | Same as resources |
| is_spotlight | boolean | Default false |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Auto-updated via trigger |

#### `resource_submissions`
Public suggestion queue. Columns mirror `resources` plus:
- `legacy_suggestion_id` (uuid, unique — for migration from old `resource_suggestions` table)
- `submitter_name`, `submitter_email`, `submitter_connection` (text)
- `status` (`submission_status`: pending, approved, rejected)
- `moderator_notes`, `reviewed_by`, `reviewed_at`
- `approved_resource_id` (uuid → resources.id)

#### `event_submissions`
Public suggestion queue. Columns mirror `events` plus:
- `organizer_name`, `organizer_email`, `organizer_phone`
- `submitter_name`, `submitter_email`, `submitter_connection`
- `status`, `moderator_notes`, `reviewed_by`, `reviewed_at`
- `approved_event_id` (uuid → events.id)

### Engagement Tables (from `engagement-schema-fixed.sql`)
- `resource_ratings` — user ratings (1–5) with reason text
- `resource_likes` — toggle likes per resource per user
- `spotlight_comments` — comments with approval flag
- `spotlight_views` — view tracking

### Custom Enum Types
- `contributor_role`: `'contributor'`, `'moderator'`, `'super_admin'`
- `content_status`: `'draft'`, `'pending'`, `'published'`, `'rejected'`, `'archived'`
- `submission_status`: `'pending'`, `'approved'`, `'rejected'`

### Key Database Functions

| Function | Returns | Purpose |
|---|---|---|
| `handle_new_user()` | trigger | Auto-creates profile on auth user signup |
| `apply_content_defaults()` | trigger | Sets `created_by`, `posted_by_name`, `updated_at` on insert/update |
| `set_updated_at()` | trigger | Auto-updates `updated_at` timestamp |
| `stamp_submission_review()` | trigger | Sets `reviewed_by`, `reviewed_at` when submission status changes |
| `display_name_for(user_id)` | text | Resolves display name from profile (display_name → org → first/last → fallback) |
| `is_moderator()` | boolean | Checks if current user is moderator or super_admin |
| `approve_resource_submission(id)` | uuid | Creates published resource from submission, stamps review |
| `approve_event_submission(id)` | uuid | Creates published event from submission, stamps review |
| `get_resource_engagement(p_resource_id)` | record | Returns aggregate engagement stats + user's own engagement |
| `toggle_resource_like(p_resource_id)` | record | Toggle like for current user, returns new state |
| `upsert_resource_rating(p_resource_id, p_rating, p_reason)` | void | Create or update user's rating |
| `remove_resource_rating(p_resource_id)` | record | Remove user's rating |
| `list_directory_resources_page(...)` | setof | Paginated directory with search, category, rating filter |
| `list_resource_rating_feedback(p_resource_id)` | setof | Rating reasons for a resource |

### Row Level Security (RLS) Policies

| Table | Policy | Access |
|---|---|---|
| `profiles` | Select: own or moderator | Authenticated |
| `profiles` | Update: own or moderator | Authenticated |
| `profiles` | Insert: own or moderator | Authenticated |
| `resources` | Public read | Published only, no auth required |
| `resources` | Authenticated read | Own resources or moderator sees all |
| `resources` | Insert | Approved contributors, draft/published only |
| `resources` | Update | Own (approved) or moderator, draft/published only |
| `resources` | Delete | Own or moderator |
| `events` | Same pattern as resources | — |
| `resource_submissions` | Public insert | Status must be 'pending' |
| `resource_submissions` | Moderator read/update | Moderator only |
| `event_submissions` | Same pattern as resource_submissions | — |

### Indexes
- `profiles_role_idx`, `resources_status_idx`, `resources_created_by_idx`, `resources_spotlight_idx`
- `events_status_idx`, `events_created_by_idx`, `events_starts_at_idx`, `events_spotlight_idx`, `events_location_coords_idx`
- `resource_submissions_status_idx`, `resource_submissions_created_at_idx`, `resource_submissions_legacy_suggestion_id_idx` (unique)
- `event_submissions_status_idx`, `event_submissions_starts_at_idx`

---

## 12. Engagement System

Two implementations exist:

### Client-Side Fallback (`src/utils/engagement.ts`)
- Uses `localStorage` for all data storage
- Functions: `getComments`, `addComment`, `toggleLike`, `getLikeCount`, `isLikedByUser`, `toggleFavorite`, `getFavoriteCount`, `isFavoritedByUser`, `incrementViewCount`, `getViewCount`, `getSpotlightEngagement`, `getUserFavorites`
- Generates random user IDs for tracking
- Used for demo/fallback purposes

### Supabase-Backed Production (`src/utils/engagementSupabase.ts`)
- Uses Supabase RPC functions and direct table queries
- **Ratings:** `addRating` (1–5 + reason, required), `removeRating`, `getRatingReason` (with in-memory cache)
- **Comments:** `getComments` (from `spotlight_comments`), `addComment` (with validation + profanity check)
- **Likes:** `toggleLike` (via `toggle_resource_like` RPC), returns isLiked + totalLikes
- **Favorites:** Currently disabled (returns empty/error)
- **Views:** `incrementViewCount` (localStorage for demo), `getViewCount` (from `spotlight_views` table)
- **Aggregate:** `getSpotlightEngagement` (via `get_resource_engagement` RPC)
- **User favorites:** `getUserFavorites` (currently returns empty list)

### Engagement Types (`src/app/types/engagement.ts`)
- `Comment` — id, spotlightId, userId, authorName, authorEmail, content, parentId, isApproved, createdAt, replies
- `Rating` — id, spotlightId, userId, rating (1–5), createdAt
- `Like` — id, spotlightId, userId, createdAt
- `Favorite` — id, spotlightId, userId, createdAt
- `View` — id, spotlightId, userId, ipAddress, userAgent, createdAt
- `SpotlightEngagementStats` — averageRating, totalRatings, totalLikes, totalComments, totalFavorites, totalViews
- `UserSpotlightEngagement` — hasRated, userRating, hasLiked, hasFavorited
- `SpotlightEngagement` — spotlightId, stats, userEngagement, comments

---

## 13. Input Validation & Profanity Filter

### Validation Utilities (`src/utils/validation.ts`)

| Function | Validates | Error Message |
|---|---|---|
| `validateEmail(email)` | Regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$` | "Please enter a valid email address" |
| `validatePhone(phone)` | US phone: 10–11 digits, starts with 2–9 | "Please enter a valid US phone number" |
| `validateUrl(url)` | HTTP/HTTPS, no placeholder domains | "Please enter a valid URL" |
| `validateRequired(value, fieldName, minLength?)` | Non-empty, min length | "{fieldName} is required" |
| `validateMaxLength(value, fieldName, maxLength)` | Character limit | "{fieldName} cannot exceed {maxLength} characters" |
| `validateZipCode(zipCode)` | US ZIP: 5 digits or 5+4 | "Please enter a valid US ZIP code" |

All validators return `string | null` (error message or null if valid). Optional fields return null when empty.

### Profanity Filter (`src/utils/profanityFilter.ts`)

| Function | Purpose |
|---|---|
| `containsProfanity(text)` | Returns boolean |
| `cleanProfanity(text)` | Replaces profanity with asterisks |
| `validateProfanity(text, fieldName)` | Returns error message or null |
| `sanitizeFormData(data)` | Cleans all string fields in an object |

Uses `profanity-filter` npm library with additional words: bastard, bitch, whore, slut, asshole, fuck, shit, pussy, cunt, twat.  
Note: Common words like "damn", "hell", "crap" are intentionally excluded to avoid false positives (e.g., "Bothell" matching "hell").

### Validation Coverage by Form

| Form | Required Fields | Format Checks | Max-Length | Profanity |
|---|---|---|---|---|
| **Portal Resources** | name, category, description, address | email, phone, URL | name:200, cat:100, desc:500, full:2000, addr:500, hours:200, tags:300, subtitle:200 | All text fields |
| **Portal Events** | title, location | image URL | title:200, cat:100, desc:1000, loc:500 | All text fields |
| **Contributor Sign Up** | org name, first/last name, email, phone | email, phone | org:200, display:100, names:50 | All name fields |
| **Suggest (Resource)** | resource name, category, description, address, submitter name/email | email, phone, URL | Various | All text fields |
| **Suggest (Event)** | title, location, starts_at, submitter name/email | URL | Various | All text fields |
| **Events ZIP Search** | ZIP code format | US ZIP code | — | — |
| **Comments** | author name, content | email (optional) | name:100, content:1000 | Name + content |

---

## 14. Google Maps Integration

### Configuration (`src/utils/googleMaps.ts`)
- API key from `VITE_GOOGLE_MAPS_API_KEY`
- Loader options: `id: "roots-routes-google-maps"`, libraries: `["places"]`

### Usage Points
1. **Events page map view** (`Events.tsx`) — `useJsApiLoader`, `GoogleMap`, `MarkerF`, `InfoWindowF`
   - Center: Bothell, WA (47.7614, -122.2052)
   - Markers for events with `location_lat`/`location_lng`
   - InfoWindows show event title, date, time, link
2. **Address autocomplete** (`AddressAutocompleteInput.tsx`) — Google Places Autocomplete for address fields in forms
   - Extracts latitude/longitude from place geometry
   - Used in Portal Resources, Portal Events, and Suggest forms

### Distance Calculation
- Haversine formula in `Events.tsx` (`distanceMiles` function)
- Earth radius: 3958.8 miles
- Used for ZIP-code-based proximity filtering

---

## 15. Deployment

### Platform: Vercel
- **Config:** `vercel.json` with SPA rewrite (`/* → /index.html`)
- **Build command:** `vite build` (from `package.json` `"build"` script)
- **Analytics:** `@vercel/analytics` React component in `App.tsx`
- **Framework detection:** Vite-based SPA

### Build Process
1. `npm i` — install dependencies
2. `npm run build` — Vite production build to `dist/`
3. Vercel serves `dist/` with SPA rewrite

### Development
```bash
npm i
npm run dev    # Starts Vite dev server
```

---

## 16. Supabase SQL Scripts

Located in `supabase/` directory:

| Script | Purpose |
|---|---|
| `simple_schema.sql` | **Complete schema:** tables, enums, constraints, functions, triggers, RLS policies, indexes, legacy migration |
| `seed.sql` | Base seed data |
| `bothell_seed_data.sql` | Bothell-specific seed resources and events |
| `import_generated_data.sql` | Bulk import of generated resource/event data (with metadata JSON) |
| `engagement-schema.sql` / `engagement-schema-fixed.sql` | Engagement tables (ratings, likes, comments, views) |
| `add_essential_waypoints.sql` | Add essential waypoint resources |
| `add_event_coordinates.sql` | Backfill lat/lng for events |
| `add_profile_status.sql` | Add status column to profiles |
| `add_super_admin_role.sql` | Add super_admin to contributor_role enum |
| `add_resource_rating_feedback_access.sql` | RPC for rating feedback |
| `anonymous_engagement_runbook.sql` | Runbook for anonymous engagement migration |
| `resources_curation_runbook.sql` | Runbook for resource curation process |
| `rebalance_resource_ratings_v3.sql` | Rebalance resource ratings |
| `bothell_seed_data.sql` | Bothell-specific seed data |
| `cleanup_dummy_links.sql` | Clean up placeholder URLs |
| `fix_outbound_links.sql` | Fix outbound resource links |
| `list_directory_resources_page.sql` | RPC for paginated directory |
| `promote_admin.sql` | Promote user to admin role |
| `remove_archived_status.sql` | Remove archived from content_status enum |
| `resources_curation_rollback.sql` | Rollback curation changes |
| `seed_engagement_after_old_seed.sql` | Seed engagement data |
| `seed_engagement_demo.sql` | Demo engagement data |
| `unify_waypoints_resources.sql` | Migrate waypoints to resources table |

### Documentation (`docs/`)
| Document | Content |
|---|---|
| `anonymous-engagement-migration-2026-03-24.md` | Migration plan for anonymous engagement |
| `dual-trust-submission-model-2026-03-24.md` | Dual-trust model documentation (contributors + public submissions) |
| `resource-curation-report-2026-03-24.md` | Resource curation audit report |

---

## Appendix A: Resource Categories

| Category | Icon | Description | Badge Color |
|---|---|---|---|
| Food Assistance | `Wheat` | Nourishment resources and meal programs | Sage green (#A7AE8A) |
| Health & Wellness | `HeartPulse` | Wellness resources and care options | Terracotta (#B36A4C) |
| Housing Support | `Home` | Housing resources and stability support | Dark green (#334233) |
| Youth Programs | `Users` | Growth resources and mentorship opportunities | Warm neutral (#E7D9C3) |
| Job Help | `Briefcase` | Career resources and employment support | Olive (#6F7553) |
| Community Events | `Calendar` | Community gathering resources | Cream (#F6F1E7) |

## Appendix B: Event Category Suggestions

UI-only suggestions (database accepts any text):
- Community Gathering
- Workshop / Class
- Festival
- Fundraiser
- Sports & Recreation
- Kids & Family
- Arts & Culture
- Food & Markets
- Government / Civic
- Volunteer Opportunity

## Appendix C: Static/Seed Data

### Homepage Resource Routes (6)
Food Assistance, Health & Wellness, Housing Support, Youth Programs, Job Help, Community Events

### Homepage Directory Entries (12 seed items)
Bothell Food Bank, North King County Mutual Aid, HealthPoint Bothell, YWCA Snohomish County, Landlord-Tenant Mediation, Denali Youth Programs, Northshore Schools Foundation, WorkSource Snohomish County, Dress for Success Seattle, Bothell Legal Aid Clinic, Open Doors Community Garden, Valley Cities Counseling

### Homepage Spotlights (6 seed items)
Bothell Community Garden Expansion, Free Weekend Health Clinic, Teen Nature Trail Guides, Northshore Housing Stability Fund, WorkReady Bothell, Language Access Initiative

### Homepage Testimonials (5)
Alex R. (Bothell Parent), Maya T. (Volunteer Organizer), Jordan L. (Resident), Chris N. (Community Advocate), Sam P. (Local Mentor) — all with CC0-licensed portrait images

## Appendix D: Dual-Trust Submission Model

The site operates on a dual-trust content model:

1. **Approved Contributors** — Organizations with approved accounts can create resources/events directly. They can set status to `draft` (work in progress) or `published` (immediately visible). They cannot set `rejected` status.

2. **Public Users** — Any visitor can submit resource/event proposals via the `/suggest` page. These go into `resource_submissions` / `event_submissions` tables with `status = 'pending'`. No account required.

3. **Moderators** — Review and approve/reject public submissions. Approving a submission automatically creates a published resource/event via PostgreSQL functions (`approve_resource_submission`, `approve_event_submission`). Moderators also approve contributor account applications and manage all content.

This ensures quality control while keeping the platform accessible to community members without accounts.
