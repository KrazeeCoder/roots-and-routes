import { Wheat, HeartPulse, Home, Users, Briefcase, Calendar } from "lucide-react";

export function WaypointsSection() {
  const waypoints = [
    { name: "Food Assistance", icon: Wheat, desc: "Pantries, meal programs, and fresh produce." },
    { name: "Health & Wellness", icon: HeartPulse, desc: "Clinics, mental health support, and care." },
    { name: "Housing Support", icon: Home, desc: "Shelters, rent help, and utility assistance." },
    { name: "Youth Programs", icon: Users, desc: "After-school activities, mentorship, childcare." },
    { name: "Job Help", icon: Briefcase, desc: "Resume building, training, and open roles." },
    { name: "Community Events", icon: Calendar, desc: "Gatherings, workshops, and local markets." },
  ];

  return (
    <section className="bg-[#E7D9C3]/50 py-24 relative overflow-hidden">
      {/* Subtle organic structure: Map contour line separator at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 rotate-180">
          <path d="M0,0 Q360,48 720,24 T1440,0 V48 H0 Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-semibold text-[#334233] mb-4">
            Essential Waypoints
          </h2>
          <p className="text-[#5B473A] text-lg font-light">
            Quickly find support for urgent or everyday needs. Think of these as markers along your path.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {waypoints.map((point) => (
            <a 
              key={point.name}
              href="#"
              className="group relative bg-[#F6F1E7] p-8 rounded-2xl shadow-sm border border-[#A7AE8A]/20 hover:border-[#B36A4C] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Decorative trail marker background accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#A7AE8A]/10 rounded-bl-[100px] pointer-events-none transition-transform duration-300 group-hover:scale-110"></div>
              
              <div className="w-12 h-12 rounded-xl bg-[#E7D9C3] flex items-center justify-center mb-6 text-[#334233] group-hover:bg-[#B36A4C] group-hover:text-white transition-colors duration-300 shadow-inner">
                <point.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-['Cormorant_Garamond',serif] font-bold text-[#334233] mb-2 group-hover:text-[#B36A4C] transition-colors">
                {point.name}
              </h3>
              
              <p className="text-[#5B473A] text-sm leading-relaxed">
                {point.desc}
              </p>

              {/* Minimalist arrow link */}
              <div className="mt-6 flex items-center text-[#B36A4C] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Explore <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      {/* Bottom organic structure */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0,0 Q360,48 720,24 T1440,0 V48 H0 Z" fill="currentColor"/>
        </svg>
      </div>
    </section>
  );
}
