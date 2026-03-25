import { HeroSection } from "../components/home/HeroSection";
import { ResourcesSection } from "../components/home/ResourcesSection";
import { SpotlightSection } from "../components/home/SpotlightSection";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { EmailSignupSection } from "../components/home/EmailSignupSection";

export function Home() {
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
