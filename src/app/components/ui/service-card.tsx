import * as React from "react";
import { Link } from "react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "./utils";

const cardVariants = cva(
  "group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-[0_15px_35px_-12px_rgba(51,66,51,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_42px_-14px_rgba(51,66,51,0.24)]",
  {
    variants: {
      variant: {
        default: "bg-white text-[#334233] border-[#E7D9C3]",
        red: "bg-[#B36A4C] text-[#F6F1E7] border-[#934a3f]",
        blue: "bg-[#334233] text-[#F6F1E7] border-[#2A352A]",
        gray: "bg-[#E7D9C3] text-[#334233] border-[#D8C9AC]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ServiceCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title: string;
  description: string;
  href: string;
  imgSrc: string;
  imgAlt: string;
  imgClassName?: string;
}

const cardAnimation = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

const imageAnimation = {
  hover: {
    scale: 1.1,
    rotate: 3,
    x: 6,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

const arrowAnimation = {
  hover: {
    x: 5,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ className, variant, title, description, href, imgSrc, imgAlt, imgClassName, ...props }, ref) => {
    return (
      <motion.div
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        variants={cardAnimation}
        whileHover="hover"
        {...props}
      >
        <div className="relative z-10 flex flex-col h-full">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] leading-tight">{title}</h3>
          <p className="mt-3 max-w-[80%] text-sm leading-relaxed text-current/85">{description}</p>
          <Link
            to={href}
            aria-label={`Learn more about ${title}`}
            className="mt-auto flex items-center text-xs font-bold uppercase tracking-[0.18em] group-hover:underline"
          >
            LEARN MORE
            <motion.div variants={arrowAnimation}>
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.div>
          </Link>
        </div>

        <motion.img
          src={imgSrc}
          alt={imgAlt}
          className={cn(
            "absolute -right-4 -bottom-4 w-32 h-32 sm:w-36 sm:h-36 object-contain opacity-90 group-hover:opacity-100 pointer-events-none",
            imgClassName,
          )}
          variants={imageAnimation}
          loading="lazy"
        />
      </motion.div>
    );
  },
);

ServiceCard.displayName = "ServiceCard";

export { ServiceCard };
