export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const GOOGLE_MAPS_LOADER_OPTIONS = {
  id: "roots-routes-google-maps",
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
} as const;
