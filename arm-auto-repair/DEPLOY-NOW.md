# Deploy ARM Auto Repair - Quick Start

## Issue: GitHub OAuth Required

DigitalOcean App Platform needs OAuth access to your GitHub repo, which requires browser authentication. I can't complete this automatically.

---

## Option A: Manual DigitalOcean Setup (5 minutes)

1. **Go to DigitalOcean App Platform:**
   - Visit: https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Connect GitHub:**
   - Choose "GitHub"
   - Authorize DigitalOcean (one-time OAuth)
   - Select repository: `DaneBennettWalter/arm-auto-repair`
   - Branch: `main`

3. **Configure:**
   - Type: **Static Site**
   - Source Directory: `/src`
   - Click "Next"

4. **Name & Region:**
   - Name: `arm-auto-repair`
   - Region: New York (or closest to Texas)
   - Click "Next"

5. **Review & Launch:**
   - Plan: $0/month (free for static sites under 1GB bandwidth)
   - Click "Create Resources"

6. **Get URL:**
   - DigitalOcean will give you: `arm-auto-repair-xxxxx.ondigitalocean.app`
   - Copy this URL

---

## Option B: Namecheap Hosting (Simpler, Immediate)

### If you want to go live RIGHT NOW:

1. **Buy Namecheap Hosting:**
   - Log into Namecheap
   - Products → Hosting → Buy "Stellar" plan (~$3/month)
   - Link to domain: armautotx.com

2. **Upload Files:**
   - Log into cPanel (Namecheap emails you login)
   - File Manager → `public_html`
   - Upload everything from `/src/`:
     ```
     index.html
     services.html
     css/styles.css
     js/script.js
     images/logo.png (you need to add this first)
     ```

3. **Enable SSL:**
   - cPanel → SSL/TLS Status
   - Enable AutoSSL for armautotx.com
   - Wait 15 minutes

4. **Done:**
   - Visit: https://armautotx.com

---

## Before Either Option:

### 1. Add Logo (REQUIRED)
The site won't look right without it.

**Your logo file from earlier** → Save as:
```
~/.openclaw/workspace/arm-auto-repair/src/images/logo.png
```

Or tell me where the logo file is and I'll copy it.

### 2. Formspree (Contact Form)
- Go to https://formspree.io
- Sign up (free)
- Create a form
- Get endpoint like: `https://formspree.io/f/abc123xyz`
- Update `index.html` line 240 with your endpoint

---

## DNS Setup (After Deployment)

Once you have your hosting URL (from DigitalOcean or Namecheap):

**Namecheap DNS:**
1. Log into Namecheap
2. Manage armautotx.com
3. Advanced DNS
4. Add records:

**If using DigitalOcean:**
```
Type: CNAME
Host: @
Value: arm-auto-repair-xxxxx.ondigitalocean.app
TTL: Automatic
```

**If using Namecheap hosting:**
- Automatically configured when you link domain to hosting

---

## Which Option Should You Choose?

**Choose DigitalOcean if:**
- You want automatic deployments (push to GitHub → auto updates)
- You want to learn modern deployment
- You might expand the site later

**Choose Namecheap if:**
- You want it live RIGHT NOW
- You prefer simple cPanel interface
- You want everything in one place (domain + hosting)

---

## What I Can Do Next:

1. **"Add the logo"** - Tell me where your logo file is
2. **"Set up Formspree"** - Give me your Formspree endpoint
3. **"Help me with DigitalOcean"** - I'll guide you through each step
4. **"Help me with Namecheap"** - I'll walk you through cPanel upload

---

## Current Status:

✅ Website built and committed to GitHub  
✅ All code ready to deploy  
⏳ Waiting for: Logo + hosting choice  

**GitHub:** https://github.com/DaneBennettWalter/arm-auto-repair  
**Preview files locally:** Open `~/.openclaw/workspace/arm-auto-repair/src/index.html` in browser
