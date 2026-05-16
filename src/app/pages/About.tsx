import { useEffect, useState } from "react";
import { HeartPulse, Layers, Users, MapPin, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";
import { Button } from "../components/ui/button";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";

interface CountUpProps {
  end: number;
  durationMs?: number;
  suffix?: string;
}

function CountUp({ end, durationMs = 2000, suffix = "" }: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      setValue(Math.round(progress * end));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [durationMs, end]);

  return (
    <span>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

export function About() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-20 pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/70 via-[#334233]/40 to-transparent" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="absolute right-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#B36A4C]/40 to-transparent pointer-events-none"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.2 }}
          className="absolute right-16 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#B36A4C] ring-4 ring-[#B36A4C]/20 pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B36A4C]/20 border border-[#B36A4C]/30 text-[#E7D9C3] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-[#B36A4C]" />
                Our story, values, and impact
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Roots & Routes: <span className="text-[#B36A4C] italic">Our Purpose</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed mb-8 max-w-2xl">
                Learn about our mission, community impact, and how we connect Bothell residents.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-[#B36A4C] hover:bg-[#A55A3C] text-white shadow-md">
                  <a href="/directory" className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Explore Directory
                  </a>
                </Button>
                <Button variant="outline" asChild className="border-[#B36A4C] text-[#B36A4C] hover:bg-[#B36A4C] hover:text-white shadow-md">
                  <a href="/suggest" className="inline-flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" />
                    Submit a Resource or Event
                  </a>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-2xl border border-[#B36A4C]/40 bg-[#B36A4C]/10 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#334233]">TSA Compliance Statement</h2>
            <p className="mt-2 text-sm sm:text-base text-[#5B473A] leading-relaxed">
              This website uses React, Vite, and Tailwind CSS. All page layouts, styling, and interface components were built by our team.
              No pre-built template or theme was used.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ScrollReveal>
          <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#334233] mb-4">
            Our story
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-[#5B473A] text-base font-light leading-relaxed mb-8">
            Our team started by providing essential resources for people without proper financial aid in Bothell, focusing on connecting neighbors with the support they needed most.
            As we grew, we realized the broader potential of a comprehensive community hub that could serve all residents of Bothell, not just those facing financial challenges.
            Today, Roots & Routes is a central resource in Bothell for community programs, events, services, and neighbor-led support that strengthens our entire community.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal delay={0.2}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-3">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-[#334233] mb-2">Support First</h3>
              <p className="text-[#5B473A] text-sm leading-relaxed">
                We began by addressing immediate needs, providing resources and aid to those who needed it most in our community.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-3">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-[#334233] mb-2">Growing Together</h3>
              <p className="text-[#5B473A] text-sm leading-relaxed">
                From targeted support to comprehensive community resources, we've expanded to serve all Bothell residents.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-3">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-[#334233] mb-2">Bothell Focused</h3>
              <p className="text-[#5B473A] text-sm leading-relaxed">
                Deeply rooted in Bothell, we provide resources and connections that are specifically tailored to our local community.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Impact metrics */}
      <section className="bg-[#E7D9C3]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#334233] mb-4">
              Community impact
            </h2>
            <p className="mb-4 text-sm text-[#6F7553]">
              Note: The community member counter is for TSA display purposes only and may not be factual.
            </p>
          </ScrollReveal>
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StaggerItem>
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-[#334233]">
                  <CountUp end={27} />
                </div>
                <div className="mt-1 text-sm text-[#5B473A]">Resources listed in the hub</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-[#334233]">
                  <CountUp end={150} />
                </div>
                <div className="mt-1 text-sm text-[#5B473A]">Community members reached</div>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ScrollReveal>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-6">
            How Roots & Routes works
          </h2>
          <p className="text-[#5B473A] text-lg font-light leading-relaxed mb-10 max-w-3xl">
            Our local hub is built around thoughtful review and contributor collaboration. Volunteers, organizations, and moderators work together to keep community listings accurate, useful, and easy to find.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#334233] mb-2">Gather insights</h3>
            <p className="text-sm text-[#5B473A]">
              Residents can submit public resource and event proposals, while organizations can apply for contributor access to maintain official listings.
            </p>
          </div>
          <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#334233] mb-2">Review with care</h3>
            <p className="text-sm text-[#5B473A]">
              Moderators approve contributor accounts and review public proposals before those public submissions become official content.
            </p>
          </div>
          <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#334233] mb-2">Share with the community</h3>
            <p className="text-sm text-[#5B473A]">
              Approved contributors can publish resources and events directly, and moderator-approved public proposals appear alongside them on the live site.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-[#334233]/5 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <TopoPattern />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-6">
                  Get involved
                </h2>
                <p className="text-[#5B473A] text-lg leading-relaxed mb-8">
                  Browse the directory, drop a resource idea, or show up to an event. Every small action helps strengthen our community network.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="bg-[#B36A4C] hover:bg-[#A55A3C] text-white shadow-md">
                    <a href="/directory" className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Explore Directory
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="border-[#B36A4C] text-[#B36A4C] hover:bg-[#B36A4C] hover:text-white shadow-md">
                    <a href="/suggest" className="inline-flex items-center gap-2">
                      <HeartPulse className="w-4 h-4" />
                      Submit a Resource or Event
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-3xl border border-[#B36A4C]/40 bg-white p-10 shadow-xl">
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#334233] mb-4">
                    <Sparkles className="w-5 h-5 text-[#B36A4C]" />
                    <span>Community-driven pathway network</span>
                  </div>
                  <div className="text-2xl font-bold text-[#334233] mb-2">We're building something together.</div>
                  <p className="text-sm text-[#5B473A] leading-relaxed">
                    Join us in creating a more connected and supportive Bothell community.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
