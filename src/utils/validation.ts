/**
 * Validates email addresses
 * @param email - Email address to validate
 * @returns Error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return null; // Optional field
  }
  
  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return "Please enter a valid email address (e.g., name@domain.com).";
  }
  
  return null;
}

/**
 * Validates phone numbers (US format)
 * @param phone - Phone number to validate
 * @returns Error message or null if valid
 */
export function validatePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    return null; // Optional field
  }
  
  // Remove common formatting characters
  const cleanPhone = trimmedPhone.replace(/[()\s\-\.]/g, '');
  
  // Check if it's a valid US phone number (10 or 11 digits starting with 1)
  const phonePattern = /^1?[2-9]\d{9}$/;
  if (!phonePattern.test(cleanPhone)) {
    return "Please enter a valid US phone number (e.g., 555-123-4567).";
  }
  
  return null;
}

/**
 * Validates URLs
 * @param url - URL to validate
 * @returns Error message or null if valid
 */
export function validateUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return null; // Optional field
  }
  
  try {
    // Add protocol if missing
    const urlToTest = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    const parsedUrl = new URL(urlToTest);
    
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return "Please enter a valid HTTP or HTTPS URL.";
    }
    
    // Check for placeholder domains
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'example.com' || hostname.endsWith('.example.com') || 
        hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return "URL cannot use placeholder domains like example.com or localhost.";
    }
    
    return null;
  } catch {
    return "Please enter a valid URL (e.g., https://www.example.com).";
  }
}

/**
 * Validates required text fields
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param minLength - Minimum length requirement
 * @returns Error message or null if valid
 */
export function validateRequired(value: string, fieldName: string, minLength: number = 1): string | null {
  if (!value || typeof value !== 'string') {
    return `${fieldName} is required.`;
  }
  
  const trimmedValue = value.trim();
  if (trimmedValue.length < minLength) {
    return `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''} long.`;
  }
  
  return null;
}

/**
 * Validates text field length
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param maxLength - Maximum length requirement
 * @returns Error message or null if valid
 */
export function validateMaxLength(value: string, fieldName: string, maxLength: number): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  if (value.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters.`;
  }
  
  return null;
}

/**
 * Validates zip codes (US format)
 * @param zipCode - Zip code to validate
 * @returns Error message or null if valid
 */
export function validateZipCode(zipCode: string): string | null {
  if (!zipCode || typeof zipCode !== 'string') {
    return null;
  }
  
  const trimmedZip = zipCode.trim();
  if (!trimmedZip) {
    return null; // Optional field
  }
  
  // US zip code pattern (5 digits or 5 digits + hyphen + 4 digits)
  const zipPattern = /^\d{5}(-\d{4})?$/;
  if (!zipPattern.test(trimmedZip)) {
    return "Please enter a valid US ZIP code (e.g., 98011 or 98011-1234).";
  }
  
  return null;
}
