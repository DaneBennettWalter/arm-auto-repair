import express from 'express'
import { withDb } from '../lib/db.js'
import { 
  sanitizeString, 
  validatePagination, 
  ValidationError,
  NotFoundError,
  ForbiddenError,
  isValidUUID
} from '../lib/helpers.js'
import { authenticateToken, verifyConversationAccess } from '../middleware/auth.js'
import { messagingRate } from '../middleware/rateLimit.js'

const router = express.Router()

// Import WebSocket broadcast function - this would be passed in or imported from a WebSocket manager
let broadcastToUser: ((userId: string, message: any) => void) | null = null

export function setBroadcastFunction(fn: (userId: string, message: any) => void) {
  broadcastToUser = fn
}

// ==========================================
// CONVERSATION ROUTES
// ==========================================

// Get user's conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const conversations = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          c.id,
          c.type,
          c.name,
          c.created_at,
          m.content as last_message,
          m.created_at as last_message_at,
          u.display_name as last_sender,
          (
            SELECT COUNT(*)
            FROM messages m2
            JOIN conversation_members cm2 ON cm2.conversation_id = m2.conversation_id
            WHERE m2.conversation_id = c.id 
            AND cm2.user_id = $1
            AND (cm2.last_read IS NULL OR m2.created_at > cm2.last_read)
            AND m2.sender_id != $1
          ) as unread_count
        FROM conversations c
        JOIN conversation_members cm ON cm.conversation_id = c.id
        LEFT JOIN LATERAL (
          SELECT * FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) m ON true
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE cm.user_id = $1
        ORDER BY COALESCE(m.created_at, c.created_at) DESC
      `, [req.user.id])

      return result.rows
    })

    res.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ error: 'Failed to get conversations' })
  }
})

// Create new conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const type = sanitizeString(req.body.type, 20)
    const name = sanitizeString(req.body.name, 100)
    const participantIds = req.body.participantIds || []

    if (!type || !['dm', 'channel', 'ai'].includes(type)) {
      return res.status(400).json({ error: 'Valid conversation type required (dm, channel, ai)' })
    }
    if (!name) {
      return res.status(400).json({ error: 'Conversation name required' })
    }

    // Validate participant IDs
    for (const id of participantIds) {
      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid participant ID format' })
      }
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const conversation = await withDb(async (client) => {
      const conversationResult = await client.query(`
        INSERT INTO conversations (type, name, created_by)
        VALUES ($1, $2, $3)
        RETURNING id, type, name, created_at
      `, [type, name, req.user!.id])

      const conversation = conversationResult.rows[0]

      // Add creator to conversation
      await client.query(`
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES ($1, $2)
      `, [conversation.id, req.user!.id])

      // Add other participants
      for (const participantId of participantIds) {
        if (participantId !== req.user!.id) {
          try {
            await client.query(`
              INSERT INTO conversation_members (conversation_id, user_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [conversation.id, participantId])
          } catch (error) {
            console.warn(`Failed to add participant ${participantId}:`, error)
          }
        }
      }

      return conversation
    })

    res.json({ conversation })
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

// Get messages for a conversation
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)
    const before = req.query.before as string // Message ID for pagination

    if (!isValidUUID(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const messages = await withDb(async (client) => {
      let query = `
        SELECT 
          m.id,
          m.conversation_id,
          m.content,
          m.type,
          m.metadata,
          m.created_at,
          m.edited_at,
          m.reactions,
          u.id as sender_id,
          u.display_name as sender_name,
          u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
      `
      const params = [conversationId]

      if (before && isValidUUID(before)) {
        query += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $${params.length + 1})`
        params.push(before)
      }

      query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`
      params.push(Math.min(limit, 100)) // Cap at 100 messages

      const result = await client.query(query, params)
      
      // Reverse to get chronological order
      return result.rows.reverse()
    })

    res.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to get messages' })
  }
})

