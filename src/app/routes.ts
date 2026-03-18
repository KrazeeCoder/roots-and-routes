import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Directory } from "./pages/Directory";
import { Spotlights } from "./pages/Spotlights";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "directory", Component: Directory },
      { path: "spotlights", Component: Spotlights },
    ],
  },
]);
