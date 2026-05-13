import express from 'express'
import { withDb } from '../lib/db.js'
import { sanitizeString, isValidUUID, ValidationError, NotFoundError } from '../lib/helpers.js'
import { authenticateToken, requireResourceAccess } from '../middleware/auth.js'
import { validateMiddleware, propertySchemas } from '../lib/validate.js'

const router = express.Router()

// ==========================================
// ENSURE TABLES EXIST
// ==========================================

async function ensurePropertiesTables() {
  await withDb(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        type TEXT CHECK (type IN ('residential', 'commercial', 'mixed', 'land')),
        units INTEGER DEFAULT 1,
        square_footage INTEGER,
        year_built INTEGER,
        purchase_price NUMERIC,
        current_value NUMERIC,
        monthly_rent NUMERIC,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id)`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        unit_number TEXT,
        status TEXT CHECK (status IN ('vacant', 'occupied', 'maintenance')) DEFAULT 'vacant',
        tenant_name TEXT,
        rent NUMERIC,
        lease_start DATE,
        lease_end DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id)`)
  })
}
ensurePropertiesTables().catch(err => console.error('Failed to create properties tables:', err))

// ==========================================
// PROPERTY ROUTES
// ==========================================

// List properties for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })

    const properties = await withDb(async (client) => {
      const result = await client.query(`
        SELECT p.*, 
          (SELECT COUNT(*) FROM units u WHERE u.property_id = p.id) as unit_count,
          (SELECT COUNT(*) FROM units u WHERE u.property_id = p.id AND u.status = 'occupied') as occupied_count
        FROM properties p
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
      `, [req.user!.id])
      return result.rows
    })

    res.json({ properties })
  } catch (error) {
    console.error('List properties error:', error)
    res.status(500).json({ error: 'Failed to list properties' })
  }
})

// Create property
router.post('/', authenticateToken, validateMiddleware(propertySchemas.createProperty), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })

    const { name, address, city, state, zip, type, units, squareFootage, yearBuilt, purchasePrice, currentValue, monthlyRent, notes } = req.body

    const property = await withDb(async (client) => {
      const result = await client.query(`
        INSERT INTO properties (user_id, name, address, city, state, zip, type, units, square_footage, year_built, purchase_price, current_value, monthly_rent, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        req.user!.id,
        name,
        sanitizeString(req.body.address, 500),
        sanitizeString(req.body.city, 200),
        sanitizeString(req.body.state, 100),
        sanitizeString(req.body.zip, 20),
        sanitizeString(req.body.type, 20) || 'residential',
        parseInt(req.body.units) || 1,
        req.body.square_footage ? parseInt(req.body.square_footage) : null,
        req.body.year_built ? parseInt(req.body.year_built) : null,
        req.body.purchase_price ? parseFloat(req.body.purchase_price) : null,
        req.body.current_value ? parseFloat(req.body.current_value) : null,
        req.body.monthly_rent ? parseFloat(req.body.monthly_rent) : null,
        sanitizeString(req.body.notes, 2000)
      ])
      return result.rows[0]
    })

    res.json({ property })
  } catch (error) {
    console.error('Create property error:', error)
    res.status(500).json({ error: 'Failed to create property' })
  }
})

// Get single property
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid property ID' })

    const result = await withDb(async (client) => {
      const propResult = await client.query(
        'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user!.id]
      )
      if (propResult.rows.length === 0) throw new NotFoundError('Property not found')

      const unitsResult = await client.query(
        'SELECT * FROM units WHERE property_id = $1 ORDER BY unit_number',
        [req.params.id]
      )

      return { property: propResult.rows[0], units: unitsResult.rows }
    })

    res.json(result)
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('Get property error:', error)
    res.status(500).json({ error: 'Failed to get property' })
  }
})

// Update property
router.put('/:id', authenticateToken, requireResourceAccess('property'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid property ID' })

    const property = await withDb(async (client) => {
      const result = await client.query(`
        UPDATE properties SET
          name = COALESCE($3, name),
          address = COALESCE($4, address),
          city = COALESCE($5, city),
          state = COALESCE($6, state),
          zip = COALESCE($7, zip),
          type = COALESCE($8, type),
          units = COALESCE($9, units),
          square_footage = COALESCE($10, square_footage),
          year_built = COALESCE($11, year_built),
          purchase_price = COALESCE($12, purchase_price),
          current_value = COALESCE($13, current_value),
          monthly_rent = COALESCE($14, monthly_rent),
          notes = COALESCE($15, notes),
          updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [
        req.params.id, req.user!.id,
        sanitizeString(req.body.name, 200) || null,
        sanitizeString(req.body.address, 500) || null,
        sanitizeString(req.body.city, 200) || null,
        sanitizeString(req.body.state, 100) || null,
        sanitizeString(req.body.zip, 20) || null,
        sanitizeString(req.body.type, 20) || null,
        req.body.units != null ? parseInt(req.body.units) : null,
        req.body.square_footage != null ? parseInt(req.body.square_footage) : null,
        req.body.year_built != null ? parseInt(req.body.year_built) : null,
        req.body.purchase_price != null ? parseFloat(req.body.purchase_price) : null,
        req.body.current_value != null ? parseFloat(req.body.current_value) : null,
        req.body.monthly_rent != null ? parseFloat(req.body.monthly_rent) : null,
        sanitizeString(req.body.notes, 2000) || null
      ])
      if (result.rows.length === 0) throw new NotFoundError('Property not found')
      return result.rows[0]
    })

    res.json({ property })
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('Update property error:', error)
    res.status(500).json({ error: 'Failed to update property' })
  }
})

