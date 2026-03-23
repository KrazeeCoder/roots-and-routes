import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { Button } from "../components/ui/button";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { listPublishedEvents, mapEventToEventItem } from "../data/portalApi";
import type { EventItem } from "../types/home";

interface EventWithDate extends EventItem {
  parsedDate: Date | null;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_DATE_FORMATS = ["MMM d", "MMM d, yyyy", "MMMM d", "MMMM d, yyyy", "MM/dd/yyyy", "yyyy-MM-dd"] as const;

function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function parseEventDate(event: EventItem): Date | null {
  if (event.startsAt) {
    const parsedStart = new Date(event.startsAt);
    if (isValidDate(parsedStart)) {
      return parsedStart;
    }
  }

  const currentYear = new Date().getFullYear();
  for (const fmt of DISPLAY_DATE_FORMATS) {
    const includesYear = fmt.includes("yyyy");
    const source = includesYear ? event.date : `${event.date}, ${currentYear}`;
    const pattern = includesYear ? fmt : `${fmt}, yyyy`;
    const parsed = parse(source, pattern, new Date());

    if (isValidDate(parsed)) {
      return parsed;
    }
  }

  const fallback = new Date(event.date);
  return isValidDate(fallback) ? fallback : null;
}

export function Calendar() {
  const [events, setEvents] = useState<EventWithDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    let cancelled = false;

    async function loadEvents() {
      try {
        const nextEvents = await listPublishedEvents();
        if (cancelled) return;

        const eventsWithDates = nextEvents
          .map(mapEventToEventItem)
          .map((event) => ({ ...event, parsedDate: parseEventDate(event) }));

        setEvents(eventsWithDates);

        const today = startOfDay(new Date());
        const sortedEventDates = eventsWithDates
          .map((event) => (event.parsedDate ? startOfDay(event.parsedDate) : null))
          .filter((date): date is Date => date !== null)
          .sort((a, b) => a.getTime() - b.getTime());

        const nextUpcomingDate = sortedEventDates.find((date) => date.getTime() >= today.getTime());
        const initialDate = nextUpcomingDate ?? sortedEventDates[0] ?? today;

        setSelectedDate(initialDate);
        setCurrentMonth(startOfMonth(initialDate));
      } catch (error) {
        console.error("Could not load published events", error);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventsByDay = useMemo(() => {
    const byDay = new Map<string, EventWithDate[]>();

    for (const event of events) {
      if (!event.parsedDate) continue;
      const key = format(event.parsedDate, "yyyy-MM-dd");
      const currentEvents = byDay.get(key) ?? [];
      byDay.set(key, [...currentEvents, event]);
    }

    return byDay;
  }, [events]);

  const getEventsForDay = (day: Date) => eventsByDay.get(format(day, "yyyy-MM-dd")) ?? [];

  const navigateMonth = (direction: "prev" | "next") => {
    const nextMonth = direction === "prev" ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);

    if (!isSameMonth(selectedDate, nextMonth)) {
      setSelectedDate(startOfMonth(nextMonth));
    }
  };

  const selectedDateEvents = getEventsForDay(selectedDate);
  const hasAnyEventsThisMonth = events.some((event) => event.parsedDate && isSameMonth(event.parsedDate, currentMonth));

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
                <CalendarIcon className="w-4 h-4 text-[#B36A4C]" />
                Community Journey Calendar
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Event <span className="text-[#B36A4C] italic">Calendar</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                Browse all upcoming community gatherings in a calendar view. Select a day to review details instantly.
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)] gap-6 items-start">
          <div className="order-2 xl:order-1">
            <ScrollReveal>
              <div className="bg-white rounded-3xl border border-[#E7D9C3] shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="text-[#334233] hover:text-[#B36A4C] hover:bg-[#E7D9C3]/30 rounded-lg p-2"
                    aria-label="Go to previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-bold text-[#334233] text-center">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="text-[#334233] hover:text-[#B36A4C] hover:bg-[#E7D9C3]/30 rounded-lg p-2"
                    aria-label="Go to next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mb-4 rounded-2xl border border-[#D9C6A8] bg-gradient-to-r from-[#F8F5F0] to-[#F6F1E7] p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-wide text-[#6F7553] font-semibold">Selected date</p>
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <p className="font-semibold text-[#334233]">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm text-[#5B473A]">
                      {selectedDateEvents.length === 0
                        ? "No events on this day"
                        : `${selectedDateEvents.length} event${selectedDateEvents.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </div>

                {!hasAnyEventsThisMonth ? (
                  <p className="mb-4 rounded-xl border border-dashed border-[#D9C6A8] bg-[#F8F5F0] px-3 py-2 text-sm text-[#6F7553]">
                    No events are scheduled in {format(currentMonth, "MMMM")}. You can still pick a day to plan ahead.
                  </p>
                ) : null}

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {DAY_HEADERS.map((day) => (
                    <div key={day} className="text-center text-[11px] sm:text-xs font-semibold text-[#6F7553] py-2 bg-[#F6F1E7]/60 rounded-md">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = isSameDay(day, selectedDate);
                    const inCurrentMonth = isSameMonth(day, currentMonth);
                    const today = isToday(day);

                    return (
                      <button
                        type="button"
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(startOfDay(day))}
                        className={`relative min-h-[74px] sm:min-h-[82px] p-2 text-left rounded-xl border transition-all overflow-hidden ${
                          inCurrentMonth ? "text-[#334233] bg-white" : "text-[#9AA085] bg-[#F8F5F0]"
                        } ${
                          isSelected
                            ? "border-[#B36A4C] shadow-md ring-1 ring-[#B36A4C]/40 bg-gradient-to-br from-[#B36A4C]/8 to-[#B36A4C]/14"
                            : "border-[#E7D9C3] hover:border-[#A7AE8A] hover:bg-[#F8F5F0]"
                        } ${hasEvents && !isSelected ? "border-[#A7AE8A]/80" : ""}`}
                        aria-pressed={isSelected}
                        aria-label={`${format(day, "MMMM d, yyyy")}${hasEvents ? `, ${dayEvents.length} events` : ", no events"}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm sm:text-base font-semibold ${today ? "text-[#B36A4C]" : "text-[#334233]"}`}>
                            {format(day, "d")}
                          </span>

                          {hasEvents ? (
                            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? "bg-[#B36A4C]" : "bg-[#6F7553]"}`} />
                          ) : null}
                        </div>

