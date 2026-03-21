import { useEffect, useRef, useState } from "react";
import { HeartPulse, Layers, Users, MapPin, Sparkles } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../components/ScrollReveal";

interface CountUpProps {
  end: number;
  durationMs?: number;
  suffix?: string;
}

function CountUp({ end, durationMs = 2000, suffix = "" }: CountUpProps) {
  const [value, setValue] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setShouldAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

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
  }, [durationMs, end, shouldAnimate]);

  return (
    <span ref={ref}>
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
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                We’re a volunteer-led hub connecting Bothell residents to trusted resources, events, and one another.
                Our mission is to make it easier for people to find help, build connections, and grow thriving neighborhoods.
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

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-6">
            Our values
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-[#5B473A] text-lg font-light leading-relaxed mb-12">
            We center people, practice care, and strive to be transparent so everyone can trust the paths we share.
          </p>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StaggerItem>
            <Card className="border-[#E7D9C3] bg-white">
              <CardHeader>
                <CardTitle>Community First</CardTitle>
              </CardHeader>
              <CardContent className="text-[#5B473A]">
                We prioritize local voices, lived experience, and practical support that helps people on their journey.
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-[#E7D9C3] bg-white">
              <CardHeader>
                <CardTitle>Open & Inclusive</CardTitle>
              </CardHeader>
              <CardContent className="text-[#5B473A]">
                We welcome contributions from any neighbor and aim to represent the full diversity of our community.
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-[#E7D9C3] bg-white">
              <CardHeader>
                <CardTitle>Practical Impact</CardTitle>
              </CardHeader>
              <CardContent className="text-[#5B473A]">
                Every listing and event is chosen to help people find their way, stay grounded, and build lasting connections.
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* Impact metrics */}
      <section className="bg-[#E7D9C3]/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-6">
              Community impact
            </h2>
          </ScrollReveal>
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StaggerItem>
              <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-5xl font-bold text-[#334233]">
                  <CountUp end={150} suffix="+" />
                </div>
                <div className="mt-2 text-sm text-[#5B473A]">Verified community resources</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-5xl font-bold text-[#334233]">
                  <CountUp end={1200} suffix="+" />
                </div>
                <div className="mt-2 text-sm text-[#5B473A]">Community members reached</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="text-5xl font-bold text-[#334233]">
                  <CountUp end={85} suffix="+" />
                </div>
                <div className="mt-2 text-sm text-[#5B473A]">Volunteer hours logged</div>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-6">
            How Roots & Routes works
          </h2>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StaggerItem>
            <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#334233] mb-2">Gather insights</h3>
              <p className="text-sm text-[#5B473A]">
                We collect trusted local resources, events, and programs shared by residents and partners.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#334233] mb-2">Review with care</h3>
              <p className="text-sm text-[#5B473A]">
                A small team verifies entries and ensures listings are accurate and inclusive.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#A7AE8A]/20 text-[#334233] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#334233] mb-2">Share with the community</h3>
              <p className="text-sm text-[#5B473A]">
                Resources are made searchable and available to anyone looking for help in Bothell.
              </p>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* Final CTA */}
      <section className="bg-[#334233] text-[#F6F1E7] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold mb-4">
                  Get involved
                </h2>
                <p className="text-[#A7AE8A] text-lg leading-relaxed mb-8">
                  Explore the directory, plant a resource suggestion, or join an event. Every action strengthens our community network.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <a href="/directory" className="inline-flex items-center gap-2">
                      Explore Directory
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/suggest" className="inline-flex items-center gap-2">
                      Plant a Resource Suggestion
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-3xl border border-[#B36A4C]/50 bg-[#F6F1E7]/10 p-10">
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#F6F1E7] mb-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#B36A4C]/20">•</span>
                    <span>Community-driven pathway network</span>
                  </div>
                  <div className="text-2xl font-bold text-white">We’re building something together.</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
