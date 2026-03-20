import { useEffect, useState } from "react";
import { Link } from "react-router";
import { format, parse, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { Button } from "../components/ui/button";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { listPublishedEvents, mapEventToEventItem } from "../data/portalApi";
import type { EventItem } from "../types/home";

interface EventWithDate extends EventItem {
  parsedDate: Date | null;
}

export function Calendar() {
  const [events, setEvents] = useState<EventWithDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Smooth scroll to top when component mounts
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    
    let cancelled = false;

    async function loadEvents() {
      try {
        const nextEvents = await listPublishedEvents();
        if (cancelled) return;
        
        const eventsWithDates = nextEvents.map(mapEventToEventItem).map(event => {
          // Try to parse the date string - handles various formats
          let parsedDate: Date | null = null;
          try {
            // The actual format from displayDateRange is "MMM d" (e.g., "Jan 15")
            // We need to add the current year to make it parseable
            const currentYear = new Date().getFullYear();
            
            // Try common date formats
            const formats = [
              'MMM d', // Jan 15 (the actual format used)
              'MMM d, yyyy', // Jan 15, 2024
              'MMMM d', // January 15
              'MMMM d, yyyy', // January 15, 2024
              'MM/dd/yyyy', // 01/15/2024
              'yyyy-MM-dd', // 2024-01-15
            ];
            
            for (const fmt of formats) {
              try {
                // For formats without year, append current year
                const dateString = fmt.includes('yyyy') ? event.date : `${event.date}, ${currentYear}`;
                parsedDate = parse(dateString, fmt.includes('yyyy') ? fmt : `${fmt}, yyyy`, new Date());
                if (isValidDate(parsedDate)) {
                  break;
                }
              } catch {
                continue;
              }
            }
            
            // If no format worked, try JavaScript's built-in parsing
            if (!parsedDate || !isValidDate(parsedDate)) {
              parsedDate = new Date(event.date);
              if (!isValidDate(parsedDate)) {
                parsedDate = null;
              }
            }
          } catch (error) {
            console.warn(`Could not parse date: ${event.date}`, error);
            parsedDate = null;
          }
          
          return { ...event, parsedDate };
        });
        
        setEvents(eventsWithDates);
      } catch (error) {
        console.error("Could not load published events", error);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  function isValidDate(date: any): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      event.parsedDate && isSameDay(event.parsedDate, day)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

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
                Community Calendar
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Event <span className="text-[#B36A4C] italic">Calendar</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                Browse all upcoming community events in a calendar view. Click on any date to see what's happening that day.
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <div className="bg-white rounded-3xl border border-[#E7D9C3] shadow-lg p-8">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="text-[#334233] hover:text-[#B36A4C] hover:bg-[#E7D9C3]/30 rounded-lg p-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233]">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="text-[#334233] hover:text-[#B36A4C] hover:bg-[#E7D9C3]/30 rounded-lg p-2"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-3">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-[#6F7553] py-4 bg-[#F6F1E7]/50 rounded-lg">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {monthDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative min-h-[110px] p-3 text-sm rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                          ${!isCurrentMonth ? 'text-[#A7AE8A]/50 bg-[#F8F5F0]' : 'text-[#334233] bg-white'}
                          ${isSelected ? 'border-[#B36A4C] bg-gradient-to-br from-[#B36A4C]/5 to-[#B36A4C]/10 shadow-md' : 'border-[#E7D9C3] hover:border-[#A7AE8A] hover:bg-[#F8F5F0] hover:shadow-sm'}
                          ${hasEvents && !isSelected ? 'border-[#A7AE8A] bg-gradient-to-br from-[#A7AE8A]/5 to-white' : ''}
                        `}
                      >
                        <div className="font-bold text-lg mb-2 text-[#334233]">{format(day, 'd')}</div>
                        
                        {/* Events for this day */}
                        {hasEvents && (
                          <div className="space-y-1.5">
                            {dayEvents.slice(0, 3).map((event, index) => (
                              <div
                                key={event.id ?? index}
                                className={`
                                  text-xs p-1.5 rounded-md truncate font-medium leading-tight
                                  ${isSelected 
                                    ? 'bg-gradient-to-r from-[#B36A4C]/20 to-[#B36A4C]/10 text-[#334233] border border-[#B36A4C]/20' 
                                    : 'bg-gradient-to-r from-[#E7D9C3]/80 to-[#D9C6A8]/60 text-[#334233] hover:from-[#D9C6A8]/90 hover:to-[#C4B5A0]/80'}
                                  transition-all duration-200
                                `}
                              >
                                <div className="flex items-center gap-1">
                                  {event.time && <Clock className="w-3 h-3 text-[#B36A4C] flex-shrink-0" />}
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className={`text-xs p-1.5 rounded-md font-medium ${isSelected ? 'text-[#B36A4C] bg-[#B36A4C]/10' : 'text-[#6F7553] bg-[#E7D9C3]/50'}`}>
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Events for Selected Date */}
            {selectedDate && (
              <ScrollReveal delay={0.2}>
                <div className="mt-8 bg-white rounded-3xl border border-[#E7D9C3] shadow-lg p-8">
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#334233] mb-6">
                    Events for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F6F1E7] flex items-center justify-center">
                        <CalendarIcon className="w-8 h-8 text-[#A7AE8A]" />
                      </div>
                      <p className="text-[#5B473A] font-medium">No events scheduled for this date.</p>
                    </div>
                  ) : (
                    <StaggerGroup className="space-y-6">
                      {selectedDateEvents.map((event, index) => {
                        const detailHref = event.id ? `/events/${event.id}` : null;
                        
                        return (
                          <StaggerItem key={event.id ?? index}>
                            <div className="bg-gradient-to-r from-[#F8F5F0] to-[#F6F1E7] rounded-2xl border border-[#E7D9C3]/50 p-6 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#B36A4C]/20 to-[#A7AE8A]/20 text-[#334233] text-sm font-semibold border border-[#B36A4C]/30">
                                      {event.category}
                                    </span>
                                  </div>
                                  
                                  {detailHref ? (
                                    <Link
                                      to={detailHref}
                                      className="block font-bold text-xl text-[#334233] hover:text-[#B36A4C] transition-colors mb-3"
                                    >
                                      {event.title}
                                    </Link>
                                  ) : (
                                    <h4 className="font-bold text-xl text-[#334233] mb-3">{event.title}</h4>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-6 text-[#5B473A]">
                                    <span className="inline-flex items-center gap-2 font-medium">
                                      <Clock className="w-4 h-4 text-[#B36A4C]" /> {event.time}
                                    </span>
                                    <span className="inline-flex items-center gap-2 font-medium">
                                      <MapPin className="w-4 h-4 text-[#B36A4C]" /> {event.location}
                                    </span>
                                  </div>
                                </div>
                                
                                {detailHref && (
                                  <div className="ml-4">
                                    <Button variant="default" size="sm" className="bg-[#B36A4C] hover:bg-[#8A6F5A] text-white" asChild>
                                      <Link to={detailHref}>View Details</Link>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerGroup>
                  )}
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
