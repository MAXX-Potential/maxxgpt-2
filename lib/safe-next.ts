/**
 * Safely validates and returns a redirect path from user input.
 * Protects against open redirect attacks by ensuring the path:
 * - Is a relative path starting with '/'
 * - Does not contain control characters
 * - Does not normalize to a protocol-relative or cross-origin URL
 * - Does not contain backslashes in the normalized pathname
 *
 * @param next - The user-provided next path (from query parameter)
 * @param origin - The trusted origin to validate against
 * @returns The safe path to redirect to, or '/' if validation fails
 */
export function safeNext(next: string | null, origin: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\') || /[\u0000-\u001F\u007F]/.test(next)) return '/'
  try {
    const u = new URL(next, origin)
    if (u.origin !== origin || u.pathname.startsWith('//') || u.pathname.includes('\\')) return '/'
    return u.pathname + u.search + u.hash
  } catch { return '/' }
}

/**
 * Gets the trusted site origin from environment variable or falls back to request origin.
 * Properly parses NEXT_PUBLIC_SITE_URL to extract just the origin.
 *
 * @param requestOrigin - The origin from the incoming request
 * @returns The trusted origin to use for redirect validation
 */
export function getTrustedOrigin(requestOrigin: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return requestOrigin
  
  try {
    return new URL(siteUrl).origin
  } catch {
    return requestOrigin
  }
}
