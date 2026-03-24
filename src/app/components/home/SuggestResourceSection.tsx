import { Link } from "react-router";
import { Heart, PlusCircle } from "lucide-react";
import { TopoPattern } from "../TopoPattern";
import { ScrollReveal } from "../ScrollReveal";

export function SuggestResourceSection() {
  return (
    <section className="bg-[#B36A4C] text-[#F6F1E7] py-20 relative overflow-hidden" id="suggest">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay">
        <TopoPattern />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <ScrollReveal>
          <div className="w-16 h-16 mx-auto bg-[#F6F1E7] rounded-full flex items-center justify-center mb-8 shadow-sm">
            <Heart className="w-8 h-8 text-[#B36A4C]" fill="currentColor" />
          </div>
          
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold mb-6 text-white">
            Add to the Community Hub
          </h2>
          
          <p className="text-[#F6F1E7]/90 text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Know a local resource or event that belongs in Roots & Routes? Public proposals help us uncover new support, programs, and gatherings for Bothell residents.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Link to="/suggest" className="inline-flex items-center justify-center px-8 py-4 border-2 border-transparent text-lg font-semibold rounded-2xl text-[#B36A4C] bg-[#F6F1E7] hover:bg-white hover:text-[#8A6F5A] shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#F6F1E7]/50 transition-all transform hover:-translate-y-1">
            <PlusCircle className="w-5 h-5 mr-3" />
            Submit a Resource or Event
          </Link>

          <p className="text-sm text-[#F6F1E7]/70 mt-6 font-medium tracking-wide">
            Public proposals stay pending until a moderator reviews them
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

