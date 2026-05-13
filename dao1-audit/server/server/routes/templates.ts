import express from 'express'
import { withDb } from '../lib/db.js'
import { 
  sanitizeString, 
  ValidationError,
  NotFoundError,
  ForbiddenError,
  generateSlug,
  isValidUUID
} from '../lib/helpers.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// ==========================================
// WIDGET TEMPLATES ROUTES
// ==========================================

// Get all templates
router.get('/', optionalAuth, async (req, res) => {
  try {
    const templates = await withDb(async (client) => {
      let query = `
        SELECT 
          wt.*,
          u.display_name as created_by_name
        FROM widget_templates wt
        LEFT JOIN users u ON wt.created_by = u.id
        WHERE wt.is_public = true
      `
      
      const params: any[] = []
      
      if (req.user) {
        query += ` OR wt.created_by = $1`
        params.push(req.user.id)
      }
      
      query += ` ORDER BY wt.is_default DESC, wt.install_count DESC, wt.name ASC`

      const result = await client.query(query, params)
      return result.rows
    })

    res.json({ templates })
  } catch (error) {
    console.error('Get templates error:', error)
    res.status(500).json({ error: 'Failed to get templates' })
  }
})

// Get templates by role
router.get('/role/:role', optionalAuth, async (req, res) => {
  try {
    const role = sanitizeString(req.params.role, 50)

    if (!role) {
      return res.status(400).json({ error: 'Role is required' })
    }

    const templates = await withDb(async (client) => {
      let query = `
        SELECT 
          wt.*,
          u.display_name as created_by_name
        FROM widget_templates wt
        LEFT JOIN users u ON wt.created_by = u.id
        WHERE wt.role = $1 AND (wt.is_public = true
      `
      
      const params = [role]
      
      if (req.user) {
        query += ` OR wt.created_by = $2)`
        params.push(req.user.id)
      } else {
        query += ')'
      }
      
      query += ` ORDER BY wt.is_default DESC, wt.install_count DESC, wt.name ASC`

      const result = await client.query(query, params)
      return result.rows
    })

    res.json({ templates })
  } catch (error) {
    console.error('Get templates by role error:', error)
    res.status(500).json({ error: 'Failed to get templates' })
  }
})

// Get template by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const slug = req.params.slug

    const template = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          wt.*,
          u.display_name as created_by_name
        FROM widget_templates wt
        LEFT JOIN users u ON wt.created_by = u.id
        WHERE wt.slug = $1 AND (wt.is_public = true OR wt.created_by = $2)
      `, [slug, req.user?.id])

      if (result.rows.length === 0) {
        throw new NotFoundError('Template not found')
      }

      return result.rows[0]
    })

    res.json({ template })
  } catch (error) {
    console.error('Get template error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to get template' })
  }
})

// Create custom template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 200)
    let slug = sanitizeString(req.body.slug, 100)
    const description = sanitizeString(req.body.description, 1000)
    const role = sanitizeString(req.body.role, 50) || 'custom'
    const icon = sanitizeString(req.body.icon, 50)
    const widgetIds = req.body.widgetIds || []
    const dashboardLayout = req.body.dashboardLayout
    const isPublic = req.body.isPublic !== false // Default to true

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' })
    }

    if (!Array.isArray(widgetIds) || widgetIds.length === 0) {
      return res.status(400).json({ error: 'At least one widget ID is required' })
    }

    if (widgetIds.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 widgets per template' })
    }

    // Validate widget IDs
    const validWidgetIds = [
      'rent-roll', 'budget-tracker', 'task-list', 'stats-cards', 'approval-flow',
      'voting-widget', 'kanban-board', 'gantt-chart', 'calendar', 'notes',
      'file-manager', 'team-chat', 'analytics', 'reports', 'invoice-manager'
    ]

    for (const widgetId of widgetIds) {
      if (!validWidgetIds.includes(widgetId)) {
        return res.status(400).json({ error: `Invalid widget ID: ${widgetId}` })
      }
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
      const existingSlug = await client.query('SELECT id FROM widget_templates WHERE slug = $1', [slug])
      if (existingSlug.rows.length > 0) {
        // Append user ID to make it unique
        slug = `${slug}-${req.user!.id.slice(-8)}`
        
        // Check again
        const finalCheck = await client.query('SELECT id FROM widget_templates WHERE slug = $1', [slug])
        if (finalCheck.rows.length > 0) {
          throw new ValidationError('Template with this slug already exists')
        }
      }

      // Validate dashboard layout if provided
      if (dashboardLayout) {
        if (typeof dashboardLayout !== 'object') {
          throw new ValidationError('Dashboard layout must be an object')
        }

        // Ensure all widget IDs in layout exist in widgetIds array
        for (const widgetId of Object.keys(dashboardLayout)) {
          if (!widgetIds.includes(widgetId)) {
            throw new ValidationError(`Layout contains widget '${widgetId}' not in widget list`)
          }
        }
      }

      const templateResult = await client.query(`
        INSERT INTO widget_templates (name, slug, description, role, icon, widget_ids, dashboard_layout, created_by, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [name, slug, description, role, icon, widgetIds, dashboardLayout, req.user!.id, isPublic])

      return templateResult.rows[0]
    })

    res.json({
      id: result.id,
      slug,
      createdAt: result.created_at,
      success: true
    })
  } catch (error) {
    console.error('Create template error:', error)
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to create template' })
  }
})

