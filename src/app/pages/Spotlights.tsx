import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { TopoPattern } from "../components/TopoPattern";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { listSpotlightItems } from "../data/portalApi";
import type { SpotlightItem } from "../types/home";

export function Spotlights() {
  const [spotlights, setSpotlights] = useState<SpotlightItem[]>([]);

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

  return (
    <div className="min-h-screen bg-[#F6F1E7] pb-24">
      {/* ── Hero Banner ── */}
      <section className="relative bg-[#334233] text-[#F6F1E7] pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60">
          <TopoPattern opacity={0.2} />
        </div>

        {/* Decorative dot cluster */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="absolute top-12 right-12 grid grid-cols-3 gap-2 pointer-events-none"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#A7AE8A]" />
          ))}
        </motion.div>

        {/* Decorative route line (squiggle) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2.0, delay: 1.0 }}
          className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 w-32 h-64 z-20 pointer-events-none -rotate-12"
        >
          <svg viewBox="0 0 100 200" fill="none" stroke="#B36A4C" strokeWidth="2" strokeDasharray="4 4">
            <path d="M100 0 C 80 50, 20 100, 50 150 C 70 180, 0 200, 0 200" />
            <circle cx="100" cy="0" r="4" fill="#334233" stroke="#B36A4C" strokeWidth="2" />
            <circle cx="50" cy="150" r="4" fill="#334233" stroke="#B36A4C" strokeWidth="2" />
            <circle cx="0" cy="200" r="4" fill="#334233" stroke="#B36A4C" strokeWidth="2" />
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#B36A4C] animate-pulse" />
              Updated Monthly
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

          {/* Stats bar */}
          <StaggerGroup fast className="mt-12 flex flex-wrap gap-8">
            {[
              { value: spotlights.length, label: "Active Spotlights" },
              { value: "6", label: "Categories Covered" },
              { value: "Monthly", label: "Refresh Cycle" },
            ].map((stat) => (
              <StaggerItem key={stat.label} className="flex flex-col">
                <span className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-[#A7AE8A] text-sm">{stat.label}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ── Featured Spotlight ── */}
      {featured ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <span className="w-8 h-0.5 bg-[#B36A4C]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#B36A4C]">
                Featured This Month
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="group grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl overflow-hidden border border-[#E7D9C3] shadow-sm hover:shadow-md hover:border-[#A7AE8A] transition-all">
              {/* Image */}
              <div className="lg:col-span-5 relative h-72 lg:h-auto overflow-hidden">
                {featured.image ? (
                  <ImageWithFallback
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[#E7D9C3] flex items-center justify-center">
                    <span className="font-['Cormorant_Garamond',serif] text-6xl text-[#A7AE8A]">R&R</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#334233]/10 lg:hidden" />
                <div className="absolute top-5 left-5 bg-[#B36A4C] text-[#F6F1E7] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {featured.category}
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
                <div className="flex flex-wrap gap-4 text-sm text-[#6F7553] mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {featured.audience}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {featured.location}
                  </div>
                </div>

                <h3 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#334233] mb-3 group-hover:text-[#B36A4C] transition-colors">
                  {featured.title}
                </h3>
                <p className="text-[#5B473A] text-sm font-medium mb-4 italic">
                  {featured.subtitle}
                </p>
                <p className="text-[#5B473A] leading-relaxed mb-8 line-clamp-4">
                  {featured.fullDescription}
                </p>
                <button className="self-start inline-flex items-center justify-center px-7 py-3 rounded-xl bg-[#334233] text-white font-semibold text-sm hover:bg-[#B36A4C] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-white">
                  Read Full Story
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      {/* ── All Spotlights Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-0.5 bg-[#A7AE8A]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6F7553]">
              All Spotlights
            </h2>
          </div>
        </ScrollReveal>

        <StaggerGroup fast className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {rest.map((item) => (
            <StaggerItem key={item.id}>
              <div className="group flex flex-col h-full bg-white rounded-3xl border border-[#E7D9C3] shadow-sm hover:border-[#A7AE8A] hover:shadow-md transition-all overflow-hidden">
                {/* Image or placeholder */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E7D9C3]/70 flex items-center justify-center">
                      <span className="font-['Cormorant_Garamond',serif] text-3xl text-[#A7AE8A]">
                        R&R
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/30 to-transparent" />
                  <div className="absolute top-4 left-4 text-[#6F7553] text-xs font-bold uppercase tracking-wider bg-[#F6F1E7]/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E7D9C3]">
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-1.5 leading-tight group-hover:text-[#B36A4C] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[#6F7553] text-xs font-medium italic mb-3">{item.subtitle}</p>
                  <p className="text-[#5B473A] text-sm leading-relaxed line-clamp-3 mb-5 flex-grow">
                    {item.description}
                  </p>

                  {/* Audience / Location */}
                  <div className="flex flex-wrap gap-3 text-xs text-[#6F7553] border-t border-[#E7D9C3] pt-4 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {item.audience}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </div>
                  </div>

                  <div className="flex items-center text-[#B36A4C] text-sm font-semibold mt-auto">
                    Read Full Story
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
}
