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
      <section className="relative pt-16 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Why Submit */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              Why Share a Resource?
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Your contribution helps build a stronger, more connected community.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="flex gap-4 items-start">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#334233]">Help people find support they need</p>
                  <p className="text-sm text-[#5B473A]">Neighbors searching for resources will discover the service or event you recommend.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#334233]">Give the organization visibility</p>
                  <p className="text-sm text-[#5B473A]">Local nonprofits, businesses, and agencies benefit from being featured in our directory.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#B36A4C] text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#334233]">Strengthen Bothell's community network</p>
                  <p className="text-sm text-[#5B473A]">Every submission makes Roots & Routes more complete and helpful for everyone.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What You Can Submit */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mb-16 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              What Can You Submit?
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5B473A]">
              You can suggest either a Resource or an Event. Here's what we accept:
            </p>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold text-[#334233]">Resources</h3>
                <p className="mt-3 text-sm text-[#5B473A]">
                  Local organizations, services, or programs that offer ongoing support. Examples include:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[#5B473A]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Food pantries, meal programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Mental health or counseling services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Housing or emergency assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Job training or employment services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Youth programs or tutoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Community centers or recreation facilities</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#334233]">Events</h3>
                <p className="mt-3 text-sm text-[#5B473A]">
                  One-time or recurring events happening in the community. Examples include:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[#5B473A]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Workshops and educational seminars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Support group meetings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Community celebrations or festivals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Youth activities or sports leagues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Classes or fitness sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B36A4C] font-bold">•</span>
                    <span>Volunteer or service opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Step-by-Step */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight font-['Cormorant_Garamond',serif] text-[#334233]">
              How to Submit
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5B473A]">
              Follow these steps to submit a resource or event:
            </p>

            <div className="mt-8 space-y-6">
              {/* Step 1 */}
              <div className="rounded-2xl border border-[#E7D9C3] bg-white p-6">
                <div className="flex gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C] text-white font-semibold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#334233]">Click "Submit Now"</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Visit the Suggest page from the main menu or the Help center. Choose whether you're submitting a Resource or an Event.
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
                    <h3 className="text-lg font-semibold text-[#334233]">Fill in Basic Information</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Enter the name, description, address, and contact details (phone/email/website). Be clear and specific so people understand what the organization or event offers.
                    </p>
                    <div className="mt-3 text-xs font-semibold text-[#B36A4C]">Required fields:</div>
                    <ul className="mt-2 space-y-1 text-sm text-[#5B473A]">
                      <li>✓ Name of resource/event</li>
                      <li>✓ Description of what it is and who it serves</li>
                      <li>✓ Address or location</li>
                      <li>✓ At least one contact method (phone, email, or website)</li>
                    </ul>
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
                    <h3 className="text-lg font-semibold text-[#334233]">Add Details & Category</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      For Resources: Select the category that best fits (Food Assistance, Health & Wellness, etc.), add hours of operation, and any tags that describe the service.
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      For Events: Add the date, time, duration, and specify if it's recurring or one-time.
                    </p>
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
                    <h3 className="text-lg font-semibold text-[#334233]">Review & Submit</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Double-check all information for accuracy. Make sure contact details are correct so people can actually reach the organization. Then click Submit!
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
                    <h3 className="text-lg font-semibold text-[#334233]">Our Team Reviews Your Submission</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Your suggestion enters our moderation queue. Our community team will verify the details and check that the resource or event meets our guidelines. This typically takes 3-7 business days.
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
                    <h3 className="text-lg font-semibold text-[#334233]">It Goes Live!</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                      Once approved, the resource or event appears in our Directory and Events page. It's now discoverable by everyone in the community!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mb-16 rounded-2xl border border-[#E7D9C3] bg-white p-8 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-[#B36A4C]" />
              <h3 className="text-xl font-semibold text-[#334233]">What to Expect Timeline</h3>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex gap-4">
                <div className="font-semibold text-[#B36A4C] w-24">Immediately</div>
                <div className="text-[#5B473A]">You'll see a confirmation that your submission was received</div>
              </div>
              <div className="flex gap-4">
                <div className="font-semibold text-[#B36A4C] w-24">1-2 days</div>
                <div className="text-[#5B473A]">Our team begins verifying your information</div>
              </div>
              <div className="flex gap-4">
                <div className="font-semibold text-[#B36A4C] w-24">3-7 days</div>
                <div className="text-[#5B473A]">Your submission is approved and published to the directory</div>
              </div>
              <div className="flex gap-4">
                <div className="font-semibold text-[#B36A4C] w-24">Ongoing</div>
                <div className="text-[#5B473A]">Your resource or event is now discoverable and searchable</div>
              </div>
            </div>
          </motion.div>

          {/* Tips for Success */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="mb-16 rounded-2xl border border-[#E7D9C3] bg-[#F6F1E7] p-8"
          >
            <h3 className="text-2xl font-semibold text-[#334233]">Tips for a Successful Submission</h3>
            <div className="mt-6 space-y-4">
              <div>
                <p className="font-semibold text-[#334233]">✓ Be Specific</p>
                <p className="text-sm text-[#5B473A]">
                  Don't just say "community services." Explain exactly what the organization does: "provides free job training for adults over 55" is much more helpful than just "job help."
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#334233]">✓ Verify Contact Info</p>
                <p className="text-sm text-[#5B473A]">
                  Double-check phone numbers, emails, and websites before submitting. Bad contact info hurts the organization and frustrates people trying to reach them.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#334233]">✓ Include Hours</p>
                <p className="text-sm text-[#5B473A]">
                  For resources, always include hours of operation. If it's available 24/7 or by appointment only, say so. This helps people know when they can access the service.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#334233]">✓ Use Accurate Addresses</p>
                <p className="text-sm text-[#5B473A]">
                  Make sure the address is where people should actually go. Don't use mailing addresses unless that's where services are provided.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#334233]">✓ For Events: Be Clear About Details</p>
                <p className="text-sm text-[#5B473A]">
                  Include start time, end time, whether it's online or in-person, and if registration is required. The more details, the better!
                </p>
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
                <h4 className="font-semibold text-[#334233]">Do I need to be a contributor to submit?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  No! Anyone can submit a resource or event. You don't need an account. However, if you represent the organization and want ongoing management access, you can apply to become a Contributor.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">What if my submission is rejected?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  If your submission doesn't meet our guidelines, we'll let you know why. Common reasons include inaccurate information or the resource being outside our service area. You can revise and resubmit.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Can I update a listing after it's been published?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  If you're a Contributor for that organization, you can update listings anytime from the Portal. If you submitted it as a public user, contact our team at rootsandroutes.bothell@outlook.com to request updates.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">Can I submit on behalf of someone else's organization?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Yes, but the organization should ideally verify it. If you're submitting on behalf of an organization, make sure all details are accurate and authorized. For ongoing management, we recommend they apply to become a Contributor.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#334233]">How do I know if something's already in the directory?</h4>
                <p className="mt-2 text-sm leading-7 text-[#5B473A]">
                  Search the Directory first! If you find a duplicate, you can reach out to let us know. We combine duplicates to keep the directory clean and organized.
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
              to="/suggest"
              className="inline-flex items-center justify-center rounded-full bg-[#B36A4C] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#934a3f] transition-colors"
            >
              Submit a Resource or Event
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
