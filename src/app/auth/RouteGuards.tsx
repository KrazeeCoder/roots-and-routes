import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import { isModerator } from "../data/portalApi";

function GuardLoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-[#334233] bg-[#F6F1E7]">
      <p className="text-sm font-medium">Checking access...</p>
    </div>
  );
}

export function RequireAuth({ children }: PropsWithChildren) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <GuardLoadingState />;
  if (!session) {
    return <Navigate to="/contributor-login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireModerator({ children }: PropsWithChildren) {
  const { role, loading } = useAuth();

  if (loading) return <GuardLoadingState />;
  if (!isModerator(role)) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}