import { useState, useMemo } from "react";
import { Search, MapPin, Phone, Globe, Clock, Filter, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { directoryEntries } from "../data/homeData";
import { ScrollReveal } from "../components/ScrollReveal";

const ALL_CATEGORIES = ["All", "Food", "Health", "Housing", "Youth", "Jobs", "Legal"];

const CATEGORY_COLORS: Record<string, string> = {
  Food:    "bg-[#A7AE8A]/20 text-[#5B473A] border-[#A7AE8A]/40",
  Health:  "bg-[#B36A4C]/10 text-[#B36A4C] border-[#B36A4C]/30",
  Housing: "bg-[#334233]/10 text-[#334233] border-[#334233]/30",
  Youth:   "bg-[#E7D9C3] text-[#5B473A] border-[#C2B99E]",
  Jobs:    "bg-[#6F7553]/10 text-[#6F7553] border-[#6F7553]/30",
  Legal:   "bg-[#F6F1E7] text-[#5B473A] border-[#E7D9C3]",
};

export function Directory() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return directoryEntries.filter((entry) => {
      const matchesCategory = activeCategory === "All" || entry.category === activeCategory;
      const matchesQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-[#F6F1E7]">
      {/* ── Hero Banner ── */}
      <section className="relative bg-[#334233] text-[#F6F1E7] pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60">
          <TopoPattern opacity={0.2} />
        </div>

        {/* Decorative route line */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="absolute right-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#B36A4C]/40 to-transparent pointer-events-none" 
        />
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.2 }}
          className="absolute right-16 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#B36A4C] ring-4 ring-[#B36A4C]/20 pointer-events-none" 
        />

        {/* Decorative route squiggle */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2.0, delay: 1.0 }}
          className="absolute left-4 lg:left-12 top-10 w-24 h-48 z-20 pointer-events-none rotate-12"
        >
          <svg viewBox="0 0 100 200" fill="none" stroke="#E7D9C3" strokeWidth="2" strokeDasharray="4 4">
            <path d="M100 0 C 80 50, 20 100, 50 150 C 70 180, 0 200, 0 200" />
            <circle cx="100" cy="0" r="4" fill="#334233" stroke="#E7D9C3" strokeWidth="2" />
            <circle cx="50" cy="150" r="4" fill="#334233" stroke="#E7D9C3" strokeWidth="2" />
            <circle cx="0" cy="200" r="4" fill="#334233" stroke="#E7D9C3" strokeWidth="2" />
          </svg>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B36A4C]/20 border border-[#B36A4C]/30 text-[#E7D9C3] text-sm font-medium mb-6"
            >
              <MapPin className="w-3.5 h-3.5 text-[#B36A4C]" />
              Bothell Community Resources
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5"
            >
              Resource{" "}
              <span className="text-[#B36A4C] italic">Directory</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4 }}
              className="text-[#A7AE8A] text-lg font-light max-w-xl leading-relaxed"
            >
              Browse and search all available community resources, programs, and services serving
              the greater Bothell area.
            </motion.p>
          </div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.6 }}
            className="mt-10 max-w-2xl"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-[#6F7553] group-focus-within:text-[#B36A4C] transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, category, or keyword…"
                className="block w-full pl-11 pr-12 py-4 text-base border-2 border-[#5B473A]/40 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-[#A7AE8A] focus:outline-none focus:border-[#B36A4C] transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A7AE8A] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setIsFilterOpen((o) => !o)}
              className="lg:hidden w-full flex items-center justify-between px-5 py-3 rounded-xl border border-[#E7D9C3] bg-white text-[#334233] font-semibold mb-4"
            >
              <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filter by Category</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-90" : ""}`} />
            </button>

            {/* Category list */}
            <div className={`${isFilterOpen ? "block" : "hidden"} lg:block sticky top-24 bg-white rounded-2xl border border-[#E7D9C3] shadow-sm p-6`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7553] mb-5">
                Category
              </h2>
              <ul className="space-y-1.5">
                {ALL_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === cat
                          ? "bg-[#334233] text-white"
                          : "text-[#5B473A] hover:bg-[#E7D9C3]/50"
                      }`}
                    >
                      {cat}
                      <span className="float-right text-xs opacity-50">
                        {cat === "All"
                          ? directoryEntries.length
                          : directoryEntries.filter((e) => e.category === cat).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-[#E7D9C3]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7553] mb-3">
                  Need Help?
                </h2>
                <p className="text-sm text-[#5B473A] leading-relaxed mb-4">
                  Can't find what you're looking for? Suggest a resource and we'll add it.
                </p>
                <a
                  href="/#suggest"
                  className="block text-center px-4 py-2.5 rounded-xl border border-[#334233] text-[#334233] text-sm font-semibold hover:bg-[#334233] hover:text-white transition-colors"
                >
                  Suggest a Resource
                </a>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-grow">
            {/* Results summary */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-[#5B473A] text-sm">
                Showing{" "}
                <span className="font-semibold text-[#334233]">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "resource" : "resources"}
                {activeCategory !== "All" && (
                  <> in <span className="font-semibold text-[#334233]">{activeCategory}</span></>
                )}
              </p>
              {(query || activeCategory !== "All") && (
                <button
                  onClick={() => { setQuery(""); setActiveCategory("All"); }}
                  className="text-sm text-[#B36A4C] font-medium hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-24 text-[#6F7553]"
              >
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-[#334233] mb-1">No resources found</p>
                <p className="text-sm">Try adjusting your search or category filter.</p>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filtered.map((entry, i) => (
                    <motion.div
                      layout
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: Math.min(i * 0.05, 0.4), 
                        ease: [0.22, 1, 0.36, 1] 
                      }}
                      className="group flex flex-col bg-white rounded-3xl border border-[#E7D9C3] shadow-sm hover:border-[#A7AE8A] hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Image */}
                      {entry.image && (
                        <div className="h-40 overflow-hidden flex-shrink-0 relative">
                          <ImageWithFallback
                            src={entry.image}
                            alt={entry.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/30 to-transparent" />
                        </div>
                      )}

                      <div className="p-6 flex flex-col flex-grow">
                        {/* Category badge */}
                        <div className="mb-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${CATEGORY_COLORS[entry.category] ?? "bg-[#E7D9C3] text-[#5B473A] border-[#C2B99E]"}`}>
                            {entry.category}
                          </span>
                        </div>

                        <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-2 group-hover:text-[#B36A4C] transition-colors">
                          {entry.name}
                        </h3>
                        <p className="text-[#5B473A] text-sm leading-relaxed mb-5 flex-grow">
                          {entry.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 bg-[#E7D9C3]/60 text-[#5B473A] text-xs rounded-full border border-[#E7D9C3]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Contact details */}
                        <div className="space-y-2 text-sm text-[#5B473A] border-t border-[#E7D9C3] pt-4">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#A7AE8A] mt-0.5 flex-shrink-0" />
                            <span>{entry.address}</span>
                          </div>
                          {entry.hours && (
                            <div className="flex items-start gap-2.5">
                              <Clock className="w-4 h-4 text-[#A7AE8A] mt-0.5 flex-shrink-0" />
                              <span>{entry.hours}</span>
                            </div>
                          )}
                          {entry.phone && (
                            <div className="flex items-center gap-2.5">
                              <Phone className="w-4 h-4 text-[#A7AE8A] flex-shrink-0" />
                              <a href={`tel:${entry.phone}`} className="hover:text-[#B36A4C] transition-colors">
                                {entry.phone}
                              </a>
                            </div>
                          )}
                          {entry.website && (
                            <div className="flex items-center gap-2.5">
                              <Globe className="w-4 h-4 text-[#A7AE8A] flex-shrink-0" />
                              <a
                                href={`https://${entry.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#B36A4C] transition-colors truncate"
                              >
                                {entry.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
