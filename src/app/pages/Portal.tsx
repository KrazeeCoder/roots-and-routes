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

  return (
    <PortalShell
      title="Portal Overview"
      description="Create and manage your resources and events. Published content appears on the public site automatically."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B36A4C]" /> Resources
            </CardTitle>
            <CardDescription>Add or update community resource listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/portal/resources">Manage Resources</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#E7D9C3]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#B36A4C]" /> Events
            </CardTitle>
            <CardDescription>Create event postings and update schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/portal/events">Manage Events</Link>
            </Button>
          </CardContent>
        </Card>

        {canModerate ? (
          <Card className="border-[#E7D9C3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B36A4C]" /> Moderation
              </CardTitle>
              <CardDescription>Review pending and rejected submissions across contributors.</CardDescription>
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
          <CardTitle>Contributor account</CardTitle>
          <CardDescription>Profile details currently attached to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#6F7553]">Organization</p>
            <p className="font-medium text-[#334233]">{profile?.organization_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-[#6F7553]">Display Name</p>
            <p className="font-medium text-[#334233]">{profile?.display_name || "Not set"}</p>
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
