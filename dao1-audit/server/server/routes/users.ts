import express from 'express'
import { withDb } from '../lib/db.js'
import { sanitizeString, validatePagination } from '../lib/helpers.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/users/search?q=<query>
router.get('/search', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const q = sanitizeString(req.query.q as string, 100)

    const users = await withDb(async (client) => {
      if (q && q.length > 0) {
        const result = await client.query(`
          SELECT id, display_name, email, avatar_url
          FROM users
          WHERE id != $1
            AND (display_name ILIKE $2 OR email ILIKE $2)
          ORDER BY display_name ASC
          LIMIT 20
        `, [req.user!.id, `%${q}%`])
        return result.rows
      } else {
        // Return recent contacts
        const result = await client.query(`
          SELECT DISTINCT u.id, u.display_name, u.email, u.avatar_url
          FROM users u
          LEFT JOIN payments p ON (p.to_user_id = u.id OR p.from_user_id = u.id)
          WHERE u.id != $1
            AND (p.from_user_id = $1 OR p.to_user_id = $1 OR p.id IS NULL)
          ORDER BY u.display_name ASC
          LIMIT 20
        `, [req.user!.id])
        return result.rows
      }
    })

    res.json({ users })
  } catch (error) {
    console.error('User search error:', error)
    res.status(500).json({ error: 'Failed to search users' })
  }
})

// GET /api/users/suggestions — people you may know
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })

    const users = await withDb(async (client) => {
      const result = await client.query(`
        SELECT u.id, u.display_name, u.email, u.avatar_url
        FROM users u
        WHERE u.id != $1
          AND u.id NOT IN (
            SELECT CASE WHEN requester_id = $1 THEN recipient_id ELSE requester_id END
            FROM connections
            WHERE (requester_id = $1 OR recipient_id = $1) AND status = 'accepted'
          )
        ORDER BY u.created_at DESC
        LIMIT 20
      `, [req.user!.id])
      return result.rows
    })

    res.json({ users })
  } catch (error) {
    console.error('User suggestions error:', error)
    res.status(500).json({ error: 'Failed to get suggestions' })
  }
})

export default router
