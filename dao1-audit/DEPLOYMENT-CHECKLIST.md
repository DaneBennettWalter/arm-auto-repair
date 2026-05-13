# day1.build Deployment Checklist
**Date:** 2026-05-12  
**Objective:** Get day1.build fully functional

---

## Current Status

✅ Frontend deployed and serving correctly  
✅ Caddy configured properly  
✅ Database running (PostgreSQL dao1_prod)  
✅ SSH access established (user: roan)  
❌ Backend server not running  
❌ OAuth redirects pointing to wrong domain  
❌ No .env file for manager-server  

---

## Step-by-Step Deployment

### Step 1: Install TypeScript Runtime
```bash
sudo npm install -g tsx
```

**Verify:**
```bash
which tsx
# Expected: /usr/bin/tsx or /usr/local/bin/tsx
```

---

### Step 2: Create .env File

**Create:** `/opt/dao1/apps/manager-server/.env`

```bash
sudo tee /opt/dao1/apps/manager-server/.env << 'EOF'
# Database
DATABASE_URL=postgresql://dao1:dao1_dao1-earth_2026@localhost:5432/dao1_prod

# Server
PORT=3002
NODE_ENV=production

# CORS - CRITICAL: Must match frontend domain
ALLOWED_ORIGINS=https://day1.build,https://www.day1.build

# Auth
JWT_SECRET=dao1_jwt_secret_2026_change_later

# Google OAuth
GOOGLE_CLIENT_ID=40221608565-c8jg48nht5tpuvicc1tbhlm75sitlb0l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=(FROM .env)
GOOGLE_REDIRECT_URI=https://day1.build/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=(FROM .env)
STRIPE_WEBHOOK_SECRET=(FROM .env)

# Optional: AI features
ANTHROPIC_API_KEY=(FROM .env)

# Optional: X/Twitter OAuth
X_CLIENT_ID=
X_CLIENT_SECRET=
EOF
```

**Fill in secrets from ~/.openclaw/workspace/.env:**
- GOOGLE_OAUTH_CLIENT_SECRET
- STRIPE_SECRET_KEY
- ANTHROPIC_API_KEY (already have)

---

### Step 3: Fix Hardcoded URLs in Code

**File:** `/opt/dao1/apps/manager-server/server/routes/auth.ts`

```bash
sudo sed -i.backup 's/manager\.dao1\.earth/day1.build/g' /opt/dao1/apps/manager-server/server/routes/auth.ts
```

**File:** `/opt/dao1/apps/manager-server/server/index.ts`

Line 24 needs changing:
```typescript
// OLD:
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://manager.dao1.earth')

// NEW:
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://day1.build')
```

```bash
sudo sed -i.backup "s/manager\.dao1\.earth/day1.build/g" /opt/dao1/apps/manager-server/server/index.ts
```

---

### Step 4: Start Backend Server

```bash
cd /opt/dao1/apps/manager-server
sudo pm2 start server/index.ts \
  --name day1-api \
  --interpreter tsx \
  --env production
```

**Verify:**
```bash
pm2 list
# Should show: day1-api | online

pm2 logs day1-api --lines 50
# Check for errors

curl http://localhost:3002/api/health
# Expected: {"status":"ok",...}
```

---

### Step 5: Save PM2 Configuration

```bash
sudo pm2 save
sudo pm2 startup
# Follow the instructions it gives
```

---

### Step 6: Test Public API

```bash
curl https://day1.build/api/health
# Expected: {"status":"ok",...}

curl https://day1.build/api/auth/google
# Expected: Redirect to Google OAuth (should have day1.build callback URL)
```

---

### Step 7: Configure Google OAuth Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth Client: `40221608565-c8jg48nht5tpuvicc1tbhlm75sitlb0l`
3. Under "Authorized redirect URIs", add:
   - `https://day1.build/api/auth/google/callback`
   - `https://www.day1.build/api/auth/google/callback`
4. Save

---

### Step 8: Test Login Flow

1. Open: https://day1.build
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Should redirect back to day1.build with auth token

**If it fails:**
```bash
# Check backend logs
pm2 logs day1-api

# Check Caddy logs
sudo journalctl -u caddy -f

# Check database connection
sudo -u postgres psql dao1_prod -c "SELECT * FROM users LIMIT 1;"
```

---

## Staging Environment (Optional)

If you want dev.day1.build working too:

```bash
# Create staging .env
sudo cp /opt/dao1/apps/manager-server/.env /opt/dao1/apps/manager-server-staging/.env
sudo sed -i 's/PORT=3002/PORT=3003/' /opt/dao1/apps/manager-server-staging/.env
sudo sed -i 's/day1\.build/dev.day1.build/g' /opt/dao1/apps/manager-server-staging/.env

# Fix staging code URLs
sudo sed -i 's/manager\.dao1\.earth/dev.day1.build/g' /opt/dao1/apps/manager-server-staging/server/routes/auth.ts
sudo sed -i 's/manager\.dao1\.earth/dev.day1.build/g' /opt/dao1/apps/manager-server-staging/server/index.ts

# Start staging server
cd /opt/dao1/apps/manager-server-staging
sudo pm2 start server/index.ts --name day1-staging --interpreter tsx --env production

sudo pm2 save
```

---

## Verification Checklist

- [ ] tsx installed globally
- [ ] .env file created with all required vars
- [ ] Hardcoded URLs replaced (auth.ts, index.ts)
- [ ] PM2 process running (day1-api)
- [ ] Health endpoint responding (localhost:3002)
- [ ] Public API accessible (https://day1.build/api/health)
- [ ] Google OAuth redirect URI added
- [ ] Login flow works end-to-end
- [ ] PM2 saved and configured for auto-restart
- [ ] Database connection verified

---

## Rollback Plan

If something breaks:

```bash
# Stop new server
sudo pm2 stop day1-api
sudo pm2 delete day1-api

# Restore backups
sudo mv /opt/dao1/apps/manager-server/server/routes/auth.ts.backup /opt/dao1/apps/manager-server/server/routes/auth.ts
sudo mv /opt/dao1/apps/manager-server/server/index.ts.backup /opt/dao1/apps/manager-server/server/index.ts

# Remove .env
sudo rm /opt/dao1/apps/manager-server/.env
```

---

## Post-Deployment

### Monitoring
```bash
# Watch logs
pm2 logs day1-api

# Monitor processes
pm2 monit

# Check resource usage
pm2 status
```

### Database Backup
```bash
sudo -u postgres pg_dump dao1_prod > /opt/dao1/backups/dao1_prod_$(date +%Y%m%d_%H%M%S).sql
```

### Create Deployment Documentation
Document this process for future deployments

---

## Required Secrets (from ~/.openclaw/workspace/.env)

Pull these values:
- `GOOGLE_OAUTH_CLIENT_SECRET` → GOOGLE_CLIENT_SECRET
- `STRIPE_SECRET_KEY` → STRIPE_SECRET_KEY  
- `ANTHROPIC_API_KEY` → ANTHROPIC_API_KEY

---

**Ready to execute. Waiting for sudo access confirmation.**
