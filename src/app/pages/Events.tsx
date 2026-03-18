import { Calendar, MapPin, Clock, Sparkles, Users } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { events } from "../data/homeData";

export function Events() {
  const featured = events[0];

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      {/* Hero */}
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
                Upcoming <span className="text-[#B36A4C] italic">Events</span> & Opportunities
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                Join your neighbors for in-person meetups, resource fairs, and programs that strengthen our community.
                Browse upcoming dates and save the ones you care about.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button asChild className="w-full sm:w-auto" variant="default">
                  <a href="#featured" className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Featured Event
                  </a>
                </Button>
                <Button asChild className="w-full sm:w-auto" variant="secondary">
                  <a href="#upcoming" className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4" /> See the Full Schedule
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

      {/* Featured Event */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
          <div className="flex-1">
            <ScrollReveal>
              <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-5">
                Featured Event
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-[#5B473A] text-lg font-light max-w-2xl leading-relaxed">
                Highlighting a community moment we think you'll want to save to your calendar. Tap into the energy, meet local folks, and find support where it matters most.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-3 text-sm font-semibold text-[#334233]/80">
                    <span className="px-3 py-1 rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">{featured.date}</span>
                    <span className="px-3 py-1 rounded-full bg-[#B36A4C]/10 text-[#B36A4C]">{featured.category}</span>
                  </div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233]">
                    {featured.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-[#5B473A] text-sm mt-4">
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A7AE8A]" /> {featured.time}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A7AE8A]" /> {featured.location}
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <Button variant="default" className="w-full sm:w-auto">
                      RSVP & Details
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Add to Calendar
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3]">
                  <ImageWithFallback
                    src={featured.image ?? "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"}
                    alt={featured.title}
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
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">✓</span>
                    <span>Meet neighbors and local organizers in a welcoming setting.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">✓</span>
                    <span>Find support, resources, and services that fit your needs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">✓</span>
                    <span>Build a stronger, more connected Bothell community.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section id="upcoming" className="bg-[#E7D9C3]/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-4">
                Upcoming Schedule
              </h2>
              <p className="text-[#5B473A] text-lg font-light leading-relaxed">
                Browse what’s coming up soon. Click any event to save it, share, or jump to the full calendar.
              </p>
            </div>
          </ScrollReveal>

          <StaggerGroup className="mt-12 space-y-10">
            {events.map((event, index) => (
              <StaggerItem key={index} className="relative">
                <div className="relative border-l-2 border-[#A7AE8A]/50 pl-8 sm:pl-12">
                  <div className="absolute -left-[34px] top-4 w-8 h-8 rounded-full bg-[#F6F1E7] border-4 border-[#A7AE8A] shadow-sm" />
                  <div className="bg-white rounded-3xl border border-[#E7D9C3] shadow-sm p-8 hover:border-[#B36A4C] hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 text-sm font-semibold text-[#334233]/80 mb-3">
                          <span className="px-3 py-1 rounded-full bg-[#A7AE8A]/20 text-[#5B473A]">{event.date}</span>
                          <span className="px-3 py-1 rounded-full bg-[#B36A4C]/10 text-[#B36A4C]">{event.category}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#334233] mb-2">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-6 text-[#5B473A] text-sm mb-4">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#A7AE8A]" /> {event.time}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#A7AE8A]" /> {event.location}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm">
                            Save to Calendar
                          </Button>
                          <Button variant="ghost" size="sm">
                            Share
                          </Button>
                        </div>
                      </div>
                      {event.image && (
                        <div className="w-full sm:w-64 h-40 rounded-2xl overflow-hidden flex-shrink-0 relative">
                          <ImageWithFallback
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/60 via-transparent" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="mt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-[#5B473A]">
              <span className="font-semibold text-[#334233]">Want more?</span> Check the community calendar for all meeting dates.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" asChild>
                <a href="#" className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Full Community Calendar
                </a>
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
