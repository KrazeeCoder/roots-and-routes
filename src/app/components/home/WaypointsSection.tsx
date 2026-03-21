import { Link } from "react-router";
import { Wheat, HeartPulse, Home, Users, Briefcase, Calendar } from 'lucide-react';
import { ScrollReveal, StaggerGroup, StaggerItem } from '../ScrollReveal';

export function WaypointsSection() {
  const waypoints = [
    { category: "Food Assistance", icon: Wheat, desc: "Nourishment stops and meal programs to fuel your journey." },
    { category: "Health & Wellness", icon: HeartPulse, desc: "Wellbeing checkpoints and care along your path." },
    { category: "Housing Support", icon: Home, desc: "Shelter waypoints and stability resources." },
    { category: "Youth Programs", icon: Users, desc: "Growth milestones and mentorship journeys." },
    { category: "Job Help", icon: Briefcase, desc: "Career pathways and employment routes." },
    { category: "Community Events", icon: Calendar, desc: "Gathering points and shared experiences." },
  ];

  return (
    <section className="bg-gradient-to-br from-[#E7D9C3] via-[#DCD2B8] to-[#D4C9A8] py-20 relative overflow-hidden">
      {/* Enhanced organic structure: Richer map contour line separator at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none text-[#334233]/10">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 rotate-180">
          <path d="M0,0 Q360,48 720,24 T1440,0 V48 H0 Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334233' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-semibold text-[#334233] mb-4">
            Community Waypoints
          </h2>
          <p className="text-[#5B473A] text-xl font-light leading-relaxed">
            Discover support along your journey. These waypoints mark important stops on your path to community connection.
          </p>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" fast>
          {waypoints.map((point, index) => (
            <StaggerItem key={`${point.category}-${index}`}>
              <Link
                to={`/waypoints?category=${encodeURIComponent(point.category)}`}
                className="group relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-[#A7AE8A]/30 hover:border-[#B36A4C] hover:shadow-2xl hover:bg-white transition-all duration-400 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              >
                {/* Enhanced decorative trail marker background accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#B36A4C]/15 to-[#334233]/10 rounded-bl-[120px] pointer-events-none transition-transform duration-400 group-hover:scale-125"></div>
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E7D9C3] to-[#D4C9A8] flex items-center justify-center mb-6 text-[#334233] group-hover:from-[#B36A4C] group-hover:to-[#8B5543] group-hover:text-white transition-all duration-400 shadow-lg border border-[#A7AE8A]/20">
                  <point.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-2xl font-['Cormorant_Garamond',serif] font-bold text-[#334233] mb-3 group-hover:text-[#B36A4C] transition-colors">
                  {point.category}
                </h3>
                
                <p className="text-[#5B473A] text-base leading-relaxed mb-4">
                  {point.desc}
                </p>

                {/* Enhanced arrow link */}
                <div className="mt-auto flex items-center text-[#B36A4C] font-semibold text-base opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0">
                  Explore <span className="ml-2 inline-block transition-transform duration-400 group-hover:translate-x-2">→</span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
      
      {/* Enhanced bottom organic structure */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#334233]/10">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0,0 Q360,48 720,24 T1440,0 V48 H0 Z" fill="currentColor"/>
        </svg>
      </div>
    </section>
  );
}

