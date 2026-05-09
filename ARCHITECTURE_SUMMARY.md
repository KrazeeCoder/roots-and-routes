# Architecture Summary - Quick Reference

## Application Overview
**Roots & Routes** is a community resource directory and event management platform built with **React 18 + TypeScript + Vite**, featuring contributor portal with role-based access control (RBAC).

**Key Characteristics**:
- Dual interface: Public directory + Contributor portal
- Community engagement (ratings, likes, comments, favorites)
- Role-based content approval workflow
- Moderator panel for content management
- Integration with Supabase (auth + database)

---

## Core Architecture Decisions

### 1. **Context API for Authentication** (Not Redux/Zustand)
- ✅ Lightweight for single domain (auth state)
- ✅ Built-in to React, no extra dependencies
- ✅ Adequate for current scale (~3 pieces of state)
- ⚠️ May need refactor if app grows significantly

### 2. **React Router v7** (File-based routing alternative)
- ✅ Excellent for protecting routes with guards
- ✅ Simple config-based approach
- ✅ Built-in outlet system for layouts
- Used guard pattern for auth/role checks

### 3. **Supabase as Backend** (BaaS)
- ✅ Integrated auth (no separate identity provider)
- ✅ PostgreSQL with RPC support for complex queries
- ✅ Row-Level Security (RLS) for data isolation
- ✅ Real-time capabilities (unused but available)
- All data is source of truth; no client-side cache

### 4. **Service Layer Architecture**
- **portalApi.ts**: Single aggregation point
  - All CRUD operations
  - Data transformation/mapping
  - Format handling (dates, overrides)
  - Error standardization
- **engagementSupabase.ts**: Isolated for engagement features
- Benefit: Easy to mock for testing, clear dependency

### 5. **Component Organization**
- Organized by feature/section, not by type
- Layout hierarchy: Pages → Sections → Components → UI primitives
- Encourages composition over complex component trees
- Example: `Home.tsx` = HeroSection + ResourcesSection + SpotlightSection + ...

### 6. **Type-First Design**
- Separate type files for each domain (home, portal, engagement)
- Maps between data types (ResourceRecord → DirectoryEntry)
- Ensures type safety across fetch → transform → render

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript |
| **Framework** | React 18 |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + custom CSS |
| **UI Library** | Radix UI + Material UI |
| **Icons** | Lucide |
| **Routing** | React Router v7 |
| **State Management** | React Context (auth) + Component State |
| **Form Handling** | Controlled components (no React Hook Form) |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **APIs** | Google Maps API, Vercel Analytics |
| **Package Manager** | npm (inferred from package.json) |

---

## Request-Response Flow Example

### Fetching Published Resources
```
User navigates to /directory
    ↓
Directory.tsx mounts
    ↓
Calls: portalApi.listPublishedResources()
    ↓
portalApi sends: supabase.from("resources").select("*").eq("status", "published")
    ↓
Supabase queries PostgreSQL
    ↓
Returns: ResourceRecord[]
    ↓
portalApi applies overrides (website URLs, excludes)
    ↓
Component receives: ResourceRecord[]
    ↓
Maps to: DirectoryEntry[] for display
    ↓
Renders: ResourceCard components with engagement stats
```

---

## Critical Paths

### Authentication Flow (Critical)
```
Login → Supabase.auth.signInWithPassword
      → AuthProvider.loadProfile() (fetch from DB)
      → Update AuthContext
      → Guards check session/profile/role
      → Redirect based on permissions
```

### Content Approval Workflow (Critical)
```
Contributor creates Resource
      → Status: "draft" (always)
      → Can be published directly if approved user
      → Otherwise: Status becomes "pending"
      → Moderator reviews at /portal/moderation
      → Approve → "published" OR Reject → "rejected"
      → Contributor can revise if rejected
```

