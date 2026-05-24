import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, BadgeCheck, CalendarDays, CalendarPlus, ChevronDown, Clock, MapPin, Sparkles, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import LightRays from "../components/ui/light-rays";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { listSpotlightEvents, listSpotlightItems } from "../data/portalApi";
import { buildDisplayImageSet } from "../../utils/imageProxy";
import { getSpotlightEngagement } from "../../utils/engagementSupabase";
import { ProgressiveBlurCard } from "../components/ui/progressive-blur-card";
import type { SpotlightItem } from "../types/home";
import type { EventRecord } from "../types/portal";
import { EVENT_DETAIL_FROM_SPOTLIGHTS_NAV, RESOURCE_DETAIL_FROM_SPOTLIGHTS_NAV } from "../utils/detailNavigation";

const FALLBACK_SPOTLIGHT_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80";

type SceneSpotlightItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  image?: string | null;
  updatedAt?: string;
  href: string;
};

function getEventDateParts(event: EventRecord) {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  const date = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const year = start.toLocaleDateString(undefined, { year: "numeric" });
  const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = end ? end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;

  return {
    date,
    year,
    time: endTime ? `${startTime} - ${endTime}` : startTime,
  };
}

function toCalendarDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function getEventCalendarRange(event: EventRecord) {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

function buildGoogleCalendarUrl(event: EventRecord) {
  const { start, end } = getEventCalendarRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarDate(start.toISOString())}/${toCalendarDate(end.toISOString())}`,
    details: event.description?.trim() ?? "",
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildYahooCalendarUrl(event: EventRecord) {
  const { start, end } = getEventCalendarRange(event);
  const params = new URLSearchParams({
    v: "60",
    view: "d",
    type: "20",
    title: event.title,
    st: toCalendarDate(start.toISOString()),
    et: toCalendarDate(end.toISOString()),
    desc: event.description?.trim() ?? "",
    in_loc: event.location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function downloadEventIcs(event: EventRecord) {
  const { start, end } = getEventCalendarRange(event);
  const timestamp = toCalendarDate(new Date().toISOString());
  const safeTitle = event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Roots & Routes//Spotlights//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${timestamp}-${safeTitle}@rootsandroutes`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${toCalendarDate(start.toISOString())}`,
    `DTEND:${toCalendarDate(end.toISOString())}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description?.trim() ?? "")}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const file = new Blob([`${lines.join("\r\n")}\r\n`], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeTitle}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function toTimestamp(value: string | undefined) {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function rotateItems<T>(items: T[], offset: number) {
  if (items.length === 0) return [];
  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  if (normalizedOffset === 0) return items;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

function clampStarFill(value: number, starIndex: number) {
  const fill = (value - starIndex) * 100;
  return Math.max(0, Math.min(100, fill));
}

function SpotlightStars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1 text-[#7A5C48]">
      {Array.from({ length: 5 }).map((_, starIndex) => {
        const fillPercent = clampStarFill(rating, starIndex);
        return (
          <span key={starIndex} className="relative inline-flex">
            <Star className="size-3.5 text-[#D0C3AE]" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star className="size-3.5 fill-[#F2B94B] text-[#F2B94B]" />
            </span>
          </span>
        );
      })}
      <span className="ml-1 text-xs font-semibold tabular-nums text-[#6F7553]">{rating.toFixed(1)} / 5</span>
    </div>
  );
}

function SpotlightEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="relative rounded-[2rem] border border-[#E7D9C3] bg-white/82 px-6 py-16 text-center shadow-xl shadow-[#334233]/8">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6F1E7]">
        <Star className="h-10 w-10 text-[#A7AE8A]" />
      </div>
      <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#243224]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-lg text-[#6F7553]">{message}</p>
    </div>
  );
}

