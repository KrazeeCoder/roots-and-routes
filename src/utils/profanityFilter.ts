// Import profanity-filter with type assertion
import * as profanityFilter from 'profanity-filter';

// Keep custom additions narrow to avoid substring false positives (e.g., "Bothell" matching "hell").
const additionalWords = [
  'bastard',
  'bitch',
  'whore',
  'slut',
  'asshole',
  'fuck',
  'shit',
  'pussy',
  'cunt',
  'twat',
];

// Initialize the profanity filter with additional words
additionalWords.forEach(word => {
  try {
    profanityFilter.addWord(word);
  } catch (e) {
    // Word might already exist, ignore
  }
});

/**
 * Checks if text contains profanity
 * @param text - Text to check
 * @returns boolean indicating if profanity was found
 */
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  // Check if the cleaned text is different from original
  const cleaned = profanityFilter.clean(text);
  return cleaned !== text;
}

/**
 * Cleans profanity from text by replacing with asterisks
 * @param text - Text to clean
 * @returns Cleaned text with profanity replaced
 */
export function cleanProfanity(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  return profanityFilter.clean(text);
}

/**
 * Validates text and returns error message if profanity found
 * @param text - Text to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if clean
 */
export function validateProfanity(text: string, fieldName: string): string | null {
  if (containsProfanity(text)) {
    return `${fieldName} contains inappropriate language. Please revise and try again.`;
  }
  return null;
}

/**
 * Sanitizes form data by cleaning profanity from all string fields
 * @param data - Form data object
 * @returns Sanitized form data
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized: Record<string, any> = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    if (typeof value === 'string') {
      sanitized[key] = cleanProfanity(value);
    }
  });
  
  return sanitized as T;
}
