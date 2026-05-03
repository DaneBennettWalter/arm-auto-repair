# Hotel Brendle - Build Guide Index

**Created:** 2026-04-29 19:21 EDT  
**Status:** Complete, ready to execute

---

## Guide Structure

This comprehensive build guide is split across 4 files for completeness:

### [Part 1: Foundation & Core Setup](./hotel-brendle-complete-build-guide.md)
**Size:** ~70KB | **Sections:** 1-10

- **1. Project Overview** — Mission, current state, goals, success metrics
- **2. Requirements & Specifications** — Business & technical requirements
- **3. Tech Stack & Justification** — Why Next.js, Tailwind, Supabase, Stripe, etc.
- **4. Development Environment Setup** — Prerequisites, tools, configuration
- **5. Database Architecture** — Complete schema (rooms, bookings, admin_users, settings, audit)
- **6. Design System** — Color palette (turquoise), typography, components, hero video
- **7. Project Structure** — Complete folder/file tree
- **8. Phase 1: Foundation & Setup** — GitHub repo, Next.js init, dependencies, env vars
- **9. Phase 2: Public Pages & UI** — Layout, header, footer, home (hero), about, contact
- **10. Phase 3: Booking System Core** — Room listing, room cards (partial)

---

### [Part 2: Booking System & Payments](./hotel-brendle-build-guide-part2.md)
**Size:** ~37KB | **Sections:** Phase 3-4 (continued)

- **Phase 3 (Continued):**
  - **Step 3:** Availability Calendar component (react-day-picker)
  - **Step 4:** Room Selector component (fetch + display available rooms)
  - **Step 5:** Guest Info Form (validation with Zod, react-hook-form)
  - **Step 6:** Booking Summary component (pricing breakdown, taxes)
  - **Step 7:** Check Availability API route
  - **Step 8:** Validation schemas (lib/validations.ts)
  - **Step 9:** Commit

- **Phase 4: Payment Integration (Stripe):**
  - **Step 1:** Stripe webhook handler (success, failure, refund events)
  - **Step 2:** Create booking API route (payment intent creation)
  - **Step 3:** Payment component (Stripe Elements)
  - **Step 4:** Confirmation page (booking details, thank you)
  - **Step 5:** Webhook setup (production + local testing)
  - **Step 6:** Commit

---

### [Part 3: Email & Admin Dashboard](./hotel-brendle-build-guide-part3.md)
**Size:** ~35KB | **Sections:** Phase 5-6

- **Phase 5: Email System (Gmail API):**
  - **Step 1:** Google Workspace & Gmail API setup
  - **Step 2:** Email client (Gmail API + Resend alternative)
  - **Step 3:** Email templates (confirmation, admin notification, reminder)
  - **Step 4:** Send confirmation after payment (webhook integration)
  - **Step 5:** Contact form email handler
  - **Step 6:** Commit

- **Phase 6: Admin Dashboard:**
  - **Step 1:** Admin authentication (bcrypt, JWT, cookies)
  - **Step 2:** Admin login page & API
  - **Step 3:** Admin layout with navigation
  - **Step 4:** Dashboard page (stats: rooms, bookings, revenue)
  - **Step 5:** Bookings management (list, filter, view)
  - **Step 6:** Commit

---

### [Part 4: Testing, Deployment & Launch](./hotel-brendle-build-guide-part4.md)
**Size:** ~25KB | **Sections:** Phase 7-10 + Checklists

- **Phase 7: Testing & QA**
  - Functional testing (booking flow, edge cases, admin)
  - Cross-browser testing
  - Performance testing (Lighthouse targets: >90)
  - Security testing
  - Accessibility testing (WCAG 2.1 AA)

- **Phase 8: Deployment to Vercel**
  - Production environment setup
  - Stripe live mode switch
  - Deploy via dashboard or CLI
  - Database migrations
  - Production testing

- **Phase 9: Domain & DNS Configuration**
  - Point brendlehg.com to Vercel
  - SSL certificate (automatic)
  - Email domain setup (Google Workspace / Resend)
  - DNS propagation verification

- **Phase 10: Post-Launch Monitoring**
  - Error tracking (Sentry)
  - Analytics (Google Analytics 4)
  - Uptime monitoring (UptimeRobot)
  - Performance monitoring (Vercel Analytics)
  - Database backups

- **Security Checklist**
- **Performance Optimization**
- **SEO & Analytics Setup**
- **Maintenance Procedures** (daily, weekly, monthly, quarterly, emergency)
- **Future Enhancements** (reviews, pricing, investor portal, multi-property)
- **Final Pre-Launch Checklist**
- **Launch Day Procedures**

---

## Quick Reference

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | React framework, SSR, API routes |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Accessible, customizable components |
| Database | Supabase (PostgreSQL) | Hosted Postgres with backups |
| Payments | Stripe | PCI-compliant payment processing |
| Email | Gmail API (or Resend) | Transactional emails from brendlehotel.com |
| Hosting | Vercel | Zero-config deployment, edge CDN |
| Auth | bcrypt + JWT | Admin authentication |
| Monitoring | Sentry + GA4 + UptimeRobot | Errors, analytics, uptime |

### Key Files

