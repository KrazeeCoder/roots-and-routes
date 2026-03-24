import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { ScrollReveal } from "../ScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import { homeTestimonials } from "../../data/homeData";
import { ImageWithFallback } from "../ui/image-with-fallback";
import { Button } from "../ui/button";

export function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || isPaused || homeTestimonials.length < 2) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, 5500);

    return () => {
      window.clearInterval(timer);
    };
  }, [api, isPaused]);

  return (
    <section className="bg-gradient-to-b from-[#E7D9C3]/30 to-[#F6F1E7] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233]">
              Community Voices
            </h2>
            <p className="mt-3 text-[#5B473A] text-lg font-light leading-relaxed">
              Stories from neighbors and volunteers who use the platform to find support and share opportunities.
            </p>
            <p className="mt-3 text-xs uppercase tracking-wider text-[#6F7553] font-semibold">
              Sample community quotes for display.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous testimonials"
              className="h-9 w-9 border-[#D9C6A8] bg-white text-[#334233] hover:bg-[#F6F1E7]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => api?.scrollNext()}
              aria-label="Next testimonials"
              className="h-9 w-9 border-[#D9C6A8] bg-white text-[#334233] hover:bg-[#F6F1E7]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="mt-8">
          <div
            className="rounded-3xl border border-[#D9C6A8] bg-white/90 shadow-sm p-4 sm:p-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsPaused(false);
              }
            }}
          >
            <Carousel setApi={setApi} opts={{ loop: true, align: "start" }}>
              <CarouselContent>
                {homeTestimonials.map((testimonial, index) => (
                  <CarouselItem key={`${testimonial.attribution}-${index}`} className="md:basis-1/2 lg:basis-1/2">
                    <article className="h-full rounded-3xl border border-[#E7D9C3] bg-gradient-to-b from-white to-[#F8F4EC] p-6 shadow-sm flex flex-col">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C]/15 text-[#B36A4C] border border-[#B36A4C]/20">
                        <Quote className="w-5 h-5" />
                      </span>
                      <p className="mt-5 text-[#334233] text-base sm:text-lg leading-relaxed flex-grow">"{testimonial.quote}"</p>
                      <div className="mt-6 pt-4 border-t border-[#E7D9C3] flex items-center gap-3">
                        <ImageWithFallback
                          src={testimonial.image}
                          alt={testimonial.attribution}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#334233]">{testimonial.attribution}</p>
                          <p className="text-xs uppercase tracking-wider text-[#6F7553] mt-0.5">{testimonial.role}</p>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="mt-5 flex items-center justify-center gap-2">
              {homeTestimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to testimonial ${index + 1}`}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeIndex === index ? "w-6 bg-[#334233]" : "w-2.5 bg-[#A7AE8A]/70 hover:bg-[#6F7553]"
                  }`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
