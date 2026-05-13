# day1.build Connectivity Audit
**Date:** 2026-05-12  
**Issue:** Frontend and backend are disconnected

---

## Frontend Expects These Endpoints

From compiled JavaScript (`/assets/index-DO1OfowD.js`):

```
/api/ai/chat          ❌ Missing
/api/ai/generate      ❌ Missing  
/api/ai/search        ❌ Missing
/api/auth/me          ✅ Exists
/api/business-pages   ❌ Wrong path (should be /api/businesses)
/api/chat             ❌ Wrong path (should be /api/conversations)
/api/health           ✅ Exists
/api/org/default/settings  ❌ Missing
/api/notifications    ✅ Exists (partial match)
```

---

## Backend Provides These Routes

From server code (`/opt/dao1/apps/manager-server/server/index.ts`):

```
/api/auth/*              ✅ Auth routes
/api/conversations/*     ✅ Messaging routes (but frontend calls /api/chat)
/api/feed                ✅ Social feed
/api/posts               ✅ Social posts
/api/profiles            ✅ User profiles
/api/businesses          ✅ Business pages (but frontend calls /api/business-pages)
/api/payments            ✅ Stripe integration
/api/templates           ✅ Widget templates
/api/notifications       ✅ Notifications
```

**Missing entirely:**
- `/api/ai/*` - AI chat, generation, search
- `/api/org/*` - Organization settings

---

## The Mismatch Problem

**Frontend was built for a different API version.**

The compiled frontend code expects:
- AI features that don't exist on backend
- Different endpoint names (`/api/chat` vs `/api/conversations`)
- Organization management that isn't implemented

**This means:**
1. Frontend loads but can't fetch data
2. Features appear broken
3. Chat doesn't work (calling wrong endpoint)
4. AI features fail silently
5. Settings page 404s

---

## What The App Actually Is

Based on database schema and backend code:

**A multi-role property management workspace:**
- Landlords manage properties
- Tenants view their rentals and vote
- Contractors manage projects
- Investors track financials
- Property managers oversee everything

**Features that SHOULD work:**
- Dashboard with customizable widgets
- Rent roll tracking
- Budget management
- Task lists
- Voting/governance
- Kanban project boards
- Social feed (posts, profiles, businesses)
- Stripe payments
- Real-time WebSocket messaging
- Notifications

**Features that DON'T exist yet:**
- AI chat assistant
- AI bid generation
- AI search
- Organization settings
- API key management

---

## What Needs To Be Fixed

### Option 1: Fix Frontend to Match Backend

**Change these API calls in the frontend:**
- `/api/chat` → `/api/conversations`
- `/api/business-pages` → `/api/businesses`
- Remove `/api/ai/*` calls (or stub them)
- Remove `/api/org/*` calls (or stub them)

**Problem:** Frontend is compiled - would need source code to rebuild.

---

### Option 2: Add Missing Backend Routes

**Create these endpoints to match frontend:**

```typescript
// /api/chat → proxy to /api/conversations
router.use('/chat', (req, res, next) => {
  req.url = req.url.replace('/chat', '/conversations')
  next()
})

// /api/business-pages → proxy to /api/businesses  
router.use('/business-pages', (req, res, next) => {
  req.url = req.url.replace('/business-pages', '/businesses')
  next()
})

// /api/ai/* → Stub or implement
router.post('/ai/chat', (req, res) => {
  res.json({ error: 'AI features require API key configuration' })
})

router.post('/ai/generate', (req, res) => {
  res.json({ error: 'AI features require API key configuration' })
})

router.get('/ai/search', (req, res) => {
  res.json({ results: [] })
})

// /api/org/default/settings → Stub
router.get('/org/default/settings', (req, res) => {
  res.json({ 
    name: 'DAO1',
    features: ['properties', 'messaging', 'voting', 'payments']
  })
})
```

**This would make the frontend work with existing backend.**

---

### Option 3: Get Frontend Source Code