```
hotel-brendle/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage (hero video)
│   ├── rooms/page.tsx            # Room listing
│   ├── book/page.tsx             # Booking flow
│   ├── confirmation/[code]/      # Booking confirmation
│   ├── admin/                    # Admin dashboard
│   └── api/                      # API routes
│       ├── bookings/             # Availability, create
│       ├── admin/                # Admin endpoints
│       └── webhooks/stripe/      # Stripe webhooks
├── components/
│   ├── ui/                       # shadcn components
│   ├── booking/                  # Booking flow components
│   ├── rooms/                    # Room display components
│   └── layout/                   # Header, Footer, AdminNav
├── lib/
│   ├── supabase.ts               # DB client
│   ├── stripe.ts                 # Payment client
│   ├── gmail.ts                  # Email client
│   ├── auth.ts                   # Admin auth
│   ├── email-templates.ts        # HTML email templates
│   ├── validations.ts            # Zod schemas
│   ├── utils.ts                  # Helper functions
│   └── constants.ts              # App constants
├── types/
│   └── index.ts                  # TypeScript types
├── public/
│   └── hero-video.mp4            # Hero section video
└── supabase/
    ├── migrations/               # SQL migrations
    └── seeds/                    # Initial data
```

### Database Schema

- **rooms** — Room inventory (room_number, type, rates, amenities, status)
- **bookings** — Guest bookings (confirmation_code, dates, payment, status)
- **admin_users** — Admin authentication (email, password_hash, role)
- **site_settings** — Key-value config (booking rules, policies, contact)
- **audit_log** — Admin action tracking

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Gmail API (or Resend)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
GMAIL_SENDER_EMAIL

# Site
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_HOTEL_PHONE
NEXT_PUBLIC_HOTEL_EMAIL
NEXT_PUBLIC_HOTEL_ADDRESS

# Admin
ADMIN_PASSWORD_HASH
ADMIN_EMAIL
JWT_SECRET
```

---

## Estimated Timeline

**Total implementation:** 40-60 developer hours

### Phase Breakdown

| Phase | Description | Time |
|-------|-------------|------|
| **1** | Foundation & setup | 3-4 hours |
| **2** | Public pages & UI | 4-6 hours |
| **3** | Booking system core | 8-12 hours |
| **4** | Payment integration | 6-8 hours |
| **5** | Email system | 3-5 hours |
| **6** | Admin dashboard | 8-10 hours |
| **7** | Testing & QA | 4-6 hours |
| **8** | Deployment | 2-3 hours |
| **9** | DNS configuration | 1-2 hours |
| **10** | Monitoring setup | 2-3 hours |

**Buffer:** +20% for unexpected issues

---

## Confirmed Specifications ✅

1. **Room rates:**
   - **Nightly:** $40/night
   - **Weekly:** $175/week
   - (Weekly is discounted: saves $105 vs 7 nights × $40)

2. **Room inventory:**
   - **Current:** 25 rooms available (adding 1/week to 67 max)
   - **12 Standard rooms** — Rate TBD (assume same as base)
   - **13 Double rooms** — Rate TBD (assume same as base)
   - All rooms: $40/night, $175/week (confirm if different rates per type)

3. **Hero video:**
   - **YouTube embed** from brendlehg.com
   - Need: YouTube video ID or direct link

4. **Room photos:**
   - **Status:** TBD
   - Can launch without, add later

5. **Email service:**
   - **Google API credentials available** ✅
   - Use Gmail API for howdy@brendlehotel.com

6. **Design direction:**
   - **Mobile-first** (critical)
   - **Minimalist but not hollow** (substance, not emptiness)
   - **Inspirations:**
     - https://marasrl.it/en/ (clean Italian furniture)
     - https://countdown.substraterx.com/ (modern, bold)
     - https://outfit.hellohello.is/ (creative agency)

7. **Refund policy:**
   - Assumption: "48 hours before check-in for full refund"
   - (Confirm or adjust)

---

## Next Steps

1. **Dane provides answers** to 6 open questions above
2. **Roan creates GitHub repo** (`hotel-brendle`)
3. **Execute Phase 1** (foundation setup)
4. **Execute Phases 2-6** (feature development)
5. **Execute Phases 7-10** (testing, deployment, launch)
6. **Monitor & iterate** post-launch

---

## Success Criteria

**Launch-ready when:**
- [ ] All features implemented & tested
- [ ] Lighthouse scores >90 (performance, accessibility, SEO)
- [ ] Payment processing works (Stripe live mode)
- [ ] Email confirmations deliver
- [ ] Admin dashboard functional
- [ ] DNS configured, SSL active
- [ ] Monitoring & backups in place

**Business success when:**
- [ ] Booking conversion rate >5%
- [ ] Zero payment failures
- [ ] 100% email delivery
- [ ] Admin usable by non-technical staff
- [ ] Page load <2 seconds
- [ ] Uptime >99.5%

---

## Support

If you have questions while executing this guide:
1. Check the detailed steps in each part
2. Refer to official docs (Next.js, Stripe, Supabase)
3. Ask Roan for clarification

---

**This guide is designed to be executed sequentially.** Start with Part 1, move through Part 2, then 3, then 4. Each phase builds on the previous.

**Built right. Built professional. Built to scale.**

Ready when you are.