// Delete property
router.delete('/:id', authenticateToken, requireResourceAccess('property'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid property ID' })

    await withDb(async (client) => {
      const result = await client.query(
        'DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING id',
        [req.params.id, req.user!.id]
      )
      if (result.rows.length === 0) throw new NotFoundError('Property not found')
    })

    res.json({ success: true })
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('Delete property error:', error)
    res.status(500).json({ error: 'Failed to delete property' })
  }
})

// ==========================================
// UNIT ROUTES
// ==========================================

// Helper to verify property ownership
async function verifyPropertyOwnership(client: any, propertyId: string, userId: string) {
  const r = await client.query('SELECT id FROM properties WHERE id = $1 AND user_id = $2', [propertyId, userId])
  if (r.rows.length === 0) throw new NotFoundError('Property not found')
}

// List units for a property
router.get('/:id/units', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid property ID' })

    const units = await withDb(async (client) => {
      await verifyPropertyOwnership(client, req.params.id, req.user!.id)
      const result = await client.query(
        'SELECT * FROM units WHERE property_id = $1 ORDER BY unit_number',
        [req.params.id]
      )
      return result.rows
    })

    res.json({ units })
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('List units error:', error)
    res.status(500).json({ error: 'Failed to list units' })
  }
})

// Create unit
router.post('/:id/units', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid property ID' })

    const unit = await withDb(async (client) => {
      await verifyPropertyOwnership(client, req.params.id, req.user!.id)
      const result = await client.query(`
        INSERT INTO units (property_id, unit_number, status, tenant_name, rent, lease_start, lease_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        req.params.id,
        sanitizeString(req.body.unit_number, 50),
        sanitizeString(req.body.status, 20) || 'vacant',
        sanitizeString(req.body.tenant_name, 200),
        req.body.rent ? parseFloat(req.body.rent) : null,
        req.body.lease_start || null,
        req.body.lease_end || null
      ])
      return result.rows[0]
    })

    res.json({ unit })
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('Create unit error:', error)
    res.status(500).json({ error: 'Failed to create unit' })
  }
})

// Update unit
router.put('/:id/units/:unitId', authenticateToken, requireResourceAccess('property'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id) || !isValidUUID(req.params.unitId)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    const unit = await withDb(async (client) => {
      await verifyPropertyOwnership(client, req.params.id, req.user!.id)
      const result = await client.query(`
        UPDATE units SET
          unit_number = COALESCE($3, unit_number),
          status = COALESCE($4, status),
          tenant_name = COALESCE($5, tenant_name),
          rent = COALESCE($6, rent),
          lease_start = COALESCE($7, lease_start),
          lease_end = COALESCE($8, lease_end)
        WHERE id = $1 AND property_id = $2
        RETURNING *
      `, [
        req.params.unitId, req.params.id,
        sanitizeString(req.body.unit_number, 50) || null,
        sanitizeString(req.body.status, 20) || null,
        sanitizeString(req.body.tenant_name, 200) || null,
        req.body.rent != null ? parseFloat(req.body.rent) : null,
        req.body.lease_start || null,
        req.body.lease_end || null
      ])
      if (result.rows.length === 0) throw new NotFoundError('Unit not found')
      return result.rows[0]
    })

    res.json({ unit })
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('Update unit error:', error)
    res.status(500).json({ error: 'Failed to update unit' })
  }
})

// Delete unit
router.delete('/:id/units/:unitId', authenticateToken, requireResourceAccess('property'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!isValidUUID(req.params.id) || !isValidUUID(req.params.unitId)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    await withDb(async (client) => {
      await verifyPropertyOwnership(client, req.params.id, req.user!.id)
      const result = await client.query(
        'DELETE FROM units WHERE id = $1 AND property_id = $2 RETURNING id',
        [req.params.unitId, req.params.id]
      )
      if (result.rows.length === 0) throw new NotFoundError('Unit not found')
    })

    res.json({ success: true })
  } catch (error: any) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error('Delete unit error:', error)
    res.status(500).json({ error: 'Failed to delete unit' })
  }
})

export default router
