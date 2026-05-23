import { motion, type Variants } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "./utils";

type SupportedTag = Extract<
  ElementType,
  "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

interface AnimatedUnderlineTextProps extends HTMLAttributes<HTMLElement> {
  as?: SupportedTag;
  children?: ReactNode;
  text?: string;
  textClassName?: string;
  underlineClassName?: string;
  underlinePath?: string;
  underlineHoverPath?: string;
  underlineDuration?: number;
  underlineHoverDuration?: number;
  disableHover?: boolean;
}

export function AnimatedUnderlineText({
  as = "span",
  children,
  text,
  className,
  textClassName,
  underlineClassName,
  underlinePath = "M 6,12 Q 75,2 150,10 Q 225,18 294,8",
  underlineHoverPath = "M 6,9 Q 75,17 150,10 Q 225,3 294,11",
  underlineDuration = 1.2,
  underlineHoverDuration = 0.8,
  disableHover = false,
  ...props
}: AnimatedUnderlineTextProps) {
  const MotionTag = motion[as] as typeof motion.span;
  const WrapperTag = (as === "span" ? motion.span : motion.div) as typeof motion.div;
  const content = text ?? children;
  const textRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [shouldAnimateUnderline, setShouldAnimateUnderline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (document.readyState === "complete") {
      setShouldAnimateUnderline(true);
      return;
    }

    const onWindowLoad = () => {
      setShouldAnimateUnderline(true);
    };

    window.addEventListener("load", onWindowLoad, { once: true });
    return () => {
      window.removeEventListener("load", onWindowLoad);
    };
  }, []);

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    const updateWidth = () => {
      setUnderlineWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  const resolvedWidth = Math.max(underlineWidth, 1);
  const defaultUnderlinePath = useMemo(() => {
    const end = Math.max(resolvedWidth - 2, 2);
    const quarter = resolvedWidth * 0.25;
    const half = resolvedWidth * 0.5;
    const threeQuarter = resolvedWidth * 0.75;
    return `M 2,12 Q ${quarter},2 ${half},10 Q ${threeQuarter},18 ${end},8`;
  }, [resolvedWidth]);

  const defaultUnderlineHoverPath = useMemo(() => {
    const end = Math.max(resolvedWidth - 2, 2);
    const quarter = resolvedWidth * 0.25;
    const half = resolvedWidth * 0.5;
    const threeQuarter = resolvedWidth * 0.75;
    return `M 2,9 Q ${quarter},18 ${half},10 Q ${threeQuarter},2 ${end},11`;
  }, [resolvedWidth]);

  const resolvedUnderlinePath = underlinePath === "M 6,12 Q 75,2 150,10 Q 225,18 294,8"
    ? defaultUnderlinePath
    : underlinePath;
  const resolvedUnderlineHoverPath = underlineHoverPath === "M 6,9 Q 75,17 150,10 Q 225,3 294,11"
    ? defaultUnderlineHoverPath
    : underlineHoverPath;

  useLayoutEffect(() => {
    const node = pathRef.current;
    if (!node || underlineWidth === 0) return;
    const nextLength = node.getTotalLength();
    setPathLength((currentLength) =>
      Math.abs(currentLength - nextLength) > 0.5 ? nextLength : currentLength,
    );
  }, [underlineWidth, resolvedUnderlinePath]);

  const pathVariants: Variants = disableHover
    ? {}
    : {
        hover: {
          d: resolvedUnderlineHoverPath,
          transition: {
            duration: underlineHoverDuration,
            ease: "easeInOut",
          },
        },
      };

  return (
    <WrapperTag
      className={cn("group relative inline-flex w-fit flex-col pb-4", className)}
      initial="hidden"
      animate="visible"
      whileHover={disableHover ? undefined : "hover"}
      {...props}
    >
      <MotionTag
        ref={textRef as never}
        className={cn("relative z-10", textClassName)}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {content}
      </MotionTag>

      {underlineWidth > 0 ? (
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute left-0 top-full -mt-3 overflow-visible", underlineClassName)}
          style={{ width: resolvedWidth }}
        >
          <svg
            width={resolvedWidth}
            height="18"
            viewBox={`0 0 ${resolvedWidth} 18`}
            className="overflow-visible"
          >
            <motion.path
              key={`${Math.round(resolvedWidth)}-${Math.round(pathLength)}`}
              ref={pathRef}
              d={resolvedUnderlinePath}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
              initial={{
                opacity: 0,
                strokeDasharray: pathLength || 1,
                strokeDashoffset: pathLength || 1,
              }}
              animate={shouldAnimateUnderline
                ? {
                    opacity: pathLength > 0 ? 1 : 0,
                    strokeDasharray: pathLength || 1,
                    strokeDashoffset: pathLength > 0 ? 0 : pathLength || 1,
                  }
                : {
                    opacity: 0,
                    strokeDasharray: pathLength || 1,
                    strokeDashoffset: pathLength || 1,
                  }}
              transition={shouldAnimateUnderline
                ? { duration: underlineDuration, ease: "easeInOut" }
                : { duration: 0 }}
              variants={pathVariants}
            />
          </svg>
        </div>
      ) : null}
    </WrapperTag>
  );
}
