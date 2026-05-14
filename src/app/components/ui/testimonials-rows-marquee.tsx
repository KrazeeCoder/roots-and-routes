import { motion } from "motion/react";
import { useMemo } from "react";
import type { HomepageTestimonial } from "../../types/home";
import { ImageWithFallback } from "./image-with-fallback";
import { cn } from "./utils";

interface TestimonialsRowsMarqueeProps {
  testimonials: HomepageTestimonial[];
  className?: string;
  topRowDuration?: number;
  bottomRowDuration?: number;
}

interface TestimonialRowProps {
  items: HomepageTestimonial[];
  direction: "left" | "right";
  duration: number;
}

const edgeFadeMask = {
  WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
};

function TestimonialRow({ items, direction, duration }: TestimonialRowProps) {
  const repeatedItems = useMemo(() => [...items, ...items], [items]);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden" style={edgeFadeMask}>
      <motion.div
        className="flex w-max gap-4 py-2 sm:gap-6"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
      >
        {repeatedItems.map((testimonial, index) => (
          <article
            key={`${testimonial.attribution}-${index}`}
            className="w-[270px] shrink-0 rounded-2xl border border-[#D9C6A8] bg-[#F8F4EC] p-5 text-[#334233] shadow-[0_8px_24px_rgba(51,66,51,0.08)] sm:w-[320px] sm:p-6 flex flex-col"
          >
            <p
              className="text-sm leading-relaxed sm:text-base flex-grow"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              "{testimonial.quote}"
            </p>
            <div className="mt-5 flex items-center gap-3">
              <ImageWithFallback
                src={testimonial.image}
                alt={testimonial.attribution}
                className="h-10 w-10 rounded-full border border-[#D9C6A8] object-cover object-top flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold sm:text-base">{testimonial.attribution}</p>
                <p className="truncate text-xs text-[#5B473A] sm:text-sm">{testimonial.role}</p>
              </div>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  );
}

export function TestimonialsRowsMarquee({
  testimonials,
  className,
  topRowDuration = 50,
  bottomRowDuration = 45,
}: TestimonialsRowsMarqueeProps) {
  const midpoint = Math.ceil(testimonials.length / 2);
  const topRow = testimonials.slice(0, midpoint);
  const bottomRow = testimonials.slice(midpoint);
  const safeBottomRow = bottomRow.length > 0 ? bottomRow : topRow;

  if (testimonials.length === 0) return null;

  return (
    <div className={cn("space-y-4 sm:space-y-5", className)}>
      <TestimonialRow items={topRow} direction="left" duration={topRowDuration} />
      <TestimonialRow items={safeBottomRow} direction="right" duration={bottomRowDuration} />
    </div>
  );
}
