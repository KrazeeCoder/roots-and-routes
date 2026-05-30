import { Link } from "react-router";
import { ArrowLeft, ArrowRight, UserPlus, CheckCircle, Lock, FileText, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";

export function GuideBecomeContributor() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#334233]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#334233] text-[#F6F1E7] pt-24 pb-16">
        <div className="absolute inset-0 opacity-20">
          <TopoPattern opacity={0.12} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-[#E7D9C3]/40 bg-[#B36A4C]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#E7D9C3]"
            >
              <UserPlus className="h-4 w-4" />
              Contributor Guide
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-8 text-4xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] sm:text-5xl"
            >
              Become a Community Contributor
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#E7D9C3]/90"
            >
              Represent your organization on Roots & Routes. Manage listings, publish approved updates, and help shape your community's resource network.
            </motion.p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/help"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E7D9C3]/40 bg-white px-5 py-2 text-sm font-semibold text-[#334233] shadow-sm hover:bg-[#F6F1E7] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Help
              </Link>
              <Link
                to="/contributor-login"
                className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
              >
                Sign Up as Contributor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-start gap-12">
            
            {/* Sticky Sidebar Navigation */}
            <div className="hidden lg:block lg:col-span-3 lg:self-start">
              <div className="sticky top-28 space-y-8">
                <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B36A4C] mb-4">Guide Sections</p>
                  <nav className="space-y-4">
                    {[
                      { num: "01", label: "What is a Contributor", href: "#what-is-a-contributor" },
                      { num: "02", label: "Benefits", href: "#benefits" },
                      { num: "03", label: "How to Sign Up", href: "#how-to-sign-up" },
                      { num: "04", label: "Common Questions", href: "#common-questions" },
                    ].map((step) => (
                      <a
                        key={step.num}
                        href={step.href}
                        className="group flex items-center gap-3 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#334233]/40"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7D9C3] bg-[#F6F1E7] text-xs font-semibold text-[#334233] transition-colors group-hover:border-[#334233] group-hover:bg-[#334233] group-hover:text-white">
                          {step.num}
                        </span>
                        <span className="text-sm font-medium text-[#5B473A] transition-colors group-hover:text-[#334233]">
                          {step.label}
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="rounded-2xl border border-[#E7D9C3] bg-[#B36A4C]/10 p-6">
                  <h4 className="text-base font-semibold text-[#334233]">Need custom support?</h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#5B473A]">
                    If you have questions that aren't covered in this guide, our community team is here to assist.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors w-full"
                  >
                    Go to Contact Form
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-16">
              {/* What is a Contributor */}
              <motion.div
                id="what-is-a-contributor"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">01</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      What is a Contributor?
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Contributors are representatives of organizations who help manage their organization's listings in the Roots & Routes directory.
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B36A4C]/10 text-[#B36A4C]">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#334233]">Who Should Apply?</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                      Representatives of organizations who want to manage their listings directly.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                      {["Staff from nonprofits or community organizations", "Business or government agency representatives", "Event organizers who manage regular programs", "Authorized individuals who can represent an organization"].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B36A4C]/10 text-[#B36A4C]">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#334233]">What You Get</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                      Access to a dedicated portal for listing management and publishing.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                      {["Publish approved contributor listings directly", "Manage multiple resources and events", "Edit and update listings anytime", "Review rating feedback for your resources"].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div
                id="benefits"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">02</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Why Become a Contributor?
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Once approved, contributors can publish and manage their organization's listings directly.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  {[
                    { title: "Increase Your Visibility", desc: "When community members search for support, they'll find your organization. Being in a trusted, organized directory means more people discovering your services." },
                    { title: "Stay Up-to-Date", desc: "Update your hours, programs, services, or events from the portal so public listings stay current." },
                    { title: "Learn From Resource Feedback", desc: "Open the Feedback view in the portal to read rating reasons left for resources you manage." },
                    { title: "Build Community Trust", desc: "Being part of a curated community resource directory adds legitimacy. People know that Roots & Routes verifies organizations." },
                    { title: "Manage Multiple Listings", desc: "If your organization runs multiple programs or operates from different locations, you can create and manage separate listings for each." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 p-4 rounded-2xl hover:bg-[#F6F1E7]/60 transition-colors duration-300">
                      <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E7D9C3] text-[#334233] shadow-sm">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#334233]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#5B473A]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sign-Up Process */}
              <motion.div
                id="how-to-sign-up"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">03</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      How to Become a Contributor
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Follow these steps to sign up and get started:
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] space-y-8">
                  <h3 className="text-lg font-semibold text-[#334233]">The Sign-Up Process:</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {[
                      { title: "Click Sign Up", desc: "Visit the Contributor Login page and click the sign-up link from the Help page or main menu." },
                      { title: "Create Your Account", desc: "Enter your organization name, contact details, and a secure password." },
                      { title: "Provide Contributor Information", desc: "Add your name, phone, and email so moderators can review your request." },
                      { title: "Submit for Approval", desc: "Submit your application for moderator review." },
                      { title: "Get Approved", desc: "Once approved, you'll receive an email confirmation and full Portal access." },
                      { title: "Start Managing Listings", desc: "Log in to the portal and create or update resources and events." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-[#334233]">{item.title}</p>
                          <p className="text-xs text-[#5B473A] mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[#B36A4C]/20 bg-[#B36A4C]/5 p-6 border-l-4 border-l-[#B36A4C]">
                    <p className="text-sm leading-relaxed text-[#334233]">
                      <strong className="text-[#B36A4C]">Pro Tip:</strong> Make sure to use an email you check regularly. All approval notifications and important account updates will be sent there.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Portal Features */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-[#B36A4C]" />
                    <h3 className="text-xl font-semibold text-[#334233]">Your Portal Dashboard</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                    Once approved, you'll have access to a comprehensive dashboard where you can manage everything.
                  </p>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-[#E7D9C3] p-4">
                      <h3 className="font-semibold text-[#334233]">Manage Resources</h3>
                      <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                        <li>- Create new resources</li>
                        <li>- Edit existing listings</li>
                        <li>- Update descriptions, hours, and contact details</li>
                        <li>- Add image URLs for listings</li>
                        <li>- Publish listings or keep them as drafts</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-[#E7D9C3] p-4">
                      <h3 className="font-semibold text-[#334233]">Manage Events</h3>
                      <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                        <li>- Create event listings with date, time, and location</li>
                        <li>- Edit event details</li>
                        <li>- Save drafts or publish ready events</li>
                        <li>- Delete outdated events</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-[#E7D9C3] p-4">
                      <h3 className="font-semibold text-[#334233]">View Resource Feedback</h3>
                      <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                        <li>- Open Feedback on each resource</li>
                        <li>- Review community rating scores</li>
                        <li>- Read written rating reasons</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-[#E7D9C3] p-4">
                      <h3 className="font-semibold text-[#334233]">Account Overview</h3>
                      <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                        <li>- View organization details</li>
                        <li>- Check approval status</li>
                        <li>- Confirm your contributor role</li>
                        <li>- Use sign-in/reset pages for account access changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="rounded-3xl border border-[#E7D9C3] bg-[#B36A4C]/10 p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  <div className="flex items-start gap-3">
                    <Lock className="h-6 w-6 text-[#B36A4C] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-[#334233]">Contributor Requirements & Policies</h3>
                      <div className="mt-4 space-y-3 text-sm text-[#5B473A]">
                        <p>
                          <strong>Eligibility:</strong> You must represent a legitimate organization, nonprofit, government agency, or business. Personal accounts cannot become Contributors.
                        </p>
                        <p>
                          <strong>Accuracy:</strong> All information you provide must be accurate and up-to-date. Intentionally providing false information may result in account suspension.
                        </p>
                        <p>
                          <strong>Appropriate Content:</strong> All listings must comply with community guidelines. We don't allow hate speech, discriminatory language, or misleading content.
                        </p>
                        <p>
                          <strong>Responsibility:</strong> You're responsible for keeping your organization's information current. Outdated or incorrect information reflects poorly on your organization.
                        </p>
                        <p>
                          <strong>Compliance:</strong> If you stop representing the organization or if your account is misused, we reserve the right to revoke Contributor status.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                id="common-questions"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">04</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Common Questions
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Have questions about becoming a Contributor? Find answers below.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { q: "How long does approval take?", a: "Approval timing can vary. Applications stay pending until a moderator reviews them, and you'll be notified when your status changes." },
                    { q: "What if my application is rejected?", a: "Contact the community team to review next steps and what information to correct before reapplying." },
                    { q: "Can multiple people from my organization be Contributors?", a: "Yes. Each person can create a contributor account. For coordinated access, your team should align with moderators on how listings are managed." },
                    { q: "What if I move to a different organization?", a: "Contact the community team to request account updates. Organization changes are handled through moderation, not a self-serve portal setting." },
                    { q: "Is there a cost to be a Contributor?", a: "No! Contributor status is completely free. We created Roots & Routes to strengthen the community, not to generate revenue. It's our gift to the Bothell community." },
                    { q: "What if I have more questions?", a: "Email us at rootsandroutes.bothell@outlook.com with any questions about becoming a Contributor. We're here to help!" },
                  ].map((faq) => (
                    <div key={faq.q} className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm hover:border-[#334233] transition-colors duration-300">
                      <h4 className="font-semibold text-base text-[#334233]">{faq.q}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-20 text-center border-t border-[#E7D9C3] pt-12"
          >
            <h3 className="text-2xl font-semibold font-['Cormorant_Garamond',serif] text-[#334233] mb-4">
              Ready to become a Contributor?
            </h3>
            <p className="text-sm text-[#5B473A] mb-8 max-w-md mx-auto">
              Apply for contributor access to manage your organization's listings once your account is approved.
            </p>
            <Link
              to="/contributor-login"
              className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-all duration-300 hover:shadow-lg"
            >
              Sign Up Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-[#5B473A]">
              Already have an account? <Link to="/contributor-login" className="font-semibold text-[#B36A4C] hover:text-[#334233]">Sign in here</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

