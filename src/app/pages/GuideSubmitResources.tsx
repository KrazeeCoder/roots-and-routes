import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Clock, FileText } from "lucide-react";
import { motion } from "motion/react";
import { TopoPattern } from "../components/TopoPattern";

export function GuideSubmitResources() {
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
              <Sparkles className="h-4 w-4" />
              Submit Guide
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-8 text-4xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] sm:text-5xl"
            >
              Share a Resource with Your Community
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#E7D9C3]/90"
            >
              Know a great local service or event? Help others find it by suggesting it to our directory. It's quick, easy, and makes a real difference.
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
                to="/suggest"
                className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
              >
                Submit Now
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
            <div className="hidden lg:sticky lg:top-24 lg:col-span-3 lg:block lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto lg:pr-1 space-y-8">
                <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B36A4C] mb-4">Guide Sections</p>
                  <nav className="space-y-4">
                    {[
                      { num: "01", label: "What You Can Submit", href: "#what-you-can-submit" },
                      { num: "02", label: "How to Submit", href: "#how-to-submit" },
                      { num: "03", label: "Review Process", href: "#review-process" },
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

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-16">
              {/* Why Submit */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="border-b border-[#E7D9C3] pb-6 mb-8 flex items-start gap-4">
                  <div className="text-5xl font-['Cormorant_Garamond',serif] font-light text-[#B36A4C] leading-none">01</div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233] sm:text-3xl">
                      Why Share a Resource?
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Your contribution helps build a stronger, more connected community.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  {[
                    { title: "Help people find support they need", desc: "Neighbors searching for resources will discover the service or event you recommend." },
                    { title: "Give the organization visibility", desc: "Local nonprofits, businesses, and agencies benefit from being featured in our directory." },
                    { title: "Strengthen Bothell's community network", desc: "Every submission makes Roots & Routes more complete and helpful for everyone." },
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

              {/* What You Can Submit */}
              <motion.div
                id="what-you-can-submit"
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
                      What Can You Submit?
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      You can suggest either a Resource or an Event. Here's what we accept:
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B36A4C]/10 text-[#B36A4C]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#334233]">Resources</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                      Local organizations, services, or programs that offer ongoing support.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                      {["Food pantries, meal programs", "Mental health or counseling services", "Housing or emergency assistance", "Job training or employment services", "Youth programs or tutoring", "Community centers or recreation facilities"].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] hover:-translate-y-1 hover:border-[#334233] transition-all duration-300">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B36A4C]/10 text-[#B36A4C]">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#334233]">Events</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">
                      Community events with a specific date, time, and location.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[#5B473A]">
                      {["Workshops and educational seminars", "Support group meetings", "Community celebrations or festivals", "Youth activities or sports leagues", "Classes or fitness sessions", "Volunteer or service opportunities"].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-[#B36A4C] mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Step-by-Step */}
              <motion.div
                id="how-to-submit"
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
                      How to Submit
                    </h2>
                    <p className="mt-2 text-base text-[#5B473A]">
                      Follow these steps to submit a resource or event:
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)] space-y-8">
                  <h3 className="text-lg font-semibold text-[#334233]">The Submission Process:</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {[
                      { title: "Visit the Suggest Page", desc: "Choose whether you're submitting a Resource or an Event from the main menu or Help center." },
                      { title: "Fill in Basic Information", desc: "Enter name, description, address, and contact details (phone/email/website)." },
                      { title: "Add Details & Category", desc: "For Resources: select category, add hours, and tags. For Events: add category, start time, end time, and organizer details if available." },
                      { title: "Review & Submit", desc: "Double-check all information for accuracy, then click Submit." },
                      { title: "Team Review", desc: "Your proposal enters moderator review before it appears publicly." },
                      { title: "It Goes Live!", desc: "Once approved, your resource or event appears in the Directory and Events page." },
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
                      <strong className="text-[#B36A4C]">Pro Tip:</strong> Be specific and verify all contact information before submitting. Accurate details help people actually reach the organizations they need.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                id="review-process"
                className="scroll-mt-28"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="rounded-3xl border border-[#E7D9C3] bg-white p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-[#B36A4C]" />
                    <h3 className="text-xl font-semibold text-[#334233]">What to Expect Timeline</h3>
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    {[
                      { time: "After submit", desc: "You see a confirmation that your proposal was received." },
                      { time: "Pending review", desc: "Moderators review details and decide whether to approve or reject." },
                      { time: "After approval", desc: "Approved proposals are published to the public Directory or Events page." },
                      { time: "If updates are needed", desc: "Submit a corrected proposal or contact the team through the Contact page." },
                    ].map((item) => (
                      <div key={item.time} className="flex gap-4">
                        <div className="font-semibold text-[#B36A4C] w-24">{item.time}</div>
                        <div className="text-[#5B473A]">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Tips for Success */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="rounded-3xl border border-[#E7D9C3] bg-[#F6F1E7] p-8 shadow-[0_15px_30px_-15px_rgba(51,66,51,0.06)]">
                  <h3 className="text-2xl font-semibold text-[#334233]">Tips for a Successful Submission</h3>
                  <div className="mt-6 space-y-4">
                    {[
                      { title: "Be Specific", desc: "Don't just say 'community services.' Explain exactly what the organization does: 'provides free job training for adults over 55' is much more helpful than just 'job help.'" },
                      { title: "Verify Contact Info", desc: "Double-check phone numbers, emails, and websites before submitting. Bad contact info hurts the organization and frustrates people trying to reach them." },
                      { title: "Include Hours", desc: "For resources, always include hours of operation. If it's available 24/7 or by appointment only, say so. This helps people know when they can access the service." },
                      { title: "Use Accurate Addresses", desc: "Make sure the address is where people should actually go. Don't use mailing addresses unless that's where services are provided." },
                      { title: "For Events: Be Clear About Timing", desc: "Include start time and end time, plus clear location details so attendees can plan." },
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
                      Have questions about submitting resources or events? Find answers below.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { q: "Do I need to be a contributor to submit?", a: "No! Anyone can submit a resource or event. You don't need an account. However, if you represent the organization and want ongoing management access, you can apply to become a Contributor." },
                    { q: "What happens after I submit?", a: "Your proposal stays pending until a moderator reviews it. It only appears publicly after approval." },
                    { q: "Can I update a listing after it's been published?", a: "Approved contributors can manage their own portal listings directly. Public users should submit a corrected proposal or use the Contact page." },
                    { q: "Can I submit on behalf of someone else's organization?", a: "Yes, but the organization should ideally verify it. If you're submitting on behalf of an organization, make sure all details are accurate and authorized. For ongoing management, we recommend they apply to become a Contributor." },
                    { q: "How do I know if something's already in the directory?", a: "Search the Directory first! If you find a duplicate, you can reach out to let us know. We combine duplicates to keep the directory clean and organized." },
                  ].map((faq) => (
                    <div key={faq.q} className="rounded-2xl border border-[#E7D9C3] bg-white p-6 shadow-sm hover:border-[#334233] transition-colors duration-300">
                      <h4 className="font-semibold text-base text-[#334233]">{faq.q}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-[#5B473A]">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mt-20 text-center border-t border-[#E7D9C3] pt-12"
              >
                <h3 className="text-2xl font-semibold font-['Cormorant_Garamond',serif] text-[#334233] mb-4">
                  Ready to share a resource?
                </h3>
                <p className="text-sm text-[#5B473A] mb-8 max-w-md mx-auto">
                  Help your community discover local services and events by submitting them to our directory.
                </p>
                <Link
                  to="/suggest"
                  className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-all duration-300 hover:shadow-lg"
                >
                  Submit a Resource or Event
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
