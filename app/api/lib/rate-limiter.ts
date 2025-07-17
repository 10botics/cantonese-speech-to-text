interface RateLimitData {
  count: number
  resetTime: number
}

// Simple in-memory store for rate limiting
// In production, you'd want to use Redis or a database
const rateLimitStore = new Map<string, RateLimitData>()

const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10

export function checkRateLimit(identifier: string): {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const data = rateLimitStore.get(identifier)

  // If no data or window has expired, reset
  if (!data || now > data.resetTime) {
    const newData: RateLimitData = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    }
    rateLimitStore.set(identifier, newData)
    
    return {
      success: true,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: newData.resetTime
    }
  }

  // Check if limit exceeded
  if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      success: false,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      resetTime: data.resetTime
    }
  }

  // Increment count
  data.count += 1
  rateLimitStore.set(identifier, data)

  return {
    success: true,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - data.count,
    resetTime: data.resetTime
  }
}

export function getRemainingTime(resetTime: number): string {
  const now = Date.now()
  const remaining = resetTime - now
  
  if (remaining <= 0) return '0 hours'
  
  const hours = Math.ceil(remaining / (60 * 60 * 1000))
  return `${hours} hour${hours !== 1 ? 's' : ''}`
} 