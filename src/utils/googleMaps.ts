export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

/** Shared loader for every screen using Maps + Places (maps core loads with the Places library). */
export const GOOGLE_MAPS_LOADER_OPTIONS = {
  id: "roots-routes-google-maps",
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ["places"] as const,
} as const;
