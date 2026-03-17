import { HeroSection } from "../components/home/HeroSection";
import { WaypointsSection } from "../components/home/WaypointsSection";
import { SpotlightSection } from "../components/home/SpotlightSection";
import { FindPathSection } from "../components/home/FindPathSection";
import { EventsSection } from "../components/home/EventsSection";
import { SuggestResourceSection } from "../components/home/SuggestResourceSection";

export function Home() {
  return (
    <div className="flex flex-col w-full bg-[#F6F1E7]">
      <HeroSection />
      <WaypointsSection />
      <SpotlightSection />
      <FindPathSection />
      <EventsSection />
      <SuggestResourceSection />
    </div>
  );
}
