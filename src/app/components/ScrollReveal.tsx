import { useRef } from "react";
import { motion, useInView, Variants } from "motion/react";

// ── Variant presets ─────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
};

export const variants = { fadeUp, fadeLeft, fadeRight, scaleIn };

// ── Stagger container ────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0 } },
};

export const staggerFastContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ── Base ScrollReveal ────────────────────────────────────────────────────────

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variants;
  duration?: number;
  delay?: number;
  /** How much of the element needs to be in view before triggering */
  amount?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Wraps children in a motion element that fades in when scrolled into view.
 * Fires once per page load.
 */
export function ScrollReveal({
  children,
  className,
  variant = fadeUp,
  duration = 0.55,
  delay = 0,
  amount = 0.18,
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    amount,
  });

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      variants={variant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

// ── StaggerGroup ─────────────────────────────────────────────────────────────

interface StaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  fast?: boolean;
  amount?: number;
}

/**
 * Wraps children in a stagger container that reveals them in sequence on scroll.
 * Each child should be wrapped in <StaggerItem>.
 */
export function StaggerGroup({ children, className, fast = false, amount = 0.1 }: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fast ? staggerFastContainer : staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerItem ──────────────────────────────────────────────────────────────

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
