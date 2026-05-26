import { Link } from "react-router";
import { useEffect, useState } from "react";
import { HelpCircle, Info, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ServiceCard } from "../components/ui/service-card";

const faqItems = [
  {
    question: "How do I find help near me?",
    answer:
      "Use the Directory search bar to enter your need, such as 'food pantry', 'rent help', or 'mental health'. You can also filter by category, rating, contact details, and availability.",
  },
  {
    question: "Can I see only events happening this week?",
    answer:
      "Use the Events page to switch between upcoming and past events, then narrow by location and radius. For a date-by-date view, open the Full Community Calendar.",
  },
  {
    question: "What should I include when suggesting a resource?",
    answer:
      "Send a clear name, location, contact details, and a short description of the service offered. That helps our team review your suggestion quickly and keep the directory accurate.",
  },
  {
    question: "Where do I go if I want to manage my listing?",
    answer:
      "Use the Portal link at the top right to sign in. Approved contributors can update resources and events once their account is verified.",
  },
  {
    question: "How do I report outdated or incorrect information?",
    answer:
      "Use the Contact page to send the resource or event name and what needs to be updated. Our team reviews corrections to keep listings accurate.",
  },
];

const guideItems = [
  {
    title: "Search & Find Resources",
    description: "Find local services, programs, and support by category, keyword, or location",
    href: "/guide/search-resources",
    imgSrc: "/help_page_svgs/search.svg",
    imgAlt: "Magnifying glass and folder icon",
    imgClassName: "w-28 h-28 sm:w-32 sm:h-32 -right-3 -bottom-3",
    variant: "default" as const,
  },
  {
    title: "Browse Community Events",
    description: "Explore upcoming local events and workshops for families, seniors, and neighbors",
    href: "/guide/browse-events",
    imgSrc: "/help_page_svgs/calendar.svg",
    imgAlt: "Calendar and checklist icon",
    imgClassName: "w-28 h-28 sm:w-32 sm:h-32 -right-2 -bottom-2",
    variant: "gray" as const,
  },
  {
    title: "Submit New Resources",
    description: "Share a trusted local service or event so our directory keeps growing",
    href: "/guide/submit-resources",
    imgSrc: "/help_page_svgs/resources.svg",
    imgAlt: "Resource card icon",
    variant: "red" as const,
  },
  {
    title: "Become a Contributor",
    description: "Manage your resource or event listings, save drafts, and publish updates once your account is approved",
    href: "/guide/become-contributor",
    imgSrc: "/help_page_svgs/contributor.svg",
    imgAlt: "Person and shield icon",
    imgClassName: "w-28 h-28 sm:w-32 sm:h-32 -right-3 -bottom-3",
    variant: "blue" as const,
  },
];

export function Help() {
  const [guideSvgsReady, setGuideSvgsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const preloadPromises = guideItems.map((guide) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const maybeDecode = img.decode?.();
          if (maybeDecode && typeof maybeDecode.then === "function") {
            maybeDecode.finally(() => resolve());
            return;
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = guide.imgSrc;
      });
    });

    Promise.all(preloadPromises).then(() => {
      if (isMounted) {
        setGuideSvgsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!guideSvgsReady) {
    return (
      <div className="min-h-screen bg-[#F6F1E7] text-[#334233] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-[#E7D9C3] border-t-[#B36A4C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-24 pb-24">
        <div className="absolute inset-0 opacity-20">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7D9C3]/40 bg-[#B36A4C]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#E7D9C3]">
              <Info className="h-4 w-4" />
              Help Center
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-8 text-4xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] sm:text-5xl"
            >
              Find your path with step-by-step help.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#E7D9C3]/90"
            >
              This page helps you use Roots & Routes to explore resources, locate events, and submit community support.
              Start with the guide cards below or jump to common questions.
            </motion.p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                to="/directory"
                className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
              >
                Browse Resources
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center rounded-full border border-[#E7D9C3] bg-[#334233]/10 px-6 py-3 text-sm font-semibold text-[#E7D9C3] hover:bg-[#334233]/20 transition-colors"
              >
                View Events
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#B36A4C]">How to use the site</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-4xl">
              Master each core feature of Roots & Routes.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5B473A]">
              Explore detailed guides for searching resources, managing events, submitting new services, and becoming a community contributor.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {guideItems.map((guide) => (
              <ServiceCard
                key={guide.title}
                title={guide.title}
                description={guide.description}
                href={guide.href}
                imgSrc={guide.imgSrc}
                imgAlt={guide.imgAlt}
                imgClassName={guide.imgClassName}
                imgLoading="eager"
                imgFetchPriority="high"
                variant={guide.variant}
                className="min-h-[180px]"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#E7D9C3] bg-white p-8 shadow-[0_20px_40px_-24px_rgba(51,66,51,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#B36A4C]">Frequently asked questions</p>
            <div className="mt-4 space-y-4">
              <Accordion type="single" collapsible>
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm leading-7 text-[#5B473A]">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E7D9C3] bg-[#F6F1E7] p-8 shadow-[0_20px_40px_-24px_rgba(51,66,51,0.2)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#B36A4C] text-white shadow-sm">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#334233]">Still need support?</h2>
            <p className="mt-4 text-sm leading-7 text-[#5B473A]">
              Please send us a message through our interactive contact form, and our community team will review your inquiry and respond within 24-48 hours.
            </p>
            <div className="mt-8 rounded-3xl border border-[#E7D9C3] bg-white p-6 flex flex-col items-start">
              <p className="text-sm font-semibold text-[#334233] mb-3">Get in touch</p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
              >
                Go to Contact Form
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
