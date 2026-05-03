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
**Status:** Style guide complete, ready for development

**Business Details:**
- ARM Auto Repair and Mechanical
- 601 E Main St, Robstown, TX
- Phone: (361) 220-1629
- Domain: ARMAUTOTX.com (purchased on Namecheap)
- ASE Certified for Gas and Diesel

**Project Files:**
- `/arm-auto-repair/PROJECT-INFO.md` - Business details and contact info
- `/arm-auto-repair/STYLE-GUIDE.md` - Complete design system, colors, typography, components, tech stack

**Design Direction:**
- Vintage Americana aesthetic (from logo)
- Red/blue/cream color palette
- Mobile-first (tap-to-call priority)
- Next.js + Tailwind + shadcn/ui

**Critical Lesson:** Previous work on this project was lost when I failed to commit to memory. All project work must be documented immediately and committed to git.
