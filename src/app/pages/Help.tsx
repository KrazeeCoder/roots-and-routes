import { Link } from "react-router";
import { CalendarDays, HelpCircle, Info, Mail, Search, Sparkles, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const quickActions = [
  {
    title: "Search the directory",
    description: "Find local services, programs, and support by category, keyword, or location.",
    href: "/directory",
    icon: Search,
  },
  {
    title: "Browse community events",
    description: "Explore upcoming local events and workshops for families, seniors, and neighbors.",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Suggest a new resource",
    description: "Share a trusted local service or event so our directory keeps growing.",
    href: "/suggest",
    icon: Sparkles,
  },
  {
    title: "Open the contributor portal",
    description: "Manage your resource or event listings, and track approvals for your submissions.",
    href: "/contributor-login",
    icon: UserPlus,
  },
];

const faqItems = [
  {
    question: "How do I find help near me?",
    answer:
      "Use the Directory search bar to enter your need, such as ‘food pantry’, ‘rent help’, or ‘mental health’. You can also filter by category and location to see the closest local services.",
  },
  {
    question: "Can I see only events happening this week?",
    answer:
      "Yes. On the Events page, the calendar and list view show upcoming community gatherings. Use the date filters to narrow results to the next few days or this week.",
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
];

const guideItems = [
  {
    title: "Search & Find Resources",
    description: "Use keywords like 'food', 'housing', or 'mental health' to discover local support. Filter by category and location to find services near you quickly.",
    href: "/guide/search-resources",
  },
  {
    title: "Browse & Register for Events",
    description: "Explore upcoming workshops, support groups, and community gatherings. View detailed information, dates, times, and registration links for each event.",
    href: "/guide/browse-events",
  },
  {
    title: "Submit New Resources",
    description: "Share a trusted local service or event with the community. Provide clear details and our team will review and publish your submission quickly.",
    href: "/guide/submit-resources",
  },
  {
    title: "Become a Contributor",
    description: "Sign up to manage resource and event listings, track approvals, and help shape the community directory. Access the contributor portal anytime.",
    href: "/guide/become-contributor",
  },
];

export function Help() {
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
              Start with the quick actions below or jump to common questions.
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
      </section>

      <section className="relative pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#E7D9C3] bg-white p-6 shadow-[0_15px_35px_-12px_rgba(51,66,51,0.12)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#334233] hover:bg-[#F6F1E7] hover:shadow-[0_20px_40px_-12px_rgba(51,66,51,0.2)]"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7D9C3] text-[#334233] shadow-sm transition-all duration-300 group-hover:bg-[#334233] group-hover:text-[#F6F1E7] group-hover:rotate-6">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-lg font-semibold text-[#334233] transition-colors duration-300">
                      {action.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]/90 transition-colors duration-300">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[#E7D9C3] pt-4 opacity-85 group-hover:opacity-100 transition-all duration-300 group-hover:border-[#334233]/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#B36A4C] transition-colors duration-300 group-hover:text-[#334233]">
                      Launch Tool
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#B36A4C] transform -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#334233]" />
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#D8C9AC] bg-[#F6F1E7] py-16">
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

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {guideItems.map((guide, index) => (
              <div key={guide.title} className="group border-t border-[#D8C9AC] pt-8 flex flex-col justify-between h-full">
                <div>
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none mb-6">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-xl font-semibold text-[#334233] leading-snug">
                    {guide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                    {guide.description}
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to={guide.href}
                    className="inline-flex items-center text-sm font-semibold text-[#B36A4C] transition-colors relative pb-1 group-hover:text-[#334233]"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B36A4C] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:bg-[#334233]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#E7D9C3] bg-white p-8 shadow-[0_20px_40px_-24px_rgba(51,66,51,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#B36A4C]">Frequently asked questions</p>
            <div className="mt-6 space-y-4">
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
              Send us a message through our interactive contact form. Our community team will review your inquiry and respond within 24-48 hours.
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
