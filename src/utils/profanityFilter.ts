// Keep this list narrow to avoid substring false positives (for example, "Bothell" should not match "hell").
const blockedWords = [
  "bastard",
  "bitch",
  "whore",
  "slut",
  "asshole",
  "fuck",
  "shit",
  "pussy",
  "cunt",
  "twat",
] as const;

const leetAlternates: Record<string, string> = {
  a: "a@4",
  b: "b8",
  e: "e3",
  i: "i!1|",
  l: "l1|!",
  o: "o0",
  s: "s$5",
  t: "t7+",
};

const mobileFormattingPattern = /[\u200B-\u200D\uFEFF]/g;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(text: string) {
  return text
    .normalize("NFKC")
    .replace(mobileFormattingPattern, "")
    .toLowerCase();
}

function buildFlexibleWordPattern(word: string) {
  const letters = [...word].map((letter) => {
    const alternates = leetAlternates[letter];
    return alternates ? `[${escapeRegExp(alternates)}]` : escapeRegExp(letter);
  });

  return new RegExp(`(^|[^a-z0-9])${letters.join("[^a-z0-9]*")}(?=$|[^a-z0-9])`, "i");
}

const blockedWordPatterns = blockedWords.map(buildFlexibleWordPattern);

/**
 * Checks if text contains profanity.
 */
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  const normalized = normalizeText(text);
  return blockedWordPatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Cleans profanity from text by replacing blocked words with asterisks.
 */
export function cleanProfanity(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  return blockedWordPatterns.reduce(
    (cleaned, pattern) => cleaned.replace(pattern, (match, prefix = "") => `${prefix}${"*".repeat(match.length - prefix.length)}`),
    text,
  );
}

/**
 * Validates text and returns an error message if profanity is found.
 */
export function validateProfanity(text: string, fieldName: string): string | null {
  if (containsProfanity(text)) {
    return `${fieldName} contains inappropriate language. Please revise and try again.`;
  }
  return null;
}

/**
 * Sanitizes form data by cleaning profanity from all string fields.
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized: Record<string, unknown> = { ...data };

  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key];
    if (typeof value === "string") {
      sanitized[key] = cleanProfanity(value);
    }
  });

  return sanitized as T;
}
