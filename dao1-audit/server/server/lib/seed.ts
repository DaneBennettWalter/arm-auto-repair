/**
 * Seed default data for new DAO1 Manager installations
 */

import { Pool } from 'pg'

interface SeedDataOptions {
  client: any // Database client
  firstUserId: string
}

export async function seedDefaultData({ client, firstUserId }: SeedDataOptions): Promise<void> {
  console.log('🌱 Seeding default data for DAO1 Manager...')

  try {
    // Check if we already have business pages - if so, skip seeding
    const existingBusinesses = await client.query('SELECT COUNT(*) FROM business_pages')
    if (parseInt(existingBusinesses.rows[0].count) > 0) {
      console.log('📦 Seed data already exists, skipping...')
      return
    }

    // Create default business pages
    await seedBusinessPages(client, firstUserId)
    
    // Create default feed posts
    await seedFeedPosts(client, firstUserId)
    
    console.log('✅ Seed data created successfully')
  } catch (error) {
    console.error('❌ Error seeding default data:', error)
    // Don't throw - seeding failure shouldn't break user registration
  }
}

async function seedBusinessPages(client: any, userId: string): Promise<void> {
  console.log('  📊 Creating business pages...')

  // Hotel Brendle
  const hotelBrendle = await client.query(`
    INSERT INTO business_pages (
      name, slug, category, description, location, 
      contact_email, created_by, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
    ) RETURNING id
  `, [
    'Hotel Brendle',
    'hotel-brendle',
    'property_management',
    'Historic hotel and community hub — birthplace of Texas Hold\'em',
    'Robstown, TX',
    'info@hotelbrendle.com',
    userId
  ])

  // Coastal Bend Builders
  const coastalBendBuilders = await client.query(`
    INSERT INTO business_pages (
      name, slug, category, description, location,
      contact_email, created_by, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
    ) RETURNING id
  `, [
    'Coastal Bend Builders',
    'cbbtx', 
    'construction',
    'Full-service construction and renovation',
    'Corpus Christi, TX',
    'info@cbbtx.com',
    userId
  ])

  console.log(`    ✅ Created Hotel Brendle (${hotelBrendle.rows[0].id})`)
  console.log(`    ✅ Created Coastal Bend Builders (${coastalBendBuilders.rows[0].id})`)
}

async function seedFeedPosts(client: any, userId: string): Promise<void> {
  console.log('  📰 Creating feed posts...')

  const posts = [
    {
      content: '🏗️ Welcome to DAO1 Manager! Your workspace is ready. Start by exploring the Widget Store or creating a Business Page.',
      type: 'auto'
    },
    {
      content: '🎉 Hotel Brendle has joined the platform',
      type: 'auto'
    },
    {
      content: '🎉 Coastal Bend Builders has joined the platform', 
      type: 'auto'
    }
  ]

  for (const post of posts) {
    await client.query(`
      INSERT INTO feed_posts (
        author_id, content, type, created_at, updated_at
      ) VALUES (
        $1, $2, $3, NOW(), NOW()
      )
    `, [userId, post.content, post.type])
  }

  console.log(`    ✅ Created ${posts.length} welcome posts`)
}

// Client-side seed data for default widgets (this runs in the browser)
export const DEFAULT_WIDGETS = [
  {
    id: 'stats-card',
    name: 'Stats Card',
    description: 'Display key metrics and KPIs'
  },
  {
    id: 'task-list', 
    name: 'Task List',
    description: 'Manage tasks and todos'
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker', 
    description: 'Track spending against budgets'
  }
]

export async function seedClientWidgets(): Promise<void> {
  // This function is called from the client-side to seed default widgets in IndexedDB
  const { db, addInstalledWidget, addDashboardWidget } = await import('../../src/lib/database')
  
  // Check if widgets are already installed
  const installedWidgets = await db.installedWidgets.toArray()
  if (installedWidgets.length > 0) {
    return // Already seeded
  }

  console.log('🔧 Installing default widgets...')

  try {
    // Install default widgets
    for (const widget of DEFAULT_WIDGETS) {
      await addInstalledWidget({
        widgetId: widget.id,
        name: widget.name,
        description: widget.description,
        installedAt: Date.now(),
        source: 'default'
      })
    }

    // Add them to dashboard layout
    for (let i = 0; i < DEFAULT_WIDGETS.length; i++) {
      const widget = DEFAULT_WIDGETS[i]
      await addDashboardWidget({
        widgetId: widget.id,
        x: i % 3,
        y: Math.floor(i / 3),
        w: 1,
        h: 1
      })
    }

    console.log('✅ Default widgets installed')
  } catch (error) {
    console.error('❌ Error installing default widgets:', error)
  }
}