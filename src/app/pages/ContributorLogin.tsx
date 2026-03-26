import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { KeyRound, Mail, Sparkles, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
  getFriendlyAuthError,
  sendContributorPasswordReset,
  signInContributor,
  signUpContributor,
} from "../data/portalApi";
import { useAuth } from "../auth/AuthProvider";
import { validateProfanity } from "../../utils/profanityFilter";
import { validateEmail, validatePhone, validateRequired, validateMaxLength } from "../../utils/validation";

type AuthMode = "signin" | "signup" | "forgot";

interface SignUpState {
  organizationName: string;
  displayName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const defaultSignUp: SignUpState = {
  organizationName: "",
  displayName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function ContributorLogin() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUp, setSignUp] = useState<SignUpState>(defaultSignUp);
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  const redirectPath = useMemo(() => {
    const fromPath = (location.state as { from?: string } | null)?.from;
    return fromPath || "/portal";
  }, [location.state]);

  useEffect(() => {
    if (session) {
      void navigate("/portal", { replace: true });
    }
  }, [session, navigate]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await signInContributor(email, password);
      void navigate(redirectPath, { replace: true });
    } catch (nextError) {
      setError(getFriendlyAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    // Validate required fields
    const orgError = validateRequired(signUp.organizationName, "Organization name");
    const firstNameError = validateRequired(signUp.firstName, "First name");
    const lastNameError = validateRequired(signUp.lastName, "Last name");
    const emailError = validateRequired(signUp.email, "Email");
    const phoneError = validateRequired(signUp.phone, "Phone");

    // Validate profanity in text fields
    const profanityOrgError = validateProfanity(signUp.organizationName, "Organization name");
    const profanityDisplayError = validateProfanity(signUp.displayName, "Display name");
    const profanityFirstNameError = validateProfanity(signUp.firstName, "First name");
    const profanityMiddleNameError = validateProfanity(signUp.middleName, "Middle name");
    const profanityLastNameError = validateProfanity(signUp.lastName, "Last name");

    // Validate input formats
    const emailFormatError = validateEmail(signUp.email);
    const phoneFormatError = validatePhone(signUp.phone);

    // Validate length constraints
    const orgLengthError = validateMaxLength(signUp.organizationName, "Organization name", 200);
    const displayLengthError = validateMaxLength(signUp.displayName, "Display name", 100);
    const firstNameLengthError = validateMaxLength(signUp.firstName, "First name", 50);
    const middleNameLengthError = validateMaxLength(signUp.middleName, "Middle name", 50);
    const lastNameLengthError = validateMaxLength(signUp.lastName, "Last name", 50);

    // Check for any validation errors
    const firstError = orgError || firstNameError || lastNameError || emailError || phoneError ||
                       profanityOrgError || profanityDisplayError || profanityFirstNameError || profanityMiddleNameError || profanityLastNameError ||
                       emailFormatError || phoneFormatError ||
                       orgLengthError || displayLengthError || firstNameLengthError || middleNameLengthError || lastNameLengthError;

    if (firstError) {
      setError(firstError);
      setSubmitting(false);
      return;
    }

    if (signUp.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }

    if (signUp.password !== signUp.confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      const result = await signUpContributor({
        organizationName: signUp.organizationName,
        displayName: signUp.displayName,
        firstName: signUp.firstName,
        middleName: signUp.middleName,
        lastName: signUp.lastName,
        email: signUp.email,
        phone: signUp.phone,
        password: signUp.password,
      });

      if (result.session) {
        void navigate("/portal", { replace: true });
        return;
      }

      setMessage("Account created. Your account is pending moderator approval. After approval, you can publish official resources and events directly. Check your email to verify your address first.");
      setMode("signin");
      setEmail(signUp.email);
      setPassword("");
    } catch (nextError) {
      setError(getFriendlyAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await sendContributorPasswordReset(forgotEmail);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (nextError) {
      setError(getFriendlyAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#6F7553]">Roots & Routes</p>
          <h1 className="font-['Cormorant_Garamond',serif] text-5xl font-bold text-[#334233]">
            Moderator & Contributor Portal
          </h1>
          <p className="mt-3 text-[#5B473A] max-w-2xl mx-auto">
            Moderators and approved contributors manage official local resources and events. Public browsing and public proposal forms remain open for everyone.
          </p>
          <p className="mt-3 text-[#000000] max-w-2xl mx-auto">
            Note for TSA Judges: Please use the "Demo Credentials" on the right to access a pre-approved contributor account or moderator account for evaluation. 
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-14 gap-6 items-start">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-[#E7D9C3] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-[#334233]">Role Information</CardTitle>
                <CardDescription className="text-xs text-[#5B473A]">
                  Learn about different access levels
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#A7AE8A]/5 border border-[#A7AE8A]/30 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <UserRound className="w-4 h-4 text-[#A7AE8A]" />
                      <p className="font-bold text-[#334233] text-xs uppercase tracking-wider">Contributor</p>
                    </div>
                    <p className="text-[#5B473A] text-xs leading-relaxed">
                      Verified organizations and community partners that can create and edit official resources/events. Published contributor content goes live immediately.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#B36A4C]/5 border border-[#B36A4C]/30 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#B36A4C]" />
                      <p className="font-bold text-[#334233] text-xs uppercase tracking-wider">Moderator</p>
                    </div>
                    <p className="text-[#5B473A] text-xs leading-relaxed">
                      Approves new contributor accounts, reviews public resource/event proposals, and oversees all official platform content.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card className="border-[#E7D9C3] bg-white shadow-sm">
              <CardHeader>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant={mode === "signin" ? "default" : "outline"}
                    onClick={() => setMode("signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "signup" ? "default" : "outline"}
                    onClick={() => setMode("signup")}
                  >
                    Create Account
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "forgot" ? "default" : "outline"}
                    onClick={() => setMode("forgot")}
                  >
                    Forgot Password
                  </Button>
                </div>
                <CardTitle className="mt-4">
                  {mode === "signin" && "Sign in to your contributor account"}
                  {mode === "signup" && "Create a contributor account"}
                  {mode === "forgot" && "Reset your password"}
                </CardTitle>
                <CardDescription>
                  {mode === "signin" && "Use your contributor credentials."}
                  {mode === "signup" && "New accounts default to contributor role and require approval before direct publishing is unlocked."}
                  {mode === "forgot" && "We'll send a secure reset link to your email."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {message ? <p className="text-sm text-[#334233]">{message}</p> : null}

                {mode === "signin" ? (
                  <form className="space-y-4" onSubmit={handleSignIn}>
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                      <KeyRound className="w-4 h-4" /> {submitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                ) : null}

                {mode === "signup" ? (
                  <form className="space-y-4" onSubmit={handleSignUp}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-org">Organization name</Label>
                        <Input
                          id="signup-org"
                          value={signUp.organizationName}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, organizationName: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-display">Display name (optional)</Label>
                        <Input
                          id="signup-display"
                          value={signUp.displayName}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, displayName: event.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="signup-first">First name</Label>
                        <Input
                          id="signup-first"
                          value={signUp.firstName}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, firstName: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-middle">Middle name</Label>
                        <Input
                          id="signup-middle"
                          value={signUp.middleName}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, middleName: event.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-last">Last name</Label>
                        <Input
                          id="signup-last"
                          value={signUp.lastName}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, lastName: event.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          value={signUp.email}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, email: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-phone">Phone</Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          value={signUp.phone}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, phone: event.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          autoComplete="new-password"
                          value={signUp.password}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, password: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-confirm">Confirm password</Label>
                        <Input
                          id="signup-confirm"
                          type="password"
                          autoComplete="new-password"
                          value={signUp.confirmPassword}
                          onChange={(event) => setSignUp((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      <UserRound className="w-4 h-4" /> {submitting ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                ) : null}

                {mode === "forgot" ? (
                  <form className="space-y-4" onSubmit={handleForgot}>
                    <div>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                      <Mail className="w-4 h-4" /> {submitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-[#B36A4C]/30 bg-[#B36A4C]/5 shadow-sm overflow-hidden">
              <CardHeader className="bg-[#B36A4C]/10 py-4">
                <CardTitle className="text-base font-semibold text-[#334233] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B36A4C]" />
                  Demo Credentials
                </CardTitle>
                <CardDescription className="text-xs text-[#5B473A]">
                  Judges & Reviewers: Use these for quick access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-[#E7D9C3] text-sm shadow-sm hover:border-[#B36A4C]/50 transition-colors">
                    <p className="font-bold text-[#334233] text-[10px] uppercase tracking-wider mb-2 text-[#A7AE8A]">Contributor Access</p>
                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-[10px] font-semibold text-[#5B473A] mb-1">Username:</p>
                        <p className="font-mono text-[11px] break-all text-[#334233]">Rootsandroutes.bothell+1@outlook.com</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#5B473A] mb-1">Password:</p>
                        <p className="font-mono text-[11px] text-[#334233]">judges!!!</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full h-8 text-xs bg-[#334233] hover:bg-[#B36A4C]"
                      onClick={() => {
                        setMode("signin");
                        setEmail("Rootsandroutes.bothell+1@outlook.com");
                        setPassword("judges!!!");
                      }}
                    >
                      Autofill Contributor
                    </Button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E7D9C3] text-sm shadow-sm hover:border-[#B36A4C]/50 transition-colors">
                    <p className="font-bold text-[#334233] text-[10px] uppercase tracking-wider mb-2 text-[#B36A4C]">Moderator Access</p>
                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-[10px] font-semibold text-[#5B473A] mb-1">Username:</p>
                        <p className="font-mono text-[11px] break-all text-[#334233]">Rootsandroutes.bothell@outlook.com</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#5B473A] mb-1">Password:</p>
                        <p className="font-mono text-[11px] text-[#334233]">judges!!</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs border-[#B36A4C] text-[#334233] hover:bg-[#B36A4C]/10"
                      onClick={() => {
                        setMode("signin");
                        setEmail("Rootsandroutes.bothell@outlook.com");
                        setPassword("judges!!");
                      }}
                    >
                      Autofill Moderator
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E7D9C3] bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs text-[#6F7553] leading-relaxed">
                  Need to submit something without a contributor account? <Link to="/suggest" className="text-[#334233] underline hover:text-[#B36A4C]">Use the public resource/event proposal form</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