// Update template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id

    if (!isValidUUID(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID format' })
    }

    const name = sanitizeString(req.body.name, 200)
    const description = sanitizeString(req.body.description, 1000)
    const icon = sanitizeString(req.body.icon, 50)
    const widgetIds = req.body.widgetIds || []
    const dashboardLayout = req.body.dashboardLayout
    const isPublic = req.body.isPublic !== undefined ? req.body.isPublic : true

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Check if template exists and user owns it
      const templateCheck = await client.query(`
        SELECT * FROM widget_templates WHERE id = $1 AND created_by = $2
      `, [templateId, req.user!.id])

      if (templateCheck.rows.length === 0) {
        throw new NotFoundError('Template not found or not owned by user')
      }

      const template = templateCheck.rows[0]

      // Don't allow editing default templates
      if (template.is_default) {
        throw new ForbiddenError('Cannot edit default templates')
      }

      // Validate widget IDs if provided
      if (widgetIds.length > 0) {
        const validWidgetIds = [
          'rent-roll', 'budget-tracker', 'task-list', 'stats-cards', 'approval-flow',
          'voting-widget', 'kanban-board', 'gantt-chart', 'calendar', 'notes',
          'file-manager', 'team-chat', 'analytics', 'reports', 'invoice-manager'
        ]

        for (const widgetId of widgetIds) {
          if (!validWidgetIds.includes(widgetId)) {
            throw new ValidationError(`Invalid widget ID: ${widgetId}`)
          }
        }

        if (widgetIds.length > 20) {
          throw new ValidationError('Maximum 20 widgets per template')
        }
      }

      // Validate dashboard layout if provided
      if (dashboardLayout && widgetIds.length > 0) {
        if (typeof dashboardLayout !== 'object') {
          throw new ValidationError('Dashboard layout must be an object')
        }

        // Ensure all widget IDs in layout exist in widgetIds array
        for (const widgetId of Object.keys(dashboardLayout)) {
          if (!widgetIds.includes(widgetId)) {
            throw new ValidationError(`Layout contains widget '${widgetId}' not in widget list`)
          }
        }
      }

      // Update template
      const updateQuery = `
        UPDATE widget_templates 
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            icon = COALESCE($4, icon),
            widget_ids = COALESCE($5, widget_ids),
            dashboard_layout = COALESCE($6, dashboard_layout),
            is_public = COALESCE($7, is_public)
        WHERE id = $1
      `

      await client.query(updateQuery, [
        templateId,
        name || null,
        description || null,
        icon || null,
        widgetIds.length > 0 ? widgetIds : null,
        dashboardLayout || null,
        isPublic
      ])
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Update template error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to update template' })
  }
})

// Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id

    if (!isValidUUID(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Check if template exists and user owns it
      const templateCheck = await client.query(`
        SELECT * FROM widget_templates WHERE id = $1 AND created_by = $2
      `, [templateId, req.user!.id])

      if (templateCheck.rows.length === 0) {
        throw new NotFoundError('Template not found or not owned by user')
      }

      const template = templateCheck.rows[0]

      // Don't allow deleting default templates
      if (template.is_default) {
        throw new ForbiddenError('Cannot delete default templates')
      }

      // Delete template
      await client.query('DELETE FROM widget_templates WHERE id = $1', [templateId])
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

// Apply template (install/use)
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id

    if (!isValidUUID(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      const templateResult = await client.query(`
        SELECT * FROM widget_templates 
        WHERE id = $1 AND (is_public = true OR created_by = $2)
      `, [templateId, req.user!.id])

      if (templateResult.rows.length === 0) {
        throw new NotFoundError('Template not found')
      }

      const template = templateResult.rows[0]

      // Increment install count (but not for own templates)
      if (template.created_by !== req.user!.id) {
        await client.query(
          'UPDATE widget_templates SET install_count = install_count + 1 WHERE id = $1', 
          [templateId]
        )
      }

      return {
        widgetIds: template.widget_ids,
        dashboardLayout: template.dashboard_layout,
        templateName: template.name,
        templateRole: template.role
      }
    })

    res.json({
      ...result,
      success: true
    })
  } catch (error) {
    console.error('Apply template error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to apply template' })
  }
})