**Find the source repo and rebuild:**
- Fix API paths
- Remove broken features
- Deploy updated build

**Problem:** Source code location unknown. Frontend might be from a different project entirely.

---

## WebSocket Connection

Backend has WebSocket server on `/ws`:

```typescript
// From index.ts
wss.on('connection', (ws, req) => {
  // Real-time messaging
})
```

**Frontend might be trying to connect but:**
- Wrong URL
- Auth token not passed correctly
- Connection setup mismatch

Need to check frontend WebSocket implementation.

---

## Database Schema Summary

**Tables that exist:**
- `users` - User accounts
- `sessions` - Auth sessions
- `properties` - Real estate
- `units` - Individual rentable units
- `conversations` - Chat threads
- `messages` - Chat messages
- `posts` - Social feed posts
- `businesses` - Business pages
- `notifications` - User notifications
- `widget_templates` - Dashboard templates
- `payments` - Stripe transactions

**What's seeded:**
- 5 default widget templates (Landlord Pro, Tenant Portal, etc.)
- Widget types: rent-roll, budget-tracker, task-list, stats-cards, voting-widget, kanban-board, etc.

**What's missing:**
- AI conversation history
- Organization settings
- Bid requests
- Construction projects

---

## Immediate Fixes (No Rebuild Required)

### 1. Add API Route Aliases

Create `/opt/dao1/apps/manager-server/server/routes/aliases.ts`:

```typescript
import express from 'express'
const router = express.Router()

// Redirect /api/chat → /api/conversations
router.use('/chat', (req, res, next) => {
  req.url = '/conversations' + req.url
  next()
})

// Redirect /api/business-pages → /api/businesses
router.use('/business-pages', (req, res, next) => {
  req.url = '/businesses' + req.url.replace('/business-pages', '')
  next()
})

export default router
```

Add to `index.ts`:
```typescript
import aliasRoutes from './routes/aliases.js'
app.use('/api', aliasRoutes)
```

---

### 2. Add AI Stub Routes

Create `/opt/dao1/apps/manager-server/server/routes/ai.ts`:

```typescript
import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/chat', authenticateToken, (req, res) => {
  res.status(501).json({ 
    error: 'AI chat not configured',
    message: 'Contact admin to enable AI features'
  })
})

router.post('/generate', authenticateToken, (req, res) => {
  res.status(501).json({ 
    error: 'AI generation not configured'
  })
})

router.get('/search', authenticateToken, (req, res) => {
  res.json({ results: [], total: 0 })
})

export default router
```

Add to `index.ts`:
```typescript
import aiRoutes from './routes/ai.js'
app.use('/api/ai', aiRoutes)
```

---

### 3. Add Org Settings Stub

Create `/opt/dao1/apps/manager-server/server/routes/org.ts`:

```typescript
import express from 'express'
const router = express.Router()

router.get('/default/settings', (req, res) => {
  res.json({
    name: 'DAO1',
    slug: 'dao1',
    features: {
      properties: true,
      messaging: true,
      voting: true,
      payments: true,
      ai: false
    },
    roles: ['landlord', 'tenant', 'contractor', 'investor', 'property-manager']
  })
})

export default router
```

Add to `index.ts`:
```typescript
import orgRoutes from './routes/org.js'
app.use('/api/org', orgRoutes)
```

---

## After These Fixes

**What will work:**
- Frontend loads without errors
- Messaging connects (via /api/chat alias)
- Business pages load (via alias)
- AI features show "not configured" instead of 404
- Settings page loads

**What still won't work:**
- Actual AI features (need implementation)
- Bid creation (need to build)
- Real-time updates (need to debug WebSocket)

---

## Next Steps

1. Add the 3 stub route files
2. Update server/index.ts to register them
3. Restart PM2
4. Test frontend in browser
5. Check browser console for remaining errors
6. Fix WebSocket connection if broken
7. Then decide: build AI features or rebuild frontend

---

**Ready to implement these fixes?**