function SpotlightsHero({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const enterInitial = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 };
  const enterTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" as const };

  return (
    <section className="relative isolate overflow-hidden bg-[#243224] text-[#F6F1E7]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(246,241,231,0.20),transparent_30%),linear-gradient(180deg,#182318_0%,#243224_56%,#334233_100%)]" />

      <div className="pointer-events-none absolute inset-0 z-0 text-[#F6F1E7] opacity-[0.24]">
        <TopoPattern opacity={0.18} />
      </div>

      <LightRays
        raysOrigin="top-center"
        raysColor="#FFF4D6"
        raysSpeed={shouldReduceMotion ? 0.2 : 0.72}
        lightSpread={0.58}
        rayLength={1.45}
        pulsating={false}
        fadeDistance={1.1}
        saturation={0.74}
        followMouse={false}
        mouseInfluence={0}
        noiseAmount={0.02}
        distortion={0.012}
        className="absolute inset-0 z-0 opacity-70 [mask-image:linear-gradient(180deg,black_0%,black_72%,transparent_100%)]"
      />

      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-24 w-[min(48rem,88vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,244,214,0.40),rgba(255,244,214,0.12)_42%,transparent_72%)] blur-xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-px w-[min(44rem,84vw)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,244,214,0.95),transparent)] shadow-[0_0_32px_rgba(255,244,214,0.75)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-[#243224] via-[#243224]/82 to-transparent" />

      <div className="relative z-30 mx-auto flex min-h-[17rem] max-w-7xl items-center justify-center px-4 pb-8 pt-20 text-center sm:min-h-[19rem] sm:px-6 sm:pt-24 lg:min-h-[21rem] lg:px-8 lg:pt-28">
        <div className="mx-auto w-full min-w-0 max-w-3xl -translate-y-6 sm:-translate-y-8 lg:-translate-y-10">
          <motion.h1
            initial={enterInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...enterTransition, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="font-['Cormorant_Garamond',serif] text-4xl font-black leading-[0.95] tracking-tight text-[#F6F1E7] drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] min-[390px]:text-5xl sm:text-6xl lg:text-7xl"
          >
            Community <span className="block text-[#D08964] sm:inline">Spotlights</span>
          </motion.h1>
          <motion.p
            initial={enterInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...enterTransition, delay: shouldReduceMotion ? 0 : 0.34 }}
            className="mx-auto mt-8 w-full max-w-2xl text-lg leading-8 text-[#E7D9C3]/90"
          >
            A curated sequence of local stories, programs, and community efforts shaping Bothell right now.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function ScenicFeaturedSpotlight({
  item,
  averageRating,
  shouldReduceMotion,
  onOpenResource,
}: {
  item: SpotlightItem;
  averageRating: number;
  shouldReduceMotion: boolean;
  onOpenResource: (spotlightId: string) => void;
}) {
  const scenicSrc =
    buildDisplayImageSet(item.image)?.src ??
    item.image ??
    FALLBACK_SPOTLIGHT_IMAGE;
  const subtitle = item.subtitle?.trim() ?? "";
  const descriptiveSubtitle =
    subtitle.length > 0 && subtitle.toLowerCase() !== "community spotlight"
      ? subtitle
      : "A handpicked local story with real programs, people, and places worth exploring this month.";

  return (
    <motion.section
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8"
    >
      <div className="grid gap-5 lg:min-h-[17.25rem] lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-stretch lg:gap-x-8">
        <div className="flex h-full flex-col justify-start border-l-2 border-[#DCCBB1] pl-4 pt-1 lg:min-h-0">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#C8BDA9] bg-[#F7F3EA] text-[#D08964] shadow-[0_6px_16px_rgba(36,50,36,0.08)]">
            <BadgeCheck className="size-5" />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7A5C48]">
            Featured
          </p>
          <h2 className="mt-2 font-['Cormorant_Garamond',serif] text-4xl font-black leading-[0.9] tracking-tight text-[#243224] sm:text-[2.7rem] lg:text-[2.35rem]">
            Resource of the <span className="text-[#B86B4D]">Month</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A553B] sm:text-[0.95rem]">
            {descriptiveSubtitle}
          </p>
        </div>
        <ProgressiveBlurCard
          className="mx-auto w-full"
          imageUrl={scenicSrc}
          title={item.title}
          description={item.description}
          averageRating={averageRating}
          actionLabel="View Detail"
          onAction={() => onOpenResource(item.id)}
        />
      </div>
    </motion.section>
  );
}

