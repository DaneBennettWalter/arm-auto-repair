import { Pool, PoolClient } from 'pg'

// ==========================================
// DATABASE SETUP AND CONNECTION
// ==========================================

const DB_PASSWORD = process.env.DB_PASSWORD
if (!DB_PASSWORD) {
  console.error('FATAL: DB_PASSWORD environment variable is required')
  process.exit(1)
}

export const pool = new Pool({
  user: process.env.DB_USER || 'dao1',
  password: DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dao1_prod',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  // Connection pool optimization
  min: 2,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

async function seedDefaultTemplates(client: PoolClient) {
  const templates = [
    {
      name: 'Landlord Pro',
      slug: 'landlord-pro',
      description: 'Complete toolkit for property managers and landlords',
      role: 'landlord',
      icon: 'Building2',
      widget_ids: ['rent-roll', 'budget-tracker', 'task-list', 'stats-cards', 'approval-flow'],
      dashboard_layout: {
        'rent-roll': { x: 0, y: 0, w: 6, h: 4 },
        'budget-tracker': { x: 6, y: 0, w: 6, h: 4 },
        'task-list': { x: 0, y: 4, w: 4, h: 4 },
        'stats-cards': { x: 4, y: 4, w: 4, h: 2 },
        'approval-flow': { x: 8, y: 4, w: 4, h: 4 }
      },
      is_default: true
    },
    {
      name: 'Tenant Portal',
      slug: 'tenant-portal',
      description: 'Essential tools for tenants and renters',
      role: 'tenant',
      icon: 'Home',
      widget_ids: ['stats-cards', 'voting-widget', 'task-list'],
      dashboard_layout: {
        'stats-cards': { x: 0, y: 0, w: 12, h: 2 },
        'voting-widget': { x: 0, y: 2, w: 6, h: 4 },
        'task-list': { x: 6, y: 2, w: 6, h: 4 }
      },
      is_default: true
    },
    {
      name: 'Contractor Suite',
      slug: 'contractor-suite',
      description: 'Project management tools for contractors',
      role: 'contractor',
      icon: 'Wrench',
      widget_ids: ['kanban-board', 'budget-tracker', 'task-list', 'stats-cards', 'gantt-chart'],
      dashboard_layout: {
        'kanban-board': { x: 0, y: 0, w: 8, h: 4 },
        'gantt-chart': { x: 8, y: 0, w: 4, h: 4 },
        'budget-tracker': { x: 0, y: 4, w: 4, h: 3 },
        'task-list': { x: 4, y: 4, w: 4, h: 3 },
        'stats-cards': { x: 8, y: 4, w: 4, h: 3 }
      },
      is_default: true
    },
    {
      name: 'Investor Dashboard',
      slug: 'investor-dashboard',
      description: 'Financial oversight and voting tools for investors',
      role: 'investor',
      icon: 'TrendingUp',
      widget_ids: ['stats-cards', 'budget-tracker', 'voting-widget', 'approval-flow'],
      dashboard_layout: {
        'stats-cards': { x: 0, y: 0, w: 12, h: 2 },
        'budget-tracker': { x: 0, y: 2, w: 6, h: 4 },
        'voting-widget': { x: 6, y: 2, w: 3, h: 4 },
        'approval-flow': { x: 9, y: 2, w: 3, h: 4 }
      },
      is_default: true
    },
    {
      name: 'Property Manager',
      slug: 'property-manager',
      description: 'Comprehensive management suite for property professionals',
      role: 'property-manager',
      icon: 'Building',
      widget_ids: ['rent-roll', 'kanban-board', 'task-list', 'budget-tracker', 'stats-cards', 'approval-flow'],
      dashboard_layout: {
        'rent-roll': { x: 0, y: 0, w: 4, h: 3 },
        'kanban-board': { x: 4, y: 0, w: 4, h: 3 },
        'stats-cards': { x: 8, y: 0, w: 4, h: 3 },
        'task-list': { x: 0, y: 3, w: 4, h: 3 },
        'budget-tracker': { x: 4, y: 3, w: 4, h: 3 },
        'approval-flow': { x: 8, y: 3, w: 4, h: 3 }
      },
      is_default: true
    }
  ]

  for (const template of templates) {
    try {
      await client.query(`
        INSERT INTO widget_templates (name, slug, description, role, icon, widget_ids, dashboard_layout, is_default, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (slug) DO NOTHING
      `, [
        template.name,
        template.slug,
        template.description,
        template.role,
        template.icon,
        template.widget_ids,
        JSON.stringify(template.dashboard_layout),
        template.is_default,
        true
      ])
    } catch (error) {
      console.error(`Failed to seed template ${template.slug}:`, error)
    }
  }
}

export async function initDb() {
  const client = await pool.connect()
  try {
    // Users and authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_seen TIMESTAMPTZ
      )
    `)

    // Add OAuth columns
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS x_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Messaging system
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL CHECK (type IN ('dm','channel','ai')),
        name TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        last_read TIMESTAMPTZ,
        PRIMARY KEY (conversation_id, user_id)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id),
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        edited_at TIMESTAMPTZ,
        is_pinned BOOLEAN DEFAULT false,
        reactions JSONB DEFAULT '{}'
      )
    `)

    // Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT,
        body TEXT,
        link TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Social features
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id),
        headline TEXT,
        location TEXT,
        website TEXT,
        phone TEXT,
        skills TEXT[],
        cover_image_url TEXT,
        is_public BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS business_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID REFERENCES users(id),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        cover_url TEXT,
        category TEXT,
        location TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        is_public BOOLEAN DEFAULT true,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS business_members (
        business_id UUID REFERENCES business_pages(id),
        user_id UUID REFERENCES users(id),
        role TEXT DEFAULT 'member',
        title TEXT,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (business_id, user_id)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author_id UUID REFERENCES users(id),
        business_id UUID REFERENCES business_pages(id),
        type TEXT DEFAULT 'update',
        content TEXT,
        media_urls TEXT[],
        tags TEXT[],
        project_id TEXT,
        property_id TEXT,
        visibility TEXT DEFAULT 'public',
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        pinned BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (post_id, user_id)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        author_id UUID REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS follows (
        follower_id UUID REFERENCES users(id),
        following_id UUID,
        following_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id, following_type)
      )
    `)

    // Payments system
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        type TEXT NOT NULL, -- 'stripe', 'btc', 'manual'
        label TEXT, -- "My Stripe", "BTC Wallet", etc.
        provider_data JSONB, -- stripe_customer_id, btc_address, etc.
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_user_id UUID REFERENCES users(id),
        to_user_id UUID REFERENCES users(id),
        amount DECIMAL(12,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending', -- 'pending','processing','completed','failed','refunded'
        type TEXT NOT NULL, -- 'invoice','payroll','p2p','subscription'
        provider TEXT DEFAULT 'stripe', -- 'stripe','btc','manual'
        provider_ref TEXT, -- stripe payment_intent id, btc txid, etc.
        description TEXT,
        payment_method TEXT, -- 'card','ach','btc'
        invoice_id TEXT, -- link to internal document
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS payroll_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES business_pages(id),
        created_by UUID REFERENCES users(id),
        period_start DATE,
        period_end DATE,
        status TEXT DEFAULT 'draft', -- 'draft','approved','processing','completed'
        total_amount DECIMAL(12,2),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS payroll_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payroll_run_id UUID REFERENCES payroll_runs(id),
        employee_user_id UUID REFERENCES users(id),
        employee_name TEXT NOT NULL,
        hours DECIMAL(6,2),
        rate DECIMAL(8,2),
        amount DECIMAL(10,2) NOT NULL,
        type TEXT DEFAULT 'regular', -- 'regular','overtime','bonus','deduction'
        notes TEXT
      )
    `)

    // Widget templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS widget_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        role TEXT NOT NULL, -- 'landlord','tenant','contractor','investor','custom'
        icon TEXT,
        widget_ids TEXT[] NOT NULL, -- array of widget IDs to install
        dashboard_layout JSONB, -- predefined layout positions
        is_default BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        is_public BOOLEAN DEFAULT true,
        install_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Create indexes for performance
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_members_user_id 
      ON conversation_members(user_id)
    `)
    
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_members_conversation_id 
      ON conversation_members(conversation_id)
    `)
    
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id_created_at 
      ON messages(conversation_id, created_at DESC)
    `)
    
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at 
      ON posts(created_at DESC)
    `)
    
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_id 
      ON posts(author_id)
    `)
    
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token 
      ON sessions(token)
    `)

    // Seed default widget templates
    await seedDefaultTemplates(client)

    console.log('Database tables and indexes initialized')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Helper for safe query execution with automatic cleanup
export async function withDb<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

// Cleanup function
export async function closeDb(): Promise<void> {
  await pool.end()
}