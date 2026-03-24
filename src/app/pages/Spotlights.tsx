import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, MapPin, Users, Star, Heart, Award, Eye } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { TopoPattern } from "../components/TopoPattern";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { listSpotlightItems } from "../data/portalApi";
import { getSpotlightEngagement, incrementViewCount } from "../../utils/engagementSupabase";
import { RatingComponent } from "../components/engagement/RatingComponent";
import { EngagementButtons } from "../components/engagement/EngagementButtons";
import type { SpotlightItem } from "../types/home";
import type { SpotlightEngagement } from "../types/engagement";

export function Spotlights() {
  const [spotlights, setSpotlights] = useState<SpotlightItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [engagementData, setEngagementData] = useState<Record<string, SpotlightEngagement>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadSpotlights() {
      try {
        const data = await listSpotlightItems();
        if (cancelled) return;
        setSpotlights(data);
      } catch (error) {
        console.error("Could not load spotlight items", error);
      }
    }

    void loadSpotlights();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => spotlights.find((s) => s.featured) || spotlights[0], [spotlights]);
  const rest = useMemo(() => spotlights.filter((s) => s.id !== featured?.id), [spotlights, featured]);
  
  const categories = useMemo(() => {
    const cats = [...new Set(spotlights.map(s => s.category))];
    return cats.sort();
  }, [spotlights]);
  
  const filteredSpotlights = useMemo(() => {
    if (selectedCategory === "all") return rest;
    return rest.filter(s => s.category === selectedCategory);
  }, [rest, selectedCategory]);

  // Load engagement data for all spotlights
  useEffect(() => {
    const loadEngagementData = async () => {
      const allSpotlights = [featured, ...rest].filter(Boolean);
      
      for (const spotlight of allSpotlights) {
        if (!spotlight?.id || engagementData[spotlight.id]) continue;

        try {
          const engagement = await getSpotlightEngagement(spotlight.id);
          setEngagementData(prev => ({ ...prev, [spotlight.id]: engagement }));
          
          // Increment view count
          await incrementViewCount(spotlight.id);
          const refreshed = await getSpotlightEngagement(spotlight.id);
          setEngagementData(prev => ({ ...prev, [spotlight.id]: refreshed }));
        } catch (error) {
          console.error(`Failed to load engagement for ${spotlight.id}:`, error);
        }
      }
    };

    if (spotlights.length > 0) {
      loadEngagementData();
    }
  }, [spotlights, featured, rest]);

  const updateEngagement = (spotlightId: string, newEngagement: SpotlightEngagement) => {
    setEngagementData(prev => ({ ...prev, [spotlightId]: newEngagement }));
  };

  const refreshEngagement = async (spotlightId: string) => {
    try {
      const latest = await getSpotlightEngagement(spotlightId);
      updateEngagement(spotlightId, latest);
    } catch (error) {
      console.error(`Failed to refresh engagement for ${spotlightId}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1E7] via-[#FAF7F0] to-[#F0EAD6] pb-24">
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
              <Star className="w-3.5 h-3.5 text-[#B36A4C]" />
              Community Spotlights
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5"
            >
              Community{" "}
              <span className="text-[#B36A4C] italic">Spotlights</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4 }}
              className="text-[#A7AE8A] text-lg font-light max-w-xl leading-relaxed"
            >
              Discover the programs, initiatives, and stories making a real difference in Bothell
              right now.
            </motion.p>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ── Category Filter ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="w-8 h-0.5 bg-[#A7AE8A]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#6F7553]">
                  Explore Categories
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === "all"
                      ? "bg-[#334233] text-white shadow-lg"
                      : "bg-white text-[#6F7553] border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md"
                  }`}
                >
                  All Spotlights
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-[#334233] text-white shadow-lg"
                        : "bg-white text-[#6F7553] border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ── Featured Spotlight ── */}
      {featured ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#B36A4C]" />
                <span className="w-8 h-0.5 bg-[#B36A4C]" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#B36A4C]">
                Featured This Month
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#E7D9C3] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Image */}
                <div className="lg:col-span-4 relative h-64 lg:h-auto overflow-hidden">
                  {featured.image ? (
                    <ImageWithFallback
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E7D9C3] to-[#D4C4B0] flex items-center justify-center">
                      <div className="text-center">
                        <span className="font-['Cormorant_Garamond',serif] text-4xl text-[#A7AE8A] block mb-2">R&R</span>
                        <span className="text-[#6F7553] text-sm">Community Spotlight</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm text-[#6F7553] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#E7D9C3] shadow-sm">
                      {featured.category}
                    </div>
                  </div>
                  
                  {/* Featured indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-[#334233]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold">Featured</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-center">
                  {/* Meta information */}
                  <div className="flex flex-wrap gap-4 text-sm text-[#6F7553] mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#B36A4C]" />
                      <span className="font-medium">{featured.audience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#B36A4C]" />
                      <span className="font-medium">{featured.location}</span>
                    </div>
                  </div>

                  {/* Title and subtitle */}
                  <div className="mb-4">
                    <h3 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#334233] mb-2 group-hover:text-[#B36A4C] transition-colors leading-tight">
                      {featured.title}
                    </h3>
                    <p className="text-[#6F7553] text-base font-medium italic">
                      {featured.subtitle}
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-[#5B473A] text-base leading-relaxed mb-6 line-clamp-3">
                    {featured.fullDescription}
                  </p>
                  
                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/resources/${featured.id}`}
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-[#334233] text-white font-semibold text-sm hover:bg-[#B36A4C] transition-colors shadow-md hover:shadow-lg"
                    >
                      Read Full Story
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-[#6F7553]">
                      <Eye className="w-4 h-4" />
                      <span>Featured this month</span>
                    </div>
                  </div>

                  {/* Engagement Section */}
                  <div className="mt-6 pt-6 border-t border-[#E7D9C3]">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Rating */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#6F7553] font-medium">Rate this spotlight:</span>
                        <RatingComponent
                          spotlightId={featured.id}
                          currentRating={engagementData[featured.id]?.userEngagement.userRating || null}
                          averageRating={engagementData[featured.id]?.stats.averageRating || 0}
                          totalRatings={engagementData[featured.id]?.stats.totalRatings || 0}
                          size="sm"
                          showCount={true}
                          onRatingChange={() => {
                            void refreshEngagement(featured.id);
                          }}
                        />
                      </div>

                      {/* Engagement Buttons */}
                      {engagementData[featured.id] && (
                        <EngagementButtons
                          spotlightId={featured.id}
                          engagement={engagementData[featured.id]}
                          onUpdate={(newEngagement) => updateEngagement(featured.id, newEngagement)}
                          compact={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      {/* ── Enhanced All Spotlights Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#A7AE8A]" />
              <span className="w-8 h-0.5 bg-[#A7AE8A]" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6F7553]">
              {selectedCategory === "all" ? "All Spotlights" : `${selectedCategory} Spotlights`}
            </h2>
            <span className="text-sm text-[#A7AE8A] font-medium">
              ({filteredSpotlights.length} {filteredSpotlights.length === 1 ? 'item' : 'items'})
            </span>
          </div>
        </ScrollReveal>

        {filteredSpotlights.length > 0 ? (
          <StaggerGroup fast className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredSpotlights.map((item) => (
              <StaggerItem key={item.id}>
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col h-full bg-white rounded-3xl border border-[#E7D9C3] shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Enhanced Image or placeholder */}
                  <div className="relative h-56 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#E7D9C3] to-[#D4C4B0] flex items-center justify-center">
                        <div className="text-center">
                          <span className="font-['Cormorant_Garamond',serif] text-4xl text-[#A7AE8A] block">
                            R&R
                          </span>
                          <span className="text-[#6F7553] text-xs mt-1">Spotlight</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/40 via-transparent to-transparent" />
                    
                    {/* Enhanced category badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm text-[#6F7553] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#E7D9C3] shadow-sm">
                        {item.category}
                      </div>
                    </div>
                    
                    {/* Hover actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                        <Heart className="w-4 h-4 text-[#B36A4C]" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Content */}
                  <div className="p-6 flex flex-col">
                    <Link
                      to={`/resources/${item.id}`}
                      className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#334233] mb-2 leading-tight group-hover:text-[#B36A4C] transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-[#6F7553] text-sm font-medium italic mb-4">{item.subtitle}</p>
                    <p className="text-[#5B473A] text-sm leading-relaxed line-clamp-3 mb-4">
                      {item.description}
                    </p>

                    {/* Enhanced Audience / Location */}
                    <div className="flex flex-wrap gap-4 text-xs text-[#6F7553] border-t border-[#E7D9C3] pt-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#F6F1E7] rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-[#B36A4C]" />
                        </div>
                        <span className="font-medium">{item.audience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#F6F1E7] rounded-full flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-[#B36A4C]" />
                        </div>
                        <span className="font-medium">{item.location}</span>
                      </div>
                    </div>

                    {/* Enhanced CTA */}
                    <Link
                      to={`/resources/${item.id}`}
                      className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-[#334233] text-white font-semibold text-sm hover:bg-[#B36A4C] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mb-4"
                    >
                      Read Full Story
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>

                    {/* Engagement Section */}
                    <div className="border-t border-[#E7D9C3] pt-4">
                      {/* Rating */}
                      <div className="mb-3">
                        <RatingComponent
                          spotlightId={item.id}
                          currentRating={engagementData[item.id]?.userEngagement.userRating || null}
                          averageRating={engagementData[item.id]?.stats.averageRating || 0}
                          totalRatings={engagementData[item.id]?.stats.totalRatings || 0}
                          size="sm"
                          showCount={true}
                          readonly={false}
                          onRatingChange={() => {
                            void refreshEngagement(item.id);
                          }}
                        />
                      </div>

                      {/* Engagement Buttons */}
                      {engagementData[item.id] && (
                        <EngagementButtons
                          spotlightId={item.id}
                          engagement={engagementData[item.id]}
                          onUpdate={(newEngagement) => updateEngagement(item.id, newEngagement)}
                          compact={true}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <ScrollReveal>
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#F6F1E7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-[#A7AE8A]" />
              </div>
              <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-3">
                No spotlights found
              </h3>
              <p className="text-[#6F7553] text-lg max-w-md mx-auto">
                {selectedCategory === "all" 
                  ? "No spotlights are available at the moment. Check back soon for new community features!"
                  : `No spotlights found in the "${selectedCategory}" category. Try selecting a different category.`
                }
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="mt-6 px-6 py-3 bg-[#334233] text-white rounded-xl font-semibold hover:bg-[#B36A4C] transition-colors"
                >
                  View All Categories
                </button>
              )}
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}
