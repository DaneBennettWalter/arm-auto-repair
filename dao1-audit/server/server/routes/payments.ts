import express from 'express'
import Stripe from 'stripe'
import { withDb } from '../lib/db.js'
import { 
  sanitizeString, 
  isPositiveNumber,
  isValidEmail,
  validatePagination,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  isValidUUID
} from '../lib/helpers.js'
import { authenticateToken, verifyBusinessAccess } from '../middleware/auth.js'
import { rateLimit, heavyRate } from '../middleware/rateLimit.js'

const router = express.Router()

// ==========================================
// STRIPE SETUP
// ==========================================

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('FATAL: STRIPE_SECRET_KEY environment variable is required')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)

// ==========================================
// USER SEARCH (for payment recipient picker)
// ==========================================

router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const q = sanitizeString(req.query.q as string, 100)
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

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
        // Return recent payment contacts
        const result = await client.query(`
          SELECT DISTINCT u.id, u.display_name, u.email, u.avatar_url
          FROM users u
          JOIN payments p ON (p.to_user_id = u.id OR p.from_user_id = u.id)
          WHERE (p.from_user_id = $1 OR p.to_user_id = $1)
            AND u.id != $1
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

// ==========================================
// STRIPE INVOICE ENDPOINTS
// ==========================================

// Create invoice
router.post('/invoices', authenticateToken, heavyRate, async (req, res) => {
  try {
    const customerEmail = sanitizeString(req.body.customerEmail, 254)
    const customerName = sanitizeString(req.body.customerName, 200)
    const description = sanitizeString(req.body.description, 1000)
    const lineItems = req.body.lineItems
    const dueDate = req.body.dueDate

    // Validation
    if (!customerEmail || !isValidEmail(customerEmail)) {
      return res.status(400).json({ error: 'Valid customer email is required' })
    }
    if (!customerName) {
      return res.status(400).json({ error: 'Customer name is required' })
    }
    if (!Array.isArray(lineItems) || lineItems.length === 0 || lineItems.length > 100) {
      return res.status(400).json({ error: 'At least one line item is required (max 100)' })
    }

    // Validate each line item
    for (const item of lineItems) {
      if (!item.description || typeof item.description !== 'string') {
        return res.status(400).json({ error: 'Each line item must have a description' })
      }
      if (!isPositiveNumber(item.quantity) || item.quantity > 99999) {
        return res.status(400).json({ error: 'Each line item must have a valid quantity' })
      }
      if (typeof item.unitAmount !== 'number' || item.unitAmount < 0 || item.unitAmount > 999999) {
        return res.status(400).json({ error: 'Each line item must have a valid unit amount' })
      }
    }

    // Validate due date if provided
    if (dueDate) {
      const parsedDate = new Date(dueDate)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid due date format' })
      }
    }

    // Find or create customer
    let customer: Stripe.Customer
    const existing = await stripe.customers.list({ email: customerEmail, limit: 1 })
    if (existing.data.length > 0) {
      customer = existing.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      })
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      description: description || undefined,
      due_date: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : undefined,
      collection_method: 'send_invoice',
      days_until_due: dueDate ? undefined : 30,
    })

    // Add line items
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id!,
        description: sanitizeString(item.description, 500),
        quantity: item.quantity,
        unit_amount: Math.round(item.unitAmount * 100), // Stripe uses cents
      })
    }

    res.json({
      invoiceId: invoice.id,
      paymentUrl: invoice.hosted_invoice_url,
    })
  } catch (error: any) {
    console.error('Create invoice error:', error.message)
    res.status(500).json({ error: 'Failed to create invoice' })
  }
})

// List invoices
router.get('/invoices', authenticateToken, async (_req, res) => {
  try {
    const invoices = await stripe.invoices.list({ limit: 100 })
    res.json({
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        status: inv.status,
        total: (inv.total || 0) / 100,
        customerEmail: inv.customer_email,
        customerName: (inv.customer_name) || inv.customer_email,
        description: inv.description,
        paymentUrl: inv.hosted_invoice_url,
        created: inv.created,
        dueDate: inv.due_date,
      }))
    })
  } catch (error: any) {
    console.error('List invoices error:', error.message)
    res.status(500).json({ error: 'Failed to list invoices' })
  }
})

// Get invoice detail
router.get('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoiceId = req.params.id
    if (!invoiceId || !invoiceId.startsWith('in_')) {
      return res.status(400).json({ error: 'Invalid invoice ID' })
    }

    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['lines'],
    })

    res.json({
      id: invoice.id,
      status: invoice.status,
      total: (invoice.total || 0) / 100,
      subtotal: (invoice.subtotal || 0) / 100,
      tax: (invoice.tax || 0) / 100,
      customerEmail: invoice.customer_email,
      customerName: (invoice.customer_name) || invoice.customer_email,
      paymentUrl: invoice.hosted_invoice_url,
      created: invoice.created,
      dueDate: invoice.due_date,
      description: invoice.description,
      lineItems: (invoice.lines?.data || []).map(li => ({
        description: li.description,
        quantity: li.quantity,
        unitAmount: (li.unit_amount_excluding_tax ? parseFloat(li.unit_amount_excluding_tax) : (li.amount || 0)) / 100,
        amount: (li.amount || 0) / 100,
      })),
    })
  } catch (error: any) {
    console.error('Get invoice detail error:', error.message)
    res.status(500).json({ error: 'Failed to get invoice' })
  }
})

// Send invoice
router.post('/invoices/:id/send', authenticateToken, async (req, res) => {
  try {
    const invoiceId = req.params.id
    // Validate Stripe invoice ID format
    if (!invoiceId || !invoiceId.startsWith('in_')) {
      return res.status(400).json({ error: 'Invalid invoice ID' })
    }

    // Finalize first if still draft
    let invoice = await stripe.invoices.retrieve(invoiceId)
    if (invoice.status === 'draft') {
      invoice = await stripe.invoices.finalizeInvoice(invoiceId)
    }

    await stripe.invoices.sendInvoice(invoiceId)

    res.json({
      success: true,
      paymentUrl: invoice.hosted_invoice_url,
    })
  } catch (error: any) {
    console.error('Send invoice error:', error.message)
    res.status(500).json({ error: 'Failed to send invoice' })
  }
})

// ==========================================
// INTERNAL PAYMENTS SYSTEM
// ==========================================

// Create payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const toUserId = req.body.toUserId
    const amount = parseFloat(req.body.amount)
    const description = sanitizeString(req.body.description, 500)
    const type = sanitizeString(req.body.type, 20) || 'p2p'
    const invoiceId = sanitizeString(req.body.invoiceId, 100)
    const paymentMethod = sanitizeString(req.body.paymentMethod, 20) || 'card'

    if (!toUserId || !isValidUUID(toUserId)) {
      return res.status(400).json({ error: 'Valid recipient ID required' })
    }
    
    if (!isPositiveNumber(amount)) {
      return res.status(400).json({ error: 'Valid positive amount required' })
    }

    if (!['p2p', 'invoice', 'payroll', 'subscription'].includes(type)) {
      return res.status(400).json({ error: 'Invalid payment type' })
    }

    if (!['card', 'ach', 'btc'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method (card, ach, btc)' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Verify recipient exists
      const recipientCheck = await client.query('SELECT id FROM users WHERE id = $1', [toUserId])
      if (recipientCheck.rows.length === 0) {
        throw new ValidationError('Recipient not found')
      }

      const paymentResult = await client.query(`
        INSERT INTO payments (from_user_id, to_user_id, amount, type, description, invoice_id, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `, [req.user!.id, toUserId, amount, type, description, invoiceId, paymentMethod])

      return paymentResult.rows[0]
    })

    res.json({ 
      id: result.id,
      createdAt: result.created_at,
      success: true 
    })
  } catch (error) {
    console.error('Create payment error:', error)
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

// List user's payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const payments = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          p.*,
          u_from.display_name as from_name,
          u_to.display_name as to_name
        FROM payments p
        LEFT JOIN users u_from ON p.from_user_id = u_from.id
        LEFT JOIN users u_to ON p.to_user_id = u_to.id
        WHERE p.from_user_id = $1 OR p.to_user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `, [req.user.id, limit, offset])

      return result.rows
    })

    res.json({ payments })
  } catch (error) {
    console.error('List payments error:', error)
    res.status(500).json({ error: 'Failed to list payments' })
  }
})