function SceneSpotlightCard({
  item,
  shouldReduceMotion,
  averageRating,
  onOpen,
}: {
  item: SceneSpotlightItem;
  shouldReduceMotion: boolean;
  averageRating: number;
  onOpen: (href: string) => void;
}) {
  const scenicSrc = buildDisplayImageSet(item.image)?.src ?? item.image ?? FALLBACK_SPOTLIGHT_IMAGE;
  const openCard = () => onOpen(item.href);
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCard();
    }
  };

  return (
    <motion.article
      role="link"
      tabIndex={0}
      onClick={openCard}
      onKeyDown={handleCardKeyDown}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative z-10 flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#DCCBB1] bg-white shadow-[0_12px_26px_rgba(29,42,29,0.11)] outline-none transition-shadow duration-300 will-change-transform hover:shadow-[0_20px_38px_rgba(29,42,29,0.16)] focus-visible:ring-2 focus-visible:ring-[#B86B4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE4]"
    >
      <div className="relative aspect-[2.35/1] overflow-hidden bg-[#E7D9C3]">
        <ImageWithFallback
          src={scenicSrc}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-focus-within:scale-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,24,20,0.02)_0%,rgba(20,24,20,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(246,241,231,0.2),transparent_52%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
        <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-white/75 bg-[#F9F5EC]/92 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F6B47] shadow-sm backdrop-blur-sm">
          {item.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col bg-white p-3.5 text-[#334233] transition-transform duration-300 group-hover:-translate-y-1 group-focus-within:-translate-y-1">
        <h3 className="line-clamp-2 min-h-[2.15rem] font-['Cormorant_Garamond',serif] text-[1.38rem] font-bold leading-[0.95] text-[#243224] transition-colors group-hover:text-[#A95E42]">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs font-medium italic leading-tight text-[#6F7553]">{item.subtitle}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-snug text-[#4A553B]">
          {item.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E7D9C3] pt-2.5">
          <SpotlightStars rating={averageRating} />
          <span className="inline-flex shrink-0 items-center rounded-lg bg-[#334233] px-3 py-1.5 text-xs font-semibold text-[#F6F1E7] shadow-sm transition-colors group-hover:bg-[#A95E42] group-focus-visible:bg-[#A95E42]">
            View
            <ArrowRight className="ml-1.5 size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function AddEventToCalendarMenu({
  event,
  open,
  onOpenChange,
  dropUp = false,
}: {
  event: EventRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dropUp?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange, open]);

  return (
    <div ref={containerRef} className="relative mt-3">
      <button
        type="button"
        className="flex w-full items-center justify-center rounded-lg border border-[#DCCBB1]/65 bg-white px-3 py-2 text-xs font-semibold text-[#334233] shadow-sm transition-colors hover:bg-[#F6F1E7]"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <CalendarPlus className="mr-1.5 size-3.5 text-[#B86B4D]" />
        Add to Calendar
        <ChevronDown className={`ml-1.5 size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute right-0 z-[1000] w-52 rounded-lg border border-[#D9C6A8] bg-white p-1.5 text-left shadow-xl ${
            dropUp ? "bottom-full mb-2" : "mt-2"
          }`}
        >
          <a
            href={buildGoogleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            className="block rounded-md px-3 py-2 text-sm font-medium text-[#334233] hover:bg-[#F6F1E7]"
            onClick={() => onOpenChange(false)}
          >
            Google Calendar
          </a>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#334233] hover:bg-[#F6F1E7]"
            onClick={() => {
              downloadEventIcs(event);
              onOpenChange(false);
            }}
          >
            Apple / Outlook (.ics)
          </button>
          <a
            href={buildYahooCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            className="block rounded-md px-3 py-2 text-sm font-medium text-[#334233] hover:bg-[#F6F1E7]"
            onClick={() => onOpenChange(false)}
          >
            Yahoo Calendar
          </a>
        </div>
      ) : null}
    </div>
  );
}

function FeaturedEventCard({
  event,
  shouldReduceMotion,
  onOpen,
  calendarMenuDropUp = false,
}: {
  event: EventRecord;
  shouldReduceMotion: boolean;
  onOpen: (eventId: string) => void;
  calendarMenuDropUp?: boolean;
}) {
  const dateParts = getEventDateParts(event);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [middleColumnHeight, setMiddleColumnHeight] = useState<number | null>(null);
  const eventImage = buildDisplayImageSet(event.image_url)?.src ?? event.image_url ?? FALLBACK_SPOTLIGHT_IMAGE;
  const middleColumnRef = useRef<HTMLDivElement>(null);
  const openEventCard = () => onOpen(event.id);
  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest("button, a, [role='menuitem']"));
  const matchedColumnHeightStyle = middleColumnHeight
    ? ({ height: `${middleColumnHeight}px` } as CSSProperties)
    : undefined;

  useEffect(() => {
    const middleColumn = middleColumnRef.current;
    if (!middleColumn) return;

    const updateHeight = () => {
      if (window.innerWidth < 768) {
        setMiddleColumnHeight(null);
        return;
      }
      setMiddleColumnHeight(middleColumn.offsetHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    resizeObserver.observe(middleColumn);

    window.addEventListener("resize", updateHeight);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <motion.article
      role="link"
      tabIndex={0}
      onClick={(clickEvent) => {
        if (isInteractiveTarget(clickEvent.target)) return;
        openEventCard();
      }}
      onKeyDown={(keyEvent) => {
        if (isInteractiveTarget(keyEvent.target)) return;
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          openEventCard();
        }
      }}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative grid cursor-pointer gap-4 overflow-visible rounded-xl border border-[#DCCBB1] bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFFFF_66%,#F8F3E8_100%)] p-4 shadow-[0_12px_26px_rgba(29,42,29,0.1)] outline-none transition-shadow duration-300 hover:shadow-[0_18px_34px_rgba(29,42,29,0.14)] focus-visible:ring-2 focus-visible:ring-[#B86B4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE4] md:grid-cols-[14rem_minmax(0,1fr)_14rem] md:items-stretch ${calendarOpen ? "z-50" : "z-10"}`}
    >
      <div
        className="relative aspect-[2.35/1] w-full min-w-0 max-w-full overflow-hidden rounded-lg bg-[#E7D9C3] [clip-path:inset(0_round_0.5rem)] md:aspect-auto md:min-h-0"
        style={matchedColumnHeightStyle}
      >
        <ImageWithFallback
          src={eventImage}
          alt={event.title}
          className="block h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#243224]/18 to-transparent" />
      </div>

      <div ref={middleColumnRef} className="flex min-w-0 flex-col pt-2">
        <h3 className="line-clamp-2 font-['Cormorant_Garamond',serif] text-[1.65rem] font-bold leading-[0.95] text-[#243224] transition-colors group-hover:text-[#A95E42]">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#4A553B]">
          {event.description?.trim() || "A featured community event coming up soon."}
        </p>
        <p className="mt-3 flex min-w-0 items-center gap-2 text-xs font-medium text-[#5B6448]">
          <MapPin className="size-3.5 shrink-0 text-[#B86B4D]" />
          <span className="line-clamp-1">{event.location}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5F6B47]">
            <Sparkles className="size-3.5 shrink-0 text-[#B86B4D]" />
            <span className="line-clamp-1">{event.category?.trim() || "Community Event"}</span>
          </p>
          <button
            type="button"
            onClick={() => onOpen(event.id)}
            className="inline-flex shrink-0 items-center rounded-lg bg-[#334233] px-3 py-1.5 text-xs font-semibold text-[#F6F1E7] shadow-sm transition-colors hover:bg-[#A95E42] group-hover:bg-[#A95E42]"
          >
            View Event
            <ArrowRight className="ml-1.5 size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col border-t border-[#DCCBB1] pt-3 text-left md:self-start md:border-l md:border-t-0 md:pl-5 md:pt-1">
        <div className="w-full">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B86B4D]/10 text-[#B86B4D]">
              <CalendarDays className="size-6" />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="font-['Cormorant_Garamond',serif] text-4xl font-black leading-none text-[#243224]">
                {dateParts.date}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A9174]">{dateParts.year}</p>
            </div>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#F6F1E7]/80 px-3 py-1.5 text-xs font-semibold text-[#5B6448]">
            <Clock className="size-3.5 text-[#B86B4D]" />
            {dateParts.time}
          </p>
        </div>
        <AddEventToCalendarMenu
          event={event}
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          dropUp={calendarMenuDropUp}
        />
      </div>
    </motion.article>
  );
}

export function Spotlights() {
  const [spotlights, setSpotlights] = useState<SpotlightItem[]>([]);
  const [spotlightEvents, setSpotlightEvents] = useState<EventRecord[]>([]);
  const [featuredAverageRating, setFeaturedAverageRating] = useState<number>(0);
  const [sceneRatings, setSceneRatings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadSpotlights() {
      try {
        const [resourceSpotlights, eventSpotlights] = await Promise.all([
          listSpotlightItems(),
          listSpotlightEvents(),
        ]);
        if (cancelled) return;
        setSpotlights(resourceSpotlights);
        setSpotlightEvents(eventSpotlights);
      } catch (error) {
        console.error("Could not load spotlight items", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSpotlights();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => spotlights.find((item) => item.featured) || spotlights[0], [spotlights]);
  const sceneItems = useMemo<SceneSpotlightItem[]>(() => {
    return spotlights
      .filter((item) => item.id !== featured?.id)
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        description: item.fullDescription || item.description,
        image: item.image,
        updatedAt: item.updatedAt,
        href: `/resources/${item.id}`,
      }))
      .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
      .slice(0, 6);
  }, [featured?.id, spotlights]);

  const featuredEvents = useMemo(() => {
    const now = Date.now();
    const upcomingEvents = spotlightEvents
      .filter((event) => toTimestamp(event.starts_at) >= now)
      .sort((a, b) => toTimestamp(a.starts_at) - toTimestamp(b.starts_at));

    if (upcomingEvents.length <= 2) {
      return upcomingEvents;
    }

    // Rotate the featured list daily so the same two events are not always pinned.
    const daySeed = Math.floor(now / (24 * 60 * 60 * 1000));
    const rotationOffset = (daySeed % (upcomingEvents.length - 1)) + 1;
    return rotateItems(upcomingEvents, rotationOffset).slice(0, 2);
  }, [spotlightEvents]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedEngagement() {
      if (!featured?.id) {
        setFeaturedAverageRating(0);
        return;
      }

      try {
        const engagement = await getSpotlightEngagement(featured.id);
        if (cancelled) return;
        setFeaturedAverageRating(engagement.stats.averageRating);
      } catch (error) {
        console.error("Could not load featured spotlight engagement", error);
        if (!cancelled) {
          setFeaturedAverageRating(0);
        }
      }
    }

    void loadFeaturedEngagement();
    return () => {
      cancelled = true;
    };
  }, [featured?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadSceneRatings() {
      const resourceIds = sceneItems.map((item) => item.id);

      if (resourceIds.length === 0) {
        if (!cancelled) setSceneRatings({});
        return;
      }

      try {
        const ratingEntries = await Promise.all(
          resourceIds.map(async (id) => {
            const engagement = await getSpotlightEngagement(id);
            return [id, engagement.stats.averageRating] as const;
          }),
        );

        if (cancelled) return;
        setSceneRatings(Object.fromEntries(ratingEntries));
      } catch (error) {
        console.error("Could not load scene spotlight ratings", error);
        if (!cancelled) {
          setSceneRatings({});
        }
      }
    }

    void loadSceneRatings();
    return () => {
      cancelled = true;
    };
  }, [sceneItems]);

  const openSceneItem = (href: string) => {
    navigate(href, { state: RESOURCE_DETAIL_FROM_SPOTLIGHTS_NAV });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#F4EFE4_0%,#F8F5ED_28%,#F2EADB_100%)] pb-20">
      <SpotlightsHero shouldReduceMotion={shouldReduceMotion} />

      {featured ? (
        <ScenicFeaturedSpotlight
          item={featured}
          averageRating={featuredAverageRating}
          shouldReduceMotion={shouldReduceMotion}
          onOpenResource={(spotlightId) =>
            navigate(`/resources/${spotlightId}`, { state: RESOURCE_DETAIL_FROM_SPOTLIGHTS_NAV })
          }
        />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pt-2 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="relative flex justify-center py-16">
            <div className="flex items-center gap-3 rounded-full border border-[#E7D9C3] bg-white/80 px-5 py-3 text-[#6F7553] shadow-lg shadow-[#334233]/5">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#A7AE8A] border-t-transparent" />
              <span className="font-medium">Loading spotlights...</span>
            </div>
          </div>
        ) : !featured ? (
          <SpotlightEmptyState
            title="No spotlight found"
            message="No spotlights are available at the moment. Check back soon for new community features."
          />
        ) : sceneItems.length === 0 ? (
          <SpotlightEmptyState
            title="No spotlight scenes yet"
            message="More spotlight events and resources will appear in this gallery as they are published."
          />
        ) : (
          <div className="pb-8 pt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[#A7AE8A]" />
              <span className="h-px w-8 bg-[#A7AE8A]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#5F6B47]">
                Featured Resources
              </h3>
              <span className="text-xs font-semibold text-[#A7AE8A]">({sceneItems.length} items)</span>
            </div>

            <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 lg:gap-6">
              {sceneItems.map((item) => (
                <SceneSpotlightCard
                  key={item.id}
                  item={item}
                  shouldReduceMotion={shouldReduceMotion}
                  averageRating={sceneRatings[item.id] ?? 0}
                  onOpen={openSceneItem}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {featuredEvents.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-[#A7AE8A]" />
            <span className="h-px w-8 bg-[#A7AE8A]" />
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#5F6B47]">
              Featured Upcoming Events
            </h3>
            <span className="text-xs font-semibold text-[#A7AE8A]">({featuredEvents.length} events)</span>
          </div>

          <div className="mt-8 grid gap-5">
            {featuredEvents.map((event, index) => (
              <FeaturedEventCard
                key={event.id}
                event={event}
                shouldReduceMotion={shouldReduceMotion}
                calendarMenuDropUp={index === featuredEvents.length - 1}
                onOpen={(eventId) => navigate(`/events/${eventId}`, { state: EVENT_DETAIL_FROM_SPOTLIGHTS_NAV })}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
