const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return (url.protocol === "http:" || url.protocol === "https:") && URL_PATTERN.test(trimmed);
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  return value.trim();
}

export function hasLink(value: string | undefined | null): value is string {
  return Boolean(value && value.trim());
}
