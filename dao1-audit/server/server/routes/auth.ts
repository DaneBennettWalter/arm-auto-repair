import express from 'express'
import crypto from 'crypto'
import { withDb } from '../lib/db.js'
import { 
  sanitizeString, 
  isValidEmail, 
  hashPassword, 
  verifyPassword, 
  generateToken,
  ValidationError,
  UnauthorizedError
} from '../lib/helpers.js'
import { authenticateToken } from '../middleware/auth.js'
import { authRate, rateLimit } from '../middleware/rateLimit.js'
import { seedDefaultData } from '../lib/seed.js'

const router = express.Router()

// ==========================================
// AUTH ROUTES
// ==========================================

// Register new user
router.post('/register', authRate, async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 254)
    const password = sanitizeString(req.body.password, 128)
    const displayName = sanitizeString(req.body.displayName, 100)

    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (!displayName || displayName.length < 1) {
      return res.status(400).json({ error: 'Display name is required' })
    }

    const result = await withDb(async (client) => {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1', 
        [email]
      )
      if (existingUser.rows.length > 0) {
        throw new ValidationError('User with this email already exists')
      }

      // Create user
      const passwordHash = hashPassword(password)
      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, display_name, avatar_url, bio, role, created_at
      `, [email, passwordHash, displayName])

      const user = userResult.rows[0]

      // Check if this is the first user - make them admin
      const userCount = await client.query('SELECT COUNT(*) FROM users')
      const isFirstUser = parseInt(userCount.rows[0].count) === 1
      if (isFirstUser) {
        await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id])
        user.role = 'admin'
        
        // Seed default data for the first admin user
        await seedDefaultData({ client, firstUserId: user.id })
      }

      // Seed default channels if they don't exist and add user to them
      const generalExists = await client.query(
        'SELECT id FROM conversations WHERE name = $1 AND type = $2', 
        ['#general', 'channel']
      )
      let generalId
      if (generalExists.rows.length === 0) {
        const generalResult = await client.query(`
          INSERT INTO conversations (type, name, created_by)
          VALUES ($1, $2, $3)
          RETURNING id
        `, ['channel', '#general', user.id])
        generalId = generalResult.rows[0].id
      } else {
        generalId = generalExists.rows[0].id
      }

      const announcementsExists = await client.query(
        'SELECT id FROM conversations WHERE name = $1 AND type = $2', 
        ['#announcements', 'channel']
      )
      let announcementsId
      if (announcementsExists.rows.length === 0) {
        const announcementsResult = await client.query(`
          INSERT INTO conversations (type, name, created_by)
          VALUES ($1, $2, $3)
          RETURNING id
        `, ['channel', '#announcements', user.id])
        announcementsId = announcementsResult.rows[0].id
      } else {
        announcementsId = announcementsExists.rows[0].id
      }

      // Add user to both channels
      await client.query(`
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES ($1, $2), ($3, $2)
        ON CONFLICT DO NOTHING
      `, [generalId, user.id, announcementsId])

      // Create session token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      await client.query(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, token, expiresAt])

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          role: user.role,
          createdAt: user.created_at
        }
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Register error:', error)
    
    if (error instanceof ValidationError) {
      return res.status(409).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login user
router.post('/login', authRate, async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 254)
    const password = sanitizeString(req.body.password, 128)

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await withDb(async (client) => {
      const userResult = await client.query(
        'SELECT * FROM users WHERE email = $1', 
        [email]
      )
      
      if (userResult.rows.length === 0) {
        throw new UnauthorizedError('Invalid email or password')
      }

      const user = userResult.rows[0]
      if (!verifyPassword(password, user.password_hash)) {
        throw new UnauthorizedError('Invalid email or password')
      }

      // Create session token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      await client.query(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, token, expiresAt])

      // Update last seen
      await client.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id])

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          role: user.role
        }
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const displayName = sanitizeString(req.body.displayName, 100)
    const bio = sanitizeString(req.body.bio, 500)
    const avatarUrl = sanitizeString(req.body.avatarUrl, 500)

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      const updateResult = await client.query(`
        UPDATE users 
        SET display_name = $1, bio = $2, avatar_url = $3
        WHERE id = $4
        RETURNING id, email, display_name, avatar_url, bio, role
      `, [
        displayName || req.user!.displayName, 
        bio, 
        avatarUrl, 
        req.user!.id
      ])

      return { user: updateResult.rows[0] }
    })

    res.json(result)
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Profile update failed' })
  }
})

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const currentPassword = sanitizeString(req.body.currentPassword, 128)
    const newPassword = sanitizeString(req.body.newPassword, 128)

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Get current password hash
      const userResult = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user!.id]
      )

      if (userResult.rows.length === 0) {
        throw new UnauthorizedError('User not found')
      }

      // Verify current password
      if (!verifyPassword(currentPassword, userResult.rows[0].password_hash)) {
        throw new UnauthorizedError('Current password is incorrect')
      }

      // Update password
      const newPasswordHash = hashPassword(newPassword)
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, req.user!.id]
      )

      // Invalidate all sessions except current one
      const authHeader = req.headers.authorization
      const currentToken = authHeader && authHeader.split(' ')[1]
      
      if (currentToken) {
        await client.query(
          'DELETE FROM sessions WHERE user_id = $1 AND token != $2',
          [req.user!.id, currentToken]
        )
      }
    })

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password change error:', error)
    
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Password change failed' })
  }
})

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      await withDb(async (client) => {
        await client.query('DELETE FROM sessions WHERE token = $1', [token])
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Logout from all devices
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [req.user!.id])
    })

    res.json({ success: true, message: 'Logged out from all devices' })
  } catch (error) {
    console.error('Logout all error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Get active sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const sessions = await withDb(async (client) => {
      const result = await client.query(`
        SELECT id, created_at, expires_at, 
               CASE WHEN token = $2 THEN true ELSE false END as is_current
        FROM sessions 
        WHERE user_id = $1 AND expires_at > NOW()
        ORDER BY created_at DESC
      `, [req.user!.id, req.headers.authorization?.split(' ')[1]])

      return result.rows
    })

    res.json({ sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({ error: 'Failed to get sessions' })
  }
})

// Revoke specific session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      const result = await client.query(
        'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
        [sessionId, req.user!.id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' })
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Revoke session error:', error)
    res.status(500).json({ error: 'Failed to revoke session' })
  }
})

// ==========================================
// OAUTH SUPPORT
// ==========================================

// Temporary storage for OAuth state/PKCE codes (in production, use Redis)
const oauthState = new Map<string, { 
  codeVerifier?: string
  state: string
  provider: 'google' | 'x'
  timestamp: number 
}>()

// Cleanup expired state entries every 30 minutes
setInterval(() => {
  const expiry = Date.now() - 10 * 60 * 1000 // 10 minutes
  for (const [key, value] of oauthState.entries()) {
    if (value.timestamp < expiry) {
      oauthState.delete(key)
    }
  }
}, 30 * 60 * 1000)

// Helper: Generate PKCE codes
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  return { codeVerifier, codeChallenge }
}

// Helper: Create or find user from OAuth profile
async function createOrFindOAuthUser(
  client: any, 
  provider: 'google' | 'x',
  profile: { 
    id: string
    email?: string
    name: string
    picture?: string 
  }
) {
  const idColumn = provider === 'google' ? 'google_id' : 'x_id'
  
  // First try to find by OAuth ID
  let userResult = await client.query(`
    SELECT * FROM users WHERE ${idColumn} = $1
  `, [profile.id])
  
  let user = userResult.rows[0]
  
  // If not found by OAuth ID, try by email (for account linking)
  if (!user && profile.email) {
    userResult = await client.query(`
      SELECT * FROM users WHERE email = $1
    `, [profile.email])
    
    user = userResult.rows[0]
    
    // Link OAuth ID to existing account
    if (user) {
      await client.query(`
        UPDATE users SET ${idColumn} = $1, auth_provider = $2 WHERE id = $3
      `, [profile.id, provider, user.id])
    }
  }
  
  // Create new user if not found
  if (!user) {
    if (!profile.email) {
      throw new ValidationError('Email is required to create an account')
    }
    
    // Generate a random password (they won't use it)
    const randomPassword = crypto.randomBytes(32).toString('hex')
    const passwordHash = hashPassword(randomPassword)
    
    const insertData = [
      profile.email,
      passwordHash,
      profile.name,
      profile.picture || null,
      profile.id,
      provider
    ]
    
    const insertFields = provider === 'google' 
      ? 'email, password_hash, display_name, avatar_url, google_id, auth_provider'
      : 'email, password_hash, display_name, avatar_url, x_id, auth_provider'
    
    const createResult = await client.query(`
      INSERT INTO users (${insertFields})
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, display_name, avatar_url, bio, role, created_at
    `, insertData)
    
    user = createResult.rows[0]
    
    // Check if this is the first user - make them admin
    const userCount = await client.query('SELECT COUNT(*) FROM users')
    if (parseInt(userCount.rows[0].count) === 1) {
      await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id])
      user.role = 'admin'
    }
    
    // Add to default channels
    const generalExists = await client.query(
      'SELECT id FROM conversations WHERE name = $1 AND type = $2', 
      ['#general', 'channel']
    )
    let generalId = generalExists.rows[0]?.id
    
    const announcementsExists = await client.query(
      'SELECT id FROM conversations WHERE name = $1 AND type = $2', 
      ['#announcements', 'channel']
    )
    let announcementsId = announcementsExists.rows[0]?.id
    
    if (generalId || announcementsId) {
      const values = []
      let valueIndex = 2
      if (generalId) values.push(`($1, $${valueIndex++})`)
      if (announcementsId) values.push(`($1, $${valueIndex++})`)
      
      const params = [user.id]
      if (generalId) params.push(generalId)
      if (announcementsId) params.push(announcementsId)
      
      if (values.length > 0) {
        await client.query(`
          INSERT INTO conversation_members (user_id, conversation_id)
          VALUES ${values.join(', ')}
          ON CONFLICT DO NOTHING
        `, params)
      }
    }
  }
  
  return user
}

// ==========================================
// GOOGLE OAUTH ROUTES
// ==========================================

router.get('/google', authRate, (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://manager.dao1.earth/api/auth/google/callback'
    
    if (!GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google OAuth not configured on this server' })
    }
    
    const state = crypto.randomBytes(16).toString('hex')
    
    oauthState.set(state, {
      state,
      provider: 'google',
      timestamp: Date.now()
    })
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline'
    })
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    res.redirect(googleAuthUrl)
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    res.status(500).json({ error: 'OAuth initialization failed' })
  }
})

router.get('/google/callback', authRate, async (req, res) => {
  try {
    const { code, state } = req.query
    
    if (!code || !state) {
      return res.redirect('https://manager.dao1.earth/auth/error?message=Missing authorization code')
    }
    
    // Verify state
    const storedState = oauthState.get(state as string)
    if (!storedState || storedState.provider !== 'google') {
      return res.redirect('https://manager.dao1.earth/auth/error?message=Invalid state parameter')
    }
    
    oauthState.delete(state as string)
    
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://manager.dao1.earth/api/auth/google/callback'
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect('https://manager.dao1.earth/auth/error?message=Google OAuth not configured')
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI
      }).toString()
    })
    
    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text())
      return res.redirect('https://manager.dao1.earth/auth/error?message=Token exchange failed')
    }
    
    const tokens = await tokenResponse.json()
    
    // Verify and decode ID token
    const userInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`)
    
    if (!userInfoResponse.ok) {
      console.error('Google token verification failed')
      return res.redirect('https://manager.dao1.earth/auth/error?message=Token verification failed')
    }
    
    const profile = await userInfoResponse.json()
    
    // Create or find user and create session
    const result = await withDb(async (client) => {
      const user = await createOrFindOAuthUser(client, 'google', {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      })
      
      // Create session token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      await client.query(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, token, expiresAt])
      
      // Update last seen
      await client.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id])
      
      return { token, user }
    })
    
    res.redirect(`https://manager.dao1.earth/auth/callback?token=${result.token}`)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    res.redirect('https://manager.dao1.earth/auth/error?message=Authentication failed')
  }
})

