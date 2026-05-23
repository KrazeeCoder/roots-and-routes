import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Route } from "lucide-react";

import { Button } from "./button";
import { cn } from "./utils";

interface TrailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  mapImageUrl?: string;
  title: string;
  location: string;
  difficulty: string;
  creators: string;
  distance: string;
  elevation: string;
  duration: string;
  directionsLabel?: string;
  onDirectionsClick?: () => void;
  footer?: React.ReactNode;
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-[#E7D9C3] bg-white/60 px-3 py-2">
    <p className="text-base font-black text-[#243224]">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F7553]">{label}</p>
  </div>
);

const TrailCard = React.forwardRef<HTMLDivElement, TrailCardProps>(
  (
    {
      className,
      imageUrl,
      mapImageUrl,
      title,
      location,
      difficulty,
      creators,
      distance,
      elevation,
      duration,
      directionsLabel = "Open Spotlight",
      onDirectionsClick,
      footer,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full overflow-hidden rounded-[2rem] border border-[#223122]/70 bg-[#F8F1E6] text-[#243224] shadow-[0_30px_80px_rgba(24,35,24,0.18)]",
          className,
        )}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        {...props}
      >
        <div className="grid md:grid-cols-[1.08fr_0.92fr]">
          <div className="relative h-44 sm:h-52 md:h-full md:min-h-[260px]">
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,17,0.08)_0%,rgba(17,25,17,0.36)_58%,rgba(17,25,17,0.72)_100%)]" />
            <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-[#1F2E1F]/66 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#F6F1E7] backdrop-blur-md">
              Feature of the Month
            </div>
            <div className="absolute inset-x-4 bottom-4 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F6F1E7]">
                <MapPin className="h-4 w-4 text-[#F0C8AC]" />
                <span className="truncate">{location}</span>
              </div>
              <Button
                variant="secondary"
                className="h-9 rounded-xl bg-[#F6F1E7]/92 px-4 text-sm font-semibold text-[#243224] hover:bg-[#FFFFFF]"
                onClick={onDirectionsClick}
                aria-label={`Open ${title}`}
              >
                {directionsLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6F7553]">{difficulty}</p>
                <p className="mt-1 truncate text-xs font-semibold text-[#8A6A56]">{creators}</p>
              </div>
              {mapImageUrl ? (
                <img
                  src={mapImageUrl}
                  alt="Route map"
                  className="h-10 w-20 rounded-md border border-[#E7D9C3] object-cover"
                />
              ) : (
                <div className="flex h-10 w-20 items-center justify-center rounded-md border border-[#E7D9C3] bg-white/70 text-[#6F7553]">
                  <Route className="h-4 w-4" />
                </div>
              )}
            </div>

            <h3 className="font-['Cormorant_Garamond',serif] text-[2.05rem] font-bold leading-[0.95] text-[#243224] sm:text-[2.35rem]">
              {title}
            </h3>

            <div className="h-px w-full bg-[#E7D9C3]" />

            <div className="grid grid-cols-3 gap-2">
              <StatItem label="Reach" value={distance} />
              <StatItem label="Rating" value={elevation} />
              <StatItem label="Support" value={duration} />
            </div>

            {footer ? <div className="rounded-xl border border-[#E7D9C3] bg-white/64 p-3">{footer}</div> : null}
          </div>
        </div>
      </motion.div>
    );
  },
);

TrailCard.displayName = "TrailCard";

export { TrailCard };
