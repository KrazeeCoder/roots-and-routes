import * as React from "react";
import { ArrowRight, Star } from "lucide-react";

import { cn } from "./utils";
import { ImageWithFallback } from "./image-with-fallback";

interface ProgressiveBlurProps {
  className?: string;
  blurIntensity?: number;
}

interface ProgressiveBlurCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  fallbackImageUrl?: string;
  title: string;
  description?: string;
  averageRating?: number;
  actionLabel?: string;
  onAction?: () => void;
  footer?: React.ReactNode;
}

function ProgressiveBlur({ className, blurIntensity = 4 }: ProgressiveBlurProps) {
  return (
    <div
      className={cn(className)}
      style={{
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        mask: "linear-gradient(to top, black 0%, black 66%, rgba(0,0,0,0.7) 84%, rgba(0,0,0,0.25) 94%, transparent 100%)",
        WebkitMask:
          "linear-gradient(to top, black 0%, black 66%, rgba(0,0,0,0.7) 84%, rgba(0,0,0,0.25) 94%, transparent 100%)",
      }}
    />
  );
}

function clampStarFill(value: number, starIndex: number) {
  const fill = (value - starIndex) * 100;
  return Math.max(0, Math.min(100, fill));
}

const ProgressiveBlurCard = React.forwardRef<HTMLDivElement, ProgressiveBlurCardProps>(
  (
    {
      className,
      imageUrl,
      fallbackImageUrl,
      title,
      description,
      averageRating = 0,
      actionLabel = "View details",
      onAction,
      footer,
      ...props
    },
    ref,
  ) => {
    const shortDescription = description?.trim() ?? "";

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-[1.35rem] border border-[#D8C7AD] bg-[#F7EFE2] shadow-[0_18px_44px_rgba(24,35,24,0.13)] transition-shadow duration-500 hover:shadow-[0_26px_60px_rgba(24,35,24,0.16)]",
          className,
        )}
        {...props}
      >
        <div className="relative min-h-[12.5rem] flex-1 overflow-hidden text-left sm:min-h-[14rem] lg:min-h-0">
          <ImageWithFallback
            src={imageUrl}
            fallbackSrc={fallbackImageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-focus-within:scale-110"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.42)_56%,rgba(0,0,0,0.9)_100%)]" />

          <ProgressiveBlur
            className="pointer-events-none absolute bottom-0 left-0 h-[34%] w-full transition-[height] duration-300 group-hover:h-[52%] group-focus-within:h-[52%]"
            blurIntensity={4}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/88 via-black/52 to-transparent transition-[height] duration-300 group-hover:h-[58%] group-hover:from-black/90 group-hover:via-black/58 group-focus-within:h-[58%] group-focus-within:from-black/90 group-focus-within:via-black/58" />

          <button
            type="button"
            onClick={onAction}
            className="absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#B36A4C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7EFE2]"
            aria-label={actionLabel}
          />

          <div className="pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/24 bg-black/28 px-2.5 py-1 text-[#F6F1E7] backdrop-blur-md">
            {Array.from({ length: 5 }).map((_, starIndex) => {
              const fillPercent = clampStarFill(averageRating, starIndex);
              return (
                <span key={starIndex} className="relative inline-flex">
                  <Star className="size-3.5 text-white/35" />
                  <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                    <Star className="size-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                  </span>
                </span>
              );
            })}
            <span className="ml-0.5 text-[10px] font-semibold leading-none tabular-nums text-white/95">
              {averageRating.toFixed(1)}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5">
            <h3 className="line-clamp-2 w-full font-['Cormorant_Garamond',serif] text-[1.9rem] font-bold leading-[0.95] text-[#F6F1E7] transition-transform duration-300 group-hover:-translate-y-12 group-focus-within:-translate-y-12 sm:text-[2.15rem]">
              {title}
            </h3>
            <div className="absolute inset-x-4 bottom-3 flex items-start justify-between gap-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 sm:inset-x-5 sm:bottom-4">
              <p className="line-clamp-2 max-w-[70%] text-sm leading-relaxed text-[#F6F1E7]/90">
                {shortDescription}
              </p>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#243224] shadow-[0_8px_22px_rgba(0,0,0,0.2)]">
                {actionLabel}
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>

        {footer ? <div className="border-t border-[#D8C7AD]/80 bg-white/78 p-3 sm:p-3.5">{footer}</div> : null}
      </div>
    );
  },
);

ProgressiveBlurCard.displayName = "ProgressiveBlurCard";

export { ProgressiveBlurCard };
