interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private readonly limit: number
  private readonly windowMs: number

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit
    this.windowMs = windowMs
  }

  check(userId: string): { allowed: boolean; remaining: number } {
    const now = Date.now()
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
}

export const chatRateLimiter = new RateLimiter(100, 60000)