// Clone template (create copy)
router.post('/:id/clone', authenticateToken, async (req, res) => {
  try {
    const templateId = req.params.id
    const newName = sanitizeString(req.body.name, 200)

    if (!isValidUUID(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Get original template
      const originalResult = await client.query(`
        SELECT * FROM widget_templates 
        WHERE id = $1 AND (is_public = true OR created_by = $2)
      `, [templateId, req.user!.id])

      if (originalResult.rows.length === 0) {
        throw new NotFoundError('Template not found')
      }

      const original = originalResult.rows[0]

      // Generate new name and slug
      const cloneName = newName || `${original.name} (Copy)`
      const baseSlug = generateSlug(cloneName)
      let cloneSlug = baseSlug

      // Ensure unique slug
      let counter = 1
      while (true) {
        const slugCheck = await client.query('SELECT id FROM widget_templates WHERE slug = $1', [cloneSlug])
        if (slugCheck.rows.length === 0) break
        
        cloneSlug = `${baseSlug}-${counter}`
        counter++
        
        if (counter > 100) {
          throw new ValidationError('Unable to generate unique slug')
        }
      }

      // Create clone
      const cloneResult = await client.query(`
        INSERT INTO widget_templates (name, slug, description, role, icon, widget_ids, dashboard_layout, created_by, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [
        cloneName,
        cloneSlug,
        `${original.description} (Cloned)`,
        original.role,
        original.icon,
        original.widget_ids,
        original.dashboard_layout,
        req.user!.id,
        false // Clones start as private
      ])

      return {
        id: cloneResult.rows[0].id,
        name: cloneName,
        slug: cloneSlug,
        createdAt: cloneResult.rows[0].created_at
      }
    })

    res.json({
      ...result,
      success: true
    })
  } catch (error) {
    console.error('Clone template error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to clone template' })
  }
})

// Get user's created templates
router.get('/my/created', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const templates = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          wt.*,
          u.display_name as created_by_name
        FROM widget_templates wt
        JOIN users u ON wt.created_by = u.id
        WHERE wt.created_by = $1
        ORDER BY wt.created_at DESC
      `, [req.user.id])

      return result.rows
    })

    res.json({ templates })
  } catch (error) {
    console.error('Get user templates error:', error)
    res.status(500).json({ error: 'Failed to get user templates' })
  }
})

// Get popular templates
router.get('/popular', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50)

    const templates = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          wt.*,
          u.display_name as created_by_name
        FROM widget_templates wt
        LEFT JOIN users u ON wt.created_by = u.id
        WHERE wt.is_public = true
        ORDER BY wt.install_count DESC, wt.created_at DESC
        LIMIT $1
      `, [limit])

      return result.rows
    })

    res.json({ templates })
  } catch (error) {
    console.error('Get popular templates error:', error)
    res.status(500).json({ error: 'Failed to get popular templates' })
  }
})

// Get available widget types
router.get('/widgets/available', async (req, res) => {
  try {
    const widgets = [
      { id: 'rent-roll', name: 'Rent Roll', category: 'property', description: 'Track rental income and tenant information' },
      { id: 'budget-tracker', name: 'Budget Tracker', category: 'finance', description: 'Monitor project budgets and expenses' },
      { id: 'task-list', name: 'Task List', category: 'productivity', description: 'Manage tasks and assignments' },
      { id: 'stats-cards', name: 'Stats Cards', category: 'analytics', description: 'Display key performance metrics' },
      { id: 'approval-flow', name: 'Approval Flow', category: 'workflow', description: 'Manage approval processes' },
      { id: 'voting-widget', name: 'Voting Widget', category: 'governance', description: 'Community voting and polls' },
      { id: 'kanban-board', name: 'Kanban Board', category: 'productivity', description: 'Visual project management' },
      { id: 'gantt-chart', name: 'Gantt Chart', category: 'productivity', description: 'Timeline and milestone tracking' },
      { id: 'calendar', name: 'Calendar', category: 'scheduling', description: 'Event and meeting management' },
      { id: 'notes', name: 'Notes', category: 'productivity', description: 'Quick notes and documentation' },
      { id: 'file-manager', name: 'File Manager', category: 'storage', description: 'Document and file organization' },
      { id: 'team-chat', name: 'Team Chat', category: 'communication', description: 'Internal team communication' },
      { id: 'analytics', name: 'Analytics', category: 'analytics', description: 'Advanced data analysis and reporting' },
      { id: 'reports', name: 'Reports', category: 'analytics', description: 'Generate and view reports' },
      { id: 'invoice-manager', name: 'Invoice Manager', category: 'finance', description: 'Create and manage invoices' }
    ]

    res.json({ widgets })
  } catch (error) {
    console.error('Get available widgets error:', error)
    res.status(500).json({ error: 'Failed to get available widgets' })
  }
})

export default router