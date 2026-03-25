import { Navigate, useLocation } from "react-router";

export function ResourcesRedirect() {
  const location = useLocation();
  return <Navigate to={`/directory${location.search}`} replace />;
}
