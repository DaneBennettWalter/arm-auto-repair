import express from 'express'
import { withDb } from '../lib/db.js'
import { 
  validatePagination,
  NotFoundError,
  isValidUUID
} from '../lib/helpers.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// ==========================================
// NOTIFICATION ROUTES
// ==========================================

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)
    const unreadOnly = req.query.unreadOnly === 'true'

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const notifications = await withDb(async (client) => {
      let query = `
        SELECT id, type, title, body, link, read, created_at
        FROM notifications
        WHERE user_id = $1
      `
      const params = [req.user!.id]

      if (unreadOnly) {
        query += ` AND read = false`
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)

      const result = await client.query(query, params)
      return result.rows
    })

    res.json({ notifications })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: 'Failed to get notifications' })
  }
})

// Get notification by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id

    if (!isValidUUID(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const notification = await withDb(async (client) => {
      const result = await client.query(`
        SELECT id, type, title, body, link, read, created_at
        FROM notifications
        WHERE id = $1 AND user_id = $2
      `, [notificationId, req.user!.id])

      if (result.rows.length === 0) {
        throw new NotFoundError('Notification not found')
      }

      return result.rows[0]
    })

    res.json({ notification })
  } catch (error) {
    console.error('Get notification error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to get notification' })
  }
})

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id

    if (!isValidUUID(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      const result = await client.query(`
        UPDATE notifications 
        SET read = true
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `, [notificationId, req.user!.id])

      if (result.rows.length === 0) {
        throw new NotFoundError('Notification not found')
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Mark notification read error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
})

// Mark notification as unread
router.put('/:id/unread', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id

    if (!isValidUUID(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      const result = await client.query(`
        UPDATE notifications 
        SET read = false
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `, [notificationId, req.user!.id])

      if (result.rows.length === 0) {
        throw new NotFoundError('Notification not found')
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Mark notification unread error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to mark notification as unread' })
  }
})

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const count = await withDb(async (client) => {
      const result = await client.query(`
        UPDATE notifications 
        SET read = true
        WHERE user_id = $1 AND read = false
        RETURNING id
      `, [req.user!.id])

      return result.rows.length
    })

    res.json({ 
      success: true, 
      markedCount: count 
    })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({ error: 'Failed to mark all notifications as read' })
  }
})

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id

    if (!isValidUUID(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      const result = await client.query(`
        DELETE FROM notifications
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `, [notificationId, req.user!.id])

      if (result.rows.length === 0) {
        throw new NotFoundError('Notification not found')
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to delete notification' })
  }
})

// Delete all notifications
router.delete('/delete-all', authenticateToken, async (req, res) => {
  try {
    const readOnly = req.query.readOnly === 'true'

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const count = await withDb(async (client) => {
      let query = `DELETE FROM notifications WHERE user_id = $1`
      const params = [req.user!.id]

      if (readOnly) {
        query += ` AND read = true`
      }

      query += ` RETURNING id`

      const result = await client.query(query, params)
      return result.rows.length
    })

    res.json({ 
      success: true, 
      deletedCount: count 
    })
  } catch (error) {
    console.error('Delete all notifications error:', error)
    res.status(500).json({ error: 'Failed to delete notifications' })
  }
})

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const count = await withDb(async (client) => {
      const result = await client.query(`
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND read = false
      `, [req.user!.id])

      return parseInt(result.rows[0].count)
    })

    res.json({ count })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ error: 'Failed to get unread count' })
  }
})

// Get notification summary/stats
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const summary = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(*) FILTER (WHERE read = false) as unread_count,
          COUNT(*) FILTER (WHERE read = true) as read_count,
          COUNT(*) FILTER (WHERE type = 'message') as message_notifications,
          COUNT(*) FILTER (WHERE type = 'follow') as follow_notifications,
          COUNT(*) FILTER (WHERE type = 'like') as like_notifications,
          COUNT(*) FILTER (WHERE type = 'comment') as comment_notifications,
          COUNT(*) FILTER (WHERE type = 'system') as system_notifications,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h_count,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week_count
        FROM notifications
        WHERE user_id = $1
      `, [req.user!.id])

      const stats = result.rows[0]

      // Get most recent notification
      const recentResult = await client.query(`
        SELECT created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [req.user!.id])

      return {
        totalNotifications: parseInt(stats.total_notifications),
        unreadCount: parseInt(stats.unread_count),
        readCount: parseInt(stats.read_count),
        byType: {
          message: parseInt(stats.message_notifications),
          follow: parseInt(stats.follow_notifications),
          like: parseInt(stats.like_notifications),
          comment: parseInt(stats.comment_notifications),
          system: parseInt(stats.system_notifications)
        },
        recent: {
          last24Hours: parseInt(stats.last_24h_count),
          lastWeek: parseInt(stats.last_week_count)
        },
        lastNotificationAt: recentResult.rows[0]?.created_at || null
      }
    })

    res.json({ summary })
  } catch (error) {
    console.error('Get notification summary error:', error)
    res.status(500).json({ error: 'Failed to get notification summary' })
  }
})

