import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Directory } from "./pages/Directory";
import { Spotlights } from "./pages/Spotlights";
import { Events } from "./pages/Events";
import { Suggest } from "./pages/Suggest";
import { About } from "./pages/About";
import { ContributorLogin } from "./pages/ContributorLogin";
import { ResetPassword } from "./pages/ResetPassword";
import { Portal } from "./pages/Portal";
import { PortalResources } from "./pages/PortalResources";
import { PortalEvents } from "./pages/PortalEvents";
import { PortalModeration } from "./pages/PortalModeration";
import { Reference } from "./pages/Reference";
import { ResourceDetail } from "./pages/ResourceDetail";
import { EventDetail } from "./pages/EventDetail";
import { RequireAuth, RequireModerator } from "./auth/RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "directory", Component: Directory },
      { path: "spotlights", Component: Spotlights },
      { path: "events", Component: Events },
      { path: "events/:eventId", Component: EventDetail },
      { path: "suggest", Component: Suggest },
      { path: "about", Component: About },
      { path: "resources/:resourceId", Component: ResourceDetail },
      { path: "reference", Component: Reference },
      { path: "contributor-login", Component: ContributorLogin },
      { path: "reset-password", Component: ResetPassword },
      {
        path: "portal",
        element: (
          <RequireAuth>
            <Portal />
          </RequireAuth>
        ),
      },
      {
        path: "portal/resources",
        element: (
          <RequireAuth>
            <PortalResources />
          </RequireAuth>
        ),
      },
      {
        path: "portal/events",
        element: (
          <RequireAuth>
            <PortalEvents />
          </RequireAuth>
        ),
      },
      {
        path: "portal/moderation",
        element: (
          <RequireAuth>
            <RequireModerator>
              <PortalModeration />
            </RequireModerator>
          </RequireAuth>
        ),
      },
    ],
  },
]);
