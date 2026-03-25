import { FormEvent, useMemo, useState } from "react";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { TopoPattern } from "../TopoPattern";
import { motion } from "motion/react";
import { ImageWithFallback } from "../ui/image-with-fallback";
import { useNavigate, Link } from "react-router";

type SearchTarget = "resources" | "events";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState<SearchTarget>("resources");
  const navigate = useNavigate();

  const searchLabel = useMemo(() => {
    if (!query.trim()) return "Choose Resources or Events, then search by keyword.";
    return `Press Search to view ${searchTarget} matching "${query.trim()}".`;
  }, [query, searchTarget]);

  const runSearch = () => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();
    const route = searchTarget === "events" ? "/events" : "/directory";

    if (trimmedQuery) params.set("q", trimmedQuery);

    const search = params.toString();
    navigate(search ? `${route}?${search}` : route);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch();
  };

  return (
    <section className="relative overflow-hidden bg-[#F6F1E7] border-b border-[#E7D9C3] pt-10 pb-16 lg:pt-16 lg:pb-20">
      <div className="absolute inset-0 z-0 pointer-events-none text-[#5B473A]">
        <TopoPattern opacity={0.06} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (Text & Search) */}
          <div className="lg:col-span-6 space-y-6 lg:pr-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E7D9C3]/50 border border-[#A7AE8A]/30 text-[#5B473A] text-sm font-medium"
            >
              <MapPin className="w-4 h-4 text-[#6F7553]" />
              Growing Roots in Bothell
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#334233] leading-[1.1] tracking-tight"
            >
              Navigate your journey to <span className="text-[#B36A4C] italic pr-2">community roots.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#5B473A] max-w-lg leading-relaxed font-light"
            >
              Roots & Routes helps Bothell residents discover essential resources, connect with local events, and create meaningful pathways to success in our community.
            </motion.p>

            {/* Directory Search */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6"
            >
              <form className="group" onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Search className="h-6 w-6 text-[#6F7553] group-focus-within:text-[#B36A4C] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="block w-full pl-12 pr-4 sm:pr-40 py-4 sm:text-lg border-2 border-[#E7D9C3] rounded-2xl bg-white shadow-sm focus:ring-0 focus:border-[#A7AE8A] transition-all text-[#334233] placeholder-[#A7AE8A]"
                      placeholder={searchTarget === "events" ? "Search events..." : "Search resources..."}
                      aria-label={`Search ${searchTarget}`}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-end sm:mt-0 sm:absolute sm:inset-y-2 sm:right-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                      }}
                      className="h-11 sm:h-full px-4 bg-[#E7D9C3] text-[#334233] rounded-l-xl border border-[#C2B99E] text-sm cursor-pointer hover:bg-[#DCD2B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2 focus:ring-offset-white"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="h-11 sm:h-full px-6 bg-[#334233] text-white rounded-r-xl font-medium hover:bg-[#B36A4C] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-white"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 inline-flex items-center rounded-full border border-[#E7D9C3] bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSearchTarget("resources")}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    searchTarget === "resources"
                      ? "bg-[#334233] text-white"
                      : "text-[#5B473A] hover:text-[#B36A4C]"
                  }`}
                  aria-pressed={searchTarget === "resources"}
                >
                  Resources
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTarget("events")}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    searchTarget === "events"
                      ? "bg-[#334233] text-white"
                      : "text-[#5B473A] hover:text-[#B36A4C]"
                  }`}
                  aria-pressed={searchTarget === "events"}
                >
                  Events
                </button>
              </div>

              <p className="mt-4 text-sm text-[#6F7553]">{searchLabel}</p>
            </motion.div>
          </div>

          {/* Right Column (Visual Composition) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative h-[360px] sm:h-[430px] lg:h-[470px] w-full mt-8 lg:mt-0"
          >
            {/* Layered Cards and Shapes */}
            <div className="absolute top-6 right-0 w-[90%] h-[88%] bg-[#E7D9C3] rounded-3xl rotate-2 shadow-sm border border-[#A7AE8A]/20"></div>
            <div className="absolute top-0 right-3 w-[90%] h-[90%] bg-white rounded-3xl -rotate-2 shadow-lg overflow-hidden border border-[#E7D9C3]">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1630123738777-fdd4f8b7d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNpZmljJTIwbm9ydGh3ZXN0JTIwdHJhaWx8ZW58MXx8fHwxNzczNzM0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Pacific Northwest Trail" 
                className="w-full h-full object-cover opacity-90"
              />
              {/* Overlay styling for natural texture */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#334233]/40 to-transparent"></div>
              
              {/* Overlay card */}
              <Link to="/directory?category=Community%20Events" className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-[#E7D9C3] hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-['Cormorant_Garamond',serif] text-lg sm:text-xl font-bold text-[#334233] group-hover:text-[#B36A4C] transition-colors">Bothell Community Trails</h3>
                    <p className="text-sm text-[#6F7553] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 3.2 miles of connected paths
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#B36A4C]/10 flex items-center justify-center text-[#B36A4C] group-hover:bg-[#B36A4C] group-hover:text-white transition-all duration-300">
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
