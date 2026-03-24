import { Navigate, useLocation } from "react-router";

export function WaypointsRedirect() {
  const location = useLocation();
  return <Navigate to={`/directory${location.search}`} replace />;
}
