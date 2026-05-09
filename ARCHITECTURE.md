# Roots & Routes - Technical Architecture Overview

## 1. APPLICATION STRUCTURE & ENTRY POINT

### Entry Point
- **File**: `src/main.tsx`
- **Flow**: 
  - Creates React root at `#root` element
  - Renders `<App />` component wrapped in `StrictMode`
  - Imports global styles from `src/styles/index.css`

### App Root (`src/app/App.tsx`)
- **Component Hierarchy**:
  ```
  <App>
    ├── <AuthProvider>          // Context provider for authentication state
    ├── <RouterProvider>        // React Router integration
    │   └── router (routes)
    └── <Analytics />           // Vercel Analytics tracking
  ```

### Build & Runtime
- **Build Tool**: Vite (configured in `vite.config.ts`)
- **React Version**: 18+ (with React Router v7)
- **UI Framework**: 
  - Radix UI (headless components)
  - Material UI (additional components)
  - Tailwind CSS (styling via `@tailwindcss/vite`)

---

## 2. ROUTING & LAYOUT STRUCTURE

### Router Configuration (`src/app/routes.tsx`)
**Base Route**: `/` (Component: `Layout`)

#### Public Routes (No Auth Required)
- `/` - Home page
- `/directory` - Resource directory
- `/resources` - Redirect to directory
- `/spotlights` - Spotlight highlights section
- `/events` - Events listing
- `/events/:eventId` - Event detail page
- `/calendar` - Calendar view
- `/suggest` - Public suggestion/submission form
- `/about` - About page
- `/resources/:resourceId` - Resource detail page
- `/reference` - Reference documentation
- `/contributor-login` - Login page
- `/reset-password` - Password reset

#### Protected Routes (Authentication Required)
- `/portal` - Contributor dashboard (wrapped in `<RequireAuth>`)
- `/portal/resources` - Resource management (wrapped in `<RequireAuth>` + `<RequireApproved>`)
- `/portal/events` - Event management (wrapped in `<RequireAuth>` + `<RequireApproved>`)
- `/portal/moderation` - Moderation panel (wrapped in `<RequireAuth>` + `<RequireModerator>`)

### Layout Component (`src/app/Layout.tsx`)
- **Responsibilities**:
  - Renders top navigation bar (with logo and menu)
  - Displays navigation items: Resource Hub, Events, Highlights, References, About
  - Renders `<Outlet />` for child route components
  - Handles scroll-to-top on route changes
  - Implements smooth scroll-to-hash anchor navigation
  - Mobile menu toggle

**Navigation Items**:
- Resource Hub → `/directory`
- Events → `/events`
- Highlights → `/spotlights`
- References → `/reference`
- About → `/about`

---

## 3. COMPONENT ORGANIZATION

### Component Hierarchy
```
src/app/components/
├── engagement/                 # Community engagement features
│   ├── CommentComponent.tsx       (comment submission & display)
│   ├── EngagementButtons.tsx      (like, favorite, rate buttons)
│   └── RatingComponent.tsx        (rating input & display)
│
├── forms/                      # Reusable form inputs
│   ├── AddressAutocompleteInput.tsx  (Google Maps address lookup)
│   ├── CategoryPicker.tsx           (resource category selector)
│   ├── ResourceHoursSelector.tsx    (operating hours input)
│   └── TagChipInput.tsx             (tag input with chips)
│
├── home/                       # Homepage sections
│   ├── HeroSection.tsx           (banner/hero content)
│   ├── ResourcesSection.tsx      (featured resources section)
│   ├── SpotlightSection.tsx      (spotlights/highlights)
│   ├── TestimonialsSection.tsx   (testimonials/quotes)
│   ├── EmailSignupSection.tsx    (newsletter signup)
│   ├── EventsSection.tsx         (upcoming events)
│   ├── FindPathSection.tsx       (CTA section)
│   └── SuggestResourceSection.tsx (suggest resources CTA)
│
├── portal/                     # Contributor portal
│   └── PortalShell.tsx           (shared layout for portal pages)
│
├── ui/                         # Radix UI built components
│   ├── card.tsx
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── label.tsx
│   ├── tabs.tsx
│   └── ...other UI primitives
│
├── ScrollReveal.tsx            # Scroll-triggered reveal animation
└── TopoPattern.tsx             # Topographic pattern background component
```