// Get payment balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const balance = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN to_user_id = $1 AND status = 'completed' THEN amount ELSE 0 END), 0) as total_received,
          COALESCE(SUM(CASE WHEN from_user_id = $1 AND status = 'completed' THEN amount ELSE 0 END), 0) as total_sent,
          COALESCE(SUM(CASE WHEN to_user_id = $1 AND status = 'pending' THEN amount ELSE 0 END), 0) as pending_received,
          COALESCE(SUM(CASE WHEN from_user_id = $1 AND status = 'pending' THEN amount ELSE 0 END), 0) as pending_sent
        FROM payments
        WHERE from_user_id = $1 OR to_user_id = $1
      `, [req.user.id])

      const balanceData = result.rows[0]
      return {
        totalReceived: parseFloat(balanceData.total_received),
        totalSent: parseFloat(balanceData.total_sent),
        pendingReceived: parseFloat(balanceData.pending_received),
        pendingSent: parseFloat(balanceData.pending_sent),
        netBalance: parseFloat(balanceData.total_received) - parseFloat(balanceData.total_sent)
      }
    })

    res.json(balance)
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({ error: 'Failed to get balance' })
  }
})

// Process payment via Stripe
router.post('/:id/process', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id
    
    if (!isValidUUID(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Get payment details
      const paymentResult = await client.query(`
        SELECT * FROM payments WHERE id = $1 AND (from_user_id = $2 OR to_user_id = $2)
      `, [paymentId, req.user!.id])

      if (paymentResult.rows.length === 0) {
        throw new NotFoundError('Payment not found')
      }

      const payment = paymentResult.rows[0]
      
      if (payment.status !== 'pending') {
        throw new ValidationError('Payment already processed')
      }

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Convert to cents
        currency: payment.currency || 'usd',
        metadata: {
          payment_id: paymentId,
          from_user_id: payment.from_user_id,
          to_user_id: payment.to_user_id
        }
      })

      // Update payment with Stripe reference
      await client.query(`
        UPDATE payments 
        SET provider_ref = $1, status = 'processing'
        WHERE id = $2
      `, [paymentIntent.id, paymentId])

      return {
        client_secret: paymentIntent.client_secret,
        amount: payment.amount
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Process payment error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to process payment' })
  }
})

// ==========================================
// PAYROLL ROUTES
// ==========================================

// Create payroll run
router.post('/payroll', authenticateToken, async (req, res) => {
  try {
    const businessId = req.body.businessId
    const periodStart = req.body.periodStart
    const periodEnd = req.body.periodEnd

    if (!businessId || !isValidUUID(businessId)) {
      return res.status(400).json({ error: 'Valid business ID required' })
    }
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Period start and end dates required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Verify user has access to this business
      const hasAccess = await verifyBusinessAccess(req.user!.id, businessId, ['owner', 'admin'])
      if (!hasAccess) {
        throw new ForbiddenError('Not authorized to create payroll for this business')
      }

      const payrollResult = await client.query(`
        INSERT INTO payroll_runs (business_id, created_by, period_start, period_end, total_amount)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `, [businessId, req.user!.id, periodStart, periodEnd, 0])

      return payrollResult.rows[0]
    })

    res.json({
      id: result.id,
      createdAt: result.created_at,
      success: true
    })
  } catch (error) {
    console.error('Create payroll error:', error)
    
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to create payroll run' })
  }
})

// Get payroll runs for a business
router.get('/payroll', authenticateToken, async (req, res) => {
  try {
    const businessId = req.query.businessId as string
    
    if (!businessId || !isValidUUID(businessId)) {
      return res.status(400).json({ error: 'Valid business ID required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Verify user has access to this business
    const hasAccess = await verifyBusinessAccess(req.user.id, businessId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view payroll for this business' })
    }

    const payrollRuns = await withDb(async (client) => {
      const result = await client.query(`
        SELECT 
          pr.*,
          u.display_name as created_by_name
        FROM payroll_runs pr
        JOIN users u ON pr.created_by = u.id
        WHERE pr.business_id = $1
        ORDER BY pr.created_at DESC
      `, [businessId])

      return result.rows
    })

    res.json({ payrollRuns })
  } catch (error) {
    console.error('Get payroll runs error:', error)
    res.status(500).json({ error: 'Failed to get payroll runs' })
  }
})

// Get payroll run with items
router.get('/payroll/:id', authenticateToken, async (req, res) => {
  try {
    const payrollId = req.params.id

    if (!isValidUUID(payrollId)) {
      return res.status(400).json({ error: 'Invalid payroll ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      const payrollResult = await client.query(`
        SELECT 
          pr.*,
          bp.name as business_name,
          u.display_name as created_by_name
        FROM payroll_runs pr
        JOIN business_pages bp ON pr.business_id = bp.id
        JOIN users u ON pr.created_by = u.id
        WHERE pr.id = $1
      `, [payrollId])

      if (payrollResult.rows.length === 0) {
        throw new NotFoundError('Payroll run not found')
      }

      const payroll = payrollResult.rows[0]

      // Verify user has access to this business
      const hasAccess = await verifyBusinessAccess(req.user.id, payroll.business_id)
      if (!hasAccess) {
        throw new ForbiddenError('Not authorized to view this payroll')
      }

      const itemsResult = await client.query(`
        SELECT * FROM payroll_items WHERE payroll_run_id = $1 ORDER BY employee_name
      `, [payrollId])

      return {
        payroll,
        items: itemsResult.rows
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get payroll run error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to get payroll run' })
  }
})

// Update payroll run
router.put('/payroll/:id', authenticateToken, async (req, res) => {
  try {
    const payrollId = req.params.id
    const { items } = req.body

    if (!isValidUUID(payrollId)) {
      return res.status(400).json({ error: 'Invalid payroll ID format' })
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // Verify access and get payroll details
      const payrollCheck = await client.query(`
        SELECT pr.*, bp.id as business_id FROM payroll_runs pr
        JOIN business_pages bp ON pr.business_id = bp.id
        WHERE pr.id = $1
      `, [payrollId])

      if (payrollCheck.rows.length === 0) {
        throw new NotFoundError('Payroll run not found')
      }

      const payroll = payrollCheck.rows[0]
      
      const hasAccess = await verifyBusinessAccess(req.user.id, payroll.business_id, ['owner', 'admin'])
      if (!hasAccess) {
        throw new ForbiddenError('Not authorized to update this payroll')
      }

      if (payroll.status !== 'draft') {
        throw new ValidationError('Can only update draft payroll runs')
      }

      // Clear existing items
      await client.query('DELETE FROM payroll_items WHERE payroll_run_id = $1', [payrollId])

      // Add new items and calculate total
      let totalAmount = 0
      for (const item of items) {
        const amount = parseFloat(item.amount) || 0
        const hours = parseFloat(item.hours) || 0
        const rate = parseFloat(item.rate) || 0
        
        if (!item.employeeName) {
          throw new ValidationError('Employee name is required for all items')
        }
        
        totalAmount += amount

        await client.query(`
          INSERT INTO payroll_items (payroll_run_id, employee_user_id, employee_name, hours, rate, amount, type, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          payrollId, 
          item.employeeUserId || null, 
          sanitizeString(item.employeeName, 200), 
          hours, 
          rate, 
          amount, 
          sanitizeString(item.type, 20) || 'regular',
          sanitizeString(item.notes, 500)
        ])
      }

      // Update total
      await client.query('UPDATE payroll_runs SET total_amount = $1 WHERE id = $2', [totalAmount, payrollId])

      return { totalAmount }
    })

    res.json({ success: true, totalAmount: result.totalAmount })
  } catch (error) {
    console.error('Update payroll error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to update payroll run' })
  }
})

