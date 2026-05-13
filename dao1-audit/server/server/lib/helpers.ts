import crypto from 'crypto'

// ==========================================
// INPUT VALIDATION AND SANITIZATION
// ==========================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export function sanitizeString(str: unknown, maxLength = 500): string {
  if (typeof str !== 'string') return ''
  return str.trim().slice(0, maxLength)
}

export function isPositiveNumber(val: unknown): val is number {
  return typeof val === 'number' && val > 0 && isFinite(val)
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function validatePagination(limit?: string, offset?: string) {
  return {
    limit: Math.min(parseInt(limit || '20'), 100),
    offset: Math.max(parseInt(offset || '0'), 0)
  }
}

// ==========================================
// PASSWORD UTILITIES
// ==========================================

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    if (!salt || !hash) return false
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex')
    return hash === testHash
  } catch (error) {
    return false
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ==========================================
// ERROR HANDLING
// ==========================================

export interface ApiError {
  error: string
  code?: string
}

export function createError(message: string, code?: string): ApiError {
  return { error: message, code }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

// ==========================================
// ASYNC HELPERS
// ==========================================

export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      // Log error but don't expose internal details
      console.error('Async handler error:', error)
      throw error
    })
  }
}

// Retry helper for database operations
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// ==========================================
// SLUG GENERATION
// ==========================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// ==========================================
// DATE HELPERS
// ==========================================

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

// ==========================================
// ARRAY HELPERS
// ==========================================

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// ==========================================
// OBJECT HELPERS
// ==========================================

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

// ==========================================
// BUSINESS LOGIC HELPERS
// ==========================================

export async function createActivityPost(
  pool: any,
  type: 'document' | 'vote' | 'work_order' | 'member_join',
  data: {
    authorId: string
    businessId?: string
    content: string
    projectId?: string
    propertyId?: string
  }
): Promise<string | null> {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        INSERT INTO posts (author_id, business_id, type, content, project_id, property_id, visibility)
        VALUES ($1, $2, 'auto', $3, $4, $5, 'public')
        RETURNING id
      `, [data.authorId, data.businessId, data.content, data.projectId, data.propertyId])

      return result.rows[0]?.id || null
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Create activity post error:', error)
    return null
  }
}

// ==========================================
// SECURITY HELPERS
// ==========================================

export function sanitizeForDatabase(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, 5000)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.filter(item => 
        typeof item === 'string' ? sanitizeString(item, 1000) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// Rate limiting helper
export function createRateLimiter() {
  const store = new Map<string, { count: number; resetAt: number }>()
  const windowMs = 60_000 // 1 minute
  const maxRequests = 30
  
  // Cleanup stale entries periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 300_000) // 5 minutes
  
  return {
    check: (identifier: string): { allowed: boolean; retryAfter?: number } => {
      const now = Date.now()
      let entry = store.get(identifier)
      
      if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs }
        store.set(identifier, entry)
      }
      
      entry.count++
      
      if (entry.count > maxRequests) {
        return {
          allowed: false,
          retryAfter: Math.ceil((entry.resetAt - now) / 1000)
        }
      }
      
      return { allowed: true }
    }
  }
}