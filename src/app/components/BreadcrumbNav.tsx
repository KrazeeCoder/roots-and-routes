import { Link, useLocation, useSearchParams } from "react-router";
import { Home } from "lucide-react";
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
}

export function BreadcrumbNav({ className = "" }: BreadcrumbNavProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    if (path === "/directory") {
      return [
        { label: "Resource Hub", href: "/directory", current: false }
      ];
    }
    
    if (path.startsWith("/resources/")) {
      return [
        { label: "Resource Hub", href: "/directory", current: false },
        { label: "Resource Details", current: true }
      ];
    }
    
    if (path === "/events") {
      return [
        { label: "Events", current: true }
      ];
    }
    
    if (path.startsWith("/events/")) {
      return [
        { label: "Events", href: "/events", current: false },
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
      const items = [
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

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={`mb-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-[#334233] transition-colors"
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
                    className="hover:text-[#334233] transition-colors"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className={item.current ? "text-[#334233]" : "text-[#6F7553]"}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
