import { useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  ShieldCheck,
  Sprout,
  UserCheck2,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { TopoPattern } from "../components/TopoPattern";
import { ScrollReveal } from "../components/ScrollReveal";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type ContributorAccessStatus = "approved" | "pending" | "rejected" | "unknown";

const processSteps = [
  {
    title: "Open Contributor Login and choose Create Account",
    description:
      "Start on the contributor portal page and select Create Account to begin your application.",
    actionLabel: "Create Contributor Account",
    actionTo: "/contributor-login",
  },
  {
    title: "Complete your account application and verify your email",
    description:
      "Provide organization and contact information, then use the verification message sent to your inbox.",
    actionLabel: "Go to Contributor Login",
    actionTo: "/contributor-login",
  },
  {
    title: "Wait for administrator approval",
    description:
      "Our moderators review each account for accuracy and trust. Your dashboard shows whether your status is pending, approved, or rejected.",
    actionLabel: "Check Account Status",
    actionTo: "/portal",
  },
  {
    title: "Sign in and submit resources in Portal Resources",
    description:
      "Approved contributors can add and update listings in the portal where content is reviewed before publishing.",
    actionLabel: "Open Resource Management",
    actionTo: "/portal/resources",
  },
] as const;

const preparationItems = [
  "Organization name and public-facing contact details",
  "Program name, category, and short summary",
  "Who the resource serves and any eligibility requirements",
  "Operating hours, location, and access instructions",
  "Official website, email, and phone number when available",
] as const;

function isModerationRole(role: string | null | undefined) {
  return role === "moderator" || role === "super_admin";
}

function getContributorAccessStatus(
  role: string | null | undefined,
  profileStatus: "pending" | "approved" | "rejected" | undefined,
): ContributorAccessStatus {
  if (isModerationRole(role) || profileStatus === "approved") return "approved";
  if (profileStatus === "pending") return "pending";
  if (profileStatus === "rejected") return "rejected";
  return "unknown";
}

const statusConfigMap = {
  approved: {
    label: "Approved",
    title: "Signed in and ready to submit resources",
    description: "You have contributor access. Open Resource Management to create or edit listings.",
    primaryLabel: "Open Resource Management",
    primaryTo: "/portal/resources",
    secondaryLabel: "Go to Portal Dashboard",
    secondaryTo: "/portal",
    chipClass: "border-green-200 bg-green-50 text-green-800",
    icon: UserCheck2,
    iconClass: "text-green-700",
  },
  pending: {
    label: "Pending Approval",
    title: "Signed in, awaiting contributor approval",
    description:
      "Your application is under review. Once approved, you can submit resources in the portal.",
    primaryLabel: "Check Account Status",
    primaryTo: "/portal",
    secondaryLabel: "Browse Public Directory",
    secondaryTo: "/directory",
    chipClass: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock3,
    iconClass: "text-amber-700",
  },
  rejected: {
    label: "Not Approved",
    title: "Signed in, but contributor access is not approved",
    description:
      "Review your account status in the portal for next steps. You can still browse public resources.",
    primaryLabel: "Review Account Status",
    primaryTo: "/portal",
    secondaryLabel: "Browse Public Directory",
    secondaryTo: "/directory",
    chipClass: "border-red-200 bg-red-50 text-red-800",
    icon: XCircle,
    iconClass: "text-red-700",
  },
  unknown: {
    label: "Status Unavailable",
    title: "Signed in, checking contributor details",
    description:
      "We could not determine your contributor status yet. Visit your dashboard for the latest account state.",
    primaryLabel: "Go to Portal Dashboard",
    primaryTo: "/portal",
    secondaryLabel: "Browse Public Directory",
    secondaryTo: "/directory",
    chipClass: "border-slate-200 bg-slate-50 text-slate-800",
    icon: ShieldCheck,
    iconClass: "text-slate-700",
  },
} as const;

export function Suggest() {
  const { session, user, profile, role, loading } = useAuth();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const isSignedIn = Boolean(session);
  const contributorStatus = getContributorAccessStatus(role, profile?.status);
  const statusConfig = statusConfigMap[contributorStatus];
  const StatusIcon = statusConfig.icon;

  const displayName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "Contributor";
  const organizationName = profile?.organization_name || "Organization not set yet";
  const accountEmail = profile?.email || user?.email || "No email on file";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
        <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-20 pb-28">
          <div className="absolute inset-0 pointer-events-none opacity-70">
            <TopoPattern opacity={0.12} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/75 via-[#334233]/45 to-transparent" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B36A4C]/20 border border-[#B36A4C]/40 text-[#E7D9C3] text-sm font-medium mb-6">
                <Sprout className="w-4 h-4 text-[#B36A4C]" />
                Contributor Pathway
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Checking Your Contributor Access
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="rounded-2xl border border-[#E7D9C3]/40 bg-[#F6F1E7]/10 p-6 max-w-2xl">
                <p className="text-[#E7D9C3] text-base flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking your contributor access...
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none text-[#F6F1E7]">
            <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-14">
              <path d="M0,0 Q360,56 720,28 T1440,0 V56 H0 Z" fill="currentColor" />
            </svg>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-20 pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#334233]/75 via-[#334233]/45 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B36A4C]/20 border border-[#B36A4C]/40 text-[#E7D9C3] text-sm font-medium mb-6">
                <Sprout className="w-4 h-4 text-[#B36A4C]" />
                {isSignedIn ? "Contributor Access Confirmed" : "Contributor Pathway"}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                {isSignedIn ? (
                  <>
                    Your Suggestion Route Is <span className="text-[#B36A4C] italic">Signed In</span>
                  </>
                ) : (
                  <>
                    Plant a <span className="text-[#B36A4C] italic">Resource</span> Through Contributor Access
                  </>
                )}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-[#A7AE8A] text-lg font-light leading-relaxed max-w-3xl">
                {isSignedIn
                  ? `Signed in as ${displayName}. Contributor status is ${statusConfig.label.toLowerCase()}. ${statusConfig.description}`
                  : "Resource submissions are limited to approved contributors. This route keeps our directory accurate, trustworthy, and safe while giving every applicant a clear process to join."}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-3">
                {isSignedIn ? (
                  <>
                    <Button asChild className="focus-visible:ring-2 focus-visible:ring-[#F6F1E7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#334233]">
                      <Link to={statusConfig.primaryTo} className="inline-flex items-center gap-2">
                        {statusConfig.primaryLabel}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="border-[#E7D9C3] text-[#F6F1E7] bg-transparent hover:bg-[#F6F1E7] hover:text-[#334233] focus-visible:ring-2 focus-visible:ring-[#F6F1E7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#334233]"
                    >
                      <Link to={statusConfig.secondaryTo}>{statusConfig.secondaryLabel}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="focus-visible:ring-2 focus-visible:ring-[#F6F1E7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#334233]">
                      <Link to="/contributor-login" className="inline-flex items-center gap-2">
                        Create Contributor Account
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="border-[#E7D9C3] text-[#F6F1E7] bg-transparent hover:bg-[#F6F1E7] hover:text-[#334233] focus-visible:ring-2 focus-visible:ring-[#F6F1E7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#334233]"
                    >
                      <Link to="/contributor-login">Sign In</Link>
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  asChild
                  className="text-[#E7D9C3] hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#F6F1E7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#334233]"
                >
                  <Link to="/directory">Browse Public Directory</Link>
                </Button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="mt-5 rounded-xl border border-[#E7D9C3]/40 bg-[#F6F1E7]/10 p-4 max-w-3xl">
                <p className="text-sm text-[#E7D9C3]">
                  <span className="font-semibold text-[#F6F1E7]">TSA Judges:</span> Contributor login information for
                  submitting events is provided on the{" "}
                  <Link to="/contributor-login" className="underline underline-offset-4 hover:text-white">
                    Contributor Login page
                  </Link>
                  .
                </p>
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

      {isSignedIn ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ScrollReveal>
            <div className={`mb-8 rounded-2xl border p-5 ${statusConfig.chipClass}`} role="status" aria-live="polite">
              <div className="flex items-start gap-3">
                <StatusIcon className={`w-5 h-5 mt-0.5 ${statusConfig.iconClass}`} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">Signed in status</p>
                  <h2 className="text-lg font-semibold mt-1">{statusConfig.title}</h2>
                  <p className="text-sm mt-1">
                    Contributor status: <span className="font-semibold">{statusConfig.label}</span>
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <ScrollReveal>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-['Cormorant_Garamond',serif] text-3xl text-[#334233]">
                      Welcome Back, {displayName}
                    </CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      You are already signed in. Use your contributor route below instead of creating a new account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#6F7553]">Account email</p>
                      <p className="font-medium text-[#334233] break-words">{accountEmail}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7553]">Organization</p>
                      <p className="font-medium text-[#334233]">{organizationName}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7553]">Role</p>
                      <p className="font-medium text-[#334233] capitalize">{role || "contributor"}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7553]">Contributor status</p>
                      <p className="font-medium text-[#334233]">{statusConfig.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#334233]">Next Step on Your Route</CardTitle>
                    <CardDescription className="text-[#5B473A]">{statusConfig.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild>
                      <Link to={statusConfig.primaryTo} className="inline-flex items-center gap-2">
                        {statusConfig.primaryLabel}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <p className="text-sm text-[#5B473A]">
                      Need full account details? Visit your <Link to="/portal" className="underline hover:text-[#B36A4C]">portal dashboard</Link>.
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#334233]">Why Contributor Approval Is Required</CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      These safeguards keep the Roots & Routes directory reliable and safe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                      <ShieldCheck className="w-5 h-5 text-[#B36A4C]" />
                      <p className="mt-2 font-semibold text-[#334233]">Accuracy First</p>
                      <p className="text-sm text-[#5B473A] mt-1">
                        Verified contributors reduce outdated or incomplete listing information.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                      <Users className="w-5 h-5 text-[#B36A4C]" />
                      <p className="mt-2 font-semibold text-[#334233]">Community Safety</p>
                      <p className="text-sm text-[#5B473A] mt-1">
                        Account screening helps prevent misuse and protects community trust.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                      <ClipboardList className="w-5 h-5 text-[#B36A4C]" />
                      <p className="mt-2 font-semibold text-[#334233]">Moderation Quality</p>
                      <p className="text-sm text-[#5B473A] mt-1">
                        Review workflows keep published resources consistent and verifiable.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            <div className="space-y-8">
              <ScrollReveal delay={0.05}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#334233]">Quick Actions</CardTitle>
                    <CardDescription className="text-[#5B473A]">Routes for your current account status.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-between">
                      <Link to={statusConfig.primaryTo}>
                        {statusConfig.primaryLabel}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link to="/portal">
                        Go to Portal Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-between text-[#334233] hover:text-[#B36A4C]">
                      <Link to="/directory">
                        Browse Public Directory
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#334233]">What to Prepare</CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      Keep these details ready before submitting or updating a listing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3" aria-label="Contributor preparation checklist">
                      {preparationItems.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#6F7553] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[#5B473A]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <ScrollReveal>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-['Cormorant_Garamond',serif] text-3xl text-[#334233]">
                      Your Route to Suggest Resources
                    </CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      Follow these four steps to become an approved contributor and submit listings through the portal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4" aria-label="Contributor onboarding process">
                      {processSteps.map((step, index) => (
                        <li key={step.title} className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-5">
                          <div className="flex items-start gap-4">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#334233] text-[#F6F1E7] text-sm font-semibold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-[#334233]">{step.title}</h3>
                              <p className="text-sm text-[#5B473A] mt-1">{step.description}</p>
                              <Button
                                asChild
                                variant="link"
                                className="h-auto px-0 mt-2 text-[#334233] underline decoration-[#B36A4C] underline-offset-4 hover:text-[#B36A4C]"
                              >
                                <Link to={step.actionTo}>{step.actionLabel}</Link>
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#334233]">Why Contributor Approval Is Required</CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      This policy protects quality and trust across the Roots & Routes directory.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                      <ShieldCheck className="w-5 h-5 text-[#B36A4C]" />
                      <p className="mt-2 font-semibold text-[#334233]">Accuracy First</p>
                      <p className="text-sm text-[#5B473A] mt-1">
                        Approved contributors provide verifiable details, reducing outdated or incomplete listings.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                      <Users className="w-5 h-5 text-[#B36A4C]" />
                      <p className="mt-2 font-semibold text-[#334233]">Community Safety</p>
                      <p className="text-sm text-[#5B473A] mt-1">
                        Screening contributors helps prevent misuse and keeps the platform focused on public benefit.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E7D9C3] p-4 bg-[#F6F1E7]">
                      <ClipboardList className="w-5 h-5 text-[#B36A4C]" />
                      <p className="mt-2 font-semibold text-[#334233]">Moderation Quality</p>
                      <p className="text-sm text-[#5B473A] mt-1">
                        Structured review workflows keep submissions consistent and easier to verify before publication.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            <div className="space-y-8">
              <ScrollReveal delay={0.05}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#334233]">Quick Actions</CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      Use these links to move through the contributor process.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-between">
                      <Link to="/contributor-login">
                        Create Contributor Account
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link to="/contributor-login">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link to="/portal/resources">
                        Open Resource Management
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-between text-[#334233] hover:text-[#B36A4C]">
                      <Link to="/directory">
                        Browse Public Directory
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <Card className="border-[#E7D9C3] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#334233]">What to Prepare</CardTitle>
                    <CardDescription className="text-[#5B473A]">
                      Bring these details so your contributor account and future submissions can move quickly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3" aria-label="Contributor preparation checklist">
                      {preparationItems.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#6F7553] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[#5B473A]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
