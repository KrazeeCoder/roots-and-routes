import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { useJsApiLoader, GoogleMap, InfoWindowF, MarkerF } from "@react-google-maps/api";
import { Calendar, Check, ChevronDown, Clock, List, Map, MapPin, Navigation, Sparkles, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { listPublishedEvents, mapEventToEventItem } from "../data/portalApi";
import type { EventItem } from "../types/home";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADER_OPTIONS } from "../../utils/googleMaps";

const bothellCenter = { lat: 47.7614, lng: -122.2052 };
const radiusOptions = [5, 10, 25, 50] as const;
const EVENTS_PER_PAGE = 3;

type ViewMode = "list" | "map";

interface EventWithDistance extends EventItem {
  distanceMiles: number | null;
}

interface CalendarPayload {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}

interface CalendarMenuProps {
  payload: CalendarPayload | null;
  triggerClassName?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  align?: "start" | "center" | "end";
}

function hasCoordinates(event: EventItem) {
  return (
    typeof event.locationLat === "number"
    && Number.isFinite(event.locationLat)
    && typeof event.locationLng === "number"
    && Number.isFinite(event.locationLng)
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(latA: number, lngA: number, latB: number, lngB: number) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function toCalendarTimestamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildCalendarPayload(event: EventItem, origin: string): CalendarPayload | null {
  if (!event.startsAt) return null;

  const start = new Date(event.startsAt);
  if (!Number.isFinite(start.getTime())) return null;

  const parsedEnd = event.endsAt ? new Date(event.endsAt) : null;
  const hasValidEnd = parsedEnd && Number.isFinite(parsedEnd.getTime()) && parsedEnd.getTime() > start.getTime();
  const end = hasValidEnd ? parsedEnd : new Date(start.getTime() + 60 * 60 * 1000);
  const detailUrl = event.id && origin ? `${origin}/events/${event.id}` : null;
  const descriptionLines = [
    "Community event from Roots & Routes.",
    event.category ? `Category: ${event.category}` : null,
    event.postedByName ? `Organizer: ${event.postedByName}` : null,
    detailUrl ? `Details: ${detailUrl}` : null,
  ].filter(Boolean);

  return {
    title: event.title,
    description: descriptionLines.join("\n"),
    location: event.location,
    start,
    end,
  };
}

function buildGoogleCalendarUrl(payload: CalendarPayload) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: payload.title,
    dates: `${toCalendarTimestamp(payload.start)}/${toCalendarTimestamp(payload.end)}`,
    details: payload.description,
    location: payload.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildYahooCalendarUrl(payload: CalendarPayload) {
  const params = new URLSearchParams({
    v: "60",
    view: "d",
    type: "20",
    title: payload.title,
    st: toCalendarTimestamp(payload.start),
    et: toCalendarTimestamp(payload.end),
    desc: payload.description,
    in_loc: payload.location,
  });
  return `https://calendar.yahoo.com/?${params.toString()}`;
}

function downloadIcs(payload: CalendarPayload) {
  const uid = `${toCalendarTimestamp(new Date())}-${Math.random().toString(36).slice(2)}@rootsandroutes`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Roots & Routes//Events//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarTimestamp(new Date())}`,
    `DTSTART:${toCalendarTimestamp(payload.start)}`,
    `DTEND:${toCalendarTimestamp(payload.end)}`,
    `SUMMARY:${escapeIcsText(payload.title)}`,
    `DESCRIPTION:${escapeIcsText(payload.description)}`,
    `LOCATION:${escapeIcsText(payload.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const file = new Blob([`${lines.join("\r\n")}\r\n`], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  const safeTitle = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
  anchor.href = url;
  anchor.download = `${safeTitle}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function CalendarMenu({
  payload,
  triggerClassName,
  triggerVariant = "outline",
  triggerSize = "default",
  align = "start",
}: CalendarMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const googleUrl = payload ? buildGoogleCalendarUrl(payload) : null;
  const yahooUrl = payload ? buildYahooCalendarUrl(payload) : null;
  const menuPositionClass = align === "end"
    ? "right-0"
    : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0";

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        Add to Calendar
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open ? (
        <div
          role="menu"
          className={`absolute ${menuPositionClass} mt-2 w-56 rounded-md border border-[#D9C6A8] bg-white shadow-lg z-[120] p-1`}
        >
          <p className="px-2 py-1.5 text-sm font-medium text-[#334233]">Save This Event</p>
          <div className="my-1 h-px bg-[#E7D9C3]" />

          {googleUrl ? (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="block rounded-sm px-2 py-1.5 text-sm text-[#334233] hover:bg-[#F6F1E7]"
              onClick={() => setOpen(false)}
            >
              Google Calendar
            </a>
          ) : (
            <span className="block rounded-sm px-2 py-1.5 text-sm text-[#9AA085] cursor-not-allowed">
              Google Calendar
            </span>
          )}

          <button
            type="button"
            role="menuitem"
            disabled={!payload}
            className="w-full text-left rounded-sm px-2 py-1.5 text-sm text-[#334233] hover:bg-[#F6F1E7] disabled:text-[#9AA085] disabled:hover:bg-transparent disabled:cursor-not-allowed"
            onClick={() => {
              if (!payload) return;
              downloadIcs(payload);
              setOpen(false);
            }}
          >
            Apple / Outlook (.ics)
          </button>

          {yahooUrl ? (
            <a
              href={yahooUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="block rounded-sm px-2 py-1.5 text-sm text-[#334233] hover:bg-[#F6F1E7]"
              onClick={() => setOpen(false)}
            >
              Yahoo Calendar
            </a>
          ) : (
            <span className="block rounded-sm px-2 py-1.5 text-sm text-[#9AA085] cursor-not-allowed">
              Yahoo Calendar
            </span>
          )}

          {!payload ? (
            <>
              <div className="my-1 h-px bg-[#E7D9C3]" />
              <span className="block rounded-sm px-2 py-1.5 text-sm text-[#9AA085] cursor-not-allowed">
                Event time unavailable
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Events() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const { isLoaded: isMapsLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeCenter, setActiveCenter] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [radiusMilesFilter, setRadiusMilesFilter] = useState<number>(25);
  const [zipCode, setZipCode] = useState("");
  const [nearbyMessage, setNearbyMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [eventsWithGeocodedCoords, setEventsWithGeocodedCoords] = useState<EventItem[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Smooth scroll to top when component mounts
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const nextEvents = await listPublishedEvents();
        if (cancelled) return;
        const mappedEvents = nextEvents.map(mapEventToEventItem);
        setEvents(mappedEvents);

        // Geocode events that don't have coordinates but have addresses
        if (isMapsLoaded && window.google?.maps?.Geocoder) {
          setIsGeocoding(true);
          const geocoder = new window.google.maps.Geocoder();
          const geocodedEvents = await Promise.all(
            mappedEvents.map(async (event) => {
              if (!hasCoordinates(event) && event.location && event.location.trim()) {
                try {
                  const geocode = await geocoder.geocode({ address: event.location });
                  const location = geocode.results[0]?.geometry?.location;
                  if (location) {
                    return {
                      ...event,
                      locationLat: location.lat(),
                      locationLng: location.lng(),
                    };
                  }
                } catch (error) {
                  console.warn(`Could not geocode event location: ${event.location}`, error);
                }
              }
              return event;
            })
          );
          if (!cancelled) {
            setEventsWithGeocodedCoords(geocodedEvents);
            setIsGeocoding(false);
          }
        } else {
          setEventsWithGeocodedCoords(mappedEvents);
          setIsGeocoding(false);
        }
      } catch (error) {
        console.error("Could not load published events", error);
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [isMapsLoaded]);

  const featured = events[0];

  const eventsWithDistance = useMemo<EventWithDistance[]>(() => {
    const sourceEvents = eventsWithGeocodedCoords.length > 0 ? eventsWithGeocodedCoords : events;
    return sourceEvents.map((event) => {
      if (!activeCenter || !hasCoordinates(event)) {
        return { ...event, distanceMiles: null };
      }

      return {
        ...event,
        distanceMiles: distanceMiles(
          activeCenter.lat,
          activeCenter.lng,
          event.locationLat as number,
          event.locationLng as number,
        ),
      };
    });
  }, [activeCenter, events, eventsWithGeocodedCoords]);

  const textMatchedEvents = useMemo<EventWithDistance[]>(() => {
    if (!normalizedQuery) return eventsWithDistance;

    return eventsWithDistance.filter((event) => {
      const haystack = [
        event.title,
        event.category,
        event.location,
        event.date,
        event.time,
        event.postedByName ?? "",
      ].join(" ").toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [eventsWithDistance, normalizedQuery]);

  const visibleEvents = useMemo<EventWithDistance[]>(() => {
    if (!activeCenter) return textMatchedEvents;

    return textMatchedEvents
      .filter((event) => event.distanceMiles !== null && event.distanceMiles <= radiusMilesFilter)
      .sort((a, b) => (a.distanceMiles ?? Number.MAX_SAFE_INTEGER) - (b.distanceMiles ?? Number.MAX_SAFE_INTEGER));
  }, [activeCenter, textMatchedEvents, radiusMilesFilter]);

  // Pagination logic
  const totalPages = Math.ceil(visibleEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    return visibleEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
  }, [visibleEvents, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCenter, normalizedQuery, radiusMilesFilter]);

  const mapEvents = useMemo(
    () => visibleEvents.filter((event) => hasCoordinates(event)),
    [visibleEvents],
  );

  const hiddenWithoutCoordinates = useMemo(() => {
    if (!activeCenter) return 0;
    return textMatchedEvents.filter((event) => !hasCoordinates(event)).length;
  }, [activeCenter, textMatchedEvents]);

  const mapCenter = activeCenter ?? { ...bothellCenter, label: "Bothell, WA" };
  const selectedMarker = mapEvents.find((event) => event.id === selectedMarkerId);
  const featuredHref = featured?.id ? `/events/${featured.id}` : null;
  const featuredCalendar = useMemo(() => {
    if (!featured) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return buildCalendarPayload(featured, origin);
  }, [featured]);

  useEffect(() => {
    if (selectedMarkerId && !mapEvents.some((event) => event.id === selectedMarkerId)) {
      setSelectedMarkerId(null);
    }
  }, [mapEvents, selectedMarkerId]);

  const useNearMe = () => {
    setNearbyMessage(null);
    setIsLocating(true);

    if (!navigator.geolocation) {
      setActiveCenter({ ...bothellCenter, label: "Bothell, WA" });
      setNearbyMessage("Location access is unavailable on this browser, so we are showing nearby events around Bothell.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActiveCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your location",
        });
        setNearbyMessage("Showing events near your current location.");
        setIsLocating(false);
      },
      () => {
        setActiveCenter({ ...bothellCenter, label: "Bothell, WA" });
        setNearbyMessage("Location permission was denied, so we are showing nearby events around Bothell.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  };

  const onZipSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedZip = zipCode.trim();

    if (!trimmedZip) {
      setNearbyMessage("Enter a ZIP code to search nearby events.");
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setNearbyMessage("Google Maps API key is missing, so ZIP search is unavailable.");
      return;
    }

    if (!isMapsLoaded || !window.google?.maps?.Geocoder) {
      setNearbyMessage("Map service is still loading. Try ZIP search again in a moment.");
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const geocode = await geocoder.geocode({ address: trimmedZip });
      const location = geocode.results[0]?.geometry?.location;

      if (!location) {
        setNearbyMessage("Could not find that ZIP code. Try a nearby ZIP.");
        return;
      }

      setActiveCenter({
        lat: location.lat(),
        lng: location.lng(),
        label: trimmedZip,
      });
      setNearbyMessage(`Showing events near ZIP ${trimmedZip}.`);
    } catch (zipError) {
      console.error("Could not geocode zip code", zipError);
      setNearbyMessage("Could not search that ZIP right now. Please try again.");
    }
  };

  const clearNearby = () => {
    setActiveCenter(null);
    setNearbyMessage(null);
    setZipCode("");
    setSelectedMarkerId(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-20 pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/60 via-[#334233]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B36A4C]/20 border border-[#B36A4C]/30 text-[#E7D9C3] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-[#B36A4C]" />
                Community Gatherings & Workshops
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Upcoming <span className="text-[#B36A4C] italic">Community</span> Connections
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                Join neighbors for meaningful gatherings, resource fairs, and programs that strengthen our community roots.
                Browse upcoming dates and save the gatherings that matter to you.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button asChild className="w-full sm:w-auto" variant="default">
                  <a href="#featured" className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Featured Gathering
                  </a>
                </Button>
                <Button asChild className="w-full sm:w-auto" variant="secondary">
                  <a href="#upcoming" className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4" /> See All Gatherings
                  </a>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
          <div className="flex-1">
            <ScrollReveal>
              <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-5">
                Featured Gathering
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-[#5B473A] text-lg font-light max-w-2xl leading-relaxed">
                Highlighting a community moment we think you'll want to save to your calendar. Tap into the energy,
                meet local folks, and find support where it matters most.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#334233]/80">
                    <span className="px-3 py-1 rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      {featured?.date ?? "TBD"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#B36A4C]/10 text-[#B36A4C]">
                      {featured?.category ?? "Community Event"}
                    </span>
                  </div>
                  {featuredHref ? (
                    <Link
                      to={featuredHref}
                      className="block font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] hover:text-[#B36A4C] transition-colors"
                    >
                      {featured?.title ?? "No published event yet"}
                    </Link>
                  ) : (
                    <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233]">
                      {featured?.title ?? "No published event yet"}
                    </h3>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-[#5B473A] text-sm mt-4">
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A7AE8A]" /> {featured?.time ?? "Time TBD"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A7AE8A]" /> {featured?.location ?? "Location TBD"}
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    {featuredHref ? (
                      <Button variant="default" className="w-full sm:w-auto" asChild>
                        <Link to={featuredHref}>RSVP & Details</Link>
                      </Button>
                    ) : (
                      <Button variant="default" className="w-full sm:w-auto">
                        RSVP & Details
                      </Button>
                    )}
                    <CalendarMenu payload={featuredCalendar} triggerClassName="w-full sm:w-auto" />
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3]">
                  <ImageWithFallback
                    src={
                      featured?.image
                      ?? "https://images.unsplash.com/photo-1528605248644-14dd04022da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    }
                    alt={featured?.title ?? "Featured event"}
                    className="w-full h-64 object-cover sm:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/50 via-transparent" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="flex-1">
            <ScrollReveal delay={0.15}>
              <div className="rounded-3xl border border-[#E7D9C3] bg-white shadow-sm p-8">
                <h4 className="text-lg font-semibold text-[#334233] mb-4">Why join community events?</h4>
                <ul className="space-y-3 text-[#5B473A] text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      <Check className="w-4 h-4" />
                    </span>
                    <span>Meet neighbors and local organizers in a welcoming setting.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      <Check className="w-4 h-4" />
                    </span>
                    <span>Find support, resources, and services that fit your needs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      <Check className="w-4 h-4" />
                    </span>
                    <span>Build a stronger, more connected Bothell community.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="upcoming" className="bg-[#E7D9C3]/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-4">
                Upcoming Schedule
              </h2>
              <p className="text-[#5B473A] text-lg font-light leading-relaxed">
                Switch between list and map view, then find events near your location or a ZIP code.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="mt-6 rounded-3xl border border-[#D9C6A8] bg-gradient-to-r from-[#F8F5F0] via-[#F6F1E7] to-[#F1E7D8] p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-[#6F7553]">Monthly View</p>
                  <p className="text-[#334233] font-semibold mt-1">Need a full month-at-a-glance calendar?</p>
                  <p className="text-sm text-[#5B473A] mt-1">Open the community calendar to click dates and review day-specific events instantly.</p>
                </div>
                <Button variant="default" asChild className="w-full sm:w-auto">
                  <Link to="/calendar" className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Open Full Calendar
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-8 rounded-3xl border border-[#E7D9C3] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
              <div className="inline-flex rounded-xl border border-[#E7D9C3] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    viewMode === "list"
                      ? "bg-[#334233] text-white"
                      : "bg-[#F6F1E7] text-[#334233] hover:bg-[#E7D9C3]/70"
                  }`}
                >
                  <List className="w-4 h-4" /> List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    viewMode === "map"
                      ? "bg-[#334233] text-white"
                      : "bg-[#F6F1E7] text-[#334233] hover:bg-[#E7D9C3]/70"
                  }`}
                >
                  <Map className="w-4 h-4" /> Map
                </button>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <Button type="button" variant="outline" onClick={useNearMe} disabled={isLocating}>
                  <Navigation className="w-4 h-4" />
                  {isLocating ? "Finding location..." : "Near me"}
                </Button>

                <form
                  onSubmit={(event) => {
                    void onZipSearch(event);
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="space-y-1">
                    <Label htmlFor="events-zip-search" className="text-xs text-[#6F7553]">
                      ZIP fallback
                    </Label>
                    <Input
                      id="events-zip-search"
                      value={zipCode}
                      onChange={(event) => setZipCode(event.target.value)}
                      placeholder="98011"
                      className="w-28"
                    />
                  </div>
                  <Button type="submit" variant="secondary">
                    Use ZIP
                  </Button>
                </form>

                <div className="space-y-1">
                  <Label htmlFor="events-radius" className="text-xs text-[#6F7553]">
                    Radius
                  </Label>
                  <select
                    id="events-radius"
                    value={radiusMilesFilter}
                    onChange={(event) => setRadiusMilesFilter(Number(event.target.value))}
                    className="h-10 rounded-md border border-[#D9C6A8] bg-[#F6F1E7] px-3 text-sm"
                  >
                    {radiusOptions.map((radius) => (
                      <option key={radius} value={radius}>
                        {radius} miles
                      </option>
                    ))}
                  </select>
                </div>

                {activeCenter ? (
                  <Button type="button" variant="ghost" onClick={clearNearby}>
                    Clear nearby
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 text-sm text-[#5B473A]">
              {activeCenter ? (
                <p>
                  Nearby search center: <span className="font-semibold text-[#334233]">{mapCenter.label}</span>
                </p>
              ) : (
                <p>Showing all published events.</p>
              )}
              {query ? (
                <p className="mt-1 text-[#6F7553]">
                  Keyword filter: <span className="font-semibold text-[#334233]">{query}</span>
                </p>
              ) : null}
              {nearbyMessage ? <p className="mt-1 text-[#6F7553]">{nearbyMessage}</p> : null}
              {activeCenter && hiddenWithoutCoordinates > 0 ? (
                <p className="mt-1 text-[#6F7553]">
                  {hiddenWithoutCoordinates} event{hiddenWithoutCoordinates === 1 ? "" : "s"} do not have map coordinates yet.
                </p>
              ) : null}
            </div>
          </div>

          {viewMode === "map" ? (
            <div className="mt-8 rounded-3xl border border-[#E7D9C3] bg-white shadow-sm overflow-hidden">
              {!GOOGLE_MAPS_API_KEY ? (
                <p className="p-6 text-sm text-[#5B473A]">
                  Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable map view.
                </p>
              ) : !isMapsLoaded ? (
                <p className="p-6 text-sm text-[#5B473A]">Loading map...</p>
              ) : isGeocoding ? (
                <p className="p-6 text-sm text-[#5B473A]">Geocoding event addresses...</p>
              ) : mapEvents.length === 0 ? (
                <p className="p-6 text-sm text-[#5B473A]">No mappable events found for the current nearby filter.</p>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "460px" }}
                  center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
                  zoom={activeCenter ? 11 : 10}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {mapEvents.map((event, index) => (
                    <MarkerF
                      key={event.id ?? `marker-${index}`}
                      position={{ lat: event.locationLat as number, lng: event.locationLng as number }}
                      onClick={() => setSelectedMarkerId(event.id ?? null)}
                    />
                  ))}

                  {selectedMarker && hasCoordinates(selectedMarker) ? (
                    <InfoWindowF
                      position={{
                        lat: selectedMarker.locationLat as number,
                        lng: selectedMarker.locationLng as number,
                      }}
                      onCloseClick={() => setSelectedMarkerId(null)}
                    >
                      <div className="max-w-[220px] text-[#334233]">
                        <p className="text-xs uppercase tracking-wide text-[#6F7553]">{selectedMarker.category}</p>
                        {selectedMarker.id ? (
                          <Link
                            to={`/events/${selectedMarker.id}`}
                            className="font-semibold hover:text-[#B36A4C] transition-colors"
                          >
                            {selectedMarker.title}
                          </Link>
                        ) : (
                          <p className="font-semibold">{selectedMarker.title}</p>
                        )}
                        <p className="text-sm text-[#5B473A]">{selectedMarker.location}</p>
                        <p className="text-xs text-[#6F7553] mt-1">{selectedMarker.date} • {selectedMarker.time}</p>
                        {selectedMarker.distanceMiles !== null ? (
                          <p className="text-xs text-[#6F7553] mt-1">
                            {selectedMarker.distanceMiles.toFixed(1)} miles away
                          </p>
                        ) : null}
                      </div>
                    </InfoWindowF>
                  ) : null}
                </GoogleMap>
              )}
            </div>
          ) : null}

          {loadingEvents ? (
            <p className="mt-10 text-[#5B473A]">Loading events...</p>
          ) : visibleEvents.length === 0 ? (
            <p className="mt-10 text-[#5B473A]">
              {query
                ? `No events match "${query}"${activeCenter ? " in this radius yet." : "."}`
                : activeCenter
                  ? "No events found in this radius yet."
                  : "No published events yet."}
            </p>
          ) : (
            <>
              <StaggerGroup className="mt-12 space-y-10">
                {paginatedEvents.map((event, index) => {
                const detailHref = event.id ? `/events/${event.id}` : null;
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const eventCalendar = buildCalendarPayload(event, origin);

                return (
                  <StaggerItem key={event.id ?? index} className="relative">
                  <div className="relative border-l-2 border-[#A7AE8A]/50 pl-8 sm:pl-12">
                    <div className="absolute -left-[34px] top-4 w-8 h-8 rounded-full bg-[#F6F1E7] border-4 border-[#A7AE8A] shadow-sm" />
                    <div className="bg-white rounded-3xl border border-[#E7D9C3] shadow-sm p-8 hover:border-[#B36A4C] hover:shadow-md transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-sm font-semibold text-[#334233]/80 mb-3">
                            <span className="px-3 py-1 rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">{event.date}</span>
                            <span className="px-3 py-1 rounded-full bg-[#B36A4C]/10 text-[#B36A4C]">{event.category}</span>
                          </div>
                          {detailHref ? (
                            <Link to={detailHref} className="text-2xl font-bold text-[#334233] mb-2 hover:text-[#B36A4C] transition-colors block">
                              {event.title}
                            </Link>
                          ) : (
                            <h3 className="text-2xl font-bold text-[#334233] mb-2">{event.title}</h3>
                          )}
                          <div className="flex flex-wrap gap-6 text-[#5B473A] text-sm mb-4">
                            <span className="inline-flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#A7AE8A]" /> {event.time}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#A7AE8A]" /> {event.location}
                            </span>
                            {event.distanceMiles !== null ? (
                              <span className="inline-flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-[#A7AE8A]" /> {event.distanceMiles.toFixed(1)} miles away
                              </span>
                            ) : null}
                          </div>
                          {event.postedByName ? (
                            <p className="text-xs text-[#6F7553] mb-4">Posted by {event.postedByName}</p>
                          ) : null}
                          <div className="flex flex-wrap gap-3">
                            {detailHref ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={detailHref}>View Details</Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                            <CalendarMenu payload={eventCalendar} triggerVariant="outline" triggerSize="sm" />
                          </div>
                        </div>
                        {event.image ? (
                          <div className="w-full sm:w-64 h-40 rounded-2xl overflow-hidden flex-shrink-0 relative">
                            <ImageWithFallback src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/60 via-transparent" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 p-0 ${currentPage === page ? "bg-[#B36A4C] hover:bg-[#8A6F5A]" : ""}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            </>
          )}

          <div className="mt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-[#5B473A]">
              <span className="font-semibold text-[#334233]">Want more?</span> Check the community calendar for all meeting dates.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" asChild>
                <Link to="/calendar" className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Full Community Calendar
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <a href="#" className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4" /> Join Our Mailing List
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
