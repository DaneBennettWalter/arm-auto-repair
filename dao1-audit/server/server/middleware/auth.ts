import express from 'express'
import { pool } from '../lib/db.js'
import { UnauthorizedError } from '../lib/helpers.js'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        displayName: string
        avatarUrl?: string
        bio?: string
        role: string
        lastSeen?: Date
      }
    }
  }
}

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

export async function authenticateToken(
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT 
          s.*, 
          u.id as user_id, 
          u.email, 
          u.display_name, 
          u.avatar_url, 
          u.bio, 
          u.role, 
          u.last_seen
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = $1 AND s.expires_at > NOW()
      `, [token])

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid or expired token' })
        return
      }

      const session = result.rows[0]
      req.user = {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        avatarUrl: session.avatar_url,
        bio: session.bio,
        role: session.role,
        lastSeen: session.last_seen
      }

      // Update last seen timestamp
      await client.query(
        'UPDATE users SET last_seen = NOW() WHERE id = $1', 
        [session.user_id]
      )
      
      next()
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

// Optional authentication middleware - doesn't require auth but populates user if available
export async function optionalAuth(
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      const client = await pool.connect()
      try {
        const result = await client.query(`
          SELECT 
            s.*, 
            u.id as user_id, 
            u.email, 
            u.display_name, 
            u.avatar_url, 
            u.bio, 
            u.role, 
            u.last_seen
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.token = $1 AND s.expires_at > NOW()
        `, [token])

        if (result.rows.length > 0) {
          const session = result.rows[0]
          req.user = {
            id: session.user_id,
            email: session.email,
            displayName: session.display_name,
            avatarUrl: session.avatar_url,
            bio: session.bio,
            role: session.role,
            lastSeen: session.last_seen
          }

          // Update last seen
          await client.query(
            'UPDATE users SET last_seen = NOW() WHERE id = $1', 
            [session.user_id]
          )
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Optional auth error:', error)
      // Don't fail the request if optional auth fails
    }
  }

  next()
}

// Role-based authorization middleware
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' })
      return
    }

    next()
  }
}

// Business member authorization helper
export async function verifyBusinessAccess(
  userId: string, 
  businessId: string, 
  allowedRoles: string[] = ['owner', 'admin', 'member']
): Promise<boolean> {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT role FROM business_members 
        WHERE business_id = $1 AND user_id = $2 AND role = ANY($3)
      `, [businessId, userId, allowedRoles])

      return result.rows.length > 0
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Business access verification error:', error)
    return false
  }
}

// Conversation member authorization helper
export async function verifyConversationAccess(
  userId: string, 
  conversationId: string
): Promise<boolean> {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT 1 FROM conversation_members 
        WHERE conversation_id = $1 AND user_id = $2
      `, [conversationId, userId])

      return result.rows.length > 0
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Conversation access verification error:', error)
    return false
  }
}

// Resource ownership verification
export async function verifyResourceOwner(
  userId: string,
  resourceType: 'post' | 'message' | 'business' | 'comment',
  resourceId: string
): Promise<boolean> {
  try {
    const client = await pool.connect()
    try {
      let query: string
      let ownerColumn: string

      switch (resourceType) {
        case 'post':
          query = 'SELECT author_id FROM posts WHERE id = $1'
          ownerColumn = 'author_id'
          break
        case 'message':
          query = 'SELECT sender_id FROM messages WHERE id = $1'
          ownerColumn = 'sender_id'
          break
        case 'business':
          query = 'SELECT owner_id FROM business_pages WHERE id = $1'
          ownerColumn = 'owner_id'
          break
        case 'comment':
          query = 'SELECT author_id FROM post_comments WHERE id = $1'
          ownerColumn = 'author_id'
          break
        default:
          return false
      }

      const result = await client.query(query, [resourceId])
      return result.rows.length > 0 && result.rows[0][ownerColumn] === userId
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Resource ownership verification error:', error)
    return false
  }
}