### Public Directory Query (Performance)
```
Directory.tsx calls listDirectoryResourcesPage(params)
      → portalApi calls Supabase RPC: list_directory_resources_page
      → RPC handles:
         - Pagination (offset/limit)
         - Search (text matching)
         - Filtering (category, min_rating)
         - Sorting
         - Count aggregation
      → Returns paginated results with total count
```

---

## Key Design Patterns

### 1. **Guard Pattern** (Route Protection)
```typescript
<RequireAuth>
  <RequireApproved>
    <PortalResources />
  </RequireApproved>
</RequireAuth>
```
- Composable guards
- Consistent UX (loading state, redirects)
- Declarative security

### 2. **Service Layer Pattern**
```typescript
// Component doesn't know about Supabase
const resources = await portalApi.listPublishedResources();

// Service handles:
// - Supabase call
// - Error handling
// - Data transformation
// - Overrides/overrides
```

### 3. **Type Transformation Pattern**
```typescript
// Database: ResourceRecord
export async function getPublishedResourceById(id: string): ResourceRecord | null

// Component wants: DirectoryEntry
const display = mapResourceToDirectoryEntry(resource);
```

### 4. **Context Hook Pattern**
```typescript
const { session, user, profile, role } = useAuth();
// GuardLogicError if used outside AuthProvider
```

### 5. **Utility Module Pattern**
- Pure functions separated from components
  - `validation.ts` - form input validation
  - `profanityFilter.ts` - content moderation
  - `googleMaps.ts` - geolocation
- No component dependencies
- Highly testable

---

## Scalability Considerations

### Current Strengths ✅
1. Service layer abstraction (easy to refactor backend)
2. Type-safe end-to-end (TypeScript everywhere)
3. Modular components (feature-based organization)
4. Clear separation of concerns (services, types, components)

### Potential Bottlenecks ⚠️
1. **Context API for Auth**: OK for now, but consider Redux/Zustand if more state
2. **Single Service File**: `portalApi.ts` growing large; consider splitting by feature
3. **No Form Library**: `<input>` + `useState` verbose; consider React Hook Form at scale
4. **No API Caching**: Every render-trigger fetches from DB; consider SWR/React Query
5. **No Pagination Cache**: Switching pages re-fetches from DB

### Recommendations for Growth
- Add **React Query/SWR** for server state caching
- Split **portalApi.ts** into: authApi.ts, resourceApi.ts, eventApi.ts, moderationApi.ts
- Add **React Hook Form** if forms grow more complex
- Consider **Zustand** if component state becomes distributed
- Add **Sentry** or similar for error tracking
- Implement **API rate limiting** awareness

---

## Environment Configuration

