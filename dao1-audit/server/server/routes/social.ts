import express from 'express'
import { withDb } from '../lib/db.js'
import { 
  sanitizeString, 
  validatePagination, 
  ValidationError,
  NotFoundError,
  ForbiddenError,
  isValidUUID,
  generateSlug
} from '../lib/helpers.js'
import { authenticateToken, optionalAuth, verifyBusinessAccess } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = express.Router()

// ==========================================
// FEED ROUTES
// ==========================================

// Get activity feed
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const posts = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          p.id, p.type, p.content, p.media_urls, p.tags, p.project_id, p.property_id,
          p.visibility, p.likes_count, p.comments_count, p.shares_count, p.pinned, p.created_at,
          u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
          bp.id as business_id, bp.name as business_name, bp.logo_url as business_logo,
          EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN business_pages bp ON p.business_id = bp.id
        LEFT JOIN follows f ON (f.following_id = p.author_id AND f.following_type = 'user') OR (f.following_id = p.business_id AND f.following_type = 'business')
        WHERE f.follower_id = $1 OR p.author_id = $1 OR p.business_id IN (
          SELECT business_id FROM business_members WHERE user_id = $1
        ) OR p.visibility = 'public'
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `, [req.user.id, limit, offset])

      return result.rows
    })

    res.json({ posts })
  } catch (error) {
    console.error('Get feed error:', error)
    res.status(500).json({ error: 'Failed to get feed' })
  }
})

// Get discover feed (public posts)
router.get('/feed/discover', optionalAuth, async (req, res) => {
  try {
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)

    const posts = await withDb(async (client) => {
      const params = [limit, offset]
      let query = `
        SELECT 
          p.id, p.type, p.content, p.media_urls, p.tags, p.project_id, p.property_id,
          p.visibility, p.likes_count, p.comments_count, p.shares_count, p.pinned, p.created_at,
          u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
          bp.id as business_id, bp.name as business_name, bp.logo_url as business_logo,
          ${req.user ? `EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $3)` : 'false'} as is_liked
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN business_pages bp ON p.business_id = bp.id
        WHERE p.visibility = 'public'
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `

      if (req.user) {
        params.push(req.user.id)
      }

      const result = await client.query(query, params)
      return result.rows
    })

    res.json({ posts })
  } catch (error) {
    console.error('Get discover feed error:', error)
    res.status(500).json({ error: 'Failed to get discover feed' })
  }
})

// ==========================================
// POST ROUTES
// ==========================================

// Create post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const content = sanitizeString(req.body.content, 5000)
    const type = sanitizeString(req.body.type, 20) || 'update'
    const visibility = sanitizeString(req.body.visibility, 20) || 'public'
    const businessId = req.body.businessId
    const mediaUrls = req.body.mediaUrls || []
    const tags = req.body.tags || []
    const projectId = sanitizeString(req.body.projectId, 100)
    const propertyId = sanitizeString(req.body.propertyId, 100)

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (!['update', 'auto', 'announcement'].includes(type)) {
      return res.status(400).json({ error: 'Invalid post type' })
    }

    if (!['public', 'private', 'business'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility setting' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // If posting as business, verify user is member
      if (businessId) {
        if (!isValidUUID(businessId)) {
          throw new ValidationError('Invalid business ID format')
        }

        const hasAccess = await verifyBusinessAccess(req.user!.id, businessId)
        if (!hasAccess) {
          throw new ForbiddenError('Not authorized to post as this business')
        }
      }

      const postResult = await client.query(`
        INSERT INTO posts (author_id, business_id, type, content, media_urls, tags, project_id, property_id, visibility)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [req.user!.id, businessId, type, content, mediaUrls, tags, projectId, propertyId, visibility])

      return postResult.rows[0]
    })

    res.json({ 
      id: result.id,
      createdAt: result.created_at,
      success: true 
    })
  } catch (error) {
    console.error('Create post error:', error)
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// Get single post with comments
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id

    if (!isValidUUID(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' })
    }

    const result = await withDb(async (client) => {
      // Get post
      const postParams = [postId]
      let postQuery = `
        SELECT 
          p.*, 
          u.display_name as author_name, u.avatar_url as author_avatar,
          bp.name as business_name, bp.logo_url as business_logo,
          ${req.user ? `EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $2)` : 'false'} as is_liked
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN business_pages bp ON p.business_id = bp.id
        WHERE p.id = $1
      `

      if (req.user) {
        postParams.push(req.user.id)
      }

      const postResult = await client.query(postQuery, postParams)

      if (postResult.rows.length === 0) {
        throw new NotFoundError('Post not found')
      }

      const post = postResult.rows[0]

      // Check visibility
      if (post.visibility === 'private' && (!req.user || req.user.id !== post.author_id)) {
        throw new ForbiddenError('Post is private')
      }

      // Get comments
      const commentsResult = await client.query(`
        SELECT 
          c.id, c.content, c.created_at,
          u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar
        FROM post_comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
      `, [postId])

      return {
        post,
        comments: commentsResult.rows
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get post error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to get post' })
  }
})

// Delete post
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id

    if (!isValidUUID(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      const result = await client.query(`
        DELETE FROM posts 
        WHERE id = $1 AND (author_id = $2 OR business_id IN (
          SELECT business_id FROM business_members WHERE user_id = $2 AND role IN ('owner', 'admin')
        ))
        RETURNING id
      `, [postId, req.user.id])

      if (result.rows.length === 0) {
        throw new NotFoundError('Post not found or not authorized')
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// Toggle like on post
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id

    if (!isValidUUID(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Check if already liked
      const existingLike = await client.query(`
        SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2
      `, [postId, req.user!.id])

      let liked = false
      if (existingLike.rows.length > 0) {
        // Unlike
        await client.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, req.user!.id])
        await client.query(`UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1`, [postId])
      } else {
        // Like
        await client.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [postId, req.user!.id])
        await client.query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [postId])
        liked = true
      }

      // Get updated count
      const countResult = await client.query(`SELECT likes_count FROM posts WHERE id = $1`, [postId])
      const likesCount = countResult.rows[0]?.likes_count || 0

      return { liked, likesCount }
    })

    res.json(result)
  } catch (error) {
    console.error('Toggle like error:', error)
    res.status(500).json({ error: 'Failed to toggle like' })
  }
})

