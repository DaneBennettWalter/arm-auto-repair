import express from 'express'

// ==========================================
// RATE LIMITING MIDDLEWARE
// ==========================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: express.Request) => string
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private windowMs: number
  private maxRequests: number
  private skipSuccessfulRequests: boolean
  private skipFailedRequests: boolean
  private keyGenerator: (req: express.Request) => string

  constructor(options: RateLimitOptions = {}) {
    this.windowMs = options.windowMs || 60_000 // 1 minute
    this.maxRequests = options.maxRequests || 30
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false
    this.skipFailedRequests = options.skipFailedRequests || false
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator

    // Clean up stale entries every 5 minutes
    setInterval(() => {
      this.cleanup()
    }, 300_000)
  }

  private defaultKeyGenerator(req: express.Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown'
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = this.keyGenerator(req)
    const now = Date.now()
    let entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs }
      this.store.set(key, entry)
    }

    // Check if we should skip counting this request
    const originalSend = res.send
    let shouldCount = true

    if (this.skipSuccessfulRequests || this.skipFailedRequests) {
      res.send = function(body) {
        const statusCode = res.statusCode
        
        if (shouldCount) {
          const isSuccess = statusCode >= 200 && statusCode < 400
          const isFailure = statusCode >= 400
          
          if ((isSuccess && this.skipSuccessfulRequests) || 
              (isFailure && this.skipFailedRequests)) {
            // Don't count this request
            entry!.count--
          }
        }

        return originalSend.call(this, body)
      }.bind(res)
    }

    entry.count++

    if (entry.count > this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      
      res.setHeader('X-RateLimit-Limit', this.maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', '0')
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString())
      res.setHeader('Retry-After', retryAfter.toString())
      
      res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter 
      })
      return
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.maxRequests.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - entry.count).toString())
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString())

    next()
  }

  // Get current stats for a key
  getStats(key: string): { count: number; resetAt: number } | null {
    const entry = this.store.get(key)
    return entry ? { ...entry } : null
  }

  // Reset rate limit for a specific key
  reset(key: string): void {
    this.store.delete(key)
  }

  // Get all current entries (for debugging)
  getAll(): Map<string, RateLimitEntry> {
    return new Map(this.store)
  }
}

// ==========================================
// PREDEFINED RATE LIMITERS
// ==========================================

// General API rate limiter
export const apiRateLimit = new RateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown'
})

// Strict rate limiter for auth endpoints
export const authRateLimit = new RateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 5, // 5 auth attempts per minute
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown'
})

// More lenient rate limiter for authenticated users
export const authenticatedRateLimit = new RateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 120, // 120 requests per minute for authenticated users
  keyGenerator: (req) => {
    // Use user ID for authenticated users, IP for others
    return req.user?.id || req.ip || req.socket.remoteAddress || 'unknown'
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Messaging rate limiter (per user)
export const messagingRateLimit = new RateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 30, // 30 messages per minute per user
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown'
})

// Expensive operations rate limiter
export const heavyOperationsRateLimit = new RateLimiter({
  windowMs: 300_000, // 5 minutes
  maxRequests: 10, // 10 heavy operations per 5 minutes
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown'
})

// AI endpoints rate limiter
export const aiRateLimit = new RateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 20, // 20 AI requests per minute
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown'
})

// Upload rate limiter
export const uploadRateLimit = new RateLimiter({
  windowMs: 300_000, // 5 minutes
  maxRequests: 20, // 20 uploads per 5 minutes
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown'
})

// Export the middleware functions
export const rateLimit = apiRateLimit.middleware
export const authRate = authRateLimit.middleware
export const authenticatedRate = authenticatedRateLimit.middleware
export const messagingRate = messagingRateLimit.middleware
export const heavyRate = heavyOperationsRateLimit.middleware
export const aiRate = aiRateLimit.middleware
export const uploadRate = uploadRateLimit.middleware

// Create a custom rate limiter
export function createRateLimit(options: RateLimitOptions) {
  const limiter = new RateLimiter(options)
  return limiter.middleware
}

// Utility functions
export function getRateLimitStats(rateLimiter: RateLimiter, key: string) {
  return rateLimiter.getStats(key)
}

export function resetRateLimit(rateLimiter: RateLimiter, key: string) {
  rateLimiter.reset(key)
}

// Per-IP rate limiting with user preference
export function createSmartRateLimit(options: {
  baseLimit: number
  userMultiplier?: number
  windowMs?: number
}) {
  return new RateLimiter({
    windowMs: options.windowMs || 60_000,
    maxRequests: options.baseLimit,
    keyGenerator: (req) => {
      const baseKey = req.ip || req.socket.remoteAddress || 'unknown'
      
      // If user is authenticated, give them higher limits
      if (req.user) {
        const multiplier = options.userMultiplier || 2
        // Create a composite key that allows higher limits for authenticated users
        return `user:${req.user.id}:${Math.floor(options.baseLimit * multiplier)}`
      }
      
      return `ip:${baseKey}:${options.baseLimit}`
    }
  })
}