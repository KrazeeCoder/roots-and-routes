import { HeroSection } from "../components/home/HeroSection";
import { WaypointsSection } from "../components/home/WaypointsSection";
import { SpotlightSection } from "../components/home/SpotlightSection";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { EmailSignupSection } from "../components/home/EmailSignupSection";

export function Home() {
  return (
    <div className="flex flex-col w-full bg-[#F6F1E7]">
      <HeroSection />
      <WaypointsSection />
      <SpotlightSection />
      <TestimonialsSection />
      <EmailSignupSection />
    </div>
  );
}
