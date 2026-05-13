import express from 'express'
import { withDb } from '../lib/db.js'
import {
  sanitizeString,
  isPositiveNumber,
  isValidUUID,
  validatePagination,
  ValidationError,
} from '../lib/helpers.js'
import { authenticateToken } from '../middleware/auth.js'
import { heavyRate } from '../middleware/rateLimit.js'

const router = express.Router()

// ==========================================
// WALLET TABLES INIT
// ==========================================

async function initWalletTables() {
  try {
    await withDb(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS wallets (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid UNIQUE REFERENCES users(id),
          balance DECIMAL(12,2) DEFAULT 0.00,
          pending_balance DECIMAL(12,2) DEFAULT 0.00,
          currency VARCHAR(3) DEFAULT 'USD',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)
      await client.query(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          wallet_id uuid REFERENCES wallets(id),
          type VARCHAR(20) NOT NULL,
          amount DECIMAL(12,2) NOT NULL,
          balance_after DECIMAL(12,2) NOT NULL,
          description TEXT,
          reference_id VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)
    })
    console.log('Wallet tables initialized')
  } catch (err) {
    console.error('Failed to init wallet tables:', err)
  }
}

initWalletTables()

async function getOrCreateWallet(client: any, userId: string) {
  let result = await client.query('SELECT * FROM wallets WHERE user_id = $1', [userId])
  if (result.rows.length === 0) {
    result = await client.query(
      'INSERT INTO wallets (user_id) VALUES ($1) RETURNING *',
      [userId]
    )
  }
  return result.rows[0]
}

function formatMoney(n: number): string {
  return '$' + n.toFixed(2)
}

// ==========================================
// WALLET ENDPOINTS
// ==========================================

// Get wallet (auto-create)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const wallet = await withDb(async (client) => getOrCreateWallet(client, req.user!.id))
    res.json({
      wallet: {
        ...wallet,
        balance: parseFloat(wallet.balance),
        pending_balance: parseFloat(wallet.pending_balance),
      }
    })
  } catch (error) {
    console.error('Get wallet error:', error)
    res.status(500).json({ error: 'Failed to get wallet' })
  }
})

// Transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const { limit, offset } = validatePagination(req.query.limit as string, req.query.offset as string)

    const transactions = await withDb(async (client) => {
      const wallet = await getOrCreateWallet(client, req.user!.id)
      const result = await client.query(
        `SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [wallet.id, limit, offset]
      )
      return result.rows.map((r: any) => ({
        ...r,
        amount: parseFloat(r.amount),
        balance_after: parseFloat(r.balance_after),
      }))
    })

    res.json({ transactions })
  } catch (error) {
    console.error('Wallet transactions error:', error)
    res.status(500).json({ error: 'Failed to get transactions' })
  }
})

// Deposit (placeholder — returns success for UI flow)
router.post('/deposit', authenticateToken, heavyRate, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const amount = parseFloat(req.body.amount)
    if (!isPositiveNumber(amount) || amount < 1) {
      return res.status(400).json({ error: 'Minimum deposit is $1.00' })
    }

    // Placeholder: in production, integrate Stripe PaymentIntent here
    res.json({
      success: true,
      message: 'Deposit initiated. Payment integration pending.',
      amount,
    })
  } catch (error) {
    console.error('Wallet deposit error:', error)
    res.status(500).json({ error: 'Failed to initiate deposit' })
  }
})

// Transfer wallet-to-wallet
router.post('/transfer', authenticateToken, heavyRate, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const toUserId = req.body.toUserId
    const amount = parseFloat(req.body.amount)
    const description = sanitizeString(req.body.description, 500) || 'Wallet transfer'

    if (!toUserId || !isValidUUID(toUserId)) return res.status(400).json({ error: 'Valid recipient ID required' })
    if (!isPositiveNumber(amount) || amount < 0.01) return res.status(400).json({ error: 'Valid amount required' })
    if (toUserId === req.user.id) return res.status(400).json({ error: 'Cannot transfer to yourself' })

    const result = await withDb(async (client) => {
      const senderResult = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user!.id])
      let senderWallet = senderResult.rows[0]
      if (!senderWallet) {
        senderWallet = (await client.query('INSERT INTO wallets (user_id) VALUES ($1) RETURNING *', [req.user!.id])).rows[0]
      }

      const senderBalance = parseFloat(senderWallet.balance)
      if (senderBalance < amount) {
        throw new ValidationError(`Insufficient balance. You have ${formatMoney(senderBalance)}`)
      }

      const recipientWallet = await getOrCreateWallet(client, toUserId)
      const newSenderBalance = senderBalance - amount
      const newRecipientBalance = parseFloat(recipientWallet.balance) + amount

      await client.query('UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2', [newSenderBalance, senderWallet.id])
      await client.query('UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2', [newRecipientBalance, recipientWallet.id])

      const refId = `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id)
         VALUES ($1, 'transfer_sent', $2, $3, $4, $5)`,
        [senderWallet.id, amount, newSenderBalance, description, refId]
      )
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id)
         VALUES ($1, 'transfer_received', $2, $3, $4, $5)`,
        [recipientWallet.id, amount, newRecipientBalance, description, refId]
      )

      return { newBalance: newSenderBalance }
    })

    res.json({ success: true, balance: result.newBalance })
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message })
    console.error('Wallet transfer error:', error)
    res.status(500).json({ error: 'Failed to transfer funds' })
  }
})

export default router