### Page Components (`src/app/pages/`)
```
├── Home.tsx                    # Homepage (composes sections)
├── Directory.tsx               # Resource directory with filtering/search
├── Events.tsx                  # Events listing
├── EventDetail.tsx             # Event detail with engagement
├── Calendar.tsx                # Calendar view of events
├── Spotlights.tsx              # Spotlight resources
├── Suggest.tsx                 # Contributor form for resources/events
├── About.tsx                   # About page
├── Reference.tsx               # Reference page
├── ResourceDetail.tsx          # Resource detail with engagement
├── ResourcesRedirect.tsx       # /resources redirect to /directory
├── ContributorLogin.tsx        # Login form
├── ResetPassword.tsx           # Password reset form
├── Portal.tsx                  # Portal overview/dashboard
├── PortalResources.tsx         # Resource CRUD management
├── PortalEvents.tsx            # Event CRUD management
└── PortalModeration.tsx        # Moderation panel
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### Auth System Architecture

#### AuthProvider (`src/app/auth/AuthProvider.tsx`)
**Purpose**: Global authentication state management via React Context

**Context Interface**:
```typescript
interface AuthContextValue {
  session: Session | null;           // Supabase session
  user: User | null;                 // Auth user object
  profile: ContributorProfile | null; // Application profile
  role: ContributorRole | null;      // "contributor" | "moderator" | "super_admin"
  loading: boolean;                  // Auth initialization state
  refreshProfile: () => Promise<void>;
}
```

**Lifecycle**:
1. On mount: calls `supabase.auth.getSession()` to restore session
2. Loads contributor profile from DB via `getProfile(userId)`
3. Subscribes to `onAuthStateChange` for real-time updates
4. Exposes `useAuth()` hook for consumer components

#### Route Guards (`src/app/auth/RouteGuards.tsx`)
```typescript
<RequireAuth>              // Requires active session; redirects to /contributor-login
<RequireApproved>          // Requires profile.status === "approved" (or moderator)
<RequireModerator>         // Requires role === "moderator" | "super_admin"
```

**Authorization Model**:
- **Contributor**: Basic user, can submit content, must be approved to publish
- **Moderator**: Can approve content, manage users, moderate discussions
- **Super Admin**: Full system access

### Authentication Flows

#### Sign Up
```
ContributorLogin.tsx
  ↓ signUpContributor(input: SignUpContributorInput)
  ↓ supabase.auth.signUp() + profile metadata
  ↓ Verification email sent
  ↓ Redirect to login page
```

#### Sign In
```
ContributorLogin.tsx
  ↓ signInContributor(email, password)
  ↓ supabase.auth.signInWithPassword()
  ↓ AuthProvider loads profile
  ↓ Set session + profile state
```

#### Password Reset
```
ResetPassword.tsx
  ↓ sendContributorPasswordReset(email)
  ↓ supabase.auth.resetPasswordForEmail()
  ↓ Email with reset link sent
  ↓ updateContributorPassword(password)
  ↓ Confirm password change
```

---

## 5. DATA LAYER & SERVICE INTEGRATIONS

### Supabase Client (`src/utils/supabase.ts`)
**Purpose**: Singleton Supabase client initialization
```typescript
supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
```
- Initializes with environment variables
- Throws error if env vars missing
- Used throughout application for DB, Auth, RPC, and Storage access

### Portal API Service (`src/app/data/portalApi.ts`)

**Core Functions**:

#### Authentication Functions
- `signInContributor(email, password)` - Supabase Auth signin
- `signUpContributor(input)` - Register new contributor
- `sendContributorPasswordReset(email)` - Send reset email
- `updateContributorPassword(password)` - Update password
- `signOutContributor()` - Logout

#### Profile Management
- `getProfile(userId)` - Fetch contributor profile
- `isModerator(role)` - Role check utility

#### Resource Operations
- `listPublishedResources()` - Get all public resources
- `listDirectoryResourcesPage(params)` - Paginated resource search (RPC)
- `getPublishedResourceById(resourceId)` - Get resource detail
- `listPortalResources(role, userId)` - Get resources for contributor
- `listResourceRatingFeedback(resourceId)` - Get rating feedback
- **Create/Update**: `createResource()`, `updateResource()`, `archiveResource()`
- **Spotlight Management**: `toggleResourceSpotlight()`

#### Event Operations
- `listPublishedEvents()` - Get all public events
- `getPublishedEventById(eventId)` - Get event detail
- `listSpotlightItems()` - Get spotlight resources (used on home)
- `listPortalEvents(role, userId)` - Get events for contributor
- **Create/Update**: `createEvent()`, `updateEvent()`, `archiveEvent()`

#### Public Submissions (from non-contributors)
- `createResourceSubmission()` - Anonymous resource proposal
- `createEventSubmission()` - Anonymous event proposal

#### Moderation
- `listModerationResources()` - Pending resource approvals
- `listModerationEvents()` - Pending event approvals
- `approveResource(id)`, `rejectResource(id)`
- `approveEvent(id)`, `rejectEvent(id)`
- `listPendingProfilesForApproval()` - Contributor accounts to verify

#### Data Mapping & Formatting
- `mapResourceToDirectoryEntry()` - Format ResourceRecord → DirectoryEntry
- `mapEventToEventItem()` - Format EventRecord → EventItem
- `displayDateRange()` - Format date/time display
- `getFriendlyAuthError()` - Humanize Supabase auth errors

**Resource Website Overrides**:
- Hardcoded URL overrides for specific resources (e.g., Bothell Community Farmers Market)

### Engagement Service (`src/utils/engagementSupabase.ts`)

**Purpose**: Handle community engagement features (ratings, likes, comments)

**Functions**:
- `addRating(spotlightId, rating, reason)` - Submit resource rating (1-5 scale)
- `toggleLike(spotlightId)` - Like/unlike resource
- `toggleFavorite(spotlightId)` - Favorite/unfavorite resource
- `recordView(spotlightId)` - Track resource view
- `addComment(spotlightId, comment)` - Submit comment
- `getResourceEngagement(spotlightId, userId)` - Fetch engagement stats

**Data Structures**:
- Uses RPC call `get_resource_engagement` to fetch aggregated stats
- Caches rating reasons in memory (`ratingReasonCache`)
- Validates comments for profanity and length

---

## 6. TYPE DEFINITIONS & DATA MODELS

### Engagement Types (`src/app/types/engagement.ts`)
```typescript
interface Comment {
  id: string;
  spotlightId: string;
  userId?: string;
  authorName: string;
  content: string;
  parentId?: string;              // For nested/threaded comments
  isApproved: boolean;
  createdAt: string;
}