// Approve and process payroll
router.post('/payroll/:id/approve', authenticateToken, async (req, res) => {
  try {
    const payrollId = req.params.id

    if (!isValidUUID(payrollId)) {
      return res.status(400).json({ error: 'Invalid payroll ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      // Verify access and get payroll details
      const payrollResult = await client.query(`
        SELECT pr.*, bp.id as business_id FROM payroll_runs pr
        JOIN business_pages bp ON pr.business_id = bp.id
        WHERE pr.id = $1
      `, [payrollId])

      if (payrollResult.rows.length === 0) {
        throw new NotFoundError('Payroll run not found')
      }

      const payroll = payrollResult.rows[0]
      
      const hasAccess = await verifyBusinessAccess(req.user.id, payroll.business_id, ['owner', 'admin'])
      if (!hasAccess) {
        throw new ForbiddenError('Not authorized to approve this payroll')
      }

      if (payroll.status !== 'draft') {
        throw new ValidationError('Payroll already processed')
      }

      // Get payroll items
      const itemsResult = await client.query(`
        SELECT pi.*, u.email 
        FROM payroll_items pi
        LEFT JOIN users u ON pi.employee_user_id = u.id
        WHERE pi.payroll_run_id = $1
      `, [payrollId])

      // Update status to approved
      await client.query('UPDATE payroll_runs SET status = $1 WHERE id = $2', ['approved', payrollId])

      // Create payment records for each employee
      for (const item of itemsResult.rows) {
        if (item.employee_user_id && item.amount > 0) {
          await client.query(`
            INSERT INTO payments (from_user_id, to_user_id, amount, type, description, status)
            VALUES ($1, $2, $3, 'payroll', $4, 'completed')
          `, [
            req.user!.id, 
            item.employee_user_id, 
            item.amount, 
            `Payroll payment for ${item.employee_name}`
          ])
        }
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Approve payroll error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to approve payroll' })
  }
})

// ==========================================
// PAYMENT ACCOUNTS MANAGEMENT
// ==========================================

// Get user's payment accounts
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const accounts = await withDb(async (client) => {
      const result = await client.query(`
        SELECT id, type, label, is_default, created_at
        FROM payment_accounts 
        WHERE user_id = $1 
        ORDER BY is_default DESC, created_at DESC
      `, [req.user.id])

      return result.rows
    })

    res.json({ accounts })
  } catch (error) {
    console.error('Get payment accounts error:', error)
    res.status(500).json({ error: 'Failed to get payment accounts' })
  }
})

// Add payment account
router.post('/accounts', authenticateToken, async (req, res) => {
  try {
    const type = sanitizeString(req.body.type, 20)
    const label = sanitizeString(req.body.label, 100)
    const isDefault = req.body.isDefault || false

    if (!type || !['stripe', 'btc', 'manual'].includes(type)) {
      return res.status(400).json({ error: 'Valid account type required (stripe, btc, manual)' })
    }

    if (!label) {
      return res.status(400).json({ error: 'Account label required' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await withDb(async (client) => {
      // If this is set as default, unset other defaults
      if (isDefault) {
        await client.query(
          'UPDATE payment_accounts SET is_default = false WHERE user_id = $1',
          [req.user!.id]
        )
      }

      const accountResult = await client.query(`
        INSERT INTO payment_accounts (user_id, type, label, is_default)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `, [req.user!.id, type, label, isDefault])

      return accountResult.rows[0]
    })

    res.json({ 
      id: result.id,
      createdAt: result.created_at,
      success: true 
    })
  } catch (error) {
    console.error('Add payment account error:', error)
    res.status(500).json({ error: 'Failed to add payment account' })
  }
})

// Delete payment account
router.delete('/accounts/:id', authenticateToken, async (req, res) => {
  try {
    const accountId = req.params.id

    if (!isValidUUID(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID format' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await withDb(async (client) => {
      const result = await client.query(
        'DELETE FROM payment_accounts WHERE id = $1 AND user_id = $2 RETURNING id',
        [accountId, req.user!.id]
      )

      if (result.rows.length === 0) {
        throw new NotFoundError('Payment account not found')
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete payment account error:', error)
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to delete payment account' })
  }
})

export default router