import { Link } from "react-router";
import { CalendarDays, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PortalShell } from "../components/portal/PortalShell";
import { useAuth } from "../auth/AuthProvider";
import { isModerator } from "../data/portalApi";

export function Portal() {
  const { profile, role } = useAuth();
  const canModerate = isModerator(role);
  const isApproved = canModerate || profile?.status === "approved";
  const isPending = profile?.status === "pending";
  const isRejected = profile?.status === "rejected";

  return (
    <PortalShell
      title="Portal Overview"
      description="Approved contributors can publish resources and events directly. Public community submissions still go through moderator review."
    >
      {!canModerate && isPending && (
        <div className="mb-8 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Account Pending Approval</p>
            <p className="text-sm mt-1">
              Your contributor account is currently under review by our administrators.
              You will be able to manage resources and events once your account is approved.
            </p>
          </div>
        </div>
      )}

      {!canModerate && isRejected && (
        <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Account Not Approved</p>
            <p className="text-sm mt-1">
              Unfortunately, your contributor account application was not approved at this time. 
              Please contact the site administrators for more information.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className={`border-[#E7D9C3] ${!isApproved ? "opacity-60" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B36A4C]" /> Resources
            </CardTitle>
            <CardDescription>Create resource listings as drafts, publish them immediately, or archive outdated entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" disabled={!isApproved}>
              {isApproved ? (
                <Link to="/portal/resources">Manage Resources</Link>
              ) : (
                <span>Manage Resources (Locked)</span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className={`border-[#E7D9C3] ${!isApproved ? "opacity-60" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#B36A4C]" /> Events
            </CardTitle>
            <CardDescription>Create event postings as drafts, publish them immediately, or archive past listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" disabled={!isApproved}>
              {isApproved ? (
                <Link to="/portal/events">Manage Events</Link>
              ) : (
                <span>Manage Events (Locked)</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {canModerate ? (
          <Card className="border-[#E7D9C3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B36A4C]" /> Moderation
              </CardTitle>
              <CardDescription>Review public proposals, approve contributor accounts, and manage site content.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/portal/moderation">Open Moderation</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="mt-8 border-[#E7D9C3]">
        <CardHeader>
          <CardTitle>How publishing works</CardTitle>
          <CardDescription>The site now uses a dual-trust workflow.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-4">
            <p className="font-semibold text-[#334233]">Approved contributors</p>
            <p className="mt-2 text-[#5B473A]">Can create and update official resources and events that publish immediately when marked as published.</p>
          </div>
          <div className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-4">
            <p className="font-semibold text-[#334233]">Public users</p>
            <p className="mt-2 text-[#5B473A]">Can submit resource and event proposals from the public site, but those proposals stay pending until a moderator reviews them.</p>
          </div>
          <div className="rounded-xl border border-[#E7D9C3] bg-[#F6F1E7] p-4">
            <p className="font-semibold text-[#334233]">Moderators</p>
            <p className="mt-2 text-[#5B473A]">Approve contributor accounts, review public proposals, and manage the official content library.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 border-[#E7D9C3]">
        <CardHeader>
          <CardTitle>Contributor account</CardTitle>
          <CardDescription>Profile details currently attached to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#6F7553]">Organization</p>
            <p className="font-medium text-[#334233]">{profile?.organization_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-[#6F7553]">Status</p>
            <p className={`font-medium capitalize ${
              isApproved ? "text-green-700" : isRejected ? "text-red-700" : "text-amber-700"
            }`}>
              {profile?.status || "Pending"}
            </p>
          </div>
          <div>
            <p className="text-[#6F7553]">Contact</p>
            <p className="font-medium text-[#334233]">
              {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-[#6F7553]">Role</p>
            <p className="font-medium text-[#334233] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6F7553]" /> {role || "contributor"}
            </p>
          </div>
        </CardContent>
      </Card>
    </PortalShell>
  );
}
