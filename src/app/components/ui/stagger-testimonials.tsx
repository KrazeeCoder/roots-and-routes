import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageTestimonial } from "../../types/home";
import { ImageWithFallback } from "./image-with-fallback";
import { cn } from "./utils";

const SQRT_5000 = Math.sqrt(5000);
const DESKTOP_CARD_WIDTH = 350;
const DESKTOP_CARD_HEIGHT = 285;
const MOBILE_CARD_WIDTH = 280;
const MOBILE_CARD_HEIGHT = 245;

interface StaggerTestimonialsProps {
  testimonials: HomepageTestimonial[];
  className?: string;
}

interface TestimonialItem extends HomepageTestimonial {
  id: number;
}

interface TestimonialCardProps {
  position: number;
  testimonial: TestimonialItem;
  handleMove: (steps: number) => void;
  cardWidth: number;
  cardHeight: number;
}

function TestimonialCard({ position, testimonial, handleMove, cardWidth, cardHeight }: TestimonialCardProps) {
  const isCenter = position === 0;

  return (
    <button
      type="button"
      onClick={() => handleMove(position)}
      aria-label={`Show testimonial from ${testimonial.attribution}`}
      aria-current={isCenter}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-6 text-left transition-all duration-500 ease-in-out sm:p-8",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B36A4C] focus-visible:ring-offset-2",
        isCenter
          ? "z-10 bg-[#334233] text-[#F6F1E7] border-[#334233]"
          : "z-0 bg-[#F8F4EC] text-[#334233] border-[#D9C6A8] hover:border-[#A7AE8A]",
      )}
      style={{
        width: cardWidth,
        height: cardHeight,
        clipPath:
          "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)",
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardWidth / 1.6) * position}px)
          translateY(${isCenter ? -24 : position % 2 ? 8 : -8}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.4 : -2.4}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 2px rgba(183, 145, 117, 0.45)" : "none",
      }}
    >
      <span
        className={cn(
          "absolute block origin-top-right rotate-45",
          isCenter ? "bg-[#F6F1E7]/35" : "bg-[#D9C6A8]",
        )}
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />

      <div className="flex h-full flex-col">
        <ImageWithFallback
          src={testimonial.image}
          alt={testimonial.attribution}
          className={cn(
            "mb-4 h-14 w-12 object-cover object-top sm:h-16 sm:w-14",
            isCenter ? "border border-[#F6F1E7]/45" : "border border-[#D9C6A8]",
          )}
          style={{
            boxShadow: isCenter ? "3px 3px 0px rgba(246, 241, 231, 0.65)" : "3px 3px 0px rgba(217, 198, 168, 0.9)",
          }}
        />
        <h3
          className={cn(
            "text-sm font-medium leading-relaxed sm:text-base",
            isCenter ? "text-[#F6F1E7]" : "text-[#334233]",
          )}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          "{testimonial.quote}"
        </h3>
        <p className={cn("mt-auto pt-2 text-[11px] italic leading-tight sm:text-xs", isCenter ? "text-[#E7D9C3]" : "text-[#6F7553]")}>
          - {testimonial.attribution}, {testimonial.role}
        </p>
      </div>
    </button>
  );
}

export function StaggerTestimonials({ testimonials, className }: StaggerTestimonialsProps) {
  const seededTestimonials = useMemo<TestimonialItem[]>(
    () => testimonials.map((testimonial, index) => ({ ...testimonial, id: index })),
    [testimonials],
  );
  const [cardWidth, setCardWidth] = useState(DESKTOP_CARD_WIDTH);
  const [cardHeight, setCardHeight] = useState(DESKTOP_CARD_HEIGHT);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>(seededTestimonials);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setTestimonialsList(seededTestimonials);
  }, [seededTestimonials]);

  const handleMove = (steps: number) => {
    setTestimonialsList((previous) => {
      const next = [...previous];

      if (steps > 0) {
        for (let i = steps; i > 0; i -= 1) {
          const item = next.shift();
          if (!item) break;
          next.push(item);
        }
      } else if (steps < 0) {
        for (let i = steps; i < 0; i += 1) {
          const item = next.pop();
          if (!item) break;
          next.unshift(item);
        }
      }

      return next;
    });
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardWidth(matches ? DESKTOP_CARD_WIDTH : MOBILE_CARD_WIDTH);
      setCardHeight(matches ? DESKTOP_CARD_HEIGHT : MOBILE_CARD_HEIGHT);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (isPaused || testimonialsList.length < 2) return;

    const timer = window.setInterval(() => {
      handleMove(1);
    }, 5800);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, testimonialsList.length]);

  if (testimonialsList.length === 0) return null;

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-3xl border border-[#D9C6A8] bg-white p-3 sm:p-4", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      style={{ height: 390 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = index - Math.floor(testimonialsList.length / 2);

        return (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
          />
        );
      })}

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-10 w-10 items-center justify-center text-2xl transition-colors",
            "bg-[#F6F1E7] border border-[#D9C6A8] text-[#334233] hover:bg-[#334233] hover:text-[#F6F1E7]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B36A4C] focus-visible:ring-offset-2",
          )}
          aria-label="Previous testimonial"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-10 w-10 items-center justify-center text-2xl transition-colors",
            "bg-[#F6F1E7] border border-[#D9C6A8] text-[#334233] hover:bg-[#334233] hover:text-[#F6F1E7]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B36A4C] focus-visible:ring-offset-2",
          )}
          aria-label="Next testimonial"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
