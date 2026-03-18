import { MapPin, Clock } from "lucide-react";
import { ImageWithFallback } from "../ui/image-with-fallback";
import { events } from "../../data/homeData";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../ScrollReveal";

export function EventsSection() {

  return (
    <section className="bg-[#E7D9C3]/30 py-24 relative" id="events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-4">
              Upcoming Events
            </h2>
            <p className="text-[#5B473A] text-lg font-light">
              Connect with your neighbors and access resources in person.
            </p>
          </div>
          <button className="inline-flex items-center text-[#B36A4C] font-semibold hover:text-[#8A6F5A] transition-colors group">
            View Full Calendar
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </ScrollReveal>

        {/* Timeline Layout */}
        <StaggerGroup className="relative border-l-2 border-[#A7AE8A]/50 pl-6 sm:pl-10 space-y-12 ml-4 sm:ml-6">
          {events.map((event, index) => (
            <StaggerItem key={index} className="relative group">
              {/* Timeline Marker */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-1 w-6 h-6 rounded-full bg-[#F6F1E7] border-4 border-[#A7AE8A] group-hover:border-[#B36A4C] group-hover:scale-125 transition-all shadow-sm"></div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all">
                {/* Event Info */}
                <div className="flex-grow flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-[#B36A4C]/10 text-[#B36A4C] font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                      {event.date}
                    </span>
                    <span className="text-[#6F7553] text-sm font-medium">
                      {event.category}
                    </span>
                  </div>
                  
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#334233] mb-4 group-hover:text-[#B36A4C] transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-6 text-[#5B473A] text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A7AE8A]" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A7AE8A]" /> {event.location}
                    </div>
                  </div>

                  <button className="self-start text-[#334233] font-semibold text-sm border-b-2 border-transparent hover:border-[#B36A4C] transition-all pb-1">
                    RSVP & Details
                  </button>
                </div>

                {/* Optional Image for Variety */}
                {event.image && (
                  <div className="w-full lg:w-1/3 h-48 lg:h-auto rounded-2xl overflow-hidden flex-shrink-0 relative hidden sm:block">
                    <ImageWithFallback 
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

