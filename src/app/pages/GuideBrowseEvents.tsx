import { Link } from "react-router";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Users, Clock, CheckCircle } from "lucide-react";
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
      <section className="relative pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-start gap-12">
            
            {/* Sticky Sidebar Navigation */}
            <div className="hidden lg:sticky lg:top-24 lg:col-span-3 lg:block lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto lg:pr-1 space-y-8">
                <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B36A4C] mb-4">Guide Sections</p>
                  <nav className="space-y-4">
                    {[
                      { num: "01", label: "Choose Your View", href: "#choose-your-view" },
                      { num: "02", label: "Filter Events", href: "#filter-events" },
                      { num: "03", label: "Review Event Details", href: "#review-event-details" },
                      { num: "04", label: "Common Questions", href: "#common-questions" },
                    ].map((step) => (
                      <a
                        key={step.num}
                        href={step.href}
                        className="group flex items-center gap-3 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#334233]/40"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7D9C3] bg-[#F6F1E7] text-xs font-semibold text-[#334233] transition-colors group-hover:border-[#334233] group-hover:bg-[#334233] group-hover:text-white">
                          {step.num}
                        </span>
                        <span className="text-sm font-medium text-[#5B473A] transition-colors group-hover:text-[#334233]">
                          {step.label}
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="rounded-2xl border border-[#E7D9C3] bg-[#B36A4C]/10 p-6">
                  <h4 className="text-base font-semibold text-[#334233]">Need custom support?</h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#5B473A]">
                    If you have questions that aren't covered in this guide, our community team is here to assist.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors w-full"
                  >
                    Go to Contact Form
                  </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-16">
              
              {/* Step 1 */}
              <motion.div
                id="choose-your-view"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">01</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Choose Your View
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Use the Events page for list and map browsing, and use the separate Full Community Calendar page for a month-by-month date view.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-6 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[#334233]">Full Community Calendar</h3>
                    <p className="mt-3 text-xs leading-relaxed text-[#5B473A]">
                      Open the calendar page to browse by month and click a date to see everything scheduled that day.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-6 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[#334233]">List View</h3>
                    <p className="mt-3 text-xs leading-relaxed text-[#5B473A]">
                      Browse events in a scrollable list with key details at a glance. Great for quickly scanning upcoming opportunities and comparing events side-by-side.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-6 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[#334233]">Map View</h3>
                    <p className="mt-3 text-xs leading-relaxed text-[#5B473A]">
                      See events plotted on a map by location. Use this to find events nearest to you and see the geographic spread of activities.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                id="filter-events"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">02</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Filter Events by What Matters to You
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Use these filters to find events that fit your needs and schedule.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  {[
                    { icon: Clock, title: "Timeframe", desc: "Switch between upcoming and past events to focus on what matters right now." },
                    { icon: MapPin, title: "Nearby Search + Radius", desc: "Enter an address or ZIP (or use your current location), then filter by 1, 5, 10, or 25 miles." },
                    { icon: CalendarDays, title: "View + Planning Tools", desc: "Toggle list/map, open markers on the map, and add events to your calendar from each event card." },
                  ].map((filter) => {
                    const FilterIcon = filter.icon;
                    return (
                      <div key={filter.title} className="flex gap-4 p-4 rounded-2xl hover:bg-[#F6F1E7]/60 transition-colors duration-300">
                        <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E7D9C3] text-[#334233] shadow-sm">
                          <FilterIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#334233]">{filter.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#5B473A]">{filter.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                id="review-event-details"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">03</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Review Event Details & Plan Ahead
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Open any event card to review the details and use built-in planning tools.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] space-y-8">
                  <h3 className="text-lg font-semibold text-[#334233]">You'll Find Everything You Need:</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {[
                      { title: "Event Title & Description", desc: "What the event is about and who it's for" },
                      { title: "Date & Time", desc: "When the event starts and (if available) ends" },
                      { title: "Location", desc: "Where the event is happening, including distance when nearby search is active" },
                      { title: "List + Map Views", desc: "Switch views and use \"Show on map\" to jump to a specific event marker" },
                      { title: "Add to Calendar", desc: "Save events to Google, Yahoo, or Apple/Outlook (.ics) from each event card" },
                      { title: "Event Detail Page", desc: "Open the full event page for complete date, time, and location information" },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-[#334233]">{item.title}</p>
                          <p className="text-xs text-[#5B473A] mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[#B36A4C]/20 bg-[#B36A4C]/5 p-6 border-l-4 border-l-[#B36A4C]">
                    <p className="text-sm leading-relaxed text-[#334233]">
                      <strong className="text-[#B36A4C]">Pro Tip:</strong> If you prefer planning by date, open the Full Community Calendar and select a day to see that day's events.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Types of Events */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                    Types of Events You'll Find
                  </h2>
                  <p className="mt-2 text-base text-[#5B473A]">
                    Our Events calendar features a diverse mix of community activities:
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Educational Workshops", desc: "Learn new skills in areas like job training, financial literacy, technology, and more." },
                    { title: "Support Groups", desc: "Connect with others facing similar challenges in mental health, parenting, recovery, and wellness." },
                    { title: "Youth Programs", desc: "Activities for kids and teens including tutoring, mentoring, sports, arts, and recreation." },
                    { title: "Community Gatherings", desc: "Social events, festivals, volunteer options, and neighborhood celebrations." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-[#E7D9C3] bg-white p-5 shadow-sm hover:border-[#334233] transition-colors duration-300">
                      <h4 className="font-semibold text-base text-[#334233]">{item.title}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-[#5B473A]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                id="common-questions"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">04</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Common Questions
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Have questions about Browse Events? Find answers to frequently asked questions below.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { q: "How do I find events near me?", a: "Use the location search box or 'Use my location' on the Events page, then choose a radius to limit results." },
                    { q: "Can I view past events?", a: "Yes. Use the Timeframe filter and switch from 'Upcoming' to 'Past'." },
                    { q: "Where is the calendar view?", a: "Use the 'Full Community Calendar' button to open /calendar for date-by-date browsing." },
                    { q: "Can I submit an event to the calendar?", a: "Yes. Use the Suggest page to submit an event proposal. It appears publicly after moderator approval." },
                  ].map((faq) => (
                    <div key={faq.q} className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm hover:border-[#334233] transition-colors duration-300">
                      <h4 className="font-semibold text-base text-[#334233]">{faq.q}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mt-20 text-center border-t border-[#E7D9C3] pt-12"
              >
                <h3 className="text-2xl font-semibold font-['Cormorant_Garamond',serif] text-[#334233] mb-4">
                  Explore upcoming events
                </h3>
                <p className="text-sm text-[#5B473A] mb-8 max-w-md mx-auto">
                  Find workshops, community meals, and neighborhood events from list/map browsing, then save them to your calendar.
                </p>
                <Link
                  to="/events"
                  className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-all duration-300 hover:shadow-lg"
                >
                  Start Browsing Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
