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

  const spotlightStrip = useMemo(() => items.slice(0, 3), [items]);

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
            View All Highlights
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        {spotlightStrip.length === 0 ? (
          <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 text-[#5B473A]">
            No highlights yet.
          </div>
        ) : (
          <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 snap-x snap-mandatory md:snap-none">
              {spotlightStrip.map((item, idx) => (
                <motion.article
                  key={item.id}
                  variants={idx % 2 === 0 ? variants.fadeLeft : variants.fadeRight}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  transition={{ duration: 0.6, delay: 0.12 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group min-w-[86%] sm:min-w-[68%] md:min-w-0 snap-start flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all h-full"
                >
                  <div className="relative h-56 sm:h-60 overflow-hidden">
                    {item.image ? (
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E7D9C3]/70 flex items-center justify-center">
                        <span className="font-['Cormorant_Garamond',serif] text-4xl text-[#A7AE8A]">R&R</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#B36A4C] text-[#F6F1E7] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow bg-white">
                    <Link
                      to={`/resources/${item.id}`}
                      className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#334233] mb-3 leading-tight hover:text-[#B36A4C] transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-[#5B473A] leading-relaxed mb-5 line-clamp-3 flex-grow">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6F7553] mb-6">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> {item.audience}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {item.location}
                      </div>
                    </div>

                    <Link
                      to={`/resources/${item.id}`}
                      className="self-start inline-flex items-center justify-center px-6 py-2.5 border border-[#334233] text-sm font-semibold rounded-xl text-[#334233] hover:bg-[#334233] hover:text-[#F6F1E7] transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
