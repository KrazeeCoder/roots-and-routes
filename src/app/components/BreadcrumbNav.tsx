import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

interface BreadcrumbNavProps {
  className?: string;
  backTo?: string;
  backLabel?: string;
  breadcrumbLabel?: string;
  sticky?: boolean;
  darkSurfaceId?: string;
}

type BreadcrumbItemConfig = {
  label: string;
  href?: string;
  current: boolean;
};

export function BreadcrumbNav({
  className = "",
  backTo,
  backLabel,
  breadcrumbLabel,
  sticky = false,
  darkSurfaceId,
}: BreadcrumbNavProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const [isOnDarkSurface, setIsOnDarkSurface] = useState(true);

  const getBreadcrumbs = (): BreadcrumbItemConfig[] => {
    const path = location.pathname;
    
    if (path === "/directory") {
      return [
        { label: "Resource Hub", href: "/directory", current: false }
      ];
    }
    
    if (path.startsWith("/resources/")) {
      const parentHref = backTo && backTo !== path ? backTo : "/directory";
      return [
        { label: breadcrumbLabel ?? "Resource Hub", href: parentHref, current: false },
        { label: "Resource Details", current: true }
      ];
    }
    
    if (path === "/events") {
      return [
        { label: "Events", current: true }
      ];
    }
    
    if (path.startsWith("/events/")) {
      const parentHref = backTo && backTo !== path ? backTo : "/events";
      return [
        { label: breadcrumbLabel ?? "Events", href: parentHref, current: false },
        { label: "Event Details", current: true }
      ];
    }
    
    if (path === "/calendar") {
      return [
        { label: "Community Calendar", current: true }
      ];
    }
    
    if (path === "/spotlights") {
      return [
        { label: "Highlights", current: true }
      ];
    }
    
    if (path.startsWith("/spotlights/")) {
      return [
        { label: "Highlights", href: "/spotlights", current: false },
        { label: "Spotlight Details", current: true }
      ];
    }
    
    if (path === "/about") {
      return [
        { label: "About", current: true }
      ];
    }
    
    if (path === "/suggest") {
      const items: BreadcrumbItemConfig[] = [
        { label: "Suggest", current: false }
      ];
      
      const type = searchParams.get("type");
      if (type) {
        items.push({ 
          label: type === "resource" ? "Resource" : "Event", 
          current: true 
        });
      } else {
        items[0].current = true;
      }
      
      return items;
    }
    
    return [];
  };

  const breadcrumbs = getBreadcrumbs();
  const isDetailStickyNav = sticky && backTo && backLabel;

  useEffect(() => {
    if (!isDetailStickyNav || !darkSurfaceId) return;

    let frameId: number | null = null;

    const updateContrastMode = () => {
      const navElement = stickyRef.current;
      const darkSurface = document.getElementById(darkSurfaceId);
      if (!navElement || !darkSurface) return;

      const navRect = navElement.getBoundingClientRect();
      const darkRect = darkSurface.getBoundingClientRect();
      const navBaseline = navRect.bottom - 1;
      const overlapsDark = navBaseline >= darkRect.top && navBaseline <= darkRect.bottom;
      setIsOnDarkSurface(overlapsDark);
    };

    const onScrollOrResize = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateContrastMode);
    };

    updateContrastMode();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [darkSurfaceId, isDetailStickyNav]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  const stickyTextColor = isOnDarkSurface ? "text-[#F6F1E7]" : "text-[#334233]";
  const stickyLinkTone = isOnDarkSurface ? "hover:text-white/80" : "hover:text-[#334233]/80";

  const breadcrumbContent = (
    <Breadcrumb className={className}>
      <BreadcrumbList className={isDetailStickyNav ? stickyTextColor : "text-[#6F7553]"}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/"
              className={
                isDetailStickyNav
                  ? `flex items-center gap-1 transition-colors ${stickyLinkTone}`
                  : "flex items-center gap-1 hover:text-[#334233] transition-colors"
              }
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.href && !item.current ? (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.href}
                    className={
                      isDetailStickyNav
                        ? `transition-colors ${stickyLinkTone}`
                        : "hover:text-[#334233] transition-colors"
                    }
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage
                  className={
                    isDetailStickyNav
                      ? item.current
                        ? "text-inherit"
                        : "text-inherit/75"
                      : item.current
                        ? "text-[#334233]"
                        : "text-[#6F7553]"
                  }
                >
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );

  if (isDetailStickyNav) {
    return (
      <div ref={stickyRef} className="z-40 bg-transparent md:fixed md:top-20 md:left-0 md:right-0">
        <div className="h-14 px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className={`flex h-full items-center justify-between gap-4 ${stickyTextColor}`}>
            <Link
              to={backTo}
              className={`inline-flex items-center gap-1.5 rounded-md border border-current/20 px-2.5 py-1.5 text-sm font-medium transition-colors ${stickyLinkTone}`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>

            <div className="min-w-0 max-w-[60vw] overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex justify-end">{breadcrumbContent}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      {breadcrumbContent}
    </div>
  );
}
