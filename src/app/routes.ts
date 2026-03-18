import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Directory } from "./pages/Directory";
import { Spotlights } from "./pages/Spotlights";
import { Events } from "./pages/Events";
import { Suggest } from "./pages/Suggest";
import { About } from "./pages/About";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "directory", Component: Directory },
      { path: "spotlights", Component: Spotlights },
      { path: "events", Component: Events },
      { path: "suggest", Component: Suggest },
      { path: "about", Component: About },
    ],
  },
]);
