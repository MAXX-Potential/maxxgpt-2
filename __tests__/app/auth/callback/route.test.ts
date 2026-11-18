/**
 * @jest-environment node
 */

import { safeNext, getTrustedOrigin } from '@/lib/safe-next'

describe('safeNext - Open Redirect Protection', () => {
  const origin = 'https://example.com'

  const testCases: Array<[string | null, string, string]> = [
    // [input, expected, description]
    ['/chat', '/chat', 'valid relative path'],
    ['/en/chat?x=1', '/en/chat?x=1', 'valid path with query string'],
    ['//evil.com', '/', 'protocol-relative URL'],
    ['/\\evil.com', '/', 'backslash variant'],
    ['@evil.com', '/', 'at-sign prefix'],
    ['/\t/evil.com', '/', 'tab character (control char)'],
    ['https://evil.com', '/', 'absolute URL different origin'],
    ['javascript:alert(1)', '/', 'javascript: protocol'],
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com', 'URL-encoded // (safe - literal path)'],
    ['', '/', 'empty string'],
    [null, '/', 'null value'],
    ['/..//evil.com', '/', 'path traversal to protocol-relative'],
    ['/a/../..//evil.com', '/', 'multiple path traversals to protocol-relative'],
  ]

  test.each(testCases)('safeNext(%p, origin) returns %p - %s', (input, expected) => {
    expect(safeNext(input, origin)).toBe(expected)
  })

  test('preserves hash and query parameters for valid paths', () => {
    expect(safeNext('/path?query=value#hash', origin)).toBe('/path?query=value#hash')
  })

  test('normalizes backslash to forward slash (safe)', () => {
    // URL constructor normalizes backslashes to forward slashes in paths
    // This is safe because the normalized result stays on same origin
    expect(safeNext('/path\\segment', origin)).toBe('/path/segment')
  })

  test('uses correct origin for validation', () => {
    const input = '/valid/path'
    expect(safeNext(input, 'https://example.com')).toBe('/valid/path')
    expect(safeNext(input, 'https://other.com')).toBe('/valid/path')
  })

  test('rejects cross-origin redirect attempts', () => {
    // URL constructor will parse this as https://evil.com with path
    expect(safeNext('https://evil.com/path', origin)).toBe('/')
  })
})

describe('getTrustedOrigin', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv
    }
  })

  test('returns request origin when NEXT_PUBLIC_SITE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    expect(getTrustedOrigin('https://request.example.com')).toBe('https://request.example.com')
  })

  test('returns parsed origin from NEXT_PUBLIC_SITE_URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.example.com'
    expect(getTrustedOrigin('https://request.example.com')).toBe('https://trusted.example.com')
  })

  test('strips trailing slash from NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.example.com/'
    expect(getTrustedOrigin('https://request.example.com')).toBe('https://trusted.example.com')
  })

  test('handles NEXT_PUBLIC_SITE_URL with path correctly', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.example.com/path'
    expect(getTrustedOrigin('https://request.example.com')).toBe('https://trusted.example.com')
  })

  test('falls back to request origin on invalid NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-valid-url'
    expect(getTrustedOrigin('https://request.example.com')).toBe('https://request.example.com')
  })
})
