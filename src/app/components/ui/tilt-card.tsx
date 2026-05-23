import { useMemo, useRef, useState } from "react";
import { cn } from "./utils";

type TiltEffect = "gravitate" | "evade";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tiltLimit?: number;
  scale?: number;
  perspective?: number;
  effect?: TiltEffect;
  spotlight?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TiltCard({
  children,
  className,
  style,
  tiltLimit: _tiltLimit = 8,
  scale = 1.02,
  perspective: _perspective = 1100,
  effect: _effect = "evade",
  spotlight = false,
}: TiltCardProps) {
  const [hovered, setHovered] = useState(false);
  const reduceMotionRef = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const hoverScale = reduceMotionRef.current ? 1 : clamp(scale, 1, 1.05);

  const baseStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: hovered
        ? `translateY(-2px) scale3d(${hoverScale}, ${hoverScale}, 1)`
        : "translateY(0px) scale3d(1, 1, 1)",
      transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
      ...style,
    }),
    [hoverScale, hovered, style],
  );

  return (
    <div
      data-hovered={hovered ? "true" : "false"}
      onPointerEnter={() => {
        if (reduceMotionRef.current) return;
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      className={cn("relative", className)}
      style={baseStyle}
    >
      {children}
      {spotlight ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div
            className="absolute h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 42%)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
