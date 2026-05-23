import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, ArrowLeft, Send, CheckCircle2, MessageSquare, HelpCircle, Sparkles, Compass } from "lucide-react";
import { toast } from "sonner";
import { TopoPattern } from "../components/TopoPattern";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { launchSuccessConfetti } from "../../utils/confetti";
import { validateEmail, validateRequired, validateMaxLength } from "../../utils/validation";
import { validateProfanity } from "../../utils/profanityFilter";

type FieldErrors = Record<string, string>;

interface ContactFormState {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const defaultForm: ContactFormState = {
  name: "",
  email: "",
  category: "general",
  subject: "",
  message: "",
};

export function Contact() {
  const [form, setForm] = useState<ContactFormState>(defaultForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    document.title = "Contact Us - Roots & Routes: Bothell";
  }, []);

  const getFieldErrorId = (fieldId: string) => `${fieldId}-error`;
  const focusFieldById = (fieldId: string) => {
    window.requestAnimationFrame(() => {
      const node = document.getElementById(fieldId);
      node?.focus();
    });
  };

  const handleInputChange = (field: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setGeneralError(null);
  };

  const validateForm = (): boolean => {
    const nextErrors: FieldErrors = {};
    let firstInvalidFieldId: string | null = null;

    const markError = (fieldId: keyof ContactFormState, message: string | null) => {
      if (!message) return;
      nextErrors[field] = message;
      if (!firstInvalidFieldId) firstInvalidFieldId = fieldId;
    };

    // Name validations
    markError("name", validateRequired(form.name, "Your name"));
    markError("name", validateMaxLength(form.name, "Your name", 100));
    markError("name", validateProfanity(form.name, "Your name"));

    // Email validations
    markError("email", validateRequired(form.email, "Your email"));
    markError("email", validateEmail(form.email));
    markError("email", validateMaxLength(form.email, "Your email", 100));

    // Subject validations
    markError("subject", validateRequired(form.subject, "Subject"));
    markError("subject", validateMaxLength(form.subject, "Subject", 150));
    markError("subject", validateProfanity(form.subject, "Subject"));

    // Message validations
    markError("message", validateRequired(form.message, "Message", 10));
    markError("message", validateMaxLength(form.message, "Message", 2000));
    markError("message", validateProfanity(form.message, "Message"));

    setErrors(nextErrors);
    
    if (Object.keys(nextErrors).length > 0) {
      if (firstInvalidFieldId) focusFieldById(firstInvalidFieldId);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setGeneralError(null);

    if (!validateForm()) {
      setSubmitting(false);
      toast.error("Please correct the errors in the form.");
      return;
    }

    const toastId = toast.loading("Sending your message...");

    try {
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Message sent successfully!", { id: toastId });
      launchSuccessConfetti();
      setSuccess(true);
      setForm(defaultForm);
    } catch (err) {
      console.error(err);
      setGeneralError("Something went wrong while sending your message. Please try again.");
      toast.error("Could not send message.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#334233] pb-24 pt-20 text-[#F6F1E7]">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/75 via-[#334233]/45 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B36A4C]/40 bg-[#B36A4C]/20 px-3 py-1.5 text-sm font-medium text-[#E7D9C3]">
              <MessageSquare className="h-4 w-4 text-[#B36A4C]" />
              Connect With Us
            </div>
            <h1 className="mb-6 font-['Cormorant_Garamond',serif] text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Get in touch with <span className="text-[#B36A4C] italic">our team</span>
            </h1>
            <p className="max-w-2xl text-lg font-light leading-relaxed text-[#A7AE8A]">
              Have questions about the directory, feedback about a local service, or want to explore partnership opportunities? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
          
          {/* Contact Form Card */}
          <Card className="border-[#E7D9C3] overflow-hidden bg-white/70 backdrop-blur-sm shadow-[0_20px_50px_-20px_rgba(51,66,51,0.15)] relative">
            
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="contact-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-[#334233] font-['Cormorant_Garamond',serif] font-bold">
                      Send Us a Message
                    </CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      Fill out the form below and we will respond as soon as possible, typically within 24 to 48 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generalError && (
                      <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {generalError}
                      </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name" className="text-[#334233] font-semibold text-sm">Full Name</Label>
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className={`mt-1.5 border-[#E7D9C3] focus:border-[#B36A4C] focus:ring-1 focus:ring-[#B36A4C] transition-all bg-white/80 ${
                              errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
                            }`}
                            placeholder="Alex Morgan"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? getFieldErrorId("name") : undefined}
                            required
                          />
                          {errors.name && (
                            <p id={getFieldErrorId("name")} className="mt-1 text-xs text-red-600 font-medium">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-[#334233] font-semibold text-sm">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={`mt-1.5 border-[#E7D9C3] focus:border-[#B36A4C] focus:ring-1 focus:ring-[#B36A4C] transition-all bg-white/80 ${
                              errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
                            }`}
                            placeholder="alex@example.com"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? getFieldErrorId("email") : undefined}
                            required
                          />
                          {errors.email && (
                            <p id={getFieldErrorId("email")} className="mt-1 text-xs text-red-600 font-medium">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-[#334233] font-semibold text-sm">Inquiry Category</Label>
                        <div className="relative mt-1.5">
                          <select
                            id="category"
                            value={form.category}
                            onChange={(e) => handleInputChange("category", e.target.value)}
                            className="w-full rounded-xl border border-[#E7D9C3] bg-white/80 px-4 py-2.5 text-sm text-[#334233] shadow-sm outline-none transition-all focus:border-[#B36A4C] focus:ring-1 focus:ring-[#B36A4C] appearance-none"
                          >
                            <option value="general">General Inquiry & Questions</option>
                            <option value="resource">Resource Hub Suggestions / Updates</option>
                            <option value="event">Community Events Information</option>
                            <option value="feedback">Website Feedback & Suggestions</option>
                            <option value="portal">Contributor Portal Support</option>
                            <option value="other">Other Inquiry</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#5B473A]">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-[#334233] font-semibold text-sm">Subject</Label>
                        <Input
                          id="subject"
                          value={form.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          className={`mt-1.5 border-[#E7D9C3] focus:border-[#B36A4C] focus:ring-1 focus:ring-[#B36A4C] transition-all bg-white/80 ${
                            errors.subject ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          placeholder="How can we help you?"
                          aria-invalid={!!errors.subject}
                          aria-describedby={errors.subject ? getFieldErrorId("subject") : undefined}
                          required
                        />
                        {errors.subject && (
                          <p id={getFieldErrorId("subject")} className="mt-1 text-xs text-red-600 font-medium">
                            {errors.subject}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-[#334233] font-semibold text-sm">Your Message</Label>
                        <Textarea
                          id="message"
                          value={form.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className={`mt-1.5 border-[#E7D9C3] focus:border-[#B36A4C] focus:ring-1 focus:ring-[#B36A4C] transition-all bg-white/80 min-h-[160px] resize-y ${
                            errors.message ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          placeholder="Please provide details about your inquiry. If referring to a specific resource, please include its name..."
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? getFieldErrorId("message") : undefined}
                          required
                        />
                        {errors.message && (
                          <p id={getFieldErrorId("message")} className="mt-1 text-xs text-red-600 font-medium">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-[#334233] hover:bg-[#B36A4C] text-[#F6F1E7] font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-colors duration-300 inline-flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="p-8 sm:p-12 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4E4] text-[#334233] mb-6 shadow-inner">
                    <CheckCircle2 className="h-10 w-10 text-[#6F7553]" />
                  </div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233] mb-3">
                    Thank You!
                  </h3>
                  <p className="text-lg font-medium text-[#B36A4C] mb-4">
                    Your message has been sent successfully.
                  </p>
                  <p className="max-w-md mx-auto text-sm leading-relaxed text-[#5B473A] mb-8">
                    We appreciate you taking the time to reach out to Roots & Routes Bothell. Our community team will review your message and get back to you shortly.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button asChild className="bg-[#334233] hover:bg-[#B36A4C] text-[#F6F1E7] rounded-xl px-5 py-2">
                      <Link to="/directory" className="inline-flex items-center gap-1.5">
                        <Compass className="h-4 w-4" />
                        Browse Resource Directory
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-[#E7D9C3] hover:bg-[#E7D9C3]/20 rounded-xl px-5 py-2">
                      <Link to="/help">
                        Back to Help Center
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Sidebar / Context Info */}
          <div className="space-y-6">
            
            {/* Direct contact details */}
            <Card className="border-[#E7D9C3] bg-[#FFF8EE]/60 backdrop-blur-sm shadow-sm overflow-hidden relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-[#334233] font-['Cormorant_Garamond',serif] font-bold inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#B36A4C]" />
                  Other Ways to Connect
                </CardTitle>
                <CardDescription className="text-xs text-[#5B473A]">
                  Prefer direct channels? Here's how else you can reach our team or get involved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-3">
                <div className="flex gap-3 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E7D9C3] text-[#B36A4C]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#334233]">Direct Email</h4>
                    <p className="text-xs text-[#5B473A] mt-0.5">Send a detailed email directly to support:</p>
                    <a
                      href="mailto:rootsandroutes.bothell@outlook.com"
                      className="text-xs font-semibold text-[#B36A4C] hover:underline block mt-1 break-all"
                    >
                      rootsandroutes.bothell@outlook.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-start border-t border-[#E7D9C3]/40 pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E7D9C3] text-[#B36A4C]">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#334233]">Contributor Portal</h4>
                    <p className="text-xs text-[#5B473A] mt-0.5">
                      Are you a local service provider? Sign up as a verified contributor to publish and update official resource listings directly.
                    </p>
                    <Link
                      to="/contributor-login"
                      className="text-xs font-semibold text-[#B36A4C] hover:underline block mt-1.5"
                    >
                      Access Contributor Login &rarr;
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help / FAQ Redirect card */}
            <Card className="border-[#E7D9C3] bg-[#EEF4E4]/40 backdrop-blur-sm shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4E4] text-[#334233] mb-4">
                  <HelpCircle className="h-5 w-5 text-[#6F7553]" />
                </div>
                <h4 className="text-lg font-semibold text-[#334233] font-['Cormorant_Garamond',serif] mb-1">
                  Looking for Step-by-Step Help?
                </h4>
                <p className="text-xs text-[#5B473A] leading-relaxed mb-4">
                  Check out our common questions, quick tutorials, and complete system user guides to quickly learn how to navigate and manage listings in Bothell's Resource Directory.
                </p>
                <Button asChild variant="outline" className="w-full border-[#A7AE8A] text-[#334233] hover:bg-[#A7AE8A]/20 rounded-xl py-2 text-xs">
                  <Link to="/help" className="inline-flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Visit Help Center
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>
    </div>
  );
}
