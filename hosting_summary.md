# Domain Hosting Summary - April 25, 2026

## Key Findings

**Total audited:** 100 domains (Namecheap API limit)

### Active Hosting Platforms

#### 🐙 GitHub Pages (14 domains - PRIMARY PLATFORM)
- **danewalter.com** ✅ LIVE
- lgbtc.io
- pencraftai.com
- uniparty.news
- vapor.capital (main Vapor brand site)
- visitwilds.com (main Wilds brand site)
- wagmi.io
- smtx.land
- dao1.earth
- hack3.art
- bookwilds.xyz
- boomstick.space
- crtx.land
- day1.build

All using IP: `185.199.108-111.153` + CNAME to `DaneBennettWalter.github.io`

---

#### 🔁 Replit (2 domains)
- **brendlehg.com** → `brendlehg.danebennettwalter.repl.co`
- **cbbtx.org** → `CBBTX.danebennettwalter.repl.co`

---

#### 🚫 External DNS (5 domains - NOT on Namecheap DNS)
- btclight.org
- costplustubs.com
- gnarwhalhc.com
- gnarwhalhc.net  
- gnarwhalhc.org

**Action needed:** Check where these are actually hosted (likely Cloudflare or other registrar)

---

### ⚠️ NO DNS RECORDS CONFIGURED (31 domains)

**Critical - New Roofing Domains:**
- **aaatexasroof.com** ❌ Not resolving
- **aaatxroof.com** ❌ Not resolving

**Hotel/Business:**
- brendle.co
- brendlehotels.com
- robstownhop.com
- jonpaulstokes.com

**Space/Tech:**
- spacecamptx.com (main domain, but all others forward to it!)
- txspacecoast.com/net/org
- homecenter.love

**Wilds/Tourism:**
- belizewilds.com/io/xyz
- bookwilds.app/com/net/org
- homesteadsmtx.com

**Web3/Governance:**
- dao.1
- 4chain.io

**News/Media:**
- asmon.news
- asmongold.news
- asmonnews.com
- agnn.tx
- ann.tx

**Other:**
- estateave.store/xyz
- hack3.digital
- **wedemoit.com** (has forward configured but target is broken)

---

### 🔀 URL Forwards (Consolidation Strategy)

**All Vapor domains → vapor.capital** (16 domains)
- vapor.army, .bid, .blue, .cash, .credit, .exchange, .financial, .fund, .green, .loans, .media, .money, .pink, .trade, .vote
- Plus vaperware.io

**All Wilds variants → visitwilds.com** (8 domains)
- kentuckywilds.com, texaswilds.com
- visitwilds.app/io/net/org/xyz
- bookwilds.xyz

**All Moon/Luna domains → spacecamptx.com** (11 domains)
- lunapasa.com/net/org/space/tech/xyz
- moonpass.net/org/space/world
- sfatx.space

**Other forwards:**
- ppa.vote, uniparty.vote → uniparty.news
- builders.tx → cbbtx.org
- rhop.cc → robstownhop.com
- goday1.com → day1.build
- nearct.com, smtxhomestead.com, terecs.org, bumlivesmatter.org → danewalter.com

---

## 🚨 IMMEDIATE ACTION ITEMS

### 1. Fix New Roofing Domains
**aaatexasroof.com** and **aaatxroof.com** need DNS setup:
- Option A: Point to GitHub Pages (free, fast, SSL auto)
- Option B: Point to DigitalOcean droplet (if you have one running)
- Option C: Use Cloudflare Pages (free, faster than GitHub)

### 2. Fix wedemoit.com
Currently forwarding to `https://wedemolish.it.com` which only shows 🔨
- Either fix destination or remove forward

### 3. Resolve spacecamptx.com Paradox
**11 domains forward TO spacecamptx.com, but spacecamptx.com has NO DNS records!**
All those domains are dead-ending.

**Fix:** Set up spacecamptx.com on GitHub Pages or other hosting

### 4. Audit External DNS Domains
Check btclight.org, costplustubs.com, gnarwhalhc.* to see where they're actually hosted and if they're still needed.

---

## 📊 Platform Distribution

| Platform | Count | Status |
|----------|-------|--------|
| GitHub Pages | 14 | ✅ Active |
| URL Forwards | 40+ | ⚠️ Many broken chains |
| Replit | 2 | ✅ Active |
| No DNS | 31 | ❌ Not resolving |
| External DNS | 5 | ❓ Need audit |

---

## ✅ DigitalOcean Droplet Status

**FOUND AND ACTIVE**

**Droplet Name:** dao1-earth  
**IP:** 159.223.161.253  
**Region:** NYC1  
**Size:** 2 vCPU / 2 GB RAM / 60 GB SSD  
**OS:** Ubuntu 24.04 LTS  
**Cost:** $18/month  
**Server:** Caddy (with auto-HTTPS)

### Hosted Domains (9 total)

**dao1.earth cluster:**
- dao1.earth ✅ LIVE
- api.dao1.earth
- manager.dao1.earth

**dao1.app cluster:**
- dao1.app ✅ LIVE
- guardian.dao1.app

**day1.build cluster:**
- day1.build ✅ LIVE
- api.day1.build
- dev.day1.build
- guardian.day1.build

**Status:** All sites active, serving HTTPS via Caddy, last updated Feb 14, 2026

---

## 🎯 Recommendations

### For Cash Flow Projects (Hotel + Construction)
1. **brendlehotel.com** → Set up on GitHub Pages or Cloudflare Pages
2. **cbbtx.com** → Missing from audit (might be in the 4 domains not returned by API) - need to check
3. Consider moving from Replit to more professional hosting (Cloudflare, Vercel, or custom droplet)

### For Roofing Funnel
Set up **aaatexasroof.com** and **aaatxroof.com** ASAP:
- Simple landing page on Cloudflare Pages (free, fast, great for lead gen)
- Form to capture leads → email or CRM
- Can be live in 30 minutes

### For Brand Consolidation
Your forward strategy is solid (Vapor → vapor.capital, Wilds → visitwilds.com), but:
- **Fix the broken chains** (spacecamptx.com, robstownhop.com)
- Consider dropping non-renewed domains that aren't part of active strategy
