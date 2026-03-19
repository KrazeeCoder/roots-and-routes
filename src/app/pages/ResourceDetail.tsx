import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, ExternalLink, Globe, MapPin, Phone, Tag, User } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { ImageWithFallback } from "../components/ui/image-with-fallback";
import { Button } from "../components/ui/button";
import { getPublishedResourceById } from "../data/portalApi";
import type { ResourceRecord } from "../types/portal";

function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function getWebsiteLabel(url: string) {
  const normalized = normalizeWebsite(url);
  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

export function ResourceDetail() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<ResourceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResource() {
      if (!resourceId) {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const data = await getPublishedResourceById(resourceId);
        if (cancelled) return;
        setResource(data);
      } catch (nextError) {
        console.error("Could not load resource detail", nextError);
        if (!cancelled) setError("Could not load this resource right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadResource();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-[#5B473A]">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-bold text-[#334233] mb-3">
            Resource not found
          </h1>
          <p className="text-[#5B473A] mb-8">
            {error ?? "This resource may be unpublished or unavailable."}
          </p>
          <Button asChild variant="outline">
            <Link to="/directory" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-24 pb-22">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/65 via-[#334233]/35 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-5">
            <Link to="/directory" className="inline-flex items-center gap-2 text-[#E7D9C3] hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#B36A4C]/15 border border-[#B36A4C]/35 text-[#E7D9C3] text-xs font-semibold uppercase tracking-wide">
              {resource.category}
            </div>
          </div>

          <h1 className="mt-8 font-['Cormorant_Garamond',serif] text-5xl font-bold leading-[1.1]">
            {resource.name}
          </h1>
          <p className="mt-4 text-[#A7AE8A] text-lg leading-relaxed max-w-3xl">
            {resource.description}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-[#E7D9C3] bg-white shadow-sm overflow-hidden">
          {resource.image_url ? (
            <div className="h-64 sm:h-80">
              <ImageWithFallback
                src={resource.image_url}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="p-8 sm:p-10 space-y-8">
            <div>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-3">
                About This Resource
              </h2>
              <p className="text-[#5B473A] leading-relaxed">
                {resource.full_description ?? resource.description}
              </p>
              {resource.posted_by_name ? (
                <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#6F7553]">
                  <User className="w-4 h-4 text-[#A7AE8A]" />
                  Organized by {resource.posted_by_name}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A]">
                <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                  <MapPin className="w-4 h-4 text-[#A7AE8A]" />
                  Address
                </div>
                <p>{resource.address}</p>
              </div>

              {resource.hours ? (
                <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A]">
                  <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                    <Clock className="w-4 h-4 text-[#A7AE8A]" />
                    Hours
                  </div>
                  <p>{resource.hours}</p>
                </div>
              ) : null}

              {resource.phone ? (
                <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A]">
                  <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                    <Phone className="w-4 h-4 text-[#A7AE8A]" />
                    Phone
                  </div>
                  <a href={`tel:${resource.phone}`} className="hover:text-[#B36A4C] transition-colors">
                    {resource.phone}
                  </a>
                </div>
              ) : null}

              {resource.website ? (
                <div className="rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-4 text-sm text-[#5B473A]">
                  <div className="inline-flex items-center gap-2 text-[#334233] font-semibold mb-1">
                    <Globe className="w-4 h-4 text-[#A7AE8A]" />
                    Website
                  </div>
                  <p className="text-xs text-[#6F7553] mb-3 break-words">{getWebsiteLabel(resource.website)}</p>
                  <a
                    href={normalizeWebsite(resource.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C9AF] bg-white px-3 py-1.5 text-sm font-semibold text-[#334233] hover:text-[#B36A4C] hover:border-[#B36A4C]/50 transition-colors"
                  >
                    Visit Website <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : null}
            </div>

            {resource.tags.length > 0 ? (
              <div>
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[#334233] mb-3 uppercase tracking-wide">
                  <Tag className="w-4 h-4 text-[#A7AE8A]" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#E7D9C3]/65 border border-[#E7D9C3] text-xs text-[#5B473A]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