interface Rating {
  id: string;
  spotlightId: string;
  userId: string;
  rating: number;                 // 1-5 scale
  createdAt: string;
}

interface Like, Favorite, View {
  id: string;
  spotlightId: string;
  userId: string;
  createdAt: string;
}

interface SpotlightEngagementStats {
  averageRating: number;
  totalRatings: number;
  totalLikes: number;
  totalComments: number;
  totalFavorites: number;
  totalViews: number;
}

interface UserSpotlightEngagement {
  hasRated: boolean;
  userRating: number | null;
  hasLiked: boolean;
  hasFavorited: boolean;
}

interface SpotlightEngagement {
  spotlightId: string;
  stats: SpotlightEngagementStats;
  userEngagement: UserSpotlightEngagement;
  comments: Comment[];
}
```

### Home Types (`src/app/types/home.ts`)
```typescript
interface DirectoryEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  tags: string[];
  image?: string | null;
  postedByName?: string;
  status?: "draft" | "pending" | "published" | "rejected";
}

interface SpotlightItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  fullDescription: string;
  audience: string;
  location: string;
  image?: string | null;
  featured?: boolean;
}

interface EventItem {
  id?: string;
  date: string;
  title: string;
  time: string;
  location: string;
  startsAt?: string;
  endsAt?: string;
  category: string;
  image?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  status?: "draft" | "pending" | "published" | "rejected";
}

interface HomepageTestimonial {
  quote: string;
  attribution: string;
  role: string;
  image: string;
}
```

### Portal Types (`src/app/types/portal.ts`)
```typescript
type ContributorRole = "contributor" | "moderator" | "super_admin";
type ContentStatus = "draft" | "pending" | "published" | "rejected";

