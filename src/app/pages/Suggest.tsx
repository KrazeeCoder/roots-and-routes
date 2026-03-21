import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Lightbulb, ShieldCheck, HelpCircle, Users } from "lucide-react";
import { TopoPattern } from "../components/TopoPattern";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ScrollReveal } from "../components/ScrollReveal";

type SuggestForm = {
  name: string;
  email: string;
  resourceName: string;
  category: string;
  description: string;
  location: string;
};

const initialForm: SuggestForm = {
  name: "",
  email: "",
  resourceName: "",
  category: "",
  description: "",
  location: "",
};

export function Suggest() {
  const [form, setForm] = useState<SuggestForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<keyof SuggestForm, boolean>>({
    name: false,
    email: false,
    resourceName: false,
    category: false,
    description: false,
    location: false,
  });

  useEffect(() => {
    // Smooth scroll to top when component mounts
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  const errors = useMemo(() => {
    const next: Record<keyof SuggestForm, string | null> = {
      name: null,
      email: null,
      resourceName: null,
      category: null,
      description: null,
      location: null,
    };

    if (!form.name.trim()) next.name = "Please share your name.";
    if (!form.email.trim()) next.email = "Please add an email address.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = "Looks like an invalid email.";

    if (!form.resourceName.trim()) next.resourceName = "Give your suggestion a short name.";
    if (!form.category.trim()) next.category = "Pick a category so we can tag it right.";
    if (!form.description.trim()) next.description = "Tell us a bit about what makes this resource helpful.";
    if (!form.location.trim()) next.location = "Where is this resource located?";

    return next;
  }, [form]);

  const hasErrors = useMemo(
    () => Object.values(errors).some((e) => e !== null),
    [errors],
  );

  const handleChange = (field: keyof SuggestForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof SuggestForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({
      name: true,
      email: true,
      resourceName: true,
      category: true,
      description: true,
      location: true,
    });

    if (hasErrors) return;

    setSubmitted(true);
  };

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
                <Lightbulb className="w-4 h-4 text-[#B36A4C]" />
                Help us grow the directory
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Plant a <span className="text-[#B36A4C] italic">Resource</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed">
                Share a local program, service, or organization that helps Bothell residents grow.
                We’ll review submissions and add them to directory so others can find their path faster.
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

      {/* Form + Guidance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <ScrollReveal>
              <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#334233] mb-4">
                Tell us about it
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-[#5B473A] text-lg font-light leading-relaxed mb-10">
                The form below is for planting services, programs, and community supports that should be on our map.
                We don’t require login or personal details beyond what helps us follow up if we have questions.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <form onSubmit={handleSubmit} noValidate className="space-y-8">
                {submitted ? (
                  <div className="rounded-2xl border border-[#A7AE8A] bg-[#F6F1E7] p-8">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233]">
                        <CheckCircle2 className="w-6 h-6" />
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#334233]">Thanks for helping our community grow!</h3>
                        <p className="text-[#5B473A] mt-2">
                          We’ll review it and add it to directory shortly. In the meantime, you can explore other pathways to support community.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <Button asChild>
                            <a href="/directory" className="inline-flex items-center gap-2">
                              Explore Directory
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href="/events" className="inline-flex items-center gap-2">
                              Upcoming Gatherings
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Your name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          onBlur={() => handleBlur("name")}
                          aria-invalid={Boolean(touched.name && errors.name)}
                        />
                        {touched.name && errors.name ? (
                          <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="email">Your email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          onBlur={() => handleBlur("email")}
                          aria-invalid={Boolean(touched.email && errors.email)}
                        />
                        {touched.email && errors.email ? (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="resourceName">Resource name</Label>
                        <Input
                          id="resourceName"
                          value={form.resourceName}
                          onChange={(e) => handleChange("resourceName", e.target.value)}
                          onBlur={() => handleBlur("resourceName")}
                          aria-invalid={Boolean(touched.resourceName && errors.resourceName)}
                        />
                        {touched.resourceName && errors.resourceName ? (
                          <p className="text-sm text-destructive mt-1">{errors.resourceName}</p>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="category">Category or focus</Label>
                        <Input
                          id="category"
                          value={form.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                          onBlur={() => handleBlur("category")}
                          aria-invalid={Boolean(touched.category && errors.category)}
                        />
                        {touched.category && errors.category ? (
                          <p className="text-sm text-destructive mt-1">{errors.category}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="description">What does it offer?</Label>
                        <Textarea
                          id="description"
                          value={form.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          onBlur={() => handleBlur("description")}
                          aria-invalid={Boolean(touched.description && errors.description)}
                          placeholder="Tell us who it's for, what services are available, and any key details."
                        />
                        {touched.description && errors.description ? (
                          <p className="text-sm text-destructive mt-1">{errors.description}</p>
                        ) : null}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="location">Location / access details</Label>
                        <Textarea
                          id="location"
                          value={form.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          onBlur={() => handleBlur("location")}
                          aria-invalid={Boolean(touched.location && errors.location)}
                          placeholder="Physical address, online meeting info, or how to connect."
                        />
                        {touched.location && errors.location ? (
                          <p className="text-sm text-destructive mt-1">{errors.location}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-sm text-[#5B473A]">
                        Thanks for helping our community grow! and follow up if we need clarification.
                      </div>
                      <Button type="submit">Submit suggestion</Button>
                    </div>
                  </div>
                )}
              </form>
            </ScrollReveal>
          </div>

          <div className="space-y-10">
            <ScrollReveal>
              <Card className="border-[#E7D9C3] bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">What makes a great suggestion?</CardTitle>
                  <CardDescription>
                    Share the info that helps us add your resource quickly and accurately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#334233]">Clear access details</p>
                      <p className="text-sm text-[#5B473A]">
                        Provide hours, eligibility, and whether people need an appointment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233]">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#334233]">Why it matters</p>
                      <p className="text-sm text-[#5B473A]">
                        Help us understand who benefits and what makes this resource unique.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#A7AE8A]/20 text-[#334233]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#334233]">Up-to-date info</p>
                      <p className="text-sm text-[#5B473A]">
                        If dates or details change, let us know so the community can trust the listing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Card className="border-[#E7D9C3] bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Need help?</CardTitle>
                  <CardDescription>
                    If you’d rather share details privately, here are other ways to get in touch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#B36A4C]/10 text-[#B36A4C]">
                        <HelpCircle className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#334233]">Email our team</p>
                        <p className="text-sm text-[#5B473A]">rootsandroutes.bothell@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#B36A4C]/10 text-[#B36A4C]">
                        <Users className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#334233]">Join the community chat</p>
                        <p className="text-sm text-[#5B473A]">Connect with volunteers and organizers in our online group.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Accordion type="single" collapsible className="rounded-2xl border border-[#E7D9C3] bg-white">
                <AccordionItem value="q1">
                  <AccordionTrigger>How long does it take to appear in the directory?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-[#5B473A]">
                      We review submissions within a few days. If we have questions, we’ll reach out using the email you provide.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>Can I suggest something that’s not a formal organization?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-[#5B473A]">
                      Yes! We welcome suggestions for mutual aid groups, informal programs, and community-led efforts too.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>Who reviews submissions?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-[#5B473A]">
                      A team of volunteers checks details for accuracy and makes sure listings fit the scope of the directory.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
