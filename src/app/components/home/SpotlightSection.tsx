import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { ImageWithFallback } from "../ui/image-with-fallback";
import { ScrollReveal, variants } from "../ScrollReveal";
import { listSpotlightItems } from "../../data/portalApi";
import type { SpotlightItem } from "../../types/home";

export function SpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [items, setItems] = useState<SpotlightItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSpotlights() {
      try {
        const data = await listSpotlightItems();
        if (cancelled) return;
        setItems(data);
      } catch (error) {
        console.error("Could not load spotlight items", error);
      }
    }

    void loadSpotlights();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => items[0], [items]);
  const supporting = useMemo(() => items.slice(1, 3), [items]);

  return (
    <section className="bg-[#F6F1E7] py-20 relative" id="spotlights" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-4">
              Growing Together
            </h2>
            <p className="text-[#5B473A] text-lg font-light">
              Discover featured programs and resources helping our community take root and flourish in Bothell this month.
            </p>
          </div>
          <Link to="/spotlights" className="inline-flex items-center text-[#B36A4C] font-semibold hover:text-[#8A6F5A] transition-colors group">
            View All Growth Stories
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        {!featured ? (
          <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 text-[#5B473A]">
            No growth stories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <motion.div
              variants={variants.fadeLeft}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-8 group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all"
            >
              <div className="relative h-60 sm:h-72 overflow-hidden">
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
                <div className="absolute top-4 left-4 bg-[#B36A4C] text-[#F6F1E7] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {featured.category}
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-grow bg-white">
                <Link
                  to={`/resources/${featured.id}`}
                  className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-3 hover:text-[#B36A4C] transition-colors"
                >
                  {featured.title}
                </Link>
                <p className="text-[#5B473A] leading-relaxed mb-5 line-clamp-3 flex-grow">
                  {featured.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-[#6F7553] mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {featured.audience}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {featured.location}
                  </div>
                </div>

                <Link
                  to={`/resources/${featured.id}`}
                  className="self-start inline-flex items-center justify-center px-6 py-2.5 border border-[#334233] text-sm font-semibold rounded-xl text-[#334233] hover:bg-[#334233] hover:text-[#F6F1E7] transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            {supporting.length > 0 ? (
              <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
                {supporting.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    variants={variants.fadeRight}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    transition={{ duration: 0.6, delay: 0.28 + idx * 0.14, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all h-full"
                  >
                    <div className="relative h-52 overflow-hidden">
                      {item.image ? (
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#E7D9C3]/70 flex items-center justify-center">
                          <span className="font-['Cormorant_Garamond',serif] text-3xl text-[#A7AE8A]">R&R</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col justify-center flex-grow">
                      <div className="text-[#6F7553] text-xs font-bold uppercase tracking-wider mb-2">{item.category}</div>
                      <Link
                        to={`/resources/${item.id}`}
                        className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-2 leading-tight hover:text-[#B36A4C] transition-colors"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[#5B473A] text-sm line-clamp-2 mb-4">
                        {item.description}
                      </p>
                      <Link
                        to="/spotlights"
                        className="mt-auto inline-flex items-center text-[#B36A4C] text-sm font-semibold hover:text-[#8A6F5A] transition-colors"
                      >
                        View More Spotlights <ArrowRight className="ml-1 w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
