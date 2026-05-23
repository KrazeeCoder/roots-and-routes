export type DetailNavigationState = {
  backTo: string;
  backLabel: string;
  breadcrumbLabel: string;
};

export const RESOURCE_DETAIL_DEFAULT_NAV: DetailNavigationState = {
  backTo: "/directory",
  backLabel: "Back to Resources",
  breadcrumbLabel: "Resource Hub",
};

export const RESOURCE_DETAIL_FROM_HOME_NAV: DetailNavigationState = {
  backTo: "/",
  backLabel: "Back to Home",
  breadcrumbLabel: "Home",
};

export const RESOURCE_DETAIL_FROM_SPOTLIGHTS_NAV: DetailNavigationState = {
  backTo: "/spotlights",
  backLabel: "Back to Highlights",
  breadcrumbLabel: "Highlights",
};

export const EVENT_DETAIL_DEFAULT_NAV: DetailNavigationState = {
  backTo: "/events",
  backLabel: "Back to Events",
  breadcrumbLabel: "Events",
};

export const EVENT_DETAIL_FROM_HOME_NAV: DetailNavigationState = {
  backTo: "/",
  backLabel: "Back to Home",
  breadcrumbLabel: "Home",
};

export const EVENT_DETAIL_FROM_CALENDAR_NAV: DetailNavigationState = {
  backTo: "/calendar",
  backLabel: "Back to Calendar",
  breadcrumbLabel: "Community Calendar",
};

export const EVENT_DETAIL_FROM_SPOTLIGHTS_NAV: DetailNavigationState = {
  backTo: "/spotlights",
  backLabel: "Back to Highlights",
  breadcrumbLabel: "Highlights",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeBackTo(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  return trimmed;
}

function sanitizeLabel(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function resolveDetailNavigationState(
  state: unknown,
  fallback: DetailNavigationState,
): DetailNavigationState {
  if (!isRecord(state)) return fallback;

  return {
    backTo: sanitizeBackTo(state.backTo, fallback.backTo),
    backLabel: sanitizeLabel(state.backLabel, fallback.backLabel),
    breadcrumbLabel: sanitizeLabel(state.breadcrumbLabel, fallback.breadcrumbLabel),
  };
}
