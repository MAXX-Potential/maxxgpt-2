/**
 * @jest-environment node
 */

// Test the safeNext function from auth callback route
// This is extracted for testing without mocking Next.js internals

function safeNext(next: string | null, origin: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\') || /[\u0000-\u001F\u007F]/.test(next)) return '/'
  try {
    const u = new URL(next, origin)
    if (u.origin !== origin || u.pathname.startsWith('//') || u.pathname.includes('\\')) return '/'
    return u.pathname + u.search + u.hash
  } catch { return '/' }
}

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
