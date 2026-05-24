import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useJsApiLoader, CircleF, GoogleMap, InfoWindowF, MarkerF } from "@react-google-maps/api";
import { Calendar, Check, ChevronDown, Clock, List, Map, MapPin, Navigation, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { EventListSkeleton } from "../components/ui/skeleton";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { listPublishedEvents, mapEventToEventItem } from "../data/portalApi";
import type { EventItem } from "../types/home";
import { EVENT_DETAIL_DEFAULT_NAV } from "../utils/detailNavigation";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADER_OPTIONS, milesToMeters } from "../../utils/googleMaps";

const bothellCenter = { lat: 47.7614, lng: -122.2052 };
const radiusOptions = [1, 5, 10, 25] as const;
const EVENTS_PER_PAGE = 6;
const DEFAULT_EVENT_IMAGE = "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1280/sample.jpg";
const CARD_INTERACTIVE_ELEMENT_SELECTOR = "a, button, input, select, textarea, [role='button'], [role='menuitem']";

type ViewMode = "list" | "map";
type EventTimeframe = "upcoming" | "past";

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
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  align?: "start" | "center" | "end";
}

function getEventStartsAtTimestamp(event: Pick<EventItem, "startsAt">) {
  if (!event.startsAt) return null;
  const startsAtMs = new Date(event.startsAt).getTime();
  return Number.isFinite(startsAtMs) ? startsAtMs : null;
}

function filterEventsByTimeframe<T extends EventItem>(
  events: T[],
  timeframe: EventTimeframe,
  now = new Date(),
) {
  const nowMs = now.getTime();
  return events.filter((event) => {
    const startsAtMs = getEventStartsAtTimestamp(event);
    if (startsAtMs === null) return false;
    return timeframe === "upcoming" ? startsAtMs >= nowMs : startsAtMs < nowMs;
  });
}