// ==========================================
// X/TWITTER OAUTH ROUTES
// ==========================================

router.get('/x', authRate, (req, res) => {
  try {
    const X_CLIENT_ID = process.env.X_CLIENT_ID
    
    if (!X_CLIENT_ID) {
      return res.status(503).json({ error: 'X OAuth not configured on this server' })
    }
    
    const state = crypto.randomBytes(16).toString('hex')
    const { codeVerifier, codeChallenge } = generatePKCE()
    
    oauthState.set(state, {
      codeVerifier,
      state,
      provider: 'x',
      timestamp: Date.now()
    })
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: X_CLIENT_ID,
      redirect_uri: 'https://manager.dao1.earth/api/auth/x/callback',
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })
    
    const xAuthUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    res.redirect(xAuthUrl)
  } catch (error) {
    console.error('X OAuth initiation error:', error)
    res.status(500).json({ error: 'OAuth initialization failed' })
  }
})

router.get('/x/callback', authRate, async (req, res) => {
  try {
    const { code, state } = req.query
    
    if (!code || !state) {
      return res.redirect('https://manager.dao1.earth/auth/error?message=Missing authorization code')
    }
    
    // Verify state and get code verifier
    const storedState = oauthState.get(state as string)
    if (!storedState || storedState.provider !== 'x' || !storedState.codeVerifier) {
      return res.redirect('https://manager.dao1.earth/auth/error?message=Invalid state parameter')
    }
    
    const { codeVerifier } = storedState
    oauthState.delete(state as string)
    
    const X_CLIENT_ID = process.env.X_CLIENT_ID
    const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET
    
    if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
      return res.redirect('https://manager.dao1.earth/auth/error?message=X OAuth not configured')
    }
    
    // Exchange code for access token using PKCE
    const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: 'https://manager.dao1.earth/api/auth/x/callback',
        code_verifier: codeVerifier
      }).toString()
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('X token exchange failed:', errorText)
      return res.redirect('https://manager.dao1.earth/auth/error?message=Token exchange failed')
    }
    
    const tokens = await tokenResponse.json()
    
    // Get user profile
    const profileResponse = await fetch('https://api.x.com/2/users/me?user.fields=profile_image_url,name', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })
    
    if (!profileResponse.ok) {
      console.error('X profile fetch failed')
      return res.redirect('https://manager.dao1.earth/auth/error?message=Profile fetch failed')
    }
    
    const profileData = await profileResponse.json()
    const profile = profileData.data
    
    // Create or find user and create session
    const result = await withDb(async (client) => {
      const user = await createOrFindOAuthUser(client, 'x', {
        id: profile.id,
        name: profile.name,
        picture: profile.profile_image_url?.replace('_normal', '_400x400') // Get higher resolution
        // X API v2 doesn't provide email in basic scope
      })
      
      // Create session token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      await client.query(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, token, expiresAt])
      
      // Update last seen
      await client.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id])
      
      return { token, user }
    })
    
    res.redirect(`https://manager.dao1.earth/auth/callback?token=${result.token}`)
  } catch (error) {
    console.error('X OAuth callback error:', error)
    res.redirect('https://manager.dao1.earth/auth/error?message=Authentication failed')
  }
})

export default router