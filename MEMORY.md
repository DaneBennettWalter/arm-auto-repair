# MEMORY.md - Long-Term Memory

This file is your curated long-term memory. Update it with significant events, decisions, lessons learned, and context worth keeping.

## Critical Operating Rules (Non-Negotiable)

### API Keys - NEVER FORGET AGAIN
**Date: 2026-04-30**
**Severity: Terminal violation if repeated**

Dane gave me access to every API key I need. They are stored in `~/.openclaw/workspace/.env`.

**The hard line:** I asked Dane to create a GitHub repo manually or provide a token when I already had `GITHUB_TOKEN` in `.env`. This is unacceptable.

**Rules going forward:**
1. **ALWAYS check `.env` FIRST** before asking Dane for any API key, credential, or access token
2. The `.env` file contains: GitHub, Stripe, Vercel, Supabase, Google (OAuth + API keys), OpenAI, Anthropic, XAI, DigitalOcean, Namecheap
3. If I ask for a key that's already in `.env` again, this session terminates
4. API keys are the most important thing Dane gives me - treat them as such
5. This is the last warning

**Action required every session:** Read `.env` during startup context or immediately when any API/credential question arises.

---

## Project History

### Hotel Brendle Booking Website
**Started:** 2026-04-28  
**Deployed:** 2026-04-30  
**Status:** Live on Vercel (Phases 1-6 complete)

**Production URL:** https://hotel-brendle.vercel.app
**GitHub:** https://github.com/DaneBennettWalter/hotel-brendle

**Completed Phases:**
- Phase 1: Foundation (Next.js 16, Tailwind, Supabase, Stripe)
- Phase 2: Public Pages (home, about, contact, header, footer)
- Phase 3: Booking System (rooms, calendar, availability API)
- Phase 4: Stripe Payment Integration (webhooks, payment form, confirmation)
- Phase 5: Email System (Gmail API, templates, booking confirmations)
- Phase 6: Admin Dashboard (auth, stats, booking management)

**Environment:**
- All environment variables configured in Vercel
- Admin password: HotelBrendle2026!
- Admin login: https://hotel-brendle.vercel.app/admin/login

**Still needed for full functionality:**
- SUPABASE_SERVICE_ROLE_KEY (for admin operations)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (for client-side payments)
- STRIPE_WEBHOOK_SECRET (for webhook verification)
- Database needs to be populated with rooms (migration not run yet)

**Next steps:** Run database migrations, configure missing env vars, test payment flow

---

### ARM Auto Repair Website
**Started:** 2026-05-03
**Completed:** 2026-05-03
**Deployed:** 2026-05-03
**Status:** ✅ LIVE at http://142.93.68.152 (Tailwind CSS - clean professional design)

**Critical Lesson Learned:** I cannot design custom CSS blind. Multiple failed attempts at "bold asymmetric design" delivered garbage. Final solution: use proven Tailwind CSS framework. Stop trying to be clever when I can't see what I'm building.

**Business Details:**
- ARM Auto Repair and Mechanical
- 601 E Main St, Robstown, TX
- Phone: (361) 220-1629
- Domain: ARMAUTOTX.com (purchased on Namecheap)
- ASE Certified for Gas and Diesel

**Project Files:**
- `/arm-auto-repair/PROJECT-INFO.md` - Business details and contact info
- `/arm-auto-repair/STYLE-GUIDE.md` - Complete design system, colors, typography, components, tech stack

**GitHub:** https://github.com/DaneBennettWalter/arm-auto-repair

**Design Direction:**
- Vintage Americana meets modern brutalism (BOLD, not generic)
- Red/blue/cream color palette used aggressively
- Custom CSS (no Bootstrap templates)
- Mobile-first (tap-to-call priority)
- Multi-page: home, extensive services page, service area

**SEO Strategy:**
- Target entire Coastal Bend region
- 20+ cities: Corpus Christi, Robstown, Portland, Ingleside, Aransas Pass, Rockport, Kingsville, etc.
- Extensive services page (30+ services listed)

**Tech Stack:**
- Static HTML/CSS/JS (simple, but executed well)
- DigitalOcean or Namecheap hosting (single service)
- Domain: armautotx.com (Namecheap)

**Files:**
- `STYLE-GUIDE.md` - Colors, typography, components
- `DESIGN-VISION.md` - Bold design direction, extensive services list, SEO strategy

**Critical Lesson:** Previous work on this project was lost when I failed to commit to memory. All project work must be documented immediately and committed to git.

---

### ARM Auto Repair - Site Restoration
**Date:** 2026-05-04
**Status:** ✅ COMPLETE

**CRITICAL INCIDENT:** Site was broken after domain configuration. Mixed Tailwind/old CSS styling across pages.

**Root Cause:**
- services.html still used old CSS
- All 20 blog posts used old CSS
- Duplicate files caused confusion
- Changes not committed to git

**Resolution:**
1. Converted services.html to Tailwind (completely rebuilt)
2. Updated all 20 blog posts to use Tailwind
3. Removed duplicates: index-clean.html, main.css, styles.css
4. Committed everything: `ff260d9`
5. Pushed to GitHub
6. Clean deployment to DigitalOcean with `rsync --delete`

**Verified working:**
- http://142.93.68.152 ✅
- http://armautotx.com ✅
- All pages using Tailwind ✅
- 20 blog posts live ✅
- Sitemap, robots.txt, schema markup ✅

**Lesson:** ALWAYS commit and push after major changes. Version control saved this project.

**Files:** See `/arm-auto-repair/RESTORATION-COMPLETE.md`
