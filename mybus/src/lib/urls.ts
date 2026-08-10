/**
 * Accepts only clean same-origin paths for post-auth redirects.
 * Rejects protocol-relative ("//host"), backslash-normalized ("/\\host",
 * which browsers resolve to "//host"), and control characters.
 */
export function sanitizeNextPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!/^\/(?![/\\])/.test(value)) return undefined;
  if (/[\\\x00-\x1f]/.test(value)) return undefined;
  return value;
}
