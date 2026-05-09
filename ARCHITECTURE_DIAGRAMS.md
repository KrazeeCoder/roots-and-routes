# Architecture Diagram (Mermaid)

## High-Level Application Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        main["main.tsx<br/>(Entry Point)"]
        app["App.tsx<br/>(Root)"]
        auth["AuthProvider<br/>(Auth Context)"]
        router["Router<br/>(React Router)"]
    end

    subgraph "Route/Layout Layer"
        layout["Layout.tsx<br/>(Navigation Shell)"]
        routes["routes.tsx<br/>(Route Config)"]
    end

    subgraph "Page Layer"
        public["Public Pages<br/>Home, Directory,<br/>Events, About"]
        protected["Protected Pages<br/>Portal, Resources,<br/>Events, Moderation"]
        guards["Route Guards<br/>RequireAuth<br/>RequireApproved<br/>RequireModerator"]
    end

    subgraph "Component Layer"
        sections["Section Components<br/>HeroSection, ResourcesSection,<br/>SpotlightSection, etc"]
        engagement["Engagement Components<br/>CommentComponent<br/>RatingComponent<br/>EngagementButtons"]
        forms["Form Components<br/>AddressAutocomplete<br/>CategoryPicker<br/>TagChipInput"]
        ui["UI Components<br/>Radix + Material UI<br/>Card, Button,<br/>Dialog, Input"]
    end

    subgraph "Service/Data Layer"
        portal["portalApi.ts<br/>(Main Service)<br/>Auth, CRUD,<br/>queries, transforms"]
        engagement_svc["engagementSupabase.ts<br/>(Engagement)<br/>Ratings, Likes,<br/>Comments"]
        supabase_client["supabase.ts<br/>(Client Instance)"]
    end

    subgraph "Utility Layer"
        validation["validation.ts<br/>(Form validation)"]
        profanity["profanityFilter.ts<br/>(Content moderation)"]
        maps["googleMaps.ts<br/>(Address lookup)"]
        engagement_util["engagement.ts<br/>(Demo engagement)"]
    end

    subgraph "External Services"
        supabase["Supabase<br/>(Auth, DB, RPC)"]
        gmaps["Google Maps API<br/>(Geolocation)"]
        vercel["Vercel Analytics<br/>(Monitoring)"]
    end

    subgraph "Data Models"
        types_engagement["Types: Comment,<br/>Rating, Like,<br/>Favorite, View"]
        types_home["Types: DirectoryEntry,<br/>SpotlightItem,<br/>EventItem"]
        types_portal["Types: ContributorProfile,<br/>ResourceRecord,<br/>EventRecord"]
    end

    main --> app
    app --> auth
    app --> router
    router --> routes
    routes --> layout
    layout --> public
    layout --> protected
    protected --> guards
    public --> sections
    protected --> sections
    sections --> engagement
    sections --> forms
    engagement --> ui
    forms --> ui
    sections --> portal
    engagement --> engagement_svc
    forms --> validation
    sections --> validation
    engagement --> profanity
    forms --> profanity
    forms --> maps
    portal --> supabase_client
    engagement_svc --> supabase_client
    supabase_client --> supabase
    maps --> gmaps
    app --> vercel
    types_engagement -.-> engagement_svc
    types_home -.-> portal
    types_portal -.-> portal
```

## Data Flow Patterns

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Service as portalApi
    participant Supabase
    participant DB as PostgreSQL

    User->>Component: Interact (click, submit)
    Component->>Service: Call function
    Service->>Supabase: Query/Mutation
    Supabase->>DB: Execute
    DB-->>Supabase: Return data
    Supabase-->>Service: Response
    Service-->>Component: Data + Transform
    Component-->>User: Render/Update
```

## Authentication Flow

```mermaid
graph LR
    Login["User at<br/>/contributor-login"]
    Submit["Submit email<br/>+ password"]
    SignIn["signInContributor()"]
    Auth["Supabase.auth"]
    Check["AuthProvider detects<br/>session change"]
    Profile["Load profile<br/>via getProfile()"]
    Context["Update AuthContext<br/>session, user, profile, role"]
    Dashboard["Redirect to<br/>/portal"]

    Login --> Submit
    Submit --> SignIn
    SignIn --> Auth
    Auth --> Check
    Check --> Profile
    Profile --> Context
    Context --> Dashboard
```

## Component Hierarchy (Home Page Example)

