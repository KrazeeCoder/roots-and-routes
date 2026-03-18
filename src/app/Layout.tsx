import { useState } from "react";
import { Outlet, Link } from "react-router";
import { Trees, Menu } from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Directory", href: "#directory" },
  { name: "Spotlights", href: "#spotlights" },
  { name: "Events", href: "#events" },
  { name: "Suggest a Resource", href: "#suggest" },
  { name: "About", href: "#about" },
];

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233] font-['Public_Sans',sans-serif] selection:bg-[#E7D9C3] selection:text-[#334233] flex flex-col">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#F6F1E7]/90 backdrop-blur-md border-b border-[#E7D9C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo area */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Trees className="h-8 w-8 text-[#6F7553]" />
              <Link to="/" className="font-['Cormorant_Garamond',serif] text-2xl font-bold tracking-tight text-[#334233]">
                Roots & Routes
                <span className="block text-sm font-['Public_Sans',sans-serif] font-normal tracking-wide text-[#6F7553] uppercase mt-0.5">Bothell</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-[#5B473A] hover:text-[#334233] transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B36A4C] transition-all group-hover:w-full"></span>
                </a>
              ))}
              <a
                href="#directory"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#334233] hover:bg-[#B36A4C] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#F6F1E7]"
              >
                Explore Directory
              </a>
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                className="text-[#334233] hover:text-[#B36A4C] focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation panel */}
        <div className={`md:hidden transition-max-h duration-300 overflow-hidden ${isMenuOpen ? "max-h-[400px]" : "max-h-0"}`}>
          <div className="px-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="block text-base font-medium text-[#334233] hover:text-[#B36A4C]">
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#334233] text-[#E7D9C3] py-16 border-t-[8px] border-[#B36A4C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Trees className="h-6 w-6 text-[#A7AE8A]" />
              <span className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white">Roots & Routes</span>
            </div>
            <p className="text-sm text-[#A7AE8A] mb-6 leading-relaxed">
              Your community resource hub for local residents. Connecting Bothell through paths of support, opportunity, and shared growth.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#directory" className="hover:text-white transition-colors">Directory</a></li>
              <li><a href="#spotlights" className="hover:text-white transition-colors">Spotlights</a></li>
              <li><a href="#events" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Food Assistance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Housing Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health & Wellness</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Youth Programs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#suggest" className="hover:text-white transition-colors">Suggest a Resource</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#6F7553]/30 text-xs text-[#A7AE8A] flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 Roots & Routes: Bothell. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
