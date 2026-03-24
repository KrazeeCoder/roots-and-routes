import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Trees, Menu } from "lucide-react";
import { RESOURCE_CATEGORIES } from "./constants/resourceCategories";

const navItems = [
  { name: "Resources", href: "/directory", isRoute: true },
  { name: "Events", href: "/events", isRoute: true },
  { name: "Spotlights", href: "/spotlights", isRoute: true },
  { name: "References", href: "/reference", isRoute: true },
  { name: "About", href: "/about", isRoute: true },
];

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (!location.hash) return;

    const id = decodeURIComponent(location.hash.slice(1));
    const scrollToHash = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const frame = window.requestAnimationFrame(scrollToHash);
    const timeout = window.setTimeout(scrollToHash, 220);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [location.hash, location.pathname]);

  const isNavActive = (href: string) => {
    if (href === "/events") return currentPath === "/events" || currentPath.startsWith("/events/");
    if (href === "/directory") return currentPath === "/directory" || currentPath.startsWith("/resources/");
    return currentPath === href;
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233] font-['Public_Sans',sans-serif] selection:bg-[#E7D9C3] selection:text-[#334233] flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-[#F6F1E7]/90 backdrop-blur-md border-b border-[#E7D9C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Trees className="h-8 w-8 text-[#6F7553]" />
              <Link to="/" className="font-['Cormorant_Garamond',serif] text-2xl font-bold tracking-tight text-[#334233]">
                Roots & Routes
                <span className="block text-sm font-['Public_Sans',sans-serif] font-normal tracking-wide text-[#6F7553] uppercase mt-0.5">
                  Bothell
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => {
                const isActive = isNavActive(item.href);
                const baseClass = "text-sm font-medium transition-colors relative group";
                const activeClasses = isActive
                  ? "text-[#334233] font-semibold"
                  : "text-[#5B473A] hover:text-[#334233]";

                return (
                  <Link key={item.name} to={item.href} className={`${baseClass} ${activeClasses}`}>
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-[#B36A4C] transition-all ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/suggest"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#334233] hover:bg-[#B36A4C] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#F6F1E7]"
              >
                Suggest
              </Link>
              <Link
                to="/contributor-login"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-[#334233] text-sm font-semibold rounded-xl text-[#334233] bg-transparent hover:bg-[#E7D9C3] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#F6F1E7]"
              >
                Portal
              </Link>
            </div>

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

        <div
          className={`md:hidden transition-max-h duration-300 overflow-hidden ${isMenuOpen ? "max-h-[520px]" : "max-h-0"}`}
        >
          <div className="px-4 pb-4 space-y-3">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);
              const activeText = isActive ? "text-[#334233] font-semibold" : "text-[#334233] hover:text-[#B36A4C]";

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-base font-medium transition-colors ${activeText}`}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-2 space-y-2">
              <Link
                to="/suggest"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl bg-[#334233] text-white text-sm font-semibold"
              >
                Suggest
              </Link>
              <Link
                to="/contributor-login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl border border-[#334233] text-[#334233] text-sm font-semibold"
              >
                Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-[#334233] text-[#E7D9C3] py-16 border-t-[8px] border-[#B36A4C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Trees className="h-6 w-6 text-[#A7AE8A]" />
              <span className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white">Roots & Routes</span>
            </div>
            <p className="text-sm text-[#A7AE8A] mb-6 leading-relaxed">
              Your community resource hub for local residents. Connecting Bothell through paths of support,
              opportunity, and shared growth.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/directory" className="hover:text-white transition-colors">
                  Directory
                </Link>
              </li>
              <li>
                <Link to="/spotlights" className="hover:text-white transition-colors">
                  Spotlights
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/reference" className="hover:text-white transition-colors">
                  Reference
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Resources</h3>
            <ul className="space-y-3 text-sm">
              {RESOURCE_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to={`/directory?category=${encodeURIComponent(category)}`}
                    className="hover:text-white transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:rootsandroutes.bothell@outlook.com" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/suggest" className="hover:text-white transition-colors">
                  Suggest a Resource
                </Link>
              </li>
              <li>
                <Link to="/#mailing-list" className="hover:text-white transition-colors">
                  Email List Signup
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#6F7553]/30 text-xs text-[#A7AE8A] flex flex-col md:flex-row justify-between items-center">
          <p>(c) 2026 Roots & Routes: Bothell. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link to="/reference" className="hover:text-white transition-colors">
              References
            </Link>
            <Link to="/calendar" className="hover:text-white transition-colors">
              Community Calendar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
