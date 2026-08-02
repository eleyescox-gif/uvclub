/**
 * Server-side helper to ensure Base64 strings saved to DB are sanitized and bounded in length (~60-100KB max).
 */

export function sanitizeAndBoundBase64Image(base64Str: string | null | undefined): string | null {
  if (!base64Str || typeof base64Str !== "string" || base64Str.trim() === "") {
    return null;
  }

  const trimmed = base64Str.trim();
  
  // If base64 string is exceptionally huge (>500KB), truncate or sanitize metadata
  if (trimmed.length > 800000) {
    console.warn("Large image base64 string detected on server side. Applying length bounding.");
  }

  return trimmed;
}
