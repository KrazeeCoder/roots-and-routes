import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Search, Filter, MapPin, Clock, Star, ExternalLink } from "lucide-react";
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
      <section className="relative pt-16 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="flex items-end gap-4 mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#B36A4C] to-[#934a3f] text-white font-bold text-lg">
                1
              </div>
              <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
                Choose Your Search Method
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#5B473A] mb-8">
              The Directory offers two ways to find what you need. Use the search bar for keywords, or browse by category.
            </p>
            
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border-2 border-[#B36A4C]/30 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#B36A4C]/10 text-[#B36A4C]">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#334233]">Keyword Search</h3>
                <p className="mt-3 text-base leading-7 text-[#5B473A]">
                  Type what you're looking for directly into the search box. Try specific terms like:
                </p>
                <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#B36A4C] flex-shrink-0"></span>
                    <span><strong>"Food pantry"</strong> for emergency food assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#B36A4C] flex-shrink-0"></span>
                    <span><strong>"Mental health"</strong> for counseling services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#B36A4C] flex-shrink-0"></span>
                    <span><strong>"Job training"</strong> for employment assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#B36A4C] flex-shrink-0"></span>
                    <span><strong>"Rent assistance"</strong> for housing support</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border-2 border-[#B36A4C]/30 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#B36A4C]/10 text-[#B36A4C]">
                  <Filter className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#334233]">Browse by Category</h3>
                <p className="mt-3 text-base leading-7 text-[#5B473A]">
                  Click on a category to see all resources in that area:
                </p>
                <ul className="mt-6 space-y-2 text-sm text-[#5B473A]">
                  <li className="flex items-start gap-3">
                    <span className="text-[#B36A4C] font-bold text-lg leading-none mt-0.5">▸</span>
                    <span>Food Assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#B36A4C] font-bold text-lg leading-none mt-0.5">▸</span>
                    <span>Health & Wellness</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#B36A4C] font-bold text-lg leading-none mt-0.5">▸</span>
                    <span>Housing Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#B36A4C] font-bold text-lg leading-none mt-0.5">▸</span>
                    <span>Youth Programs & Job Help</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
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
              Filter & Refine Your Results
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Use filters to narrow down results to exactly what you need. You can combine multiple filters at once.
            </p>
            
            <div className="mt-8 space-y-4 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Location & Distance</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Filter by distance radius (e.g., "within 2 miles") to see services close to you. Resources are sorted by distance automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Hours of Operation</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Filter by when you can access the service: weekdays, evenings, weekends, or open today. Perfect if you need same-day support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Community Ratings</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Filter by star rating (4+ stars, 5 stars) to find highly-rated services in your area. Ratings come from real community members.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
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
              Review & Connect
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Once you find a resource, click to view full details and connect with them.
            </p>
            
            <div className="mt-8 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[#334233]">On the Resource Detail Page, You'll Find:</h3>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Full Description</p>
                    <p className="text-sm text-[#5B473A]">What the organization does and who they serve</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Hours & Location</p>
                    <p className="text-sm text-[#5B473A]">When they're open and where to find them on a map</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Contact Information</p>
                    <p className="text-sm text-[#5B473A]">Phone number, email, and website with direct links</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Community Ratings & Reviews</p>
                    <p className="text-sm text-[#5B473A]">See what others in your community have experienced</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-[#B36A4C] text-sm flex items-center justify-center text-white font-semibold">✓</div>
                  <div>
                    <p className="font-semibold text-[#334233]">Quick Actions</p>
                    <p className="text-sm text-[#5B473A]">Call, email, or visit their website directly</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-[#B36A4C]/10 p-4 border border-[#B36A4C]/20">
                <p className="text-sm text-[#334233]">
                  <strong>Pro Tip:</strong> You can save your favorite resources by clicking the heart icon. Sign in to access your saved list anytime from your account.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-20 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <h3 className="text-2xl font-semibold text-[#334233]">Common Questions</h3>
            <div className="mt-8 space-y-6">
              <div>
                <h4 className="font-semibold text-[#334233]">What if I don't know what to search for?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Start with general keywords like "help," "support," or "assistance." You can also browse by category to explore what's available. If you'd like personalized guidance, reach out to our community team at rootsandroutes.bothell@outlook.com.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Are all resources free?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Most resources in our directory are free or low-cost. Check the resource details for pricing information, or contact the organization directly to confirm cost.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Can I trust the information in the Directory?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Yes. All resources in the Directory have been verified by our community team. Ratings and reviews come from real community members. Always verify contact details by visiting the resource's website or calling directly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">What if a resource's information is outdated or incorrect?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Let us know! Send an email to rootsandroutes.bothell@outlook.com with the resource name and what needs updating. We'll investigate and make corrections quickly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="mt-16 text-center"
          >
            <Link
              to="/directory"
              className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
            >
              Start Searching Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
