import { useMemo, useState } from "react";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { TopoPattern } from "../TopoPattern";
import { motion } from "motion/react";
import { ImageWithFallback } from "../ui/image-with-fallback";
import { heroFilters } from "../../data/homeData";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const visibleFilters = useMemo(
    () => heroFilters.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  const searchLabel = useMemo(() => {
    if (!query && !activeFilter) return "Search for a resource above.";
    return `Showing results for "${query || "all"}" in ${activeFilter || "all categories"}.`;
  }, [query, activeFilter]);

  return (
    <section className="relative overflow-hidden bg-[#F6F1E7] border-b border-[#E7D9C3] pt-12 pb-24 lg:pt-24 lg:pb-32">
      <div className="absolute inset-0 z-0 pointer-events-none text-[#5B473A]">
        <TopoPattern opacity={0.06} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column (Text & Search) */}
          <div className="lg:col-span-6 space-y-8 lg:pr-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E7D9C3]/50 border border-[#A7AE8A]/30 text-[#5B473A] text-sm font-medium"
            >
              <MapPin className="w-4 h-4 text-[#6F7553]" />
              Serving the Greater Bothell Area
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl lg:text-7xl font-bold text-[#334233] leading-[1.1] tracking-tight"
            >
              Find your route to <span className="text-[#B36A4C] italic pr-2">local support.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-[#5B473A] max-w-lg leading-relaxed font-light"
            >
              Roots & Routes helps Bothell residents navigate essential resources, discover local events, and connect with opportunities in the community.
            </motion.p>

            {/* Directory Search */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-6 w-6 text-[#6F7553] group-focus-within:text-[#B36A4C] transition-colors" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="block w-full pl-12 pr-32 py-5 sm:text-lg border-2 border-[#E7D9C3] rounded-2xl bg-white shadow-sm focus:ring-0 focus:border-[#A7AE8A] transition-all text-[#334233] placeholder-[#A7AE8A]"
                  placeholder="What are you looking for?"
                  aria-label="Search resources"
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="h-full px-4 bg-[#E7D9C3] text-[#334233] rounded-l-xl border border-[#C2B99E] text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setActiveFilter(activeFilter || "all")}
                    className="h-full px-6 bg-[#334233] text-white rounded-r-xl font-medium hover:bg-[#B36A4C] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-white"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {visibleFilters.length > 0 ? (
                  visibleFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                        activeFilter === filter
                          ? "bg-[#B36A4C] border-[#B36A4C] text-white"
                          : "bg-white/60 border-[#E7D9C3] text-[#5B473A] hover:border-[#B36A4C] hover:text-[#B36A4C]"
                      }`}
                      aria-pressed={activeFilter === filter}
                    >
                      {filter}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-[#6F7553]">No filters match your query.</p>
                )}
              </div>

              <p className="mt-4 text-sm text-[#6F7553]">{searchLabel}</p>
            </motion.div>
          </div>

          {/* Right Column (Visual Composition) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative h-[500px] lg:h-[600px] w-full mt-12 lg:mt-0"
          >
            {/* Layered Cards and Shapes */}
            <div className="absolute top-10 right-0 w-[85%] h-[80%] bg-[#E7D9C3] rounded-3xl rotate-3 shadow-sm border border-[#A7AE8A]/20"></div>
            <div className="absolute top-0 right-4 w-[85%] h-[85%] bg-white rounded-3xl -rotate-2 shadow-lg overflow-hidden border border-[#E7D9C3]">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1630123738777-fdd4f8b7d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNpZmljJTIwbm9ydGh3ZXN0JTIwdHJhaWx8ZW58MXx8fHwxNzczNzM0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Pacific Northwest Trail" 
                className="w-full h-full object-cover opacity-90"
              />
              {/* Overlay styling for natural texture */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/40 to-transparent"></div>
              
              {/* Overlay card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-[#E7D9C3]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233]">Bothell Community Trails</h3>
                    <p className="text-sm text-[#6F7553] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 3.2 miles of connected paths
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#B36A4C]/10 flex items-center justify-center text-[#B36A4C]">
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Map / Route Line */}
            <div className="absolute top-1/4 -left-12 lg:-left-20 w-32 h-64 z-20 pointer-events-none opacity-60">
              <svg viewBox="0 0 100 200" fill="none" stroke="#B36A4C" strokeWidth="2" strokeDasharray="4 4">
                <path d="M100 0 C 80 50, 20 100, 50 150 C 70 180, 0 200, 0 200" />
                <circle cx="100" cy="0" r="4" fill="#F6F1E7" stroke="#B36A4C" strokeWidth="2" />
                <circle cx="50" cy="150" r="4" fill="#F6F1E7" stroke="#B36A4C" strokeWidth="2" />
                <circle cx="0" cy="200" r="4" fill="#F6F1E7" stroke="#B36A4C" strokeWidth="2" />
              </svg>
            </div>
            
            {/* Abstract Topo Badge */}
            <div className="absolute top-12 -left-6 bg-[#334233] text-[#F6F1E7] p-4 rounded-full shadow-lg z-20 border-4 border-[#F6F1E7]">
              <div className="text-center w-16 h-16 flex flex-col justify-center items-center rounded-full border border-dashed border-[#A7AE8A]">
                <span className="block text-2xl font-['Cormorant_Garamond',serif] font-bold leading-none text-[#E7D9C3]">24</span>
                <span className="block text-[10px] uppercase tracking-wider text-[#A7AE8A] mt-1">Resources</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
