import { useRef } from "react";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { ImageWithFallback } from "../ui/image-with-fallback";
import { ScrollReveal, variants } from "../ScrollReveal";

export function SpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section className="bg-[#F6F1E7] py-24 relative" id="spotlights" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-4">
              Community Spotlights
            </h2>
            <p className="text-[#5B473A] text-lg font-light">
              Discover featured programs and resources making a difference in Bothell this month.
            </p>
          </div>
          <Link to="/spotlights" className="inline-flex items-center text-[#B36A4C] font-semibold hover:text-[#8A6F5A] transition-colors group">
            View All Spotlights
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        {/* 1 Large + 2 Supporting Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Large Featured Card */}
          <motion.div
            variants={variants.fadeLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all"
          >
            <div className="relative h-64 sm:h-80 overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1631195414013-85b70ff2c180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW58ZW58MXx8fHwxNzczNzM0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Community Garden"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-[#B36A4C] text-[#F6F1E7] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                Food &amp; Community
              </div>
            </div>

            <div className="p-8 sm:p-10 flex flex-col flex-grow bg-white">
              <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-4">
                Bothell Community Garden Expansion
              </h3>
              <p className="text-[#5B473A] leading-relaxed mb-6 flex-grow">
                The local community garden has expanded, offering 20 new plots for residents. Learn how to reserve a space, attend weekend gardening workshops, or donate excess produce to the local food bank.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#6F7553] mb-8">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> All Residents
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Downtown Bothell
                </div>
              </div>

              <button className="self-start inline-flex items-center justify-center px-6 py-2.5 border border-[#334233] text-sm font-semibold rounded-xl text-[#334233] hover:bg-[#334233] hover:text-[#F6F1E7] transition-colors focus:outline-none">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Supporting Cards Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">

            {/* Supporting Card 1 */}
            <motion.div
              variants={variants.fadeRight}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col sm:flex-row bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all"
            >
              <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1720180244267-67c2eb52f3a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBoZWFsdGglMjBjbGluaWN8ZW58MXx8fHwxNzczNzM0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Modern Health Clinic"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                <div className="text-[#6F7553] text-xs font-bold uppercase tracking-wider mb-2">Health &amp; Wellness</div>
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-2 leading-tight">
                  Free Weekend Health Clinic
                </h3>
                <p className="text-[#5B473A] text-sm line-clamp-2 mb-4">
                  Partnering with local doctors to provide basic checkups, vaccinations, and health screenings.
                </p>
                <div className="mt-auto flex items-center text-[#B36A4C] text-sm font-semibold">
                  Read Full Story <ArrowRight className="ml-1 w-3 h-3" />
                </div>
              </div>
            </motion.div>

            {/* Supporting Card 2 */}
            <motion.div
              variants={variants.fadeRight}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col sm:flex-row bg-[#E7D9C3]/40 rounded-3xl overflow-hidden shadow-sm border border-[#E7D9C3] hover:border-[#A7AE8A] hover:shadow-md transition-all"
            >
              <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1634475159836-0da3c41866ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kbGFuZCUyMHBhdGh8ZW58MXx8fHwxNzczNzM0OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Woodland Path"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                <div className="text-[#6F7553] text-xs font-bold uppercase tracking-wider mb-2">Youth Programs</div>
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#334233] mb-2 leading-tight">
                  Teen Nature Trail Guides
                </h3>
                <p className="text-[#5B473A] text-sm line-clamp-2 mb-4">
                  A new summer program teaching local high schoolers conservation and trail maintenance.
                </p>
                <div className="mt-auto flex items-center text-[#B36A4C] text-sm font-semibold">
                  Read Full Story <ArrowRight className="ml-1 w-3 h-3" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