// Get notifications by type
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const notificationType = req.params.type
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)

    const validTypes = ['message', 'follow', 'like', 'comment', 'system', 'payment', 'business']
    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ error: 'Invalid notification type' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const notifications = await withDb(async (client) => {
      const result = await client.query(`
        SELECT id, type, title, body, link, read, created_at
        FROM notifications
        WHERE user_id = $1 AND type = $2
        ORDER BY created_at DESC
        LIMIT $3 OFFSET $4
      `, [req.user!.id, notificationType, limit, offset])

      return result.rows
    })

    res.json({ notifications })
  } catch (error) {
    console.error('Get notifications by type error:', error)
    res.status(500).json({ error: 'Failed to get notifications by type' })
  }
})

// Create notification (for system/admin use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, type, title, body, link } = req.body

    // Only allow admins or system to create notifications for others
    if (!req.user || (req.user.role !== 'admin' && targetUserId !== req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to create notifications for other users' })
    }

    if (!targetUserId || !type || !title) {
      return res.status(400).json({ error: 'Target user ID, type, and title are required' })
    }

    if (!isValidUUID(targetUserId)) {
      return res.status(400).json({ error: 'Invalid target user ID format' })
    }

    const validTypes = ['message', 'follow', 'like', 'comment', 'system', 'payment', 'business']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' })
    }

    const notification = await withDb(async (client) => {
      // Verify target user exists
      const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [targetUserId])
      if (userCheck.rows.length === 0) {
        throw new NotFoundError('Target user not found')
      }

      const result = await client.query(`
        INSERT INTO notifications (user_id, type, title, body, link)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `, [targetUserId, type, title, body || null, link || null])

      return result.rows[0]
    })

    res.json({
      id: notification.id,
      createdAt: notification.created_at,
      success: true
    })
  } catch (error) {
    console.error('Create notification error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to create notification' })
  }
})

// Bulk mark as read
router.put('/bulk/read', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'Notification IDs array required' })
    }

    if (notificationIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 notifications at once' })
    }

    // Validate all IDs are UUIDs
    for (const id of notificationIds) {
      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid notification ID format' })
      }
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const count = await withDb(async (client) => {
      const placeholders = notificationIds.map((_, i) => `$${i + 2}`).join(',')
      const result = await client.query(`
        UPDATE notifications 
        SET read = true
        WHERE user_id = $1 AND id IN (${placeholders})
        RETURNING id
      `, [req.user!.id, ...notificationIds])

      return result.rows.length
    })

    res.json({ 
      success: true, 
      markedCount: count 
    })
  } catch (error) {
    console.error('Bulk mark as read error:', error)
    res.status(500).json({ error: 'Failed to mark notifications as read' })
  }
})

// Bulk delete
router.delete('/bulk', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'Notification IDs array required' })
    }

    if (notificationIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 notifications at once' })
    }

    // Validate all IDs are UUIDs
    for (const id of notificationIds) {
      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid notification ID format' })
      }
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const count = await withDb(async (client) => {
      const placeholders = notificationIds.map((_, i) => `$${i + 2}`).join(',')
      const result = await client.query(`
        DELETE FROM notifications
        WHERE user_id = $1 AND id IN (${placeholders})
        RETURNING id
      `, [req.user!.id, ...notificationIds])

      return result.rows.length
    })

    res.json({ 
      success: true, 
      deletedCount: count 
    })
  } catch (error) {
    console.error('Bulk delete notifications error:', error)
    res.status(500).json({ error: 'Failed to delete notifications' })
  }
})

export default router