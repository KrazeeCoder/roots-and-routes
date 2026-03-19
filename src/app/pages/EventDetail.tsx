import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import { getPublishedEventById } from "../data/portalApi";
import type { EventRecord } from "../types/portal";

function formatDateRange(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  const date = start.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = end ? end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;

  return {
    date,
    time: endTime ? `${startTime} - ${endTime}` : startTime,
  };
}

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      if (!eventId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getPublishedEventById(eventId);
        if (cancelled) return;
        setEvent(data);
      } catch (nextError) {
        console.error("Could not load event detail", nextError);
        if (!cancelled) setError("Could not load this event right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEvent();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-[#5B473A]">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-bold text-[#334233] mb-3">
            Event not found
          </h1>
          <p className="text-[#5B473A] mb-8">
            {error ?? "This event may be unpublished or unavailable."}
          </p>
          <Button asChild variant="outline">
            <Link to="/events" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const display = formatDateRange(event.starts_at, event.ends_at);

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-24 pb-22">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/65 via-[#334233]/35 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-5">
            <Link to="/events" className="inline-flex items-center gap-2 text-[#E7D9C3] hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#B36A4C]/15 border border-[#B36A4C]/35 text-[#E7D9C3] text-xs font-semibold uppercase tracking-wide">
              {event.category ?? "Community Event"}
            </div>
          </div>

          <h1 className="mt-8 font-['Cormorant_Garamond',serif] text-5xl font-bold leading-[1.1]">
            {event.title}
          </h1>
          <p className="mt-4 text-[#A7AE8A] text-lg leading-relaxed max-w-3xl">
            {event.description ?? "Join this community event and connect with local residents."}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-[#E7D9C3] bg-white shadow-sm overflow-hidden">
          {event.image_url ? (
            <div className="h-64 sm:h-80">
              <ImageWithFallback
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="p-8 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A]">
                <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                  <Calendar className="w-4 h-4 text-[#A7AE8A]" />
                  Date
                </div>
                <p>{display.date}</p>
              </div>
              <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A]">
                <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                  <Clock className="w-4 h-4 text-[#A7AE8A]" />
                  Time
                </div>
                <p>{display.time}</p>
              </div>
              <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A] sm:col-span-2">
                <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                  <MapPin className="w-4 h-4 text-[#A7AE8A]" />
                  Location
                </div>
                <p>{event.location}</p>
              </div>
            </div>

            {event.description ? (
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-3">
                  Event Details
                </h2>
                <p className="text-[#5B473A] leading-relaxed">{event.description}</p>
              </div>
            ) : null}

            {event.posted_by_name ? (
              <p className="inline-flex items-center gap-2 text-sm text-[#6F7553]">
                <User className="w-4 h-4 text-[#A7AE8A]" />
                Organized by {event.posted_by_name}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
