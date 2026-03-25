import { useState, useMemo, useEffect, useDeferredValue, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, MapPin, Filter, X, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import { RatingComponent } from "../components/engagement/RatingComponent";
import { EngagementButtons } from "../components/engagement/EngagementButtons";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_META,
  isResourceCategory,
  type ResourceCategoryFilter,
} from "../constants/resourceCategories";
import { listDirectoryResourcesPage, mapResourceToDirectoryEntry } from "../data/portalApi";
import type { DirectoryEntry } from "../types/home";
import type { SpotlightEngagement } from "../types/engagement";
import { getSpotlightEngagement } from "../../utils/engagementSupabase";

const PAGE_SIZE = 8;
const STICKY_HEADER_OFFSET_PX = 112;

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

function truncateDescription(value: string, maxLength = 180) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}...`;
}

export function Directory() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const categoryParam = normalizeCategoryParam(searchParams.get("category"));

  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [engagementByEntry, setEngagementByEntry] = useState<Record<string, SpotlightEngagement>>({});
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState(queryParam);
  const deferredQuery = useDeferredValue(query);
  const [activeCategory, setActiveCategory] = useState<ResourceCategoryFilter>(categoryParam);
  const [minRating, setMinRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const resultsTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(queryParam);
    setActiveCategory(categoryParam);
  }, [queryParam, categoryParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, activeCategory, minRating]);

  useEffect(() => {
    let cancelled = false;

    async function loadEntriesPage() {
      setLoadingEntries(true);
      setLoadError(null);

      try {
        const pageResult = await listDirectoryResourcesPage({
          page: currentPage,
          pageSize: PAGE_SIZE,
          query: deferredQuery,
          category: activeCategory === "All" ? null : activeCategory,
          minRating,
        });

        const nextEntries = pageResult.resources.map(mapResourceToDirectoryEntry);

        const engagementRows = await Promise.all(
          nextEntries.map(async (entry) => {
            const engagement = await getSpotlightEngagement(entry.id);
            return [entry.id, engagement] as const;
          }),
        );

        if (cancelled) return;
        setEntries(nextEntries);
        setEngagementByEntry(Object.fromEntries(engagementRows));
        setTotalCount(pageResult.totalCount);
        setTotalPages(pageResult.totalPages);
      } catch (error) {
        console.error("Could not load directory resources", error);
        if (cancelled) return;
        setEntries([]);
        setEngagementByEntry({});
        setTotalCount(0);
        setTotalPages(0);
        setLoadError("Could not load resources right now. Please try again.");
      } finally {
        if (!cancelled) setLoadingEntries(false);
      }
    }

    void loadEntriesPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, deferredQuery, activeCategory, minRating]);

  const refreshEntryEngagement = async (entryId: string) => {
    try {
      const latest = await getSpotlightEngagement(entryId);
      setEngagementByEntry((prev) => ({ ...prev, [entryId]: latest }));
    } catch (error) {
      console.error(`Could not refresh engagement for ${entryId}`, error);
    }
  };

  const scrollToResultsTop = () => {
    const target = resultsTopRef.current;
    if (!target || typeof window === "undefined") return;
    const top = target.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_OFFSET_PX;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  const allCategories: ResourceCategoryFilter[] = useMemo(
    () => ["All", ...RESOURCE_CATEGORIES],
    [],
  );

  const hasFilters = query.trim().length > 0 || activeCategory !== "All" || minRating > 0;
  const showSpinnerOverlay = loadingEntries && entries.length > 0;

  return (
    <div className="min-h-screen bg-[#F6F1E7]">
      <section className="relative bg-[#334233] text-[#F6F1E7] pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60">
          <TopoPattern opacity={0.2} />
        </div>

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
              Community Resources
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5"
            >
              Resource <span className="text-[#B36A4C] italic">Directory</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4 }}
              className="text-[#A7AE8A] text-lg font-light max-w-xl leading-relaxed"
            >
              Browse the programs, services, and neighbor-led help that people in the greater Bothell area rely on.
            </motion.p>
          </div>

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
                onChange={(event) => setQuery(event.target.value)}
                disabled={loadingEntries}
                placeholder="Search by name, category, or keyword..."
                className="block w-full pl-11 pr-12 py-4 text-base border-2 border-[#5B473A]/40 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-[#A7AE8A] focus:outline-none focus:border-[#B36A4C] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={loadingEntries}
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

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-64 flex-shrink-0">
            <button
              onClick={() => setIsFilterOpen((open) => !open)}
              className="lg:hidden w-full flex items-center justify-between px-5 py-3 rounded-xl border border-[#E7D9C3] bg-white text-[#334233] font-semibold mb-4"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-90" : ""}`} />
            </button>

            <div
              className={`${isFilterOpen ? "block" : "hidden"} lg:block sticky top-24 bg-white rounded-2xl border border-[#E7D9C3] shadow-sm p-6`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7553] mb-5">Category</h2>
              <ul className="space-y-1.5">
                {allCategories.map((category) => (
                  <li key={category}>
                    <button
                      disabled={loadingEntries}
                      onClick={() => {
                        setActiveCategory(category);
                        scrollToResultsTop();
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                        activeCategory === category
                          ? "bg-[#334233] text-white"
                          : "text-[#5B473A] hover:bg-[#E7D9C3]/50"
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-[#E7D9C3]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7553] mb-3">Minimum Rating</h2>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={minRating}
                    disabled={loadingEntries}
                    onChange={(event) => setMinRating(Number(event.target.value))}
                    className="w-full accent-[#334233] disabled:opacity-70"
                    aria-label="Minimum average rating"
                  />
                  <p className="text-sm text-[#5B473A]">
                    {minRating <= 0 ? "Any rating" : `${minRating.toFixed(1)} stars and up`}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E7D9C3]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7553] mb-3">Need Guidance?</h2>
                <p className="text-sm text-[#5B473A] leading-relaxed mb-4">
                  Still not seeing what you need? Submit a resource proposal for moderator review.
                </p>
                <a
                  href="/suggest?type=resource"
                  className="block text-center px-4 py-2.5 rounded-xl border border-[#334233] text-[#334233] text-sm font-semibold hover:bg-[#334233] hover:text-white transition-colors"
                >
                  Submit a Resource
                </a>
              </div>
            </div>
          </aside>

          <div className="flex-grow">
            <div ref={resultsTopRef} />
            <div className="flex items-center justify-between mb-8 gap-4">
              <p className="text-[#5B473A] text-sm">
                Showing <span className="font-semibold text-[#334233]">{totalCount}</span>{" "}
                {totalCount === 1 ? "resource" : "resources"}
                {activeCategory !== "All" && (
                  <>
                    {" "}
                    in <span className="font-semibold text-[#334233]">{activeCategory}</span>
                  </>
                )}
                {minRating > 0 && (
                  <>
                    {" "}
                    with rating <span className="font-semibold text-[#334233]">{minRating.toFixed(1)}+</span>
                  </>
                )}
              </p>
              {hasFilters && (
                <button
                  disabled={loadingEntries}
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("All");
                    setMinRating(0);
                    setCurrentPage(1);
                    scrollToResultsTop();
                  }}
                  className="text-sm text-[#B36A4C] font-medium hover:underline flex items-center gap-1 disabled:opacity-70 disabled:no-underline"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>

            <div className="relative">
              {showSpinnerOverlay && (
                <div className="absolute inset-0 z-20 bg-[#F6F1E7]/75 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-[#E7D9C3] text-[#334233]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#B36A4C]" />
                    <span className="text-sm font-medium">Loading resources...</span>
                  </div>
                </div>
              )}

              {loadingEntries && entries.length === 0 ? (
                <div className="text-center py-24 text-[#6F7553]">
                  <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-[#B36A4C]" />
                  <p className="text-lg font-medium text-[#334233]">Loading resources...</p>
                </div>
              ) : loadError ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-[#6F7553]">
                  <p className="text-lg font-medium text-[#334233] mb-1">We ran into a loading issue</p>
                  <p className="text-sm">{loadError}</p>
                </motion.div>
              ) : entries.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-[#6F7553]">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium text-[#334233] mb-1">No resources found</p>
                  <p className="text-sm">Try adjusting your search, category, or minimum rating filter.</p>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${showSpinnerOverlay ? "pointer-events-none" : ""}`}
                  transition={{ layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
                >
                  {entries.map((entry) => (
                    <motion.div
                      layout="position"
                      key={entry.id}
                      initial={false}
                      transition={{ layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
                      className="group flex flex-col bg-white rounded-3xl border border-[#E7D9C3] shadow-sm hover:border-[#A7AE8A] hover:shadow-md transition-all overflow-hidden"
                    >
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
                        <div className="mb-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryBadgeClassName(entry.category)}`}
                          >
                            {entry.category}
                          </span>
                        </div>

                        <Link to={`/resources/${entry.id}`}>
                          <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-2 group-hover:text-[#B36A4C] transition-colors">
                            {entry.name}
                          </h3>
                        </Link>

                        <p className="text-[#5B473A] text-sm leading-relaxed mb-4">
                          {truncateDescription(entry.description)}
                        </p>

                        {entry.postedByName ? (
                          <p className="text-xs text-[#6F7553] mb-4">Posted by {entry.postedByName}</p>
                        ) : null}

                        <div className="mb-5 border-t border-[#E7D9C3] pt-4">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <RatingComponent
                              spotlightId={entry.id}
                              currentRating={engagementByEntry[entry.id]?.userEngagement.userRating ?? null}
                              averageRating={engagementByEntry[entry.id]?.stats.averageRating ?? 0}
                              totalRatings={engagementByEntry[entry.id]?.stats.totalRatings ?? 0}
                              size="sm"
                              showCount={false}
                              onRatingChange={() => {
                                void refreshEntryEngagement(entry.id);
                              }}
                            />
                            {engagementByEntry[entry.id] ? (
                              <EngagementButtons
                                spotlightId={entry.id}
                                engagement={engagementByEntry[entry.id]}
                                onUpdate={(nextEngagement) =>
                                  setEngagementByEntry((prev) => ({ ...prev, [entry.id]: nextEngagement }))
                                }
                                compact={true}
                              />
                            ) : null}
                          </div>
                        </div>

                        <Link
                          to={`/resources/${entry.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#334233] hover:text-[#B36A4C] transition-colors"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingEntries || currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    scrollToResultsTop();
                  }}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      disabled={loadingEntries}
                      onClick={() => {
                        setCurrentPage(page);
                        scrollToResultsTop();
                      }}
                      className={`w-8 h-8 p-0 ${currentPage === page ? "bg-[#B36A4C] hover:bg-[#8A6F5A]" : ""}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingEntries || currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    scrollToResultsTop();
                  }}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
