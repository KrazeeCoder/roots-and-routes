import type { Library, UseLoadScriptOptions } from "@react-google-maps/api";

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

/** Shared loader for every screen using Maps + Places (maps core loads with the Places library). */
const GOOGLE_MAPS_LIBRARIES: Library[] = ["places"];

export const GOOGLE_MAPS_LOADER_OPTIONS: UseLoadScriptOptions = {
  id: "roots-routes-google-maps",
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: GOOGLE_MAPS_LIBRARIES,
};

export const METERS_PER_MILE = 1609.344;

export function milesToMeters(miles: number) {
  return miles * METERS_PER_MILE;
}