// Add comment to post
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id
    const content = sanitizeString(req.body.content, 1000)

    if (!isValidUUID(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' })
    }

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      const commentResult = await client.query(`
        INSERT INTO post_comments (post_id, author_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, created_at
      `, [postId, req.user!.id, content])

      // Update comment count
      await client.query(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`, [postId])

      return {
        id: commentResult.rows[0].id,
        content,
        created_at: commentResult.rows[0].created_at,
        author_id: req.user!.id,
        author_name: req.user!.displayName,
        author_avatar: req.user!.avatarUrl
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// ==========================================
// PROFILE ROUTES
// ==========================================

// Get user profile
router.get('/profiles/:userId', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId

    if (!isValidUUID(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    const result = await withDb(async (client) => {
      // Get user and profile
      const userResult = await client.query(`
        SELECT 
          u.id, u.email, u.display_name, u.avatar_url, u.bio, u.created_at,
          p.headline, p.location, p.website, p.phone, p.skills, p.cover_image_url, p.is_public
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `, [userId])

      if (userResult.rows.length === 0) {
        throw new NotFoundError('User not found')
      }

      const user = userResult.rows[0]

      // Check if profile is public or if it's the user's own profile
      if (!user.is_public && (!req.user || req.user.id !== userId)) {
        throw new ForbiddenError('Profile is private')
      }

      // Get recent posts
      const postsResult = await client.query(`
        SELECT 
          p.id, p.type, p.content, p.media_urls, p.tags, p.visibility,
          p.likes_count, p.comments_count, p.created_at,
          bp.name as business_name, bp.logo_url as business_logo
        FROM posts p
        LEFT JOIN business_pages bp ON p.business_id = bp.id
        WHERE p.author_id = $1 AND (p.visibility = 'public' OR $2 = $1)
        ORDER BY p.created_at DESC
        LIMIT 10
      `, [userId, req.user?.id])

      return {
        user: {
          id: user.id,
          email: req.user?.id === userId ? user.email : undefined, // Only show email to owner
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          createdAt: user.created_at,
          headline: user.headline,
          location: user.location,
          website: user.website,
          phone: req.user?.id === userId ? user.phone : undefined, // Only show phone to owner
          skills: user.skills,
          coverImageUrl: user.cover_image_url,
          isPublic: user.is_public
        },
        posts: postsResult.rows
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get profile error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// Update own profile
router.put('/profiles/me', authenticateToken, async (req, res) => {
  try {
    const headline = sanitizeString(req.body.headline, 200)
    const location = sanitizeString(req.body.location, 200)
    const website = sanitizeString(req.body.website, 500)
    const phone = sanitizeString(req.body.phone, 50)
    const skills = req.body.skills || []
    const coverImageUrl = sanitizeString(req.body.coverImageUrl, 500)
    const isPublic = req.body.isPublic !== undefined ? req.body.isPublic : true

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Upsert profile
      await client.query(`
        INSERT INTO profiles (user_id, headline, location, website, phone, skills, cover_image_url, is_public, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          headline = EXCLUDED.headline,
          location = EXCLUDED.location,
          website = EXCLUDED.website,
          phone = EXCLUDED.phone,
          skills = EXCLUDED.skills,
          cover_image_url = EXCLUDED.cover_image_url,
          is_public = EXCLUDED.is_public,
          updated_at = NOW()
      `, [req.user.id, headline, location, website, phone, skills, coverImageUrl, isPublic])
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get posts by user
router.get('/profiles/:userId/posts', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)

    if (!isValidUUID(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    const posts = await withDb(async (client) => {
      const params = [userId, req.user?.id, limit, offset]
      let query = `
        SELECT 
          p.id, p.type, p.content, p.media_urls, p.tags, p.visibility,
          p.likes_count, p.comments_count, p.created_at,
          u.display_name as author_name, u.avatar_url as author_avatar,
          bp.name as business_name, bp.logo_url as business_logo,
          ${req.user ? `EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $2)` : 'false'} as is_liked
        FROM posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN business_pages bp ON p.business_id = bp.id
        WHERE p.author_id = $1 AND (p.visibility = 'public' OR $2 = $1)
        ORDER BY p.created_at DESC
        LIMIT $3 OFFSET $4
      `

      if (!req.user) {
        // Remove user ID parameter if no user authenticated
        params.splice(1, 1) // Remove req.user.id
        query = query.replace('$2', 'NULL').replace('$3', '$2').replace('$4', '$3')
      }

      const result = await client.query(query, params)
      return result.rows
    })

    res.json({ posts })
  } catch (error) {
    console.error('Get user posts error:', error)
    res.status(500).json({ error: 'Failed to get user posts' })
  }
})

// ==========================================
// BUSINESS PAGES ROUTES
// ==========================================

// Create business page
router.post('/businesses', authenticateToken, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 200)
    let slug = sanitizeString(req.body.slug, 100).toLowerCase()
    const description = sanitizeString(req.body.description, 1000)
    const category = sanitizeString(req.body.category, 100)
    const location = sanitizeString(req.body.location, 200)
    const phone = sanitizeString(req.body.phone, 50)
    const email = sanitizeString(req.body.email, 254)
    const website = sanitizeString(req.body.website, 500)
    const logoUrl = sanitizeString(req.body.logoUrl, 500)
    const coverUrl = sanitizeString(req.body.coverUrl, 500)

    if (!name) {
      return res.status(400).json({ error: 'Business name is required' })
    }

    // Generate slug if not provided
    if (!slug) {
      slug = generateSlug(name)
    } else {
      slug = generateSlug(slug)
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Check slug availability
      const existingSlug = await client.query('SELECT id FROM business_pages WHERE slug = $1', [slug])
      if (existingSlug.rows.length > 0) {
        // Append random number to make it unique
        slug = `${slug}-${Date.now().toString().slice(-6)}`
      }

      const businessResult = await client.query(`
        INSERT INTO business_pages (owner_id, name, slug, description, category, location, phone, email, website, logo_url, cover_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at
      `, [req.user!.id, name, slug, description, category, location, phone, email, website, logoUrl, coverUrl])

      const business = businessResult.rows[0]

      // Add owner as admin member
      await client.query(`
        INSERT INTO business_members (business_id, user_id, role, title)
        VALUES ($1, $2, 'owner', 'Owner')
      `, [business.id, req.user!.id])

      return {
        id: business.id,
        slug,
        createdAt: business.created_at
      }
    })

    res.json({ 
      ...result,
      success: true 
    })
  } catch (error) {
    console.error('Create business error:', error)
    res.status(500).json({ error: 'Failed to create business' })
  }
})

// Get business page by slug
router.get('/businesses/:slug', optionalAuth, async (req, res) => {
  try {
    const slug = req.params.slug

    const result = await withDb(async (client) => {
      // Get business page
      const businessParams = [slug]
      let businessQuery = `
        SELECT 
          bp.*,
          u.display_name as owner_name,
          ${req.user ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = bp.id AND following_type = 'business')` : 'false'} as is_following
        FROM business_pages bp
        JOIN users u ON bp.owner_id = u.id
        WHERE bp.slug = $1 AND bp.is_public = true
      `

      if (req.user) {
        businessParams.push(req.user.id)
      }

      const businessResult = await client.query(businessQuery, businessParams)

      if (businessResult.rows.length === 0) {
        throw new NotFoundError('Business not found')
      }

      const business = businessResult.rows[0]

      // Get team members
      const membersResult = await client.query(`
        SELECT 
          bm.role, bm.title, bm.joined_at,
          u.id, u.display_name, u.avatar_url
        FROM business_members bm
        JOIN users u ON bm.user_id = u.id
        WHERE bm.business_id = $1
        ORDER BY 
          CASE bm.role 
            WHEN 'owner' THEN 1 
            WHEN 'admin' THEN 2 
            ELSE 3 
          END,
          bm.joined_at ASC
      `, [business.id])

      // Get recent posts
      const postsParams = [business.id]
      let postsQuery = `
        SELECT 
          p.id, p.type, p.content, p.media_urls, p.tags,
          p.likes_count, p.comments_count, p.created_at,
          u.display_name as author_name, u.avatar_url as author_avatar,
          ${req.user ? `EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $2)` : 'false'} as is_liked
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.business_id = $1 AND p.visibility = 'public'
        ORDER BY p.created_at DESC
        LIMIT 10
      `

      if (req.user) {
        postsParams.push(req.user.id)
      }

      const postsResult = await client.query(postsQuery, postsParams)

      return {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          description: business.description,
          category: business.category,
          location: business.location,
          phone: business.phone,
          email: business.email,
          website: business.website,
          logoUrl: business.logo_url,
          coverUrl: business.cover_url,
          verified: business.verified,
          createdAt: business.created_at,
          ownerName: business.owner_name,
          isFollowing: business.is_following
        },
        members: membersResult.rows,
        posts: postsResult.rows
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get business error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to get business' })
  }
})

