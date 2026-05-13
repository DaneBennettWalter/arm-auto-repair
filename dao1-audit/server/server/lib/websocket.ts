import { WebSocket, WebSocketServer } from 'ws'
import { pool } from './db.js'

// ==========================================
// WEBSOCKET MANAGER
// ==========================================

export interface AuthenticatedWebSocket extends WebSocket {
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

export class WebSocketManager {
  private wss: WebSocketServer
  private connectedUsers = new Map<string, AuthenticatedWebSocket[]>()
  private heartbeatInterval?: NodeJS.Timeout
  
  private readonly HEARTBEAT_INTERVAL = 30000 // 30 seconds
  private readonly CONNECTION_TIMEOUT = 60000 // 1 minute

  constructor(wss: WebSocketServer) {
    this.wss = wss
    this.setupEventHandlers()
    this.startHeartbeat()
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket) => {
      console.log('New WebSocket connection')
      ws.lastPing = Date.now()

      ws.on('pong', () => {
        ws.lastPing = Date.now()
      })

      ws.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString())
          await this.handleMessage(ws, data)
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      })

      ws.on('close', async () => {
        await this.handleDisconnect(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
    })
  }

  private async handleMessage(ws: AuthenticatedWebSocket, data: any) {
    switch (data.type) {
      case 'auth':
        await this.authenticateConnection(ws, data.token)
        break
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
      case 'subscribe':
        // Handle room subscriptions for future features
        break
      default:
        console.warn('Unknown WebSocket message type:', data.type)
    }
  }

  private async authenticateConnection(ws: AuthenticatedWebSocket, token: string) {
    if (!token) {
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        error: 'Token required' 
      }))
      return
    }

    try {
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
          if (!this.connectedUsers.has(ws.userId)) {
            this.connectedUsers.set(ws.userId, [])
          }
          this.connectedUsers.get(ws.userId)!.push(ws)

          // Send auth success
          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            data: { user: ws.user } 
          }))

          // Broadcast online presence to conversation members
          await this.broadcastPresence(ws.userId, 'online')
          
          console.log(`User ${ws.user.displayName} (${ws.userId}) connected via WebSocket`)
        } else {
          ws.send(JSON.stringify({ 
            type: 'auth_error', 
            error: 'Invalid or expired token' 
          }))
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('WebSocket authentication error:', error)
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        error: 'Authentication failed' 
      }))
    }
  }

  private async handleDisconnect(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return

    // Remove from connected users
    const userConnections = this.connectedUsers.get(ws.userId)
    if (userConnections) {
      const index = userConnections.indexOf(ws)
      if (index !== -1) {
        userConnections.splice(index, 1)
      }
      
      if (userConnections.length === 0) {
        this.connectedUsers.delete(ws.userId)
        
        // Broadcast offline status
        await this.broadcastPresence(ws.userId, 'offline')
        console.log(`User ${ws.userId} disconnected from WebSocket`)
      }
    }
  }

  private async broadcastPresence(userId: string, status: 'online' | 'offline') {
    try {
      const client = await pool.connect()
      try {
        // Get users who share conversations with this user
        const membersResult = await client.query(`
          SELECT DISTINCT cm.user_id
          FROM conversation_members cm
          JOIN conversation_members cm2 ON cm.conversation_id = cm2.conversation_id
          WHERE cm2.user_id = $1 AND cm.user_id != $1
        `, [userId])

        for (const member of membersResult.rows) {
          this.broadcastToUser(member.user_id, {
            type: 'presence',
            data: { userId, status }
          })
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Presence broadcast error:', error)
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.readyState === WebSocket.OPEN) {
          if (ws.lastPing && (now - ws.lastPing) > this.CONNECTION_TIMEOUT) {
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
    }, this.HEARTBEAT_INTERVAL)
  }

  // Public methods for broadcasting messages

  public broadcastToUser(userId: string, message: any): void {
    const userConnections = this.connectedUsers.get(userId)
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

  public broadcastToUsers(userIds: string[], message: any): void {
    userIds.forEach(userId => {
      this.broadcastToUser(userId, message)
    })
  }

  public broadcastToAll(message: any): void {
    const messageStr = JSON.stringify(message)
    this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr)
        } catch (error) {
          console.error('WebSocket broadcast error:', error)
        }
      }
    })
  }

  public broadcastToRole(role: string, message: any): void {
    const messageStr = JSON.stringify(message)
    this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.readyState === WebSocket.OPEN && ws.user?.role === role) {
        try {
          ws.send(messageStr)
        } catch (error) {
          console.error('WebSocket role broadcast error:', error)
        }
      }
    })
  }

  // Utility methods

  public getConnectedUserCount(): number {
    return this.connectedUsers.size
  }

  public getTotalConnectionCount(): number {
    return this.wss.clients.size
  }

  public getUserConnectionCount(userId: string): number {
    return this.connectedUsers.get(userId)?.length || 0
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.length > 0
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys())
  }

  // Cleanup

  public async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    // Close all connections gracefully
    this.wss.clients.forEach((ws) => {
      ws.terminate()
    })
    
    this.connectedUsers.clear()
    
    console.log('WebSocket manager shut down')
  }
}

// Utility functions for creating common message types

export function createNotificationMessage(notification: {
  type: string
  title: string
  body?: string
  link?: string
}) {
  return {
    type: 'notification',
    data: notification
  }
}

export function createMessageMessage(message: {
  id: string
  conversation_id: string
  content: string
  type: string
  created_at: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
}) {
  return {
    type: 'message',
    data: message
  }
}

export function createPresenceMessage(userId: string, status: 'online' | 'offline' | 'away') {
  return {
    type: 'presence',
    data: { userId, status }
  }
}

export function createSystemMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  return {
    type: 'system',
    data: { message, level, timestamp: new Date().toISOString() }
  }
}