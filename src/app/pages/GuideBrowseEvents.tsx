import { Link } from "react-router";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Users, Clock, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";

export function GuideBrowseEvents() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-24 pb-16">
        <div className="absolute inset-0 opacity-20">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-[#E7D9C3]/40 bg-[#B36A4C]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#E7D9C3]"
            >
              <CalendarDays className="h-4 w-4" />
              Events Guide
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-8 text-4xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] sm:text-5xl"
            >
              Discover Community Gatherings Near You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#E7D9C3]/90"
            >
              Find workshops, support groups, classes, and community events happening in Bothell. Connect with neighbors and build community.
            </motion.p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/help"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E7D9C3]/40 bg-white px-5 py-2 text-sm font-semibold text-[#334233] shadow-sm hover:bg-[#F6F1E7] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Help
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
              >
                Browse Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pt-16 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Viewing Options */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-16"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold">
              1
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Choose Your View
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              The Events page offers three different ways to explore and filter events. Pick the view that works best for you.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#334233]">Calendar View</h3>
                <p className="mt-3 text-sm leading-7 text-[#5B473A]">
                  See events laid out on a calendar. Perfect for planning ahead and finding events on specific dates. Click any date to see all events happening that day.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#334233]">List View</h3>
                <p className="mt-3 text-sm leading-7 text-[#5B473A]">
                  Browse events in a scrollable list with key details at a glance. Great for quickly scanning upcoming opportunities and comparing events side-by-side.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#334233]">Map View</h3>
                <p className="mt-3 text-sm leading-7 text-[#5B473A]">
                  See events plotted on a map by location. Use this to find events nearest to you and see the geographic spread of activities.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filtering */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mb-16"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold">
              2
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Filter Events by What Matters to You
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Use these filters to find events that fit your needs and schedule.
            </p>

            <div className="mt-8 space-y-4 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Date & Time Range</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Filter by dates to see events happening this week, this month, or within a specific date range you choose. Use the calendar picker to set your preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Distance Radius</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Filter by how far you're willing to travel (e.g., "within 3 miles"). Events are sorted by distance, showing the closest options first.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Event Type & Category</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Filter by category (workshops, support groups, youth programs, etc.) to see events relevant to your interests.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mb-16"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold">
              3
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Review Event Details
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Click on any event to see complete information and find registration or attendance options.
            </p>

            <div className="mt-8 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[#334233]">You'll Find Everything You Need:</h3>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Event Title & Description</p>
                    <p className="text-sm text-[#5B473A]">What the event is about and who it's for</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Date, Time & Duration</p>
                    <p className="text-sm text-[#5B473A]">When the event starts, ends, and how long it lasts</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Location & Address</p>
                    <p className="text-sm text-[#5B473A]">Where the event is happening, with distance from you</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Organizer Contact</p>
                    <p className="text-sm text-[#5B473A]">Phone, email, or website to get more information</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Registration Link</p>
                    <p className="text-sm text-[#5B473A]">Direct link to register online (if available)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Map & Directions</p>
                    <p className="text-sm text-[#5B473A]">See the location on a map and get driving directions</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-[#B36A4C]/10 p-4 border border-[#B36A4C]/20">
                <p className="text-sm text-[#334233]">
                  <strong>Pro Tip:</strong> If registration details aren't clear, contact the organizer directly using the phone or email provided. They'll be happy to answer questions about how to participate.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Types of Events */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Types of Events You'll Find
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Our Events calendar features a diverse mix of community activities:
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-lg border border-[#E7D9C3] bg-white p-4 flex items-start gap-3">
                <span className="text-[#B36A4C] font-bold text-lg">→</span>
                <div>
                  <p className="font-semibold text-[#334233]">Educational Workshops</p>
                  <p className="text-sm text-[#5B473A]">Learn new skills in areas like job training, financial literacy, technology, and more</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#E7D9C3] bg-white p-4 flex items-start gap-3">
                <span className="text-[#B36A4C] font-bold text-lg">→</span>
                <div>
                  <p className="font-semibold text-[#334233]">Support Groups</p>
                  <p className="text-sm text-[#5B473A]">Connect with others facing similar challenges in mental health, parenting, recovery, and wellness</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#E7D9C3] bg-white p-4 flex items-start gap-3">
                <span className="text-[#B36A4C] font-bold text-lg">→</span>
                <div>
                  <p className="font-semibold text-[#334233]">Youth Programs</p>
                  <p className="text-sm text-[#5B473A]">Activities for kids and teens including tutoring, mentoring, sports, arts, and recreation</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#E7D9C3] bg-white p-4 flex items-start gap-3">
                <span className="text-[#B36A4C] font-bold text-lg">→</span>
                <div>
                  <p className="font-semibold text-[#334233]">Community Gatherings</p>
                  <p className="text-sm text-[#5B473A]">Social events, festivals, and neighborhood celebrations</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#E7D9C3] bg-white p-4 flex items-start gap-3">
                <span className="text-[#B36A4C] font-bold text-lg">→</span>
                <div>
                  <p className="font-semibold text-[#334233]">Health & Wellness Activities</p>
                  <p className="text-sm text-[#5B473A]">Fitness classes, health screenings, wellness seminars, and more</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <h3 className="text-2xl font-semibold text-[#334233]">Common Questions</h3>
            <div className="mt-8 space-y-6">
              <div>
                <h4 className="font-semibold text-[#334233]">Do I have to register in advance?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  It depends on the event. Some require advance registration, while others are drop-in. Check the event details or contact the organizer to confirm. When in doubt, showing up early is a good idea.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Are events free?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Most events are free or low-cost. The event details will specify if there's a cost. If pricing isn't listed, contact the organizer to ask.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">What if I can't make an event I registered for?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Contact the organizer as soon as possible to cancel your registration. This helps them plan better and opens a spot for someone else. Look for cancellation instructions in your registration confirmation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">How do I know if an event is suitable for me or my family?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Read the event description carefully. It will specify age groups, prerequisites, or any accessibility information. If you have questions, contact the organizer directly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Can I submit an event to the calendar?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Yes! Use the "Suggest" page to submit new events. Our community team will review and add it to the calendar if it meets our guidelines.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="mt-16 text-center"
          >
            <Link
              to="/events"
              className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
            >
              Explore Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
