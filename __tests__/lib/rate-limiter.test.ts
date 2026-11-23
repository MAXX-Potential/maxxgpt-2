/**
 * @jest-environment node
 */
import { chatRateLimiter } from "@/lib/rate-limiter"

// The module exports a singleton (100 req / 60s). Use distinct user ids and a
// fake clock; no timers are created by the module.
describe("rate limiter", () => {
  let now = 1_000_000
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => now)
  })
  afterEach(() => jest.restoreAllMocks())

  it("allows 100 requests per window then denies", () => {
    for (let i = 0; i < 100; i++) {
      expect(chatRateLimiter.check("burst-user").allowed).toBe(true)
    }
    expect(chatRateLimiter.check("burst-user").allowed).toBe(false)
    expect(chatRateLimiter.check("other-user").allowed).toBe(true)
  })

  it("resets after the window", () => {
    now += 61_000
    expect(chatRateLimiter.check("burst-user").allowed).toBe(true)
  })

  it("lazily evicts expired entries on access (no timers)", () => {
    chatRateLimiter.check("stale-user")
    const map = (chatRateLimiter as any).requests as Map<string, unknown>
    expect(map.has("stale-user")).toBe(true)
    now += 125_000
    chatRateLimiter.check("fresh-user")
    expect(map.has("stale-user")).toBe(false)
    expect(map.has("fresh-user")).toBe(true)
  })
})
