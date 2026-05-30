import { useEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Trees, HelpCircle } from "lucide-react";
import { RESOURCE_CATEGORIES } from "./constants/resourceCategories";
import { trapFocus } from "../utils/accessibility";

const navItems = [
  { name: "Resource Hub", href: "/directory", isRoute: true },
  { name: "Events", href: "/events", isRoute: true },
  { name: "Highlights", href: "/spotlights", isRoute: true },
  { name: "References", href: "/reference", isRoute: true },
  { name: "About", href: "/about", isRoute: true },
];

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [guideScrollProgress, setGuideScrollProgress] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const wasMenuOpenRef = useRef(false);
  const menuOpenScrollYRef = useRef(0);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const location = useLocation();
  const currentPath = location.pathname;
  const isGuidePage = currentPath.includes("/guide/");

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.hash) return;
    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      const heading = main?.querySelector("h1") as HTMLElement | null;
      const focusTarget = heading ?? main;
      focusTarget?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.pathname, location.hash]);

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

  useEffect(() => {
    if (!isMenuOpen) return;

    menuOpenScrollYRef.current = window.scrollY;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${menuOpenScrollYRef.current}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, menuOpenScrollYRef.current);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || !mobileMenuRef.current) return;

    const cleanupFocusTrap = trapFocus(mobileMenuRef.current);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cleanupFocusTrap();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (wasMenuOpenRef.current && !isMenuOpen) {
      menuButtonRef.current?.focus();
    }
    wasMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isGuidePage) {
      setGuideScrollProgress(0);
      return;
    }

    let animationFrame = 0;
    const updateProgress = () => {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const maxScrollableDistance = Math.max(scrollingElement.scrollHeight - scrollingElement.clientHeight, 0);
      if (maxScrollableDistance === 0) {
        setGuideScrollProgress(1);
        return;
      }

      const scrolledDistance = scrollingElement.scrollTop;
      const progress = Math.min(Math.max(scrolledDistance / maxScrollableDistance, 0), 1);
      setGuideScrollProgress(progress);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isGuidePage, location.pathname, location.hash]);

  const isNavActive = (href: string) => {
    if (href === "/events") return currentPath === "/events" || currentPath.startsWith("/events/");
    if (href === "/directory") return currentPath === "/directory" || currentPath.startsWith("/resources/");
    return currentPath === href;
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233] font-['Public_Sans',sans-serif] selection:bg-[#E7D9C3] selection:text-[#334233] flex flex-col">
      <header
        className={`${isMenuOpen ? "fixed" : "sticky"} top-0 z-50 w-full bg-[#F6F1E7]/90 backdrop-blur-md border-b border-[#E7D9C3]`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Trees className="h-8 w-8 text-[#6F7553]" />
              <Link to="/" className="font-['Cormorant_Garamond',serif] text-2xl font-bold tracking-tight text-[#334233]" aria-label="Roots & Routes Bothell - Home">
                Roots & Routes
                <span className="block text-sm font-['Public_Sans',sans-serif] font-normal tracking-wide text-[#6F7553] uppercase mt-0.5">
                  Bothell
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8 items-center" role="navigation" aria-label="Main navigation" id="navigation">
              {navItems.map((item) => {
                const isActive = isNavActive(item.href);
                const baseClass = "text-sm font-medium transition-colors relative group";
                const activeClasses = isActive
                  ? "text-[#334233] font-semibold"
                  : "text-[#5B473A] hover:text-[#334233]";

                return (
                  <Link key={item.name} to={item.href} className={`${baseClass} ${activeClasses}`} aria-current={isActive ? "page" : undefined}>
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
                to="/help"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E7D9C3]/20 text-[#334233] hover:bg-[#E7D9C3]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#F6F1E7]"
                aria-label="Help center"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
              <Link
                to="/suggest"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#334233] hover:bg-[#B36A4C] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#F6F1E7]"
                aria-label="Suggest a resource or event"
              >
                Suggest
              </Link>
              <Link
                to="/contributor-login"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-[#334233] text-sm font-semibold rounded-xl text-[#334233] bg-transparent hover:bg-[#E7D9C3] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B36A4C] focus:ring-offset-[#F6F1E7]"
                aria-label="Access contributor portal"
              >
                Portal
              </Link>
            </div>

            <div className="flex md:hidden items-center">
              <button
                ref={menuButtonRef}
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#334233] transition-colors hover:text-[#B36A4C] focus:outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2 focus:ring-offset-[#F6F1E7]"
              >
                <span className="relative block h-5 w-6" aria-hidden="true">
                  <span
                    className={`absolute left-0 top-0.5 h-0.5 w-6 rounded-full bg-current transition-transform duration-300 ${
                      isMenuOpen ? "translate-y-2 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-2.5 h-0.5 w-6 rounded-full bg-current transition-opacity duration-200 ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-4.5 h-0.5 w-6 rounded-full bg-current transition-transform duration-300 ${
                      isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
        {isGuidePage ? (
          <div
            aria-hidden="true"
            className="h-1 w-full bg-[#E7D9C3]"
          >
            <div
              className="h-full origin-left bg-[#B36A4C] transition-transform duration-100 ease-linear"
              style={{ transform: `scaleX(${guideScrollProgress})` }}
            />
          </div>
        ) : null}
      </header>

      <div
        className={`fixed inset-x-0 top-20 bottom-0 z-40 md:hidden ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close mobile menu"
          className={`absolute inset-0 bg-[#334233]/35 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="mobile-navigation"
          ref={mobileMenuRef}
          role="navigation"
          aria-label="Mobile navigation"
          className={`absolute top-0 right-0 h-full w-[min(85vw,22rem)] bg-[#F6F1E7] border-l border-[#E7D9C3] shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto px-5 py-4">
            <div className="mb-4 border-b border-[#E7D9C3] pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6F7553]">Menu</span>
            </div>

            <div className="space-y-3">
              {navItems.map((item) => {
                const isActive = isNavActive(item.href);
                const activeText = isActive ? "text-[#334233] font-semibold" : "text-[#334233] hover:text-[#B36A4C]";

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-base font-medium transition-colors ${activeText}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <Link
                to="/help"
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-medium text-[#334233] hover:text-[#B36A4C] transition-colors"
                aria-label="Help center"
              >
                Help
              </Link>

              <div className="pt-3 space-y-2">
                <Link
                  to="/suggest"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl bg-[#334233] text-white text-sm font-semibold"
                  aria-label="Suggest a resource or event"
                >
                  Suggest
                </Link>
                <Link
                  to="/contributor-login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl border border-[#334233] text-[#334233] text-sm font-semibold"
                  aria-label="Access contributor portal"
                >
                  Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow" role="main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="bg-[#334233] text-[#E7D9C3] py-16 border-t-[8px] border-[#B36A4C]" role="contentinfo">
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
            <ul className="space-y-3 text-sm" role="list">
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
            <ul className="space-y-3 text-sm" role="list">
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
            <ul className="space-y-3 text-sm" role="list">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/suggest" className="hover:text-white transition-colors">
                  Submit to the Hub
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
            <Link to="/help" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
