import { ScrollReveal } from "../ScrollReveal";
import { homeTestimonials } from "../../data/homeData";
import { TestimonialsRowsMarquee } from "../ui/testimonials-rows-marquee";

export function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-[#E7D9C3]/30 to-[#F6F1E7] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-3xl">
          <div className="max-w-2xl">
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233]">
              Community Voices
            </h2>
            <p className="mt-3 text-[#5B473A] text-lg font-light leading-relaxed">
              Stories from neighbors and volunteers who use the platform to find support and share opportunities.
            </p>
            <p className="mt-3 text-xs uppercase tracking-wider text-[#6F7553] font-semibold">
              Sample community quotes for TSA display purposes.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="mt-8">
          <TestimonialsRowsMarquee testimonials={homeTestimonials} />
        </ScrollReveal>
      </div>
    </section>
  );
}