function sortEventsByStartsAt<T extends EventItem>(
  events: T[],
  direction: "asc" | "desc",
) {
  return [...events].sort((a, b) => {
    const aStartsAt = getEventStartsAtTimestamp(a);
    const bStartsAt = getEventStartsAtTimestamp(b);
    const aMs = aStartsAt ?? 0;
    const bMs = bStartsAt ?? 0;
    return direction === "asc" ? aMs - bMs : bMs - aMs;
  });
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

function isInteractiveCardElement(target: EventTarget | null) {
  return target instanceof Element && target.closest(CARD_INTERACTIVE_ELEMENT_SELECTOR) !== null;
}

function zoomForCircleHeight({
  latitude,
  radiusMeters,
  mapHeightPx,
}: {
  latitude: number;
  radiusMeters: number;
  mapHeightPx: number;
}) {
  if (!Number.isFinite(mapHeightPx) || mapHeightPx <= 0) return null;

  const latRadians = (latitude * Math.PI) / 180;
  const metersPerPixelAtZoom0 = 156543.03392 * Math.cos(latRadians);
  const desiredMetersPerPixel = (radiusMeters * 2) / mapHeightPx;

  if (desiredMetersPerPixel <= 0 || !Number.isFinite(desiredMetersPerPixel)) return null;

  const zoom = Math.log2(metersPerPixelAtZoom0 / desiredMetersPerPixel);
  return Math.max(0, Math.min(21, zoom));
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const { isLoaded: isMapsLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [timeframeFilter, setTimeframeFilter] = useState<EventTimeframe>("upcoming");
  const [activeCenter, setActiveCenter] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [radiusMilesFilter, setRadiusMilesFilter] = useState<number>(25);
  const [locationQuery, setLocationQuery] = useState("");
  const [nearbyMessage, setNearbyMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [eventsWithGeocodedCoords, setEventsWithGeocodedCoords] = useState<EventItem[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

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

  const timeframeEvents = useMemo<EventWithDistance[]>(() => {
    const filteredEvents = filterEventsByTimeframe(eventsWithDistance, timeframeFilter);
    const direction = timeframeFilter === "upcoming" ? "asc" : "desc";
    return sortEventsByStartsAt(filteredEvents, direction);
  }, [eventsWithDistance, timeframeFilter]);

  const featured = timeframeEvents[0];

  const textMatchedEvents = useMemo<EventWithDistance[]>(() => {
    if (!normalizedQuery) return timeframeEvents;

    return timeframeEvents.filter((event) => {
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
  }, [timeframeEvents, normalizedQuery]);

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
  }, [activeCenter, normalizedQuery, radiusMilesFilter, timeframeFilter]);

  const mapEvents = useMemo(
    () => visibleEvents.filter((event) => hasCoordinates(event)),
    [visibleEvents],
  );
  const radiusMeters = useMemo(() => milesToMeters(radiusMilesFilter), [radiusMilesFilter]);

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

  const syncMapToActiveRadius = useCallback((map: google.maps.Map) => {
    if (!activeCenter) return;

    map.setCenter({ lat: activeCenter.lat, lng: activeCenter.lng });
    const mapHeightPx = map.getDiv().clientHeight;
    const zoom = zoomForCircleHeight({
      latitude: activeCenter.lat,
      radiusMeters,
      mapHeightPx,
    });

    if (zoom !== null) {
      map.setZoom(zoom);
    }
  }, [activeCenter, radiusMeters]);

  useEffect(() => {
    if (viewMode !== "map" || !mapRef.current) return;
    syncMapToActiveRadius(mapRef.current);
  }, [syncMapToActiveRadius, viewMode]);

  useEffect(() => {
    if (viewMode !== "map" || !activeCenter) return;

    const handleResize = () => {
      if (mapRef.current) {
        syncMapToActiveRadius(mapRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeCenter, syncMapToActiveRadius, viewMode]);

  useEffect(() => {
    if (!selectedMarkerId) return;
    const selectedIndex = visibleEvents.findIndex((event) => event.id === selectedMarkerId);
    if (selectedIndex === -1) return;
    const targetPage = Math.floor(selectedIndex / EVENTS_PER_PAGE) + 1;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [currentPage, selectedMarkerId, visibleEvents]);

  const showEventOnMap = (eventId: string) => {
    setSelectedMarkerId(eventId);
    setViewMode("map");
    window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const useNearMe = () => {
    setNearbyMessage(null);
    setIsLocating(true);

    if (!navigator.geolocation) {
      setNearbyMessage("Location access is unavailable on this browser. Enter a ZIP or address instead.");
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
        setNearbyMessage("Location permission was denied. Enter a ZIP or address to search nearby.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  };

  const onLocationSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedLocation = locationQuery.trim();

    if (!trimmedLocation) {
      setNearbyMessage("Enter a ZIP or address to search nearby events.");
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setNearbyMessage("Google Maps API key is missing, so location search is unavailable.");
      return;
    }

    if (!isMapsLoaded || !window.google?.maps?.Geocoder) {
      setNearbyMessage("Map service is still loading. Try location search again in a moment.");
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const geocode = await geocoder.geocode({ address: trimmedLocation });
      const topResult = geocode.results[0];
      const location = topResult?.geometry?.location;

      if (!location) {
        setNearbyMessage("Could not find that location. Try a nearby ZIP or full address.");
        return;
      }

      const label = topResult?.formatted_address ?? trimmedLocation;
      setActiveCenter({
        lat: location.lat(),
        lng: location.lng(),
        label,
      });
      setNearbyMessage(`Showing events near ${label}.`);
    } catch (locationError) {
      console.error("Could not geocode location query", locationError);
      setNearbyMessage("Could not search that location right now. Please try again.");
    }
  };

  const clearNearby = () => {
    setActiveCenter(null);
    setNearbyMessage(null);
    setLocationQuery("");
    setSelectedMarkerId(null);
  };

  const handleEventCardClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>, detailHref: string | null) => {
      if (!detailHref) return;
      if (isInteractiveCardElement(event.target)) return;
      navigate(detailHref, { state: EVENT_DETAIL_DEFAULT_NAV });
    },
    [navigate],
  );

  const handleEventCardKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>, detailHref: string | null) => {
      if (!detailHref) return;
      if (event.currentTarget !== event.target) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      navigate(detailHref, { state: EVENT_DETAIL_DEFAULT_NAV });
    },
    [navigate],
  );

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
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  variant="secondary"
                >
                  <Link to="/calendar" className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Open Full Calendar
                  </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto" variant="outline">
                  <Link to="/suggest?type=event" className="inline-flex items-center gap-2">
                    Submit an Event
                  </Link>
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

      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <ScrollReveal>
          <div className="mb-8 rounded-2xl border-2 border-[#B36A4C]/45 bg-gradient-to-r from-[#FFF9EF] via-[#F6F1E7] to-[#EEDFC9] p-4 sm:p-5 shadow-md ring-1 ring-[#B36A4C]/25">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#7E664F]">Event Calendar</p>
                <h2 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-[#334233] mt-1">
                  Need the full month-at-a-glance?
                </h2>
                <p className="text-[#5B473A] text-sm mt-1 leading-relaxed">
                  Open the community calendar to click dates and review day-specific events instantly.
                </p>
              </div>
              <Button
                variant="default"
                asChild
                className="w-full sm:w-auto sm:min-w-48 h-10 px-6 text-sm font-semibold rounded-md shadow-sm"
              >
                <Link to="/calendar" className="inline-flex items-center justify-center gap-2">
                  <Calendar className="size-4" /> Open Full Calendar
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
          <div className="flex-1">
            <ScrollReveal>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#334233] mb-4">
                Featured Gathering
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-[#5B473A] text-base font-light max-w-2xl leading-relaxed">
                Highlighting a community moment we think you'll want to save to your calendar. Tap into the energy,
                meet local folks, and find support where it matters most.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
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
                      state={EVENT_DETAIL_DEFAULT_NAV}
                      className="block font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] hover:text-[#B36A4C] transition-colors"
                    >
                      {featured?.title ?? "No published event yet"}
                    </Link>
                  ) : (
                    <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233]">
                      {featured?.title ?? "No published event yet"}
                    </h3>
                  )}
                  <div className="mt-4 rounded-xl border border-[#D9C6A8] bg-[#F8F5F0] divide-y divide-[#E7D9C3]">
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#A7AE8A]/25 text-[#5B473A]">
                        <Clock className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-[#6F7553]">Time</p>
                        <p className="mt-1 text-[#334233] font-semibold text-sm leading-snug">
                          {featured?.time ?? "Time TBD"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#A7AE8A]/25 text-[#5B473A]">
                        <MapPin className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-[#6F7553]">Location</p>
                        <p className="mt-1 text-[#334233] font-medium text-sm leading-snug break-words">
                          {featured?.location ?? "Location TBD"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    {featuredHref ? (
                      <Button variant="default" className="w-full sm:w-auto" asChild>
                        <Link to={featuredHref} state={EVENT_DETAIL_DEFAULT_NAV}>View Details</Link>
                      </Button>
                    ) : (
                      <Button variant="default" className="w-full sm:w-auto">
                        RSVP & Details
                      </Button>
                    )}
                    <CalendarMenu payload={featuredCalendar} triggerClassName="w-full sm:w-auto" />
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#E7D9C3]">
                  <ImageWithFallback
                    src={featured?.image?.trim() ? featured.image : DEFAULT_EVENT_IMAGE}
                    alt={featured?.title ?? "Featured event"}
                    className="w-full h-52 object-cover sm:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/50 via-transparent" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="flex-1">
            <ScrollReveal delay={0.15}>
              <div className="rounded-2xl border border-[#E7D9C3] bg-white shadow-sm p-6">
                <h4 className="text-base font-semibold text-[#334233] mb-3">Why join community events?</h4>
                <ul className="space-y-2 text-[#5B473A] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Meet neighbors and local organizers in a welcoming setting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Find support, resources, and services that fit your needs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Build a stronger, more connected Bothell community.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="upcoming" className="bg-[#E7D9C3]/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#334233] mb-3">
                {timeframeFilter === "upcoming" ? "Upcoming Schedule" : "Past Events"}
              </h2>
              <p className="text-[#5B473A] text-base font-light leading-relaxed">
                Switch between upcoming and past events, then use list/map view and nearby filters.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-4 rounded-2xl border border-[#E7D9C3] bg-white p-4 shadow-sm">
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
                <form
                  onSubmit={(event) => {
                    void onLocationSearch(event);
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="space-y-1">
                    <Label htmlFor="events-location-search" className="text-xs text-[#6F7553]">
                      Location
                    </Label>
                    <Input
                      id="events-location-search"
                      value={locationQuery}
                      onChange={(event) => setLocationQuery(event.target.value)}
                      placeholder="ZIP or address"
                      className="w-48 sm:w-64"
                    />
                  </div>
                  <Button type="submit" variant="secondary">
                    Search
                  </Button>
                </form>

                <Button type="button" variant="outline" onClick={useNearMe} disabled={isLocating}>
                  <Navigation className="w-4 h-4" />
                  {isLocating ? "Finding location..." : "Use my location"}
                </Button>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="events-timeframe" className="mb-0 text-xs text-[#6F7553]">
                    Timeframe
                  </Label>
                  <select
                    id="events-timeframe"
                    value={timeframeFilter}
                    onChange={(event) => setTimeframeFilter(event.target.value === "past" ? "past" : "upcoming")}
                    className="h-10 rounded-md border border-[#D9C6A8] bg-[#F6F1E7] px-3 text-sm"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="events-radius" className="mb-0 text-xs text-[#6F7553]">
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
                <p>Showing {timeframeFilter} published events.</p>
              )}
              {query ? (
                <p className="mt-1 text-[#6F7553]">
                  Keyword filter: <span className="font-semibold text-[#334233]">{query}</span>
                </p>
              ) : null}
              {nearbyMessage ? <p className="mt-1 text-[#6F7553]">{nearbyMessage}</p> : null}
            </div>
          </div>

          {viewMode === "map" ? (
            <div ref={mapSectionRef} className="mt-8 rounded-3xl border border-[#E7D9C3] bg-white shadow-sm overflow-hidden">
              {!GOOGLE_MAPS_API_KEY ? (
                <p className="p-6 text-sm text-[#5B473A]">
                  Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable map view.
                </p>
              ) : !isMapsLoaded ? (
                <p className="p-6 text-sm text-[#5B473A]">Loading map...</p>
              ) : loadingEvents || isGeocoding ? (
                <p className="p-6 text-sm text-[#5B473A]">
                  {loadingEvents ? "Loading events..." : "Geocoding event addresses..."}
                </p>
              ) : (
                <>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "360px" }}
                  center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
                  zoom={activeCenter ? 11 : 10}
                  onLoad={(map) => {
                    mapRef.current = map;
                    syncMapToActiveRadius(map);
                  }}
                  onUnmount={() => {
                    mapRef.current = null;
                  }}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {activeCenter ? (
                    <CircleF
                      center={{ lat: activeCenter.lat, lng: activeCenter.lng }}
                      radius={radiusMeters}
                      options={{
                        fillColor: "#A7AE8A",
                        fillOpacity: 0.12,
                        strokeColor: "#5B473A",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        clickable: false,
                      }}
                    />
                  ) : null}

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
                            state={EVENT_DETAIL_DEFAULT_NAV}
                            className="font-semibold hover:text-[#B36A4C] transition-colors"
                          >
                            {selectedMarker.title}
                          </Link>
                        ) : (
                          <p className="font-semibold">{selectedMarker.title}</p>
                        )}
                        <p className="text-sm text-[#5B473A]">{selectedMarker.location}</p>
                        <p className="text-xs text-[#6F7553] mt-1">{selectedMarker.date} - {selectedMarker.time}</p>
                        {selectedMarker.distanceMiles !== null ? (
                          <p className="text-xs text-[#6F7553] mt-1">
                            {selectedMarker.distanceMiles.toFixed(1)} miles away
                          </p>
                        ) : null}
                      </div>
                    </InfoWindowF>
                  ) : null}
                </GoogleMap>
                {mapEvents.length === 0 ? (
                  <p className="border-t border-[#E7D9C3] p-4 text-sm text-[#5B473A]">
                    No mappable {timeframeFilter} events found for the current nearby filter.
                  </p>
                ) : null}
                </>
              )}
            </div>
          ) : null}

          {loadingEvents ? (
            <EventListSkeleton />
          ) : visibleEvents.length === 0 ? (
            <p className="mt-10 text-[#5B473A]">
              {query
                ? `No ${timeframeFilter} events match "${query}"${activeCenter ? " in this radius yet." : "."}`
                : activeCenter
                  ? `No ${timeframeFilter} events found in this radius yet.`
                  : timeframeFilter === "upcoming"
                    ? "No upcoming events yet."
                    : "No past events yet."}
            </p>
          ) : (
            <>
              <StaggerGroup className="mt-8 space-y-6">
                {paginatedEvents.map((event, index) => {
                const detailHref = event.id ? `/events/${event.id}` : null;
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const eventCalendar = buildCalendarPayload(event, origin);
                const canShowOnMap = Boolean(event.id && hasCoordinates(event));
                const isSelectedCard = event.id !== undefined && selectedMarkerId === event.id;

                return (
                  <StaggerItem key={event.id ?? index} className="relative">
                  <div className="relative border-l-2 border-[#A7AE8A]/50 pl-6 sm:pl-8">
                    <div className="absolute -left-[26px] top-3 w-6 h-6 rounded-full bg-[#F6F1E7] border-3 border-[#A7AE8A] shadow-sm" />
                    <div
                      role={detailHref ? "link" : undefined}
                      tabIndex={detailHref ? 0 : undefined}
                      aria-label={detailHref ? `Open event details: ${event.title}` : undefined}
                      onClick={(event) => handleEventCardClick(event, detailHref)}
                      onKeyDown={(event) => handleEventCardKeyDown(event, detailHref)}
                      className={`rounded-2xl border shadow-sm p-4 sm:p-5 lg:p-4 transition-all ${
                        isSelectedCard
                          ? "bg-[#FFF8EE] border-[#B36A4C] ring-2 ring-[#B36A4C]/20"
                          : "bg-white border-[#E7D9C3] hover:border-[#B36A4C] hover:shadow-md"
                      } ${
                        detailHref ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B36A4C]/40" : ""
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#334233]/80 mb-2">
                            <span className="px-2 py-1 rounded-full bg-[#A7AE8A]/20 text-[#5B473A] text-xs">{event.date}</span>
                            <span className="px-2 py-1 rounded-full bg-[#B36A4C]/10 text-[#B36A4C] text-xs">{event.category}</span>
                          </div>
                          {detailHref ? (
                            <Link
                              to={detailHref}
                              state={EVENT_DETAIL_DEFAULT_NAV}
                              className="text-xl font-bold text-[#334233] mb-2 hover:text-[#B36A4C] transition-colors block"
                            >
                              {event.title}
                            </Link>
                          ) : (
                            <h3 className="text-xl font-bold text-[#334233] mb-2">{event.title}</h3>
                          )}
                          <div className="flex flex-wrap gap-4 text-[#5B473A] text-xs mb-3">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#A7AE8A]" /> {event.time}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#A7AE8A]" /> {event.location}
                            </span>
                            {event.distanceMiles !== null ? (
                              <span className="inline-flex items-center gap-1">
                                <Navigation className="w-3 h-3 text-[#A7AE8A]" /> {event.distanceMiles.toFixed(1)} miles away
                              </span>
                            ) : null}
                          </div>
                          {event.postedByName ? (
                            <p className="text-xs text-[#6F7553] mb-3">Posted by {event.postedByName}</p>
                          ) : null}
                          <div className="flex flex-wrap gap-3 lg:hidden">
                            {canShowOnMap && event.id ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => showEventOnMap(event.id as string)}
                                className={isSelectedCard ? "border border-[#B36A4C]/35" : undefined}
                              >
                                Show on map
                              </Button>
                            ) : null}
                            {detailHref ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={detailHref} state={EVENT_DETAIL_DEFAULT_NAV}>View Details</Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                            <CalendarMenu payload={eventCalendar} triggerVariant="outline" triggerSize="sm" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-shrink-0">
                          <div className="w-full sm:w-48 lg:w-52 h-32 lg:h-28 rounded-xl overflow-hidden relative">
                            <ImageWithFallback
                              src={event.image?.trim() ? event.image : DEFAULT_EVENT_IMAGE}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/60 via-transparent" />
                          </div>
                          <div className="hidden lg:flex lg:w-[170px] lg:flex-col lg:gap-2">
                            {canShowOnMap && event.id ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => showEventOnMap(event.id as string)}
                                className={`w-full justify-center ${isSelectedCard ? "border border-[#B36A4C]/35" : ""}`}
                              >
                                Show on map
                              </Button>
                            ) : null}
                            {detailHref ? (
                              <Button variant="outline" size="sm" className="w-full justify-center" asChild>
                                <Link to={detailHref} state={EVENT_DETAIL_DEFAULT_NAV}>View Details</Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="w-full justify-center">
                                View Details
                              </Button>
                            )}
                            <CalendarMenu
                              payload={eventCalendar}
                              triggerVariant="outline"
                              triggerSize="sm"
                              triggerClassName="w-full justify-between"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex w-full max-w-[180px] items-center justify-center gap-2 sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="w-full max-w-full overflow-x-auto px-1 sm:w-auto">
                  <div className="flex min-w-max items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 shrink-0 p-0 ${currentPage === page ? "bg-[#B36A4C] hover:bg-[#8A6F5A]" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex w-full max-w-[180px] items-center justify-center gap-2 sm:w-auto"
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
              <span className="font-semibold text-[#334233]">Want more?</span> Check the community calendar or submit a public event proposal for moderator review.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" asChild>
                <Link to="/calendar" className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Full Community Calendar
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/suggest?type=event">Submit an Event</Link>
              </Button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
