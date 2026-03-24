import { Link } from "react-router";
import { Mail, PlusCircle } from "lucide-react";
import { ScrollReveal } from "../ScrollReveal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const MAILCHIMP_FORM_ACTION = "https://app.us15.list-manage.com/subscribe/post?u=1a4d66e4b7bf806af9a2a7a96&id=ed25e2a503&f_id=00d7a2e1f0";
const MAILCHIMP_HONEYPOT_NAME = "b_1a4d66e4b7bf806af9a2a7a96_ed25e2a503";

export function EmailSignupSection() {
  return (
    <section id="mailing-list" className="bg-[#E7D9C3]/30 py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-3xl border border-[#D9C6A8] bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B36A4C]/12 text-[#B36A4C] border border-[#B36A4C]/20">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#334233]">Join The Email List</h3>
                <p className="mt-2 text-sm text-[#5B473A]">
                  Get updates on local events and resources.
                </p>
              </div>
            </div>

            <form
              action={MAILCHIMP_FORM_ACTION}
              method="post"
              id="mc-embedded-subscribe-form-home"
              name="mc-embedded-subscribe-form-home"
              target="_blank"
              noValidate
              className="relative mt-6"
            >
              <Label htmlFor="mce-EMAIL-home" className="text-[#334233]">
                Email Address <span className="text-[#B36A4C]">*</span>
              </Label>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
                <Input
                  id="mce-EMAIL-home"
                  name="EMAIL"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 bg-white border-[#D9C6A8] focus-visible:border-[#A7AE8A]"
                />
                <Button type="submit" variant="default" className="h-11 px-6 bg-[#334233] hover:bg-[#B36A4C]">
                  Subscribe
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-6 border-[#334233] text-[#334233] hover:bg-[#334233] hover:text-[#F6F1E7]"
                >
                  <Link to="/suggest">
                    <PlusCircle className="w-4 h-4" />
                    Suggest a Resource
                  </Link>
                </Button>
              </div>

              <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                <input type="text" name={MAILCHIMP_HONEYPOT_NAME} tabIndex={-1} defaultValue="" />
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
