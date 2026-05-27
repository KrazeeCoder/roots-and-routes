import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Landmark } from "lucide-react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import {
  HERO_ISOMETRIC_CARDS,
  type HeroIsometricCard,
} from "../../data/heroIsometricCards";
import { EVENT_DETAIL_FROM_HOME_NAV, RESOURCE_DETAIL_FROM_HOME_NAV } from "../../utils/detailNavigation";
import { ImageWithFallback } from "../ui/image-with-fallback";

const DESKTOP_ROTATE_Y = 16;
const DESKTOP_SKEW_Y = -1;
const DESKTOP_STEP_Y = 10;
const DESKTOP_STEP_Z = 0.5;

const DESKTOP_CENTER_LIFT = -88;
const DESKTOP_NEIGHBOR_LIFT = -14;

const MOBILE_STEP_X = 8;
const MOBILE_STEP_Y = 12;
const MOBILE_STEP_SCALE = 0.03;
const HERO_CARD_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

function getDesktopTransform(index: number, yOffset = 0) {
  return `rotateY(${DESKTOP_ROTATE_Y}deg) translateY(${index * DESKTOP_STEP_Y + yOffset}px) translateZ(${index * DESKTOP_STEP_Z}px) skewY(${DESKTOP_SKEW_Y}deg)`;
}

function getMobileDepth(index: number, activeIndex: number, total: number) {
  return (index - activeIndex + total) % total;
}

function getMobileTransform(depth: number) {
  const scale = Math.max(0.78, 1 - depth * MOBILE_STEP_SCALE);
  return `translate(-50%, -50%) rotateY(13deg) skewY(-1deg) translateX(${depth * MOBILE_STEP_X}px) translateY(${depth * MOBILE_STEP_Y}px) scale(${scale})`;
}

function getKindLabel(card: HeroIsometricCard) {
  return card.kind === "event" ? "Event" : "Resource";
}

function getCardDetailState(card: HeroIsometricCard) {
  return card.kind === "event" ? EVENT_DETAIL_FROM_HOME_NAV : RESOURCE_DETAIL_FROM_HOME_NAV;
}

