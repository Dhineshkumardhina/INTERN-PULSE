/**
 * Utility to extract clean initials from a person's name.
 * Handles titles like Dr., Mr., Mrs., Ms. as well as initials like "V. ABINAYA".
 */
export function getInitials(name?: string, fallback = 'ST'): string {
  if (!name || !name.trim()) return fallback;
  // Remove academic / professional titles
  const cleaned = name
    .replace(/^(dr\.|dr|mr\.|mr|mrs\.|mrs|ms\.|ms|prof\.|prof)\s+/i, '')
    .trim();

  // Split on spaces and dots
  const parts = cleaned.split(/[\s.]+/).filter((p) => p.length > 0);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  // Take first character of first and last segment
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}
