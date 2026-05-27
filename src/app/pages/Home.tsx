import { useEffect, useState } from "react";
import { HeroSection } from "../components/home/HeroSection";
import { ResourcesSection } from "../components/home/ResourcesSection";
import { SpotlightSection } from "../components/home/SpotlightSection";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { EmailSignupSection } from "../components/home/EmailSignupSection";
import { HERO_ISOMETRIC_CARDS } from "../data/heroIsometricCards";
import { homeTestimonials } from "../data/homeData";
import { areImageUrlsPreloaded, preloadImageUrls } from "../../utils/preloadImages";

const HOME_PRELOAD_IMAGE_URLS = [
  ...HERO_ISOMETRIC_CARDS.map((card) => card.image),
  ...homeTestimonials.map((testimonial) => testimonial.image),
];

function HomeLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full border-2 border-[#D9C6A8] border-t-[#B36A4C] animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7553]">
          Roots & Routes Bothell
        </p>
        <h1 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-bold leading-tight text-[#334233]">
          Preparing community paths
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
          Loading the homepage imagery first so the page appears as a complete scene.
        </p>
      </div>
    </div>
  );
}

export function Home() {
  const [imagesReady, setImagesReady] = useState(() => areImageUrlsPreloaded(HOME_PRELOAD_IMAGE_URLS));

  useEffect(() => {
    if (imagesReady) return;

    let cancelled = false;

    preloadImageUrls(HOME_PRELOAD_IMAGE_URLS, { timeoutMs: 5000 }).then(() => {
      if (!cancelled) {
        setImagesReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imagesReady]);

  if (!imagesReady) {
    return <HomeLoadingScreen />;
  }

  return (
    <div className="flex flex-col w-full bg-[#F6F1E7]">
      <HeroSection />
      <ResourcesSection />
      <SpotlightSection />
      <TestimonialsSection />
      <EmailSignupSection />
    </div>
  );
}
