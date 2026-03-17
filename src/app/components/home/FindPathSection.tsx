import { Search, Filter, HandHeart } from "lucide-react";
import { TopoPattern } from "../TopoPattern";

export function FindPathSection() {
  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      desc: "Use our directory to search for specific needs or browse by category."
    },
    {
      icon: Filter,
      title: "Filter Your Options",
      desc: "Narrow down resources by location, eligibility, and current availability."
    },
    {
      icon: HandHeart,
      title: "Connect to Support",
      desc: "Get contact info, directions, and next steps to access the help you need."
    }
  ];

  return (
    <section className="bg-[#334233] text-[#F6F1E7] py-24 relative overflow-hidden">
      {/* Background Topo */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay">
        <TopoPattern />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold mb-6 text-[#E7D9C3]">
            Find Your Path
          </h2>
          <p className="text-[#A7AE8A] text-lg font-light">
            Navigating local resources shouldn't feel like wandering in the dark. We've mapped out a clear route to get you connected.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Route Line */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-[#A7AE8A]/20 via-[#B36A4C] to-[#A7AE8A]/20 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                {/* Step Icon Container */}
                <div className="w-24 h-24 rounded-full bg-[#334233] border-4 border-[#5B473A] shadow-[0_0_0_8px_rgba(51,66,51,1)] flex items-center justify-center mb-8 relative transition-transform duration-500 group-hover:scale-110 group-hover:border-[#B36A4C]">
                  <step.icon className="w-10 h-10 text-[#E7D9C3] group-hover:text-[#B36A4C] transition-colors" />
                  
                  {/* Map marker dot */}
                  <div className="absolute -bottom-1 w-3 h-3 bg-[#E7D9C3] rounded-full border-2 border-[#334233] group-hover:bg-[#B36A4C]"></div>
                </div>
                
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white mb-4">
                  <span className="text-[#A7AE8A] mr-2 opacity-50 font-sans text-sm">0{index + 1}</span>
                  {step.title}
                </h3>
                
                <p className="text-[#A7AE8A] leading-relaxed max-w-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <button className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-[#B36A4C] hover:bg-[#8A6F5A] shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#334233] transition-all transform hover:-translate-y-0.5">
            Start Your Search
          </button>
        </div>
      </div>
    </section>
  );
}
