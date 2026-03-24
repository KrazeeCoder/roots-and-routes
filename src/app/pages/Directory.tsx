import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, MapPin, Phone, Globe, Clock, Filter, X, ChevronRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_META,
  isResourceCategory,
  type ResourceCategoryFilter,
} from "../constants/resourceCategories";
import { listPublishedResources, mapResourceToDirectoryEntry } from "../data/portalApi";
import type { DirectoryEntry } from "../types/home";

function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function normalizeCategoryParam(value: string | null) {
  if (!value || value.toLowerCase() === "all") return "All";
  return isResourceCategory(value) ? value : "All";
}

function getCategoryBadgeClassName(category: string) {
  if (isResourceCategory(category)) {
    return RESOURCE_CATEGORY_META[category].badgeClassName;
  }

  return "bg-[#E7D9C3] text-[#5B473A] border-[#C2B99E]";
}

export function Directory() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const categoryParam = normalizeCategoryParam(searchParams.get("category"));
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [query, setQuery] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState<ResourceCategoryFilter>(categoryParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [resultsPulse, setResultsPulse] = useState(false);

  useEffect(() => {
    setQuery(queryParam);
    setActiveCategory(categoryParam);
  }, [queryParam, categoryParam]);

  useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      try {
        const resources = await listPublishedResources();
        if (cancelled) return;
        setEntries(resources.map(mapResourceToDirectoryEntry));
      } catch (error) {
        console.error("Could not load published resources", error);
      } finally {
        if (!cancelled) setLoadingEntries(false);
      }
    }

    void loadEntries();
    return () => {
      cancelled = true;
    };
  }, []);

  const queryFiltered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return entries.filter((entry) => {
      const matchesQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [query, entries]);

  const filtered = useMemo(
    () =>
      queryFiltered.filter((entry) => activeCategory === "All" || entry.category === activeCategory),
    [activeCategory, queryFiltered],
  );
  const resourcesAnimationKey = `${query}-${activeCategory}`;
  useEffect(() => {
    if (loadingEntries) return;

    setResultsPulse(true);
    const pulseTimeout = setTimeout(() => {
      setResultsPulse(false);
    }, 450);

    return () => clearTimeout(pulseTimeout);
  }, [query, activeCategory, loadingEntries]);

  const allCategories: ResourceCategoryFilter[] = useMemo(
    () => ["All", ...RESOURCE_CATEGORIES],
    [],
  );

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
              Community Pathways
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
              Navigate all available community resources, programs, and pathways serving
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
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
                {allCategories.map((cat) => (
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
                          ? queryFiltered.length
                          : queryFiltered.filter((e) => e.category === cat).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-[#E7D9C3]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7553] mb-3">
                  Need Guidance?
                </h2>
                <p className="text-sm text-[#5B473A] leading-relaxed mb-4">
                  Can't find your path? Suggest a resource and we'll help it grow.
                </p>
                <a
                  href="/suggest"
                  className="block text-center px-4 py-2.5 rounded-xl border border-[#334233] text-[#334233] text-sm font-semibold hover:bg-[#334233] hover:text-white transition-colors"
                >
                  Plant a Resource
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

            {loadingEntries ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-[#6F7553]"
              >
                <p className="text-lg font-medium text-[#334233] mb-1">Loading resources...</p>
              </motion.div>
            ) : filtered.length === 0 ? (
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
              <motion.div
                key={resourcesAnimationKey}
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0.15, y: 20, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: resultsPulse ? 1.015 : 1,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.4, 0, 0.2, 1],
                  scale: { type: "spring", stiffness: 260, damping: 24 },
                }}
              >
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
                        <Link to={`/resources/${entry.id}`} className="h-40 overflow-hidden flex-shrink-0 relative block">
                          <ImageWithFallback
                            src={entry.image}
                            alt={entry.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/30 to-transparent" />
                        </Link>
                      )}

                      <div className="p-6 flex flex-col flex-grow">
                        {/* Category badge */}
                        <div className="mb-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryBadgeClassName(entry.category)}`}>
                            {entry.category}
                          </span>
                        </div>

                        <Link to={`/resources/${entry.id}`}>
                          <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-2 group-hover:text-[#B36A4C] transition-colors">
                            {entry.name}
                          </h3>
                        </Link>
                        <p className="text-[#5B473A] text-sm leading-relaxed mb-5 flex-grow">
                          {entry.description}
                        </p>
                        {entry.postedByName ? (
                          <p className="text-xs text-[#6F7553] mb-4">Posted by {entry.postedByName}</p>
                        ) : null}

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

                        <Link
                          to={`/resources/${entry.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#334233] hover:text-[#B36A4C] transition-colors mb-5"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>

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
                          {entry.email && (
                            <div className="flex items-center gap-2.5">
                              <Mail className="w-4 h-4 text-[#A7AE8A] flex-shrink-0" />
                              <a
                                href={`mailto:${entry.email.trim().toLowerCase()}`}
                                className="hover:text-[#B36A4C] transition-colors truncate"
                              >
                                {entry.email}
                              </a>
                            </div>
                          )}
                          {entry.website && (
                            <div className="flex items-center gap-2.5">
                              <Globe className="w-4 h-4 text-[#A7AE8A] flex-shrink-0" />
                              <a
                                href={normalizeWebsite(entry.website)}
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

