import { useEffect, useMemo, useState } from "react";
import { FileText, Link as LinkIcon, Code2, Globe, Sparkles } from "lucide-react";
import {
  directoryEntries as seededDirectoryEntries,
  events as seededEvents,
  spotlights as seededSpotlights,
} from "../data/homeData";
import { TopoPattern } from "../components/TopoPattern";
import { ScrollReveal } from "../components/ScrollReveal";
import { listPublishedEvents, listPublishedResources } from "../data/portalApi";

const HERO_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/0/08/Bothell_Way_northbound_from_Main_Street_in_Bothell%2C_WA.jpg";
const EVENTS_FALLBACK_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/0/0c/Bothell_Landing_04.jpg";

const additionalReferenceImages = [
  "https://upload.wikimedia.org/wikipedia/commons/0/08/Bothell_Way_northbound_from_Main_Street_in_Bothell%2C_WA.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/0/0c/Bothell_Landing_04.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/e/ec/Bothell_Landing_Bridge_01.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/2/2c/Bothell%2C_WA_-_Country_Village_09_-_in_front_of_Clock_Tower_Building.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/f/f4/Bothell_Library.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/d/d3/U.W._Bothell_01.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/c/c8/Centennial_Park_under_a_blue_sky_in_Bothell.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/15/Snohomish_County_portion_of_North_Creek_Forest_in_Bothell%2C_WA%2C_just_north_of_King_County_border%2C_with_sign_in_foreground.JPG",
];

const developmentSources = [
  { name: "React Documentation", url: "https://react.dev/" },
  { name: "Vite Documentation", url: "https://vite.dev/" },
  { name: "Tailwind CSS Documentation", url: "https://tailwindcss.com/docs" },
  { name: "Supabase Documentation", url: "https://supabase.com/docs" },
  { name: "React Router Documentation", url: "https://reactrouter.com/" },
  { name: "Google Maps JavaScript API", url: "https://developers.google.com/maps/documentation/javascript" },
  { name: "WCAG 2.2 Quick Reference", url: "https://www.w3.org/WAI/WCAG22/quickref/" },
];

const licenseSources = [
  { name: "Wikimedia Commons (CC BY-SA / GFDL / CC0)", url: "https://commons.wikimedia.org/wiki/Main_Page" },
  { name: "shadcn/ui (MIT License)", url: "https://github.com/shadcn-ui/ui/blob/main/LICENSE.md" },
  { name: "Google Fonts (Cormorant Garamond + Public Sans)", url: "https://fonts.google.com/" },
];

const researchSources = [
  { name: "WCAG 2.2 Quick Reference (W3C)", url: "https://www.w3.org/WAI/WCAG22/quickref/" },
  { name: "WAI-ARIA Authoring Practices (W3C)", url: "https://www.w3.org/WAI/ARIA/apg/" },
  { name: "MDN: Web Accessibility", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" },
  { name: "web.dev Accessibility", url: "https://web.dev/accessibility" },
  { name: "Google Maps JavaScript API", url: "https://developers.google.com/maps/documentation/javascript" },
  { name: "City of Bothell: Your Community", url: "https://www.bothellwa.gov/148/Your-Community" },
  { name: "City of Bothell: City Services", url: "https://www.bothellwa.gov/101/City-Services" },
  { name: "City of Bothell: Parks & Recreation", url: "https://www.bothellwa.gov/249/Parks-Recreation" },
  { name: "City of Bothell: Maps & GIS", url: "https://www.bothellwa.gov/233/Maps-GIS" },
];

const allowedImageHosts = [
  "images.unsplash.com",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
];

interface ImageCitation {
  type: "Resource" | "Event";
  label: string;
  url: string;
}

function ensureAbsoluteUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function isPlaceholderDomain(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "example.com" || parsed.hostname.endsWith(".example.com");
  } catch {
    return false;
  }
}

function isAllowedImageSource(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return allowedImageHosts.some(
      (allowedHost) => hostname === allowedHost || hostname.endsWith(`.${allowedHost}`),
    );
  } catch {
    return false;
  }
}

function shortenUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function Reference() {
  const [resourceWebsites, setResourceWebsites] = useState<string[]>([]);
  const [resourceImages, setResourceImages] = useState<string[]>([]);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [resourceImageCitations, setResourceImageCitations] = useState<ImageCitation[]>([]);
  const [eventImageCitations, setEventImageCitations] = useState<ImageCitation[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceSources() {
      try {
        const [resources, events] = await Promise.all([
          listPublishedResources(),
          listPublishedEvents(),
        ]);

        if (cancelled) return;

        setResourceWebsites(
          resources
            .map((resource) => resource.website)
            .filter((website): website is string => Boolean(website)),
        );
        setResourceImages(
          resources
            .map((resource) => resource.image_url)
            .filter((image): image is string => Boolean(image)),
        );
        setResourceImageCitations(
          resources
            .filter((resource) => Boolean(resource.image_url))
            .map((resource) => ({
              type: "Resource" as const,
              label: resource.name,
              url: resource.image_url as string,
            })),
        );
        setEventImages(
          events
            .map((event) => event.image_url)
            .filter((image): image is string => Boolean(image)),
        );
        setEventImageCitations(
          events
            .filter((event) => Boolean(event.image_url))
            .map((event) => ({
              type: "Event" as const,
              label: event.title,
              url: event.image_url as string,
            })),
        );
      } catch (error) {
        console.error("Could not load citation sources", error);
      }
    }

    void loadReferenceSources();
    return () => {
      cancelled = true;
    };
  }, []);

  const organizationInfoSources = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...seededDirectoryEntries
              .map((entry) => entry.website)
              .filter((website): website is string => Boolean(website)),
            ...resourceWebsites,
          ]
            .map(ensureAbsoluteUrl)
            .filter((url) => !isPlaceholderDomain(url)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [resourceWebsites],
  );

  const imageSources = useMemo(
    () => Array.from(
      new Set(
        [
          HERO_IMAGE_URL,
          EVENTS_FALLBACK_IMAGE_URL,
          ...additionalReferenceImages,
          ...seededEvents.map((event) => event.image).filter((image): image is string => Boolean(image)),
          ...seededDirectoryEntries.map((entry) => entry.image).filter((image): image is string => Boolean(image)),
          ...seededSpotlights.map((item) => item.image).filter((image): image is string => Boolean(image)),
          ...resourceImages,
          ...eventImages,
        ]
          .filter((url) => !isPlaceholderDomain(url))
          .filter((url) => isAllowedImageSource(url)),
      ),
    ).sort((a, b) => a.localeCompare(b)),
    [eventImages, resourceImages],
  );

  const publishedImageCitations = useMemo(
    () =>
      Array.from(
        new Map(
          [...resourceImageCitations, ...eventImageCitations]
            .map((citation) => ({
              ...citation,
              url: ensureAbsoluteUrl(citation.url),
            }))
            .filter((citation) => !isPlaceholderDomain(citation.url))
            .filter((citation) => isAllowedImageSource(citation.url))
            .map((citation) => [`${citation.type}:${citation.label}:${citation.url}`, citation]),
        ).values(),
      ).sort((a, b) => a.label.localeCompare(b.label) || a.url.localeCompare(b.url)),
    [eventImageCitations, resourceImageCitations],
  );

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
        <div className="space-y-16">
          {/* TSA Documents */}
          <ScrollReveal>
            <div className="space-y-4">
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#B36A4C]" />
                TSA Documents
              </h2>
              <p className="text-sm text-[#5B473A]">
                Embedded PDF references for judging and documentation review.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <ScrollReveal>
              <article className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-[#E7D9C3] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-[#334233]">Copyright Checklist</h3>
                    <p className="text-sm text-[#5B473A] mt-1">Completed PDF checklist for copyright compliance.</p>
                  </div>
                  <a
                    href="https://drive.google.com/file/d/1N9d0weILs0gI_uovZHEJsEa91-c11wEP/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#B36A4C] hover:underline whitespace-nowrap"
                  >
                    Open in New Tab
                  </a>
                </div>
                <div className="overflow-hidden rounded-xl border border-[#E7D9C3] bg-[#F6F1E7]">
                  <iframe
                    src="https://drive.google.com/file/d/1N9d0weILs0gI_uovZHEJsEa91-c11wEP/preview"
                    title="Copyright Checklist PDF"
                    className="w-full h-[320px] sm:h-[380px]"
                    loading="lazy"
                  />
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <article className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-[#E7D9C3] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-[#334233]">Work Log</h3>
                    <p className="text-sm text-[#5B473A] mt-1">Completed plan of work log for this project entry.</p>
                  </div>
                  <a
                    href="https://drive.google.com/file/d/1no-PkCYWgZ9pZp7qSL_dS2aGdXFbJSHA/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#B36A4C] hover:underline whitespace-nowrap"
                  >
                    Open in New Tab
                  </a>
                </div>
                <div className="overflow-hidden rounded-xl border border-[#E7D9C3] bg-[#F6F1E7]">
                  <iframe
                    src="https://drive.google.com/file/d/1no-PkCYWgZ9pZp7qSL_dS2aGdXFbJSHA/preview"
                    title="Work Log PDF"
                    className="w-full h-[320px] sm:h-[380px]"
                    loading="lazy"
                  />
                </div>
              </article>
            </ScrollReveal>
          </div>

          {/* References & Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Code Stack */}
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-[#B36A4C]" />
                  Code Stack & Docs
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
                  {developmentSources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col p-4 rounded-xl bg-[#E7D9C3]/20 border border-[#E7D9C3]/30 hover:border-[#B36A4C] hover:bg-[#E7D9C3]/35 transition-colors"
                    >
                      <span className="font-semibold text-[#334233]">{source.name}</span>
                      <span className="text-xs text-[#5B473A] mt-1">{shortenUrl(source.url)}</span>
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Image Links */}
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                  <Globe className="w-6 h-6 text-[#B36A4C]" />
                  Image Sources
                </h2>
                <p className="text-sm text-[#5B473A]">
                  All third-party images shown on this site are sourced from Unsplash or Wikimedia Commons and are
                  used under those platforms&apos; license terms with attribution on this page.
                </p>
                <p className="text-sm text-[#5B473A]">
                  Community submission policy: contributors are responsible for only uploading media they created or
                  are licensed/authorized to share. By submitting content, contributors affirm they have those rights.
                </p>
                <p className="text-sm text-[#5B473A] italic mb-4">
                  These are the exact image URLs currently used across home data, hero/fallback visuals, and published portal content.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-[#B36A4C] break-all max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#E7D9C3]">
                  {imageSources.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {url}
                    </a>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  {licenseSources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs p-3 rounded-lg bg-white border border-[#E7D9C3] text-[#334233] hover:bg-[#B36A4C] hover:text-white transition-colors block truncate"
                    >
                      {source.name}
                    </a>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-[#334233] mb-3">Published Content Image Citations</h3>
                  <p className="text-xs text-[#5B473A] mb-4">
                    These citations pair each published resource/event title with its image source URL.
                  </p>
                  {publishedImageCitations.length === 0 ? (
                    <p className="text-sm text-[#6F7553]">
                      No published resource or event images found yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-2">
                      {publishedImageCitations.map((citation) => (
                        <div key={`${citation.type}-${citation.label}-${citation.url}`} className="rounded-lg border border-[#E7D9C3] bg-white p-3">
                          <p className="text-xs font-semibold text-[#334233]">
                            {citation.type}: {citation.label}
                          </p>
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-mono text-[#B36A4C] break-all hover:underline"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {citation.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Information Sources */}
          <ScrollReveal>
            <div className="space-y-6">
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-[#B36A4C]" />
                Organization Information Sources
              </h2>
              <p className="text-sm text-[#5B473A]">
                Combined from project directory data and published resource links, with placeholder domains excluded.
              </p>
              {organizationInfoSources.length === 0 ? (
                <p className="text-sm text-[#6F7553]">
                  No published organization websites found yet. Once resources are published, links will appear here automatically.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {organizationInfoSources.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-xs p-3 rounded-lg bg-white border border-[#E7D9C3] text-[#334233] hover:bg-[#B36A4C] hover:text-white transition-colors block truncate">
                      {shortenUrl(url)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Research Sources */}
          <ScrollReveal>
            <div className="space-y-6">
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-[#B36A4C]" />
                Research Sources
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {researchSources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs p-3 rounded-lg bg-white border border-[#E7D9C3] text-[#334233] hover:bg-[#B36A4C] hover:text-white transition-colors block">
                    <span className="font-semibold block truncate">{source.name}</span>
                    <span className="opacity-80 block truncate mt-1">{shortenUrl(source.url)}</span>
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
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
