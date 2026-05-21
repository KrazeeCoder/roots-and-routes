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
              Represent your organization on Roots & Routes. Manage listings, track engagement, and help shape your community's resource network.
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
      <section className="relative pt-16 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* What is a Contributor */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              What is a Contributor?
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Contributors are representatives of organizations who help manage their organization's listings in the Roots & Routes directory. You gain access to a special Portal where you can create, edit, and publish resources and events without waiting for moderation.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#334233]">Who Should Apply?</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#5B473A]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Staff from nonprofits or community organizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Business or government agency representatives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Event organizers who manage regular programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Authorized individuals who can represent an organization</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7D9C3] text-[#334233]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#334233]">What You Get</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#5B473A]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Instant publishing (no moderation delays)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Manage multiple resources and events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Edit and update listings anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Access engagement analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mb-16 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Why Become a Contributor?
            </h2>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Increase Your Visibility</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    When community members search for support, they'll find your organization. Being in a trusted, organized directory means more people discovering your services.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Stay Up-to-Date</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Instantly update your hours, programs, services, or events. No waiting for moderation—changes go live immediately. When hours change or you launch a new program, update it right away.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Understand Your Impact</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Access engagement analytics to see how many people are viewing your listing, rating your services, and asking about your events. Learn what resonates with your community.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Build Community Trust</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    Being part of a curated community resource directory adds legitimacy. People know that Roots & Routes verifies organizations, which builds confidence in your services.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#334233]">Manage Multiple Listings</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                    If your organization runs multiple programs or operates from different locations, you can create and manage separate listings for each, keeping information organized and accurate.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sign-Up Process */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              How to Become a Contributor
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Follow these steps to sign up and get started:
            </p>

            <div className="mt-8 space-y-6">
              {/* Step 1 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Click "Sign Up as Contributor"</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Visit the Contributor Login page and click the sign-up link. You can also access this from the Help page or the Portal link in the main menu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Create Your Account</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Enter your email address and create a secure password. This will be your login for the Contributor Portal. Make sure to use an email you check regularly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Provide Organization Details</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Tell us about your organization: name, type, your role, contact information, and a brief description. This helps our team understand who you represent and verify your authenticity.
                    </p>
                    <div className="mt-3 text-xs font-semibold text-[#B36A4C]">Required information:</div>
                    <ul className="mt-2 space-y-1 text-sm text-[#5B473A]">
                      <li>✓ Your full name</li>
                      <li>✓ Your role in the organization</li>
                      <li>✓ Organization name</li>
                      <li>✓ Organization type (nonprofit, government, business, etc.)</li>
                      <li>✓ Organization contact details</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Submit for Approval</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Submit your application. Your account status will show as "Pending" while our team reviews your information. This typically takes 2-5 business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Get Approved</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Once approved, you'll receive an email confirmation. Your status will change to "Approved" in the Portal, and you'll have full access to create and manage listings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Start Managing Your Listings</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Log in to the Portal and start creating resources and events. Your listings go live immediately. You can edit them anytime, and they'll update in the Directory right away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Portal Features */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mb-16 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Your Portal Dashboard
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5B473A]">
              Once approved, you'll have access to a comprehensive dashboard where you can manage everything:
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[#E7D9C3] p-4">
                <h3 className="font-semibold text-[#334233]">Manage Resources</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                  <li>• Create new resources</li>
                  <li>• Edit existing listings</li>
                  <li>• Update descriptions and hours</li>
                  <li>• Upload images</li>
                  <li>• Publish or unpublish</li>
                </ul>
              </div>

              <div className="rounded-lg border border-[#E7D9C3] p-4">
                <h3 className="font-semibold text-[#334233]">Manage Events</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                  <li>• Create recurring or one-time events</li>
                  <li>• Set date, time, and location</li>
                  <li>• Add registration links</li>
                  <li>• Edit event details</li>
                  <li>• Archive past events</li>
                </ul>
              </div>

              <div className="rounded-lg border border-[#E7D9C3] p-4">
                <h3 className="font-semibold text-[#334233]">View Engagement</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                  <li>• See how many people viewed your listings</li>
                  <li>• Track community ratings and reviews</li>
                  <li>• Monitor engagement metrics</li>
                  <li>• Identify trending interest areas</li>
                </ul>
              </div>

              <div className="rounded-lg border border-[#E7D9C3] p-4">
                <h3 className="font-semibold text-[#334233]">Account Settings</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#5B473A]">
                  <li>• Update your profile</li>
                  <li>• Change your password</li>
                  <li>• Manage organization info</li>
                  <li>• View account status</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="mb-16 rounded-2xl border border-[#E7D9C3] bg-[#B36A4C]/10 p-8"
          >
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
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <h3 className="text-2xl font-semibold text-[#334233]">Common Questions</h3>
            <div className="mt-8 space-y-6">
              <div>
                <h4 className="font-semibold text-[#334233]">How long does approval take?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Usually 2-5 business days. We review each application to ensure it represents a legitimate organization. You'll receive an email when your account is approved.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">What if my application is rejected?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  We'll send you an explanation. Common reasons include incomplete information or being outside our service area. You can reach out to rootsandroutes.bothell@outlook.com to discuss and reapply.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Can multiple people from my organization be Contributors?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Yes. Each person creates their own account, but they all manage the same organization's listings. You can have multiple staff members accessing the Portal.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">What if I move to a different organization?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  You can update your account to represent your new organization. Contact our team or use the account settings to change your organization affiliation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Is there a cost to be a Contributor?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  No! Contributor status is completely free. We created Roots & Routes to strengthen the community, not to generate revenue. It's our gift to the Bothell community.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">What if I have more questions?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Email us at rootsandroutes.bothell@outlook.com with any questions about becoming a Contributor. We're here to help!
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-16 text-center"
          >
            <Link
              to="/contributor-login"
              className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
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
