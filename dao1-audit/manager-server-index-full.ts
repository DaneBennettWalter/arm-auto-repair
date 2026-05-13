import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

// Database and utilities
import { initDb, closeDb, pool } from './lib/db.js'
import { createRateLimiter } from './lib/helpers.js'

// Middleware
import { rateLimit, authenticatedRate } from './middleware/rateLimit.js'

// Routes
import authRoutes from './routes/auth.js'
import messagingRoutes, { setBroadcastFunction } from './routes/messaging.js'
import socialRoutes from './routes/social.js'
import paymentsRoutes from './routes/payments.js'
import templatesRoutes from './routes/templates.js'
import notificationsRoutes from './routes/notifications.js'

// Environment validation
const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = parseInt(process.env.PORT || '3002', 10)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://manager.dao1.earth')
  .split(',')
  .map(s => s.trim())
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// ==========================================
// WEBSOCKET TYPES AND SETUP
// ==========================================

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  user?: {
    id: string
    email: string
    displayName: string
    avatarUrl?: string
    bio?: string
    role: string
  }
  lastPing?: number
}

const connectedUsers = new Map<string, AuthenticatedWebSocket[]>()

// Broadcast function for other modules
function broadcastToUser(userId: string, message: any) {
  const userConnections = connectedUsers.get(userId)
  if (userConnections) {
    const messageStr = JSON.stringify(message)
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr)
        } catch (error) {
          console.error('WebSocket send error:', error)
        }
      }
    })
  }
}

// ==========================================
// EXPRESS APP SETUP
// ==========================================

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ 
  server,
  clientTracking: true
})

// Trust proxy (behind Caddy/nginx)
app.set('trust proxy', 1)

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // CSP - allow Stripe, self, and inline styles (Tailwind needs them)
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '))
  
  next()
})

// CORS - restrict to allowed origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin) || NODE_ENV === 'development') {
      return callback(null, true)
    }
    callback(new Error('CORS: origin not allowed'))
  },
  credentials: true,
}))

// Body parser with size limit
app.use(express.json({ limit: '100kb' }))

// Apply rate limiting to API routes
app.use('/api', rateLimit)

// ==========================================
// ROUTE MOUNTING
// ==========================================

// Set up broadcast function for messaging
setBroadcastFunction(broadcastToUser)

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/conversations', messagingRoutes)
app.use('/api', socialRoutes) // Feed, posts, profiles, businesses, follows
app.use('/api/payments', paymentsRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/notifications', notificationsRoutes)

// ==========================================
// AI ENDPOINTS (keeping inline for now)
// ==========================================

// AI chat proxy — keeps API key server-side
app.post('/api/chat', authenticatedRate, async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'AI chat not configured on this server' })
    }

    const messages = req.body.messages
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return res.status(400).json({ error: 'Messages array required (max 50)' })
    }

    // Validate and sanitize messages
    const cleanMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: (m.content || '').toString().trim().slice(0, 10000),
    })).filter((m: any) => m.content)

    if (cleanMessages.length === 0) {
      return res.status(400).json({ error: 'At least one non-empty message required' })
    }

    const systemPrompt = (req.body.system || '').toString().trim().slice(0, 5000) ||
      'You are a helpful business assistant for a construction and property management company. Be concise and practical.'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: req.body.model || 'claude-sonnet-4-20250514',
        max_tokens: Math.min(req.body.max_tokens || 2048, 4096),
        system: systemPrompt,
        messages: cleanMessages,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return res.status(502).json({ error: 'AI service temporarily unavailable' })
    }

    const data = await response.json() as any
    const text = data.content?.[0]?.text || ''

    res.json({ message: text })
  } catch (error: any) {
    console.error('Chat error:', error.message)
    res.status(500).json({ error: 'Chat request failed' })
  }
})

// AI generate endpoint (for estimate generation)
app.post('/api/ai/generate', authenticatedRate, async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'AI not configured on this server' })
    }

    const description = (req.body.description || '').toString().trim().slice(0, 5000)
    const docType = (req.body.docType || '').toString().trim().slice(0, 50)

    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `You are a construction/service business assistant. Create a detailed ${docType} based on this description:\n\n${description}\n\nReturn ONLY valid JSON with fields: title, description, materials (array of {description, quantity, unit, unitCost, supplier}), laborEquipment (array of {description, quantity, unit, rate}), notes.`
        }]
      })
    })

    if (!response.ok) {
      return res.status(502).json({ error: 'AI service temporarily unavailable' })
    }

    const data = await response.json() as any
    const text = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        res.json({ success: true, estimate: parsed })
      } catch (parseError) {
        res.json({ success: false, error: 'Could not parse AI response' })
      }
    } else {
      res.json({ success: false, error: 'Could not parse AI response' })
    }
  } catch (error: any) {
    console.error('AI generate error:', error.message)
    res.status(500).json({ success: false, error: 'AI request failed' })
  }
})

// ==========================================
// WEBSOCKET HANDLING
// ==========================================

// Heartbeat/ping-pong to detect stale connections
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const CONNECTION_TIMEOUT = 60000 // 1 minute

function heartbeat() {
  const now = Date.now()
  
  wss.clients.forEach((ws: AuthenticatedWebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      if (ws.lastPing && (now - ws.lastPing) > CONNECTION_TIMEOUT) {
        console.log('Terminating stale WebSocket connection')
        ws.terminate()
        return
      }
      
      try {
        ws.ping()
      } catch (error) {
        console.error('WebSocket ping error:', error)
      }
    }
  })
}

// Start heartbeat interval
const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL)