```mermaid
graph TB
    Home["Home Page<br/>(Home.tsx)"]
    Hero["HeroSection"]
    Resources["ResourcesSection"]
    Spotlights["SpotlightSection"]
    Testimonials["TestimonialsSection"]
    Email["EmailSignupSection"]

    Home --> Hero
    Home --> Resources
    Home --> Spotlights
    Home --> Testimonials
    Home --> Email

    Resources --> RC["ResourceCard<br/>Component"]
    Spotlights --> SC["SpotlightCard<br/>Component"]
    RC --> UI["UI Components<br/>Card, Button,<br/>Badge"]
    SC --> UI
    SC --> EB["EngagementButtons<br/>Like, Rate, Favorite"]
```

## Role-Based Access Control (RBAC)

```mermaid
graph TB
    User["Unauthenticated<br/>User"]
    Contrib["Contributor<br/>user.role = contributor"]
    Mod["Moderator<br/>user.role = moderator"]
    SuperAdmin["Super Admin<br/>user.role = super_admin"]

    User -->|Can Access| Public["/ (Home)<br/>/directory<br/>/events<br/>/spotlights"]

    Auth["Authenticated?"]
    Public --> Auth

    Auth -->|Yes| ProfileCheck["Profile Approved?"]
    Auth -->|No| Guard1["→ Redirect to<br/>/contributor-login"]

    ProfileCheck -->|Yes| Contrib
    ProfileCheck -->|No| Guard2["→ Stay on<br/>/portal"]

    Contrib -->|Can Access| Resources["/portal/resources<br/>/portal/events<br/>/portal (overview)"]

    IsMod["Role is<br/>Moderator?"]
    Resources --> IsMod
    IsMod -->|Yes| Mod
    IsMod -->|No| Guard3["→ Redirect to<br/>/portal"]

    Mod -->|Can Access| Moderation["/portal/moderation<br/>(Approve content)<br/>(Approve profiles)"]
    Mod -->|Same as| Resources

    SuperAdmin -->|Can Access| AllPortal["All Portal Pages<br/>+ Full System Access"]
```

## Resource Lifecycle (Contributor)

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    Draft --> Pending: Submit for Review
    Draft --> Archived: Archive
    Pending --> Published: Moderator Approves
    Pending --> Rejected: Moderator Rejects
    Pending --> Draft: Revise
    Published --> Archived: Archive
    Rejected --> Draft: Resubmit
    Archived --> [*]
```

## Service Dependencies

```mermaid
graph TB
    Component["Components<br/>(UI Layer)"]
    Portal["portalApi.ts<br/>(Main Service)"]
    Engagement["engagementSupabase.ts<br/>(Engagement Service)"]
    Validation["validation.ts<br/>(Validation)"]
    Profanity["profanityFilter.ts<br/>(Moderation)"]
    GoogleMaps["googleMaps.ts<br/>(Geolocation)"]
    Client["supabase.ts<br/>(Supabase Client)"]
    Supabase["Supabase API<br/>(Backend)"]

    Component -->|Uses| Portal
    Component -->|Uses| Engagement
    Component -->|Uses| Validation
    Component -->|Uses| Profanity
    Component -->|Uses| GoogleMaps

    Portal -->|Uses| Client
    Engagement -->|Uses| Client
    Validation -->|Standalone|
    Profanity -->|Standalone|
    GoogleMaps -->|Uses| Supabase

    Client -->|Connects to| Supabase
```

## Type System Overview

```mermaid
graph LR
    Home["home.ts<br/>DirectoryEntry<br/>SpotlightItem<br/>EventItem"]
    Portal["portal.ts<br/>ContributorProfile<br/>ResourceRecord<br/>EventRecord<br/>...Payloads"]
    Engagement["engagement.ts<br/>Comment<br/>Rating<br/>Like<br/>Favorite<br/>View"]

    Home -->|Used by| Pages["Directory.tsx<br/>Spotlights.tsx<br/>Home.tsx"]
    Portal -->|Used by| PortalPages["Portal.tsx<br/>PortalResources.tsx<br/>PortalEvents.tsx"]
    Engagement -->|Used by| Components["CommentComponent.tsx<br/>RatingComponent.tsx<br/>EngagementButtons.tsx"]

    Pages -->|"Fetch via"| API["portalApi.ts<br/>mapResourceToDirectoryEntry<br/>mapEventToEventItem"]
    PortalPages -->|"CRUD via"| API
    Components -->|"Fetch via"| Engagement_API["engagementSupabase.ts<br/>getResourceEngagement<br/>addRating"]
```
