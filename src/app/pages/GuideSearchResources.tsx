import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Search, Filter, MapPin, Clock, Star, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";

export function GuideSearchResources() {
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
              <Search className="h-4 w-4" />
              Search Guide
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-8 text-4xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] sm:text-5xl"
            >
              Find Local Support in 3 Steps
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#E7D9C3]/90"
            >
              Learn how to search the Directory and discover the resources and support your community has to offer.
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
                to="/directory"
                className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
              >
                Go to Directory
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
                      { num: "01", label: "Choose Search Method", href: "#choose-search-method" },
                      { num: "02", label: "Filter & Refine", href: "#filter-refine" },
                      { num: "03", label: "Review & Connect", href: "#review-connect" },
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
                id="choose-search-method"
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
                      Choose Your Search Method
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      The Directory offers two ways to find what you need. Use the search bar for keywords, or browse by category.
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B36A4C]/10 text-[#B36A4C]">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#334233]">Keyword Search</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                      Type what you're looking for directly into the search box. Try specific terms like:
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                      {[
                        { term: "Food pantry", desc: "for emergency food assistance" },
                        { term: "Mental health", desc: "for counseling services" },
                        { term: "Job training", desc: "for employment assistance" },
                        { term: "Rent assistance", desc: "for housing support" },
                      ].map((item) => (
                        <li key={item.term} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                          <span><strong>"{item.term}"</strong> {item.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B36A4C]/10 text-[#B36A4C]">
                      <Filter className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#334233]">Browse by Category</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                      Click on a category card to see all resources in that specific domain:
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                      {["Food Assistance", "Health & Wellness", "Housing Support", "Youth Programs", "Job Help", "Community Events"].map((cat) => (
                        <li key={cat} className="flex items-center gap-3">
                          <span className="text-[#B36A4C] text-lg leading-none">-</span>
                          <span className="font-medium text-[#334233]">{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                id="filter-refine"
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
                      Filter & Refine Your Results
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Use filters to narrow down results to exactly what you need. You can combine multiple filters at once.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  {[
                    { icon: Filter, title: "Category + Keyword", desc: "Use category buttons with search terms to narrow the list quickly." },
                    { icon: Clock, title: "Availability", desc: "Use the availability filter for weekdays, weekends, evenings, or 24/7 services." },
                    { icon: Star, title: "Rating + Sort", desc: "Set a minimum rating, then sort by relevance, highest rated, or name." },
                    { icon: MapPin, title: "Contact Filters", desc: "Limit results to listings with website, phone number, or email." },
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
                id="review-connect"
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
                      Review & Connect
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Once you find a resource, click to view full details and connect with them.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] space-y-8">
                  <h3 className="text-lg font-semibold text-[#334233]">On the Resource Detail Page, You'll Find:</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {[
                      { title: "Full Description", desc: "What the organization does and who they serve" },
                      { title: "Hours & Address", desc: "When they're open and where the service is located" },
                      { title: "Contact Information", desc: "Phone number, email, and website with direct links" },
                      { title: "Community Ratings", desc: "View average ratings and add your own rating with a short reason" },
                      { title: "Quick Actions", desc: "Call, email, or visit their website directly" },
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
                      <strong className="text-[#B36A4C]">Pro Tip:</strong> Use ratings and likes to share what was useful, and check contact details before you visit.
                    </p>
                  </div>
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
                      Have questions about the Directory? Find answers to frequently asked questions below.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { q: "What if I don't know what to search for?", a: "Start with general keywords like 'help,' 'support,' or 'assistance.' You can also browse by category cards to explore what's available. If you'd like personalized guidance, feel free to use our Contact Form." },
                    { q: "Are all resources free?", a: "Most resources in our directory are free or low-cost. Check the resource details for pricing information, or contact the organization directly to confirm cost." },
                    { q: "Can I trust the information in the Directory?", a: "Listings come from approved contributors and moderator-approved public proposals. You should still confirm details directly with the organization before visiting." },
                    { q: "What if a resource's information is outdated or incorrect?", a: "Let us know! Send us a quick note through our Contact Form with the resource name and what needs updating. We'll investigate and make corrections quickly." },
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
                  Ready to find support?
                </h3>
                <p className="text-sm text-[#5B473A] mb-8 max-w-md mx-auto">
                  Jump straight to the resource directory and apply search and filters to narrow the organizations that fit your needs.
                </p>
                <Link
                  to="/directory"
                  className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-all duration-300 hover:shadow-lg"
                >
                  Start Searching Now
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