interface ContributorProfile {
  id: string;
  role: ContributorRole;
  status: "pending" | "approved" | "rejected";
  organization_name: string | null;
  display_name: string | null;
  first_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface ResourceRecord {
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

interface EventRecord {
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
  posted_by_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ResourcePayload {
  name: string;
  category: ResourceCategory;
  description: string;
  address: string;
  status: ContentStatus;
  is_spotlight?: boolean;
}

interface EventPayload {
  title: string;
  location: string;
  starts_at: string;
  status: ContentStatus;
  is_spotlight?: boolean;
}

interface SignUpContributorInput {
  organizationName: string;
  displayName: string;
  firstName: string;
  email: string;
  password: string;
  // ...additional fields
}
```

---

## 7. UTILITY & HELPER MODULES

### Validation (`src/utils/validation.ts`)
**Exported Functions**:
- `validateRequired(value, fieldName)` - Check non-empty
- `validateMaxLength(value, max, fieldName)` - String length validation
- `validateEmail(email)` - Email format validation
- `validatePhone(phone)` - US phone number validation
- `validateUrl(url)` - URL format validation with protocol checking

**Validation Rules**:
- Email: Basic regex pattern `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Phone: US format, 10-11 digits
- URL: Must be HTTP/HTTPS, blocks example.com & localhost

### Profanity Filter (`src/utils/profanityFilter.ts`)
**Imported from**: `profanity-filter` package with custom extensions

**Exported Functions**:
- `containsProfanity(text)` - Boolean check
- `cleanProfanity(text)` - Replace with asterisks
- `validateProfanity(text, fieldName)` - Returns error message or null

**Custom Words**: bastard, bitch, whore, slut, asshole, fuck, shit, pussy, cunt, twat

### Google Maps Integration (`src/utils/googleMaps.ts`)
**Purpose**: Interaction with Google Maps API for address autocomplete and geocoding

**Used in**:
- `AddressAutocompleteInput.tsx` - Autocomplete street addresses
- Event/Resource location input forms

### Engagement Utilities (`src/utils/engagement.ts`)
**Purpose**: Client-side engagement state management (localStorage-based for demo)

**Functions**:
- `getComments(spotlightId)` - Retrieve comments
- `addComment(commentData)` - Add new comment
- `toggleLike(spotlightId)` - Like/unlike
- `toggleFavorite(spotlightId)` - Favorite/unfavorite
- **Note**: This is a demo/fallback implementation; production uses `engagementSupabase.ts`

---

## 8. EXTERNAL INTEGRATIONS

### 1. Supabase (Backend-as-a-Service)
**Components Used**:
- **Auth**: User registration, signin, password reset via `supabase.auth`
- **Database**: PostgreSQL via `supabase.from()` queries
- **RPC Functions**: Stored procedures for complex queries
  - `get_resource_engagement` - Fetch engagement stats
  - `list_directory_resources_page` - Paginated search with filters
  - `list_resource_rating_feedback` - Fetch rating reasons

**Environment Variables**:
- `VITE_SUPABASE_URL` - API endpoint
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key

### 2. Google Maps API
**Purpose**: Address autocomplete and geocoding

**Integration Points**:
- `AddressAutocompleteInput.tsx` - Address lookup during form submission
- Event/Resource creation forms - Set location coordinates
- Event detail page - Display embedded map

**Used via**: `@react-google-maps/api` package

### 3. Vercel Analytics
**Purpose**: Application performance monitoring and user analytics

**Implementation**: `<Analytics />` component in `App.tsx` from `@vercel/analytics/react`

---

## 9. STYLING & THEMING

### CSS Architecture
```
src/styles/
├── index.css               # Global styles entry
├── tailwind.css            # Tailwind directives
├── theme.css               # Color/design token definitions
└── fonts.css               # Font imports (@font-face)
```

### Component Styling
- **Tailwind CSS**: Utility-first CSS via `@tailwindcss/vite` plugin
- **Color Scheme**: Warm/earthy tones
  - Primary: `#B36A4C` (rust brown)
  - Background: `#F6F1E7` (cream)
  - Text: `#334233` (dark green)
  - Borders: `#E7D9C3` (tan)

### UI Component Library
- **Radix UI**: Unstyled, accessible components
  - Card, Button, Dialog, Form, Input, Select, Checkbox, Label, Tabs, etc.
- **Material UI**: Styled components for specific needs
- **Lucide Icons**: SVG icon library for UI elements

---

## 10. DATA FLOW PATTERNS

### 1. Public Content Viewing Flow
```
User Visits /directory or /spotlights
  ↓
Layout & Route Handler
  ↓
Directory/Spotlight Component
  ↓
Call portalApi.listPublishedResources() or listSpotlightItems()
  ↓
Supabase Query
  ↓
Apply Resource Overrides & Formatting
  ↓
Render ResourceCards with DisplayName, Tags, Engagement Stats
  ↓
Optional: Load Engagement Stats via engagementSupabase.ts
```

### 2. Resource Detail View with Engagement
```
User Clicks Resource Card
  ↓
Navigate to /resources/:resourceId
  ↓
ResourceDetail Component
  ↓
Fetch Resource via portalApi.getPublishedResourceById()
  ↓
Fetch Engagement Stats via engagementSupabase.getResourceEngagement()
  ↓
Render:
  ├── Resource Info (name, description, contact, hours)
  ├── Engagement Stats (ratings, likes, favorites, views)
  ├── Comments Section (CommentComponent)
  └── Engagement Buttons (RatingComponent, EngagementButtons)
```

### 3. Contributor Portal Flow
```
User at /contributor-login
  ↓
Submit email/password → signInContributor()
  ↓
Supabase authenticates session
  ↓
AuthProvider detects session change
  ↓
Load profile via getProfile(userId)
  ↓
Set session, user, profile, role in AuthContext
  ↓
Redirect to /portal
  ↓
PortalShell renders portal layout
  ↓
User can navigate to:
  ├── /portal/resources (if approved)
  ├── /portal/events (if approved)
  └── /portal/moderation (if moderator)
```

### 4. Content Creation Flow
```
Contributor at /portal/resources
  ↓
Click "Create Resource"
  ↓
Open Form Dialog with inputs:
  ├── Name, Description, Full Description
  ├── Category (CategoryPicker)
  ├── Address (AddressAutocompleteInput)
  ├── Hours (ResourceHoursSelector)
  ├── Tags (TagChipInput)
  ├── Contact Info
  ├── Image URL
  └── Status (draft/pending/published)
  ↓
Validate inputs
  ↓
Call portalApi.createResource(payload)
  ↓
Supabase insert into resources table
  ↓
Return updated resource list
  ↓
Refresh UI
```

### 5. Moderation Flow
```
Moderator at /portal/moderation
  ↓
Sections display:
  ├── Pending Resources (from public submissions)
  ├── Pending Events
  └── Pending Profile Approvals
  ↓
Moderator clicks "Review" on item
  ↓
View details with "Approve" / "Reject" buttons
  ↓
Call portalApi.approveResource() or rejectResource()
  ↓
Supabase updates content status
  ↓
Refresh pending lists
```

---

## 11. KEY MODULES & THEIR PURPOSES

| Module | Purpose |
|--------|---------|
| `AuthProvider.tsx` | Global auth state + session management via React Context |
| `RouteGuards.tsx` | Protect routes with auth/role checks (HOCs) |
| `portalApi.ts` | All data service functions (auth, CRUD, queries, transformations) |
| `supabase.ts` | Singleton Supabase client |
| `engagementSupabase.ts` | Community engagement operations (ratings, likes, comments) |
| `validation.ts` | Form input validation utilities |
| `profanityFilter.ts` | Content moderation (profanity detection) |
| `googleMaps.ts` | Google Maps API integration |
| `engagement.ts` | Demo/fallback engagement state (localStorage) |
| `routes.tsx` | React Router configuration |
| `Layout.tsx` | Main app shell (nav, outlet, scroll handling) |
| `Portal.tsx` | Contributor dashboard overview |
| `PortalResources.tsx` | Resource CRUD management |
| `PortalEvents.tsx` | Event CRUD management |
| `PortalModeration.tsx` | Content & profile approval |
| `Directory.tsx` | Resource directory with search/filter |
| `Events.tsx` | Event listing |
| `Spotlights.tsx` | Highlighted resources/events |
| `Suggest.tsx` | Public submission form for resources/events |

---

## 12. ARCHITECTURE PATTERNS

### Patterns Used
1. **Provider Pattern**: `AuthProvider` for auth context
2. **Guard Pattern**: `RequireAuth`, `RequireApproved`, `RequireModerator` HOCs
3. **Service Layer**: `portalApi.ts` abstracts all data operations
4. **Custom Hooks**: `useAuth()` for accessing auth context
5. **Component Composition**: Sections compose to form pages (e.g., Home = Hero + Resources + Spotlights)

### State Management
- **Auth State**: React Context (AuthProvider)
- **UI State**: React Component State (useState)
- **Form State**: React Hook Form or controlled components
- **Server State**: Supabase (source of truth)
- **Engagement State**: Supabase + optional localStorage caching

### Data Flow
- **Unidirectional**: Components → Services → Supabase → Services → Components
- **Async Operations**: Error handling via try-catch, user feedback via loading states
- **Real-time Updates**: Limited in current architecture; Supabase realtime could be added

---

## Summary for UML Architecture Diagram

**Key Entities**:
1. **App** (root)
2. **AuthProvider** (context)
3. **Router** (react-router)
4. **Layout** (shell)
5. **Pages** (Home, Directory, Portal, etc.)
6. **Components** (sections, reusable UI)
7. **Services** (portalApi, engagementSupabase, supabase)
8. **Types** (interfaces for data models)
9. **Utilities** (validation, filters, helpers)
10. **External APIs** (Supabase, Google Maps, Vercel)

**Relationships**:
- App contains AuthProvider + Router
- Router manages route hierarchy under Layout
- Pages use Services for data
- Components consume hooks (useAuth) and services
- Services call Supabase client
- Utilities support Services and Components

**Data Model Entities**:
- ContributorProfile
- ResourceRecord
- EventRecord
- Comment, Rating, Like, Favorite, View
- DirectoryEntry, SpotlightItem, EventItem
