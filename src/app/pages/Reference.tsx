import { FileText, Link as LinkIcon, Code2, Globe, Sparkles } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";
import { Button } from "../components/ui/button";

export function Reference() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-20 pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/70 via-[#334233]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B36A4C]/20 border border-[#B36A4C]/30 text-[#E7D9C3] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-[#B36A4C]" />
                Sources, Permissions & TSA Documents
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Reference <span className="text-[#B36A4C] italic">Page</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                Documentation of all educational resources, project logs, and third-party assets utilized in the development of Roots & Routes.
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: TSA Documents */}
          <div className="lg:col-span-1 border-r border-[#E7D9C3]/50 pr-8">
            <ScrollReveal>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-8 flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#B36A4C]" />
                TSA Documents
              </h2>
            </ScrollReveal>
            
            <StaggerGroup className="space-y-6">
              <StaggerItem>
                <div className="p-6 rounded-2xl bg-white border border-[#E7D9C3] shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-[#334233] mb-2">Work Log</h3>
                  <p className="text-sm text-[#5B473A] mb-4">Completed project work log for this entry.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">View PDF</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="#" download>Download</a>
                    </Button>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="p-6 rounded-2xl bg-white border border-[#E7D9C3] shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-[#334233] mb-2">Copyright Checklist</h3>
                  <p className="text-sm text-[#5B473A] mb-4">Completed PDF checklist for copyright compliance.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/StudentCopyrightChecklist.pdf" target="_blank" rel="noopener noreferrer">View PDF</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/StudentCopyrightChecklist.pdf" download>Download</a>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            </StaggerGroup>
          </div>

          {/* Right Column: References & Links */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Code Stack */}
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-[#B36A4C]" />
                  Code Stack
                </h2>
                <div className="prose prose-stone max-w-none text-[#5B473A] font-light leading-relaxed">
                  <p>
                    This website utilizes <strong>React</strong> with <strong>Vite</strong>, a modern build tool optimized for speed and developer experience.
                    On top of this, the site leverages <strong>Tailwind CSS</strong> for utility-first styling and <strong>Supabase</strong> for a robust
                    backend infrastructure including database management and authentication.
                  </p>
                  <p>
                    All components were built from scratch by our team to ensure a premium, customized experience that adheres to modern web standards.
                    The site follows WCAG accessibility guidelines, prioritizing clear color contrast and responsive designs.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {[
                    { name: "lucide-react", desc: "Premium icon library for React applications." },
                    { name: "motion", desc: "Production-ready motion library for React." },
                    { name: "supabase-js", desc: "Isomorphic JavaScript client for Supabase." },
                    { name: "react-router", desc: "Declarative routing for React applications." }
                  ].map((lib) => (
                    <div key={lib.name} className="flex flex-col p-4 rounded-xl bg-[#E7D9C3]/20 border border-[#E7D9C3]/30">
                      <span className="font-semibold text-[#334233]">{lib.name}</span>
                      <span className="text-xs text-[#5B473A] mt-1">{lib.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Image Links */}
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                  <Globe className="w-6 h-6 text-[#B36A4C]" />
                  Image Links
                </h2>
                <p className="text-sm text-[#5B473A] italic mb-4">
                  All images rely on either the Unsplash, Canva License, or Creative Commons Sharealike (+ Attribution) license, or are otherwise public domain.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-[#B36A4C] break-all max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#E7D9C3]">
                  {[
                    "https://images.unsplash.com/photo-1576267423048-15c0040fec78",
                    "https://images.unsplash.com/photo-1593113592332-6e2ee791ef60",
                    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d",
                    "https://images.unsplash.com/photo-1460317442991-0ec209397118",
                    "https://images.unsplash.com/photo-1509062522246-3755977927d7",
                    "https://unsplash.com/photos/landscape-photo-of-new-york-empire-state-building-5omwAMDxmkU",
                    "https://unsplash.com/photos/cloud-gate-in-city-during-daytime-cfmSStcrDn4",
                    "https://unsplash.com/photos/green-palm-tree-and-city-view-UZVlSjrIJ3o",
                    "https://unsplash.com/photos/high-rise-buildings-during-daytime-UmEYn_GYqFo",
                    "https://unsplash.com/photos/a-pile-of-different-types-of-vegetables-on-a-white-surface-5aJVJvJ9rG8",
                    "https://en.wikipedia.org/wiki/The_Washington_Post",
                    "https://en.wikipedia.org/wiki/Forbes",
                    "https://en.wikipedia.org/wiki/The_Guardian_2018.svg",
                    "https://en.wikipedia.org/wiki/Today_2023.svg",
                    "https://en.wikipedia.org/wiki/Los_Angeles_Times",
                    "https://www.pexels.com/photo/an-aerial-shot-of-a-busy-road-7358771/",
                    "https://unsplash.com/photos/white-rice-with-sliced-strawberries-and-brown-nuts-on-white-ceramic-plate-5pk7ZB1xyjU",
                    "https://www.themediterraneandish.com/wp-content/uploads/2022/09/falafel-bowl-recipe-1.jpg",
                    "https://unsplash.com/photos/green-and-brown-vegetable-on-white-ceramic-plate-7GO11y7bznw",
                    "https://www.flickr.com/photos/queenkv/13699777484/",
                    "https://www.mydarlingvegan.com/korean-barbecue-bowl/",
                    "https://unsplash.com/photos/cooked-foods-WmKXu-bzygo",
                    "https://unsplash.com/photos/a-blue-bowl-filled-with-vegetables-and-a-wooden-spoon-yhc4pSbl01A",
                    "https://unsplash.com/photos/bowl-of-vegetable-salads-IGfIGP5ONV0",
                    "https://unsplash.com/photos/noddles-on-black-bowl-V82GYnR98lY",
                    "https://unsplash.com/photos/fried-rice-with-green-vegetable-on-brown-ceramic-plate-708OpfCW4H8"
                  ].map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {url.length > 50 ? url.substring(0, 50) + "..." : url}
                    </a>
                  ))}
                  <div className="italic text-stone-400 mt-2">Many more provided in official project documentation.</div>
                </div>
              </div>
            </ScrollReveal>

            {/* Research Links */}
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                  <LinkIcon className="w-6 h-6 text-[#B36A4C]" />
                  Research Links
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "https://www.mdanderson.org/publications/focused-on-health/5-benefits-of-a-plant-based-diet.h20-1592991.html",
                    "https://www.hitchcockfarms.com/blog/farm-to-table-movement",
                    "https://www.sare.org/resources/farm-to-table-building-local-and-regional-food-systems/",
                    "https://www.myplate.gov/eat-healthy/what-is-myplate",
                    "https://www.w3.org/WAI/WCAG22/quickref/",
                    "https://www.nytimes.com/2023/03/14/dining/zero-waste-cooking.html",
                    "https://sdgs.un.org/topics/sustainable-transport"
                  ].map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-xs p-3 rounded-lg bg-white border border-[#E7D9C3] text-[#334233] hover:bg-[#B36A4C] hover:text-white transition-colors block truncate">
                      {new URL(url).hostname} - {url.split('/').pop()?.substring(0, 20)}
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* Vision Footer Link */}
      <section className="bg-[#334233] text-[#F6F1E7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-['Cormorant_Garamond',serif] text-2xl font-light italic text-[#A7AE8A]">
            "Building connections, bridging gaps, and growing together."
          </p>
        </div>
      </section>
    </div>
  );
}
