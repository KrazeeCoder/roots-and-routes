import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../auth/AuthProvider";
import { isModerator, signOutContributor } from "../../data/portalApi";

interface PortalShellProps extends PropsWithChildren {
  title: string;
  description: string;
}

const portalNavItems = [
  { label: "Overview", href: "/portal" },
  { label: "Resources", href: "/portal/resources" },
  { label: "Events", href: "/portal/events" },
];

export function PortalShell({ title, description, children }: PortalShellProps) {
  const { role, profile } = useAuth();
  const location = useLocation();
  const canModerate = isModerator(role);

  const handleSignOut = async () => {
    await signOutContributor();
  };

  const navItems = canModerate
    ? [...portalNavItems, { label: "Moderation", href: "/portal/moderation" }]
    : portalNavItems;

  return (
    <div className="min-h-screen bg-[#F6F1E7]">
      <section className="border-b border-[#E7D9C3] bg-[#F6F1E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#6F7553] mb-2">
                Contributor Portal
              </p>
              <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233]">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-[#5B473A]">{description}</p>
              {profile ? (
                <p className="mt-4 text-xs text-[#6F7553]">
                  Signed in as {profile.display_name || profile.organization_name || profile.email} ({role})
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void handleSignOut();
              }}
              className="self-start border-[#334233] text-[#334233] hover:bg-[#334233] hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    isActive
                      ? "bg-[#334233] text-white border-[#334233]"
                      : "bg-white text-[#334233] border-[#E7D9C3] hover:border-[#B36A4C] hover:text-[#B36A4C]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</section>
    </div>
  );
}