wss.on('connection', (ws: AuthenticatedWebSocket) => {
  console.log('New WebSocket connection')
  ws.lastPing = Date.now()

  ws.on('pong', () => {
    ws.lastPing = Date.now()
  })

  ws.on('message', async (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString())

      if (data.type === 'auth') {
        // Authenticate the connection
        const token = data.token
        if (token) {
          const client = await pool.connect()
          try {
            const result = await client.query(`
              SELECT s.*, u.id as user_id, u.email, u.display_name, u.avatar_url, u.bio, u.role
              FROM sessions s
              JOIN users u ON s.user_id = u.id
              WHERE s.token = $1 AND s.expires_at > NOW()
            `, [token])

            if (result.rows.length > 0) {
              const session = result.rows[0]
              ws.userId = session.user_id
              ws.user = {
                id: session.user_id,
                email: session.email,
                displayName: session.display_name,
                avatarUrl: session.avatar_url,
                bio: session.bio,
                role: session.role
              }

              // Add to connected users
              if (!connectedUsers.has(ws.userId)) {
                connectedUsers.set(ws.userId, [])
              }
              connectedUsers.get(ws.userId)!.push(ws)

              // Send auth success
              ws.send(JSON.stringify({ 
                type: 'auth_success', 
                data: { user: ws.user } 
              }))

              // Broadcast presence to conversation members
              const membersResult = await client.query(`
                SELECT DISTINCT cm.user_id
                FROM conversation_members cm
                JOIN conversation_members cm2 ON cm.conversation_id = cm2.conversation_id
                WHERE cm2.user_id = $1 AND cm.user_id != $1
              `, [ws.userId])

              for (const member of membersResult.rows) {
                broadcastToUser(member.user_id, {
                  type: 'presence',
                  data: { userId: ws.userId, status: 'online' }
                })
              }
            } else {
              ws.send(JSON.stringify({ 
                type: 'auth_error', 
                error: 'Invalid token' 
              }))
            }
          } finally {
            client.release()
          }
        }
      } else if (data.type === 'ping') {
        // Handle client-side ping
        ws.send(JSON.stringify({ type: 'pong' }))
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  })

  ws.on('close', async () => {
    if (ws.userId) {
      // Remove from connected users
      const userConnections = connectedUsers.get(ws.userId)
      if (userConnections) {
        const index = userConnections.indexOf(ws)
        if (index !== -1) {
          userConnections.splice(index, 1)
        }
        
        if (userConnections.length === 0) {
          connectedUsers.delete(ws.userId)

          // Broadcast offline status
          try {
            const client = await pool.connect()
            try {
              const membersResult = await client.query(`
                SELECT DISTINCT cm.user_id
                FROM conversation_members cm
                JOIN conversation_members cm2 ON cm.conversation_id = cm2.conversation_id
                WHERE cm2.user_id = $1 AND cm.user_id != $1
              `, [ws.userId])

              for (const member of membersResult.rows) {
                broadcastToUser(member.user_id, {
                  type: 'presence',
                  data: { userId: ws.userId, status: 'offline' }
                })
              }
            } finally {
              client.release()
            }
          } catch (error) {
            console.error('Presence broadcast error:', error)
          }
        }
      }
    }
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    hasAI: !!ANTHROPIC_API_KEY,
    connections: wss.clients.size,
    authenticatedConnections: connectedUsers.size,
  })
})

// ==========================================
// ERROR HANDLING
// ==========================================

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error)
  
  // Don't leak error details in production
  const isDev = NODE_ENV === 'development'
  
  res.status(500).json({
    error: 'Internal server error',
    ...(isDev && { details: error.message, stack: error.stack })
  })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ==========================================
// CLEANUP AND PERIODIC TASKS
// ==========================================

// Clean up expired sessions every hour
const sessionCleanupTimer = setInterval(async () => {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query('DELETE FROM sessions WHERE expires_at < NOW() RETURNING id')
      if (result.rows.length > 0) {
        console.log(`Cleaned up ${result.rows.length} expired sessions`)
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Session cleanup error:', error)
  }
}, 3600_000) // 1 hour

// ==========================================
// SERVER STARTUP
// ==========================================

async function startServer() {
  try {
    console.log('🚀 Starting Manager Platform API Server...')
    
    // Initialize database
    console.log('📊 Initializing database...')
    await initDb()
    
    // Start server
    server.listen(PORT, () => {
      console.log('✅ Manager API Server Started Successfully!')
      console.log('━'.repeat(50))
      console.log(`🌐 Server: http://localhost:${PORT} [${NODE_ENV}]`)
      console.log(`🗄️  Database: PostgreSQL connected`)
      console.log(`🔌 WebSocket: enabled`)
      console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ configured' : '❌ NOT configured'}`)
      console.log(`🤖 AI: ${ANTHROPIC_API_KEY ? '✅ configured' : '❌ NOT configured'}`)
      console.log(`🛡️  CORS origins: ${ALLOWED_ORIGINS.join(', ')}`)
      console.log('━'.repeat(50))
    })
  } catch (error) {
    console.error('💥 Failed to start server:', error)
    process.exit(1)
  }
}

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...')
  
  // Stop accepting new connections
  server.close(() => {
    console.log('📪 HTTP server closed')
  })
  
  // Close all WebSocket connections
  wss.clients.forEach((ws) => {
    ws.terminate()
  })
  
  // Clear intervals
  clearInterval(heartbeatTimer)
  clearInterval(sessionCleanupTimer)
  
  // Close database connections
  try {
    await closeDb()
    console.log('🗄️  Database connections closed')
  } catch (error) {
    console.error('Database shutdown error:', error)
  }
  
  console.log('✅ Graceful shutdown complete')
  process.exit(0)
}

// Handle shutdown signals
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer()