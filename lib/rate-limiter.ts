interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private readonly limit: number
  private readonly windowMs: number
  private lastSweep = 0

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit
    this.windowMs = windowMs
  }

  check(userId: string): { allowed: boolean; remaining: number } {
    const now = Date.now()
    this.sweep(now)
    const entry = this.requests.get(userId)

    if (!entry || now > entry.resetTime) {
      this.requests.set(userId, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return { allowed: true, remaining: this.limit - 1 }
    }

    if (entry.count >= this.limit) {
      return { allowed: false, remaining: 0 }
    }

    entry.count++
    return { allowed: true, remaining: this.limit - entry.count }
  }

  // Lazily drop expired entries (at most once per window) so the Map cannot
  // grow without bound. No timers: safe for serverless / edge runtimes.
  private sweep(now: number) {
    if (now - this.lastSweep < this.windowMs) return
    this.lastSweep = now
    for (const [userId, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(userId)
      }
    }
  }
}

export const chatRateLimiter = new RateLimiter(100, 60000)