export function IsometricHeroCards() {
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const [isTouchMode, setIsTouchMode] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse), (max-width: 767px)");
    const update = () => setIsTouchMode(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const animateDesktopStack = (activeIndex: number | null) => {
    const centerLift = shouldReduceMotion ? -40 : DESKTOP_CENTER_LIFT;
    const neighborLift = shouldReduceMotion ? -20 : DESKTOP_NEIGHBOR_LIFT;
    const baseDuration = shouldReduceMotion ? 0 : activeIndex === null ? 0.32 : 0.42;
    const easing = activeIndex === null ? "power2.out" : "power3.out";

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let lift = 0;
      if (activeIndex !== null) {
        if (index === activeIndex) {
          lift = centerLift;
        } else if (index === activeIndex - 1 || index === activeIndex + 1) {
          lift = neighborLift;
        }
      }

      const zIndex = activeIndex !== null && index === activeIndex
        ? HERO_ISOMETRIC_CARDS.length + 30
        : HERO_ISOMETRIC_CARDS.length - index;

      gsap.to(card, {
        duration: baseDuration,
        ease: easing,
        zIndex,
        transform: getDesktopTransform(index, lift),
        overwrite: "auto",
      });
    });
  };

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (isTouchMode) {
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const depth = getMobileDepth(index, activeMobileIndex, HERO_ISOMETRIC_CARDS.length);
          gsap.to(card, {
            duration: shouldReduceMotion ? 0 : 0.35,
            ease: "power2.out",
            transform: getMobileTransform(depth),
            zIndex: HERO_ISOMETRIC_CARDS.length - depth,
          });
        });
        return;
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        gsap.set(card, {
          transform: getDesktopTransform(index, 0),
          zIndex: HERO_ISOMETRIC_CARDS.length - index,
        });
      });
    }, rootRef);

    return () => context.revert();
  }, [activeMobileIndex, isTouchMode, shouldReduceMotion]);

  const showNextCard = () => {
    setActiveMobileIndex((index) => (index + 1) % HERO_ISOMETRIC_CARDS.length);
  };

  const showPreviousCard = () => {
    setActiveMobileIndex((index) =>
      index === 0 ? HERO_ISOMETRIC_CARDS.length - 1 : index - 1,
    );
  };

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-visible"
      onMouseLeave={() => {
        if (!isTouchMode) animateDesktopStack(null);
      }}
      onBlurCapture={(event) => {
        if (isTouchMode) return;
        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && rootRef.current?.contains(nextTarget)) return;
        animateDesktopStack(null);
      }}
    >
      {isTouchMode ? (
        <div className="absolute inset-0 z-30 flex items-end justify-between px-5 pb-5">
          <button
            type="button"
            onClick={showPreviousCard}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4C5AF] bg-white/95 text-[#334233] shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2"
            aria-label="Show previous Bothell card"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showNextCard}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4C5AF] bg-white/95 text-[#334233] shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2"
            aria-label="Show next Bothell card"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {isTouchMode ? (
        <div className="absolute inset-0 [perspective:1100px] [perspective-origin:50%_-165%]">
          {HERO_ISOMETRIC_CARDS.map((card, index) => {
            const depth = getMobileDepth(index, activeMobileIndex, HERO_ISOMETRIC_CARDS.length);
            const isActive = depth === 0;

            return (
              <Link
                key={card.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                to={card.href}
                state={getCardDetailState(card)}
                className={`absolute left-1/2 top-[50%] flex h-[250px] w-[220px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-black/20 shadow-[0_14px_26px_rgba(22,18,14,0.28)] focus:outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2 ${
                  isActive ? "pointer-events-auto" : "pointer-events-none"
                }`}
                style={{
                  backgroundColor: card.accentColor,
                  transform: getMobileTransform(depth),
                }}
                aria-label={`Open ${card.title}`}
              >
                <CardContent card={card} />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="absolute left-[20%] top-[39%] z-20 flex -translate-y-1/2 gap-[52px] [transform:translateX(-104px)]">
          {HERO_ISOMETRIC_CARDS.map((card, index) => (
            <div
              key={card.id}
              className="relative h-[320px] w-0 [perspective:1000px] [perspective-origin:50%_-229%]"
              onMouseEnter={() => animateDesktopStack(index)}
            >
              <Link
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                to={card.href}
                state={getCardDetailState(card)}
                className="absolute left-0 top-0 flex h-[320px] w-[290px] flex-col overflow-hidden rounded-2xl border border-black/20 shadow-[0_14px_30px_rgba(25,20,15,0.3)] outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2 [will-change:transform]"
                style={{ backgroundColor: card.accentColor, transform: getDesktopTransform(index, 0) }}
                onFocus={() => animateDesktopStack(index)}
                aria-label={`Open ${card.title}`}
              >
                <CardContent card={card} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardContent({ card }: { card: HeroIsometricCard }) {
  return (
    <>
      <ImageWithFallback
        src={card.image}
        fallbackSrc={HERO_CARD_FALLBACK_IMAGE}
        alt=""
        aria-hidden="true"
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover opacity-80 [filter:saturate(0.76)_contrast(0.95)_brightness(0.9)]"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, rgba(30,24,20,0.26) 0%, rgba(42,34,27,0.46) 68%, rgba(28,22,18,0.68) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(140deg, rgba(246,241,231,0.16) 0%, rgba(246,241,231,0.06) 44%, rgba(246,241,231,0) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col px-4 pt-2">
        <div className="rounded-xl border border-white/55 bg-white/97 p-3 text-[#334233] shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E7D9C3] bg-[#F6F1E7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B473A]">
            {card.kind === "event" ? (
              <CalendarDays className="h-3.5 w-3.5 text-[#B36A4C]" />
            ) : (
              <Landmark className="h-3.5 w-3.5 text-[#B36A4C]" />
            )}
            {getKindLabel(card)}
          </div>
          <h3 className="mt-1.5 font-['Cormorant_Garamond',serif] text-[1.28rem] font-bold leading-[1.1] text-[#2E3B2E]">
            {card.title}
          </h3>
        </div>
      </div>
    </>
  );
}
