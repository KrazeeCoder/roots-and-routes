import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { getFriendlyAuthError, updateContributorPassword } from "../data/portalApi";

export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await updateContributorPassword(password);
      setMessage("Password updated. You can sign in now.");
      setTimeout(() => {
        void navigate("/contributor-login");
      }, 1200);
    } catch (nextError) {
      setError(getFriendlyAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="border-[#E7D9C3] bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>Set a new password for your contributor account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {message ? <p className="text-sm text-[#334233]">{message}</p> : null}

              <div>
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <KeyRound className="w-4 h-4" />
                {submitting ? "Updating..." : "Update password"}
              </Button>
            </form>

            <p className="mt-5 text-xs text-[#6F7553]">
              Back to <Link to="/contributor-login" className="underline text-[#334233]">Contributor Portal sign in</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
