/**
 * UI-only guidance for event categories. The database accepts any category text.
 */
export const EVENT_CATEGORY_SUGGESTIONS = [
  "Community Gathering",
  "Workshop / Class",
  "Festival",
  "Fundraiser",
  "Sports & Recreation",
  "Kids & Family",
  "Arts & Culture",
  "Food & Markets",
  "Government / Civic",
  "Volunteer Opportunity",
] as const;

export type EventCategorySuggestion = (typeof EVENT_CATEGORY_SUGGESTIONS)[number];
