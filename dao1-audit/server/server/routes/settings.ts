import express from 'express'
import { withDb } from '../lib/db.js'
import { sanitizeString } from '../lib/helpers.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Init settings table
async function initSettingsTable() {
  try {
    await withDb(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid UNIQUE REFERENCES users(id),
          theme text DEFAULT 'system',
          notifications_enabled boolean DEFAULT true,
          default_currency text DEFAULT 'USD',
          default_tax_rate numeric(5,2) DEFAULT 0,
          default_overhead_rate numeric(5,2) DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)
    })
    console.log('Settings table initialized')
  } catch (err) {
    console.error('Failed to init settings table:', err)
  }
}

initSettingsTable()

async function getOrCreateSettings(client: any, userId: string) {
  let result = await client.query('SELECT * FROM user_settings WHERE user_id = $1', [userId])
  if (result.rows.length === 0) {
    result = await client.query(
      'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
      [userId]
    )
  }
  return result.rows[0]
}

// GET /api/settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const settings = await withDb(async (client) => getOrCreateSettings(client, req.user!.id))
    res.json({
      settings: {
        ...settings,
        default_tax_rate: parseFloat(settings.default_tax_rate),
        default_overhead_rate: parseFloat(settings.default_overhead_rate),
      }
    })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Failed to get settings' })
  }
})

// PUT /api/settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })

    const theme = sanitizeString(req.body.theme, 20)
    const notificationsEnabled = req.body.notifications_enabled
    const defaultCurrency = sanitizeString(req.body.default_currency, 3)
    const defaultTaxRate = parseFloat(req.body.default_tax_rate)
    const defaultOverheadRate = parseFloat(req.body.default_overhead_rate)

    const settings = await withDb(async (client) => {
      // Ensure exists
      await getOrCreateSettings(client, req.user!.id)

      const updates: string[] = []
      const values: any[] = []
      let idx = 1

      if (theme && ['system', 'light', 'dark'].includes(theme)) {
        updates.push(`theme = $${idx++}`)
        values.push(theme)
      }
      if (typeof notificationsEnabled === 'boolean') {
        updates.push(`notifications_enabled = $${idx++}`)
        values.push(notificationsEnabled)
      }
      if (defaultCurrency && defaultCurrency.length === 3) {
        updates.push(`default_currency = $${idx++}`)
        values.push(defaultCurrency.toUpperCase())
      }
      if (!isNaN(defaultTaxRate) && defaultTaxRate >= 0 && defaultTaxRate <= 100) {
        updates.push(`default_tax_rate = $${idx++}`)
        values.push(defaultTaxRate)
      }
      if (!isNaN(defaultOverheadRate) && defaultOverheadRate >= 0 && defaultOverheadRate <= 100) {
        updates.push(`default_overhead_rate = $${idx++}`)
        values.push(defaultOverheadRate)
      }

      if (updates.length === 0) {
        return getOrCreateSettings(client, req.user!.id)
      }

      updates.push(`updated_at = NOW()`)
      values.push(req.user!.id)

      const result = await client.query(
        `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`,
        values
      )
      return result.rows[0]
    })

    res.json({
      settings: {
        ...settings,
        default_tax_rate: parseFloat(settings.default_tax_rate),
        default_overhead_rate: parseFloat(settings.default_overhead_rate),
      }
    })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

export default router