// Send message to conversation
router.post('/:id/messages', authenticateToken, messagingRate, async (req, res) => {
  try {
    const conversationId = req.params.id
    const content = sanitizeString(req.body.content, 5000)
    const type = sanitizeString(req.body.type, 20) || 'text'

    if (!isValidUUID(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' })
    }

    if (!content) {
      return res.status(400).json({ error: 'Message content required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const result = await withDb(async (client) => {
      // Insert message
      const messageResult = await client.query(`
        INSERT INTO messages (conversation_id, sender_id, content, type, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, conversation_id, content, type, created_at, metadata
      `, [conversationId, req.user!.id, content, type, req.body.reply_to ? {
        reply_to: req.body.reply_to,
        reply_to_content: req.body.reply_to_content,
        reply_to_sender: req.body.reply_to_sender
      } : null])

      const message = messageResult.rows[0]

      // Get conversation members for notifications and WebSocket
      const membersResult = await client.query(`
        SELECT cm.user_id, u.display_name
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = $1 AND cm.user_id != $2
      `, [conversationId, req.user!.id])

      // Create notifications for other members
      for (const member of membersResult.rows) {
        await client.query(`
          INSERT INTO notifications (user_id, type, title, body, link)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          member.user_id,
          'message',
          `New message from ${req.user!.displayName}`,
          content.substring(0, 100),
          `/messages?conversation=${conversationId}`
        ])

        // Send WebSocket notification
        if (broadcastToUser) {
          broadcastToUser(member.user_id, {
            type: 'notification',
            data: {
              type: 'message',
              title: `New message from ${req.user!.displayName}`,
              body: content.substring(0, 100),
              link: `/messages?conversation=${conversationId}`
            }
          })
        }
      }

      // Broadcast message to conversation members
      const messageData = {
        id: message.id,
        conversation_id: message.conversation_id,
        content: message.content,
        type: message.type,
        created_at: message.created_at,
        sender_id: req.user!.id,
        sender_name: req.user!.displayName,
        sender_avatar: req.user!.avatarUrl
      }

      // Send to all members (including sender for real-time feedback)
      const allMembers = await client.query(`
        SELECT user_id FROM conversation_members WHERE conversation_id = $1
      `, [conversationId])

      if (broadcastToUser) {
        for (const member of allMembers.rows) {
          broadcastToUser(member.user_id, {
            type: 'message',
            data: messageData
          })
        }
      }

      return messageData
    })

    res.json({ message: result })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Mark conversation as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id

    if (!isValidUUID(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      await client.query(`
        UPDATE conversation_members 
        SET last_read = NOW()
        WHERE conversation_id = $1 AND user_id = $2
      `, [conversationId, req.user!.id])
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ error: 'Failed to mark as read' })
  }
})

// Edit message
router.put('/:id/messages/:msgId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id
    const messageId = req.params.msgId
    const content = sanitizeString(req.body.content, 5000)

    if (!isValidUUID(conversationId) || !isValidUUID(messageId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    if (!content) {
      return res.status(400).json({ error: 'Message content required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Check if user can edit this message
      const messageCheck = await client.query(`
        SELECT sender_id FROM messages WHERE id = $1 AND conversation_id = $2
      `, [messageId, conversationId])

      if (messageCheck.rows.length === 0) {
        throw new NotFoundError('Message not found')
      }

      if (messageCheck.rows[0].sender_id !== req.user!.id) {
        throw new ForbiddenError('Can only edit your own messages')
      }

      // Update message
      await client.query(`
        UPDATE messages 
        SET content = $1, edited_at = NOW()
        WHERE id = $2
      `, [content, messageId])
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Edit message error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to edit message' })
  }
})

// Delete message
router.delete('/:id/messages/:msgId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id
    const messageId = req.params.msgId

    if (!isValidUUID(conversationId) || !isValidUUID(messageId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Check if user can delete this message
      const messageCheck = await client.query(`
        SELECT sender_id FROM messages WHERE id = $1 AND conversation_id = $2
      `, [messageId, conversationId])

      if (messageCheck.rows.length === 0) {
        throw new NotFoundError('Message not found')
      }

      if (messageCheck.rows[0].sender_id !== req.user!.id) {
        throw new ForbiddenError('Can only delete your own messages')
      }

      // Delete message
      await client.query('DELETE FROM messages WHERE id = $1', [messageId])
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

// Add/remove reaction
router.post('/:id/messages/:msgId/react', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id
    const messageId = req.params.msgId
    const emoji = sanitizeString(req.body.emoji, 10)

    if (!isValidUUID(conversationId) || !isValidUUID(messageId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const reactions = await withDb(async (client) => {
      // Get current reactions
      const messageResult = await client.query(`
        SELECT reactions FROM messages WHERE id = $1 AND conversation_id = $2
      `, [messageId, conversationId])

      if (messageResult.rows.length === 0) {
        throw new NotFoundError('Message not found')
      }

      let reactions = messageResult.rows[0].reactions || {}
      
      // Toggle reaction
      if (!reactions[emoji]) {
        reactions[emoji] = []
      }
      
      const userIndex = reactions[emoji].indexOf(req.user!.id)
      if (userIndex === -1) {
        reactions[emoji].push(req.user!.id)
      } else {
        reactions[emoji].splice(userIndex, 1)
        if (reactions[emoji].length === 0) {
          delete reactions[emoji]
        }
      }

      // Update reactions
      await client.query(`
        UPDATE messages SET reactions = $1 WHERE id = $2
      `, [JSON.stringify(reactions), messageId])

      return reactions
    })

    res.json({ reactions })
  } catch (error) {
    console.error('React to message error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to add reaction' })
  }
})

// Pin/unpin message
router.post('/:id/pin/:msgId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id
    const messageId = req.params.msgId

    if (!isValidUUID(conversationId) || !isValidUUID(messageId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const isPinned = await withDb(async (client) => {
      // Toggle pin status
      const result = await client.query(`
        UPDATE messages 
        SET is_pinned = NOT is_pinned 
        WHERE id = $1 AND conversation_id = $2
        RETURNING is_pinned
      `, [messageId, conversationId])

      if (result.rows.length === 0) {
        throw new NotFoundError('Message not found')
      }

      return result.rows[0].is_pinned
    })

    res.json({ is_pinned: isPinned })
  } catch (error) {
    console.error('Pin message error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to pin message' })
  }
})

// Get pinned messages
router.get('/:id/pins', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id

    if (!isValidUUID(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const messages = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          m.id, m.content, m.type, m.created_at, m.reactions,
          u.id as sender_id, u.display_name as sender_name, u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1 AND m.is_pinned = true
        ORDER BY m.created_at DESC
      `, [conversationId])

      return result.rows
    })

    res.json({ messages })
  } catch (error) {
    console.error('Get pinned messages error:', error)
    res.status(500).json({ error: 'Failed to get pinned messages' })
  }
})

// Search messages within conversation
router.get('/:id/search', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id
    const query = sanitizeString(req.query.q as string, 100)
    const { limit } = validatePagination(req.query.limit as string)

    if (!isValidUUID(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' })
    }

    if (!query) {
      return res.status(400).json({ error: 'Search query required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const messages = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          m.id, m.content, m.type, m.created_at, m.reactions,
          u.id as sender_id, u.display_name as sender_name, u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1 AND m.content ILIKE $2
        ORDER BY m.created_at DESC
        LIMIT $3
      `, [conversationId, `%${query}%`, Math.min(limit, 50)])

      return result.rows
    })

    res.json({ messages })
  } catch (error) {
    console.error('Search messages error:', error)
    res.status(500).json({ error: 'Failed to search messages' })
  }
})

// Get conversation members
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id

    if (!isValidUUID(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is member of conversation
    const hasAccess = await verifyConversationAccess(req.user.id, conversationId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this conversation' })
    }

    const members = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          u.id, u.display_name, u.avatar_url, u.last_seen,
          cm.joined_at
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = $1
        ORDER BY cm.joined_at ASC
      `, [conversationId])

      return result.rows
    })

    res.json({ members })
  } catch (error) {
    console.error('Get conversation members error:', error)
    res.status(500).json({ error: 'Failed to get conversation members' })
  }
})

export default router