                        {hasEvents ? (
                          <div className="mt-1.5">
                            <p className="text-[10px] sm:text-[11px] leading-tight truncate font-medium text-[#5B473A]">
                              {dayEvents[0].title}
                            </p>
                            {dayEvents.length > 1 ? (
                              <p className="mt-0.5 text-[10px] text-[#6F7553]">+{dayEvents.length - 1} more</p>
                            ) : null}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="order-1 xl:order-2">
            <ScrollReveal delay={0.12}>
              <div className="xl:sticky xl:top-24 bg-white rounded-3xl border border-[#E7D9C3] shadow-lg p-5 sm:p-6">
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#334233]">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <p className="mt-1 text-sm text-[#6F7553]">Select another date on the calendar to update this list.</p>

                <div className="mt-5">
                  {selectedDateEvents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#D9C6A8] bg-[#F8F5F0] p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white border border-[#E7D9C3] flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-[#A7AE8A]" />
                      </div>
                      <p className="text-[#5B473A] font-medium">No events scheduled for this date.</p>
                    </div>
                  ) : (
                    <StaggerGroup className="space-y-4">
                      {selectedDateEvents.map((event, index) => {
                        const detailHref = event.id ? `/events/${event.id}` : null;

                        return (
                          <StaggerItem key={event.id ?? index}>
                            <div className="bg-gradient-to-r from-[#F8F5F0] to-[#F6F1E7] rounded-2xl border border-[#E7D9C3]/70 p-4 sm:p-5 hover:shadow-md transition-all duration-200">
                              <span className="inline-flex items-center rounded-full border border-[#B36A4C]/30 bg-[#B36A4C]/10 px-2.5 py-1 text-xs font-semibold text-[#334233]">
                                {event.category}
                              </span>

                              {detailHref ? (
                                <Link
                                  to={detailHref}
                                  className="mt-3 block font-semibold text-lg text-[#334233] hover:text-[#B36A4C] transition-colors"
                                >
                                  {event.title}
                                </Link>
                              ) : (
                                <h4 className="mt-3 font-semibold text-lg text-[#334233]">{event.title}</h4>
                              )}

                              <div className="mt-3 space-y-2 text-sm text-[#5B473A]">
                                <p className="inline-flex items-center gap-2 font-medium">
                                  <Clock className="w-4 h-4 text-[#B36A4C]" /> {event.time}
                                </p>
                                <p className="inline-flex items-center gap-2 font-medium">
                                  <MapPin className="w-4 h-4 text-[#B36A4C]" /> {event.location}
                                </p>
                              </div>

                              {detailHref ? (
                                <div className="mt-4">
                                  <Button variant="default" size="sm" className="bg-[#B36A4C] hover:bg-[#8A6F5A] text-white" asChild>
                                    <Link to={detailHref}>View Details</Link>
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerGroup>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