// Get user's businesses
router.get('/businesses', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const businesses = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          bp.id, bp.name, bp.slug, bp.description, bp.category, bp.logo_url, bp.created_at,
          bm.role, bm.title
        FROM business_pages bp
        JOIN business_members bm ON bp.id = bm.business_id
        WHERE bm.user_id = $1
        ORDER BY bp.name ASC
      `, [req.user.id])

      return result.rows
    })

    res.json({ businesses })
  } catch (error) {
    console.error('Get user businesses error:', error)
    res.status(500).json({ error: 'Failed to get businesses' })
  }
})

// ==========================================
// FOLLOW ROUTES
// ==========================================

// Follow/unfollow user or business
router.post('/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = req.body.followingId
    const followingType = req.body.followingType

    if (!followingId || !isValidUUID(followingId)) {
      return res.status(400).json({ error: 'Valid following ID required' })
    }

    if (!followingType || !['user', 'business'].includes(followingType)) {
      return res.status(400).json({ error: 'Valid following type required (user or business)' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Check if already following
      const existing = await client.query(`
        SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2 AND following_type = $3
      `, [req.user!.id, followingId, followingType])

      let following = false
      if (existing.rows.length > 0) {
        // Unfollow
        await client.query(`
          DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 AND following_type = $3
        `, [req.user!.id, followingId, followingType])
      } else {
        // Follow
        await client.query(`
          INSERT INTO follows (follower_id, following_id, following_type) VALUES ($1, $2, $3)
        `, [req.user!.id, followingId, followingType])
        following = true
      }

      return { following }
    })

    res.json(result)
  } catch (error) {
    console.error('Follow/unfollow error:', error)
    res.status(500).json({ error: 'Failed to update follow status' })
  }
})

// Get followers of user or business
router.get('/followers/:id/:type', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id
    const type = req.params.type

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    if (!['user', 'business'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type (user or business)' })
    }

    const followers = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          u.id, u.display_name, u.avatar_url, u.bio,
          f.created_at as followed_at
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = $1 AND f.following_type = $2
        ORDER BY f.created_at DESC
      `, [id, type])

      return result.rows
    })

    res.json({ followers })
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({ error: 'Failed to get followers' })
  }
})

// Get who current user follows
router.get('/following', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const following = await withDb(async (client) => {
      // Get users they follow
      const usersResult = await client.query(`
        SELECT 
          u.id, u.display_name, u.avatar_url, u.bio,
          f.created_at as followed_at, 'user' as type
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = $1 AND f.following_type = 'user'
        ORDER BY f.created_at DESC
      `, [req.user.id])

      // Get businesses they follow
      const businessResult = await client.query(`
        SELECT 
          bp.id, bp.name as display_name, bp.logo_url as avatar_url, bp.description as bio,
          f.created_at as followed_at, 'business' as type
        FROM follows f
        JOIN business_pages bp ON f.following_id = bp.id
        WHERE f.follower_id = $1 AND f.following_type = 'business'
        ORDER BY f.created_at DESC
      `, [req.user.id])

      return [...usersResult.rows, ...businessResult.rows]
        .sort((a, b) => new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime())
    })

    res.json({ following })
  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({ error: 'Failed to get following list' })
  }
})

export default router