### Required Environment Variables
```bash
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Development Server
```bash
npm run dev
# Runs Vite dev server with HMR
# Proxy: /images.unsplash.com → https://images.unsplash.com (CORS workaround)
```

### Production Build
```bash
npm run build
# Outputs to dist/
# Vite tree-shakes unused code
# TypeScript compiled to JavaScript
```

---

## Testing Strategy (Outline)

### Unit Tests
- **Services**: Mock Supabase, test data transformation
- **Utilities**: validation, profanityFilter, googleMaps
- **Hooks**: useAuth hook in isolation

### Integration Tests
- **Pages**: Render with mocked services, test user flows
- **Components**: Test with real component dependencies

### E2E Tests
- Login flow
- Resource CRUD
- Moderation workflow

### Current State
- **No test files found** in workspace
- Recommend: Vitest + React Testing Library

---

## Security Considerations

### ✅ What's Good
- Supabase Auth manages session tokens
- Profile + role checks guard routes
- Profanity filter prevents some spam
- RLS on database (presumably configured)

### ⚠️ What Needs Review
1. **API Key Exposure**: Public key is exposed (safe for Supabase)
2. **XSS**: React prevents DOM injection, but check user-generated content
3. **CSRF**: Not explicitly handled (check Supabase built-in protections)
4. **Input Validation**: Basic validation present, add stricter rules
5. **Rate Limiting**: No client-side or server-side rate limiting visible
6. **Error Messages**: Should not leak database/infrastructure details

### Recommendations
- Implement stricter content validation
- Add rate limiting (Supabase built-in or middleware)
- Audit RLS policies on sensitive tables
- Enable CORS strictly (whitelist domains)
- Monitor for suspicious activity

---

## Development Workflow

### Typical Task: Add New Resource Field

1. **Database Schema** (Supabase SQL migration)
   ```sql
   ALTER TABLE resources ADD COLUMN new_field TEXT;
   ```

2. **Type Update** (`src/app/types/portal.ts`)
   ```typescript
   interface ResourceRecord {
     // ...
     new_field: string | null;
   }
   ```

3. **API Update** (`src/app/data/portalApi.ts`)
   ```typescript
   export interface ResourcePayload {
     // ...
     new_field?: string;
   }
   ```

4. **Form Component** (`src/app/components/forms/`)
   ```tsx
   <input value={formState.new_field} onChange={...} />
   ```

5. **Display Component** (Resource card/detail)
   ```tsx
   <p>{resource.new_field}</p>
   ```

### Code Style
- **Naming**: camelCase for variables/functions, PascalCase for types/components
- **File Organization**: Feature-based grouping under `components/`
- **Imports**: No barrel exports visible; direct imports from files
- **Formatting**: Likely Prettier (not explicitly configured in visible files)

---

## Deployment

### Host
- Likely **Vercel** (inferred from `vercel.json` and `@vercel/analytics`)

### Build
```bash
npm run build
# Outputs dist/ folder
# Vite handles tree-shaking and minification
```

### Environment
- Production environment variables set in Vercel dashboard
- Supabase project must be configured for production

### CI/CD
- Not visible in workspace (likely in hidden GitHub actions)

---

## Quick Links to Key Files

| Purpose | File |
|---------|------|
| Application Entry | `src/main.tsx` |
| Root Component | `src/app/App.tsx` |
| Routes | `src/app/routes.tsx` |
| Main Layout | `src/app/Layout.tsx` |
| Auth Context | `src/app/auth/AuthProvider.tsx` |
| Guards | `src/app/auth/RouteGuards.tsx` |
| Data Service | `src/app/data/portalApi.ts` |
| Engagement Service | `src/utils/engagementSupabase.ts` |
| Validations | `src/utils/validation.ts` |
| Types (Auth) | `src/app/types/portal.ts` |
| Types (Data) | `src/app/types/home.ts` |
| Types (Engagement) | `src/app/types/engagement.ts` |

---

## Common Tasks

### Add a New Route
1. Create page component in `src/app/pages/`
2. Add to router config in `src/app/routes.tsx`
3. Wrap with guards if protected
4. Add navigation link in `src/app/Layout.tsx` if needed

### Add a New Engagement Type (e.g., "Save")
1. Add type in `src/app/types/engagement.ts`
2. Add database migration for new table
3. Add function in `src/utils/engagementSupabase.ts`
4. Create component (e.g., `SaveButton.tsx`)
5. Integrate into resource cards

### Add Moderator-Only Feature
1. Add check with `isModerator(role)`
2. Wrap component with `<RequireModerator>`
3. Implement function in `portalApi.ts`
4. Call Supabase RPC or direct query

---

## Known Limitations

1. **Pagination**: Manual pagination (no infinite scroll)
2. **Search**: Full-text via RPC function (not optimized indexing visible)
3. **Real-time Updates**: Not implemented (Supabase realtime available but unused)
4. **Offline Support**: No offline capability
5. **Image Handling**: Store URLs, no built-in image upload
6. **Analytics**: Basic Vercel Analytics (no custom event tracking)
7. **Error Boundaries**: Not visible in component tree
8. **Loading States**: Likely simple loading spinners, no skeleton screens
