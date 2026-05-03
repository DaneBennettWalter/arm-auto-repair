# Hotel Brendle - Build Guide
**Created:** 2026-04-29 19:12 EDT  
**Status:** Pre-build, starting from scratch

---

## Project Overview

**Goal:** Professional booking website for Hotel Brendle (601 E Ave A, Robstown, TX)

**Core Features:**
1. Public booking system with Stripe payments
2. Admin dashboard for managing bookings & rooms
3. Investor portal (Phase 2)

**Build Philosophy:**
- Professional grade, not prototype
- Clean architecture, no spaghetti
- Simple things should be simple
- Permanent solutions, no workarounds

---

## Design System

### Colors
**Primary Palette:**
- **New Mexico Turquoise** — `#5FB3B3` (hero accents, CTAs, links)
- **Desert Sand** — `#E8DCC4` (backgrounds, cards)
- **Warm Earth** — `#8B7355` (text, headers)
- **Deep Clay** — `#4A3728` (primary text)
- **Sunset Orange** — `#D97757` (accents, hover states)

**Usage:**
- Hero section: Video background with turquoise overlay/accents
- CTAs: Turquoise buttons with hover transitions
- Cards/sections: Desert sand backgrounds
- Text: Deep clay for body, warm earth for headers

### Typography
- **Headers:** Modern serif (Playfair Display or Lora)
- **Body:** Clean sans-serif (Inter or Open Sans)
- **Sizes:** Mobile-first, responsive scaling

### Hero Section
- **Video:** Ported from existing site (primary keeper)
- **Overlay:** Subtle dark gradient for text legibility
- **CTA:** Turquoise "Book Your Stay" button, prominent
- **Style:** Clean, inviting, not busy

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom design system
- **Components:** shadcn/ui (best maintained, professional)
- **State:** React hooks + context (keep simple)
- **Forms:** React Hook Form + Zod validation

### Backend
- **API:** Next.js API routes (collocated with frontend)
- **Database:** Supabase (Postgres) — already provisioned
- **Auth:** Simple password for admin (can upgrade later)
- **Payments:** Stripe (key already saved)
- **Email:** Resend (need key) — transactional emails

### Hosting
- **Platform:** Vercel (fast deploy, auto SSL, zero config)
- **Domain:** brendlehg.com (already owned)
- **CDN:** Vercel Edge Network (automatic)

### Development
- **Version Control:** GitHub (key already saved)
- **Package Manager:** npm
- **Node Version:** 18+ LTS

---

## Database Schema

### Tables

#### `rooms`
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- 'standard', 'deluxe', 'suite'
    description TEXT,
    rate_per_night DECIMAL(10,2) NOT NULL,
    max_occupancy INT DEFAULT 2,
    amenities JSONB, -- ['wifi', 'tv', 'mini-fridge', etc.]
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'maintenance', 'offline'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `bookings`
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms(id),
    confirmation_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Guest info
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    
    -- Dates
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    
    -- Payment
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
    stripe_payment_intent_id VARCHAR(100),
    stripe_charge_id VARCHAR(100),
    
    -- Status
    booking_status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'checked_in', 'checked_out', 'cancelled'
    
    -- Notes
    special_requests TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `admin_users`
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'superadmin'
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `site_settings`
```sql
CREATE TABLE site_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings examples:
-- 'booking_rules': {"min_nights": 1, "max_nights": 30, "advance_days": 180}
-- 'deposit_percent': {"value": 50}
-- 'contact_info': {"phone": "+1-555-0100", "email": "info@brendlehg.com"}
```

---

## Feature Breakdown

### Phase 1: Core Booking System (Today)

#### Public Pages
- **`/`** — Hero video, overview, CTA to book
- **`/rooms`** — Room types, rates, photos, amenities
- **`/book`** — Availability calendar, booking form
- **`/confirmation/[code]`** — Booking confirmation page
- **`/contact`** — Contact form, map, info
- **`/about`** — Hotel story, Robstown context

#### Booking Flow
1. **Select dates** — Calendar picker (react-day-picker)
2. **Choose room** — Available rooms shown with rates
3. **Guest info** — Form: name, email, phone, special requests
4. **Payment** — Stripe checkout (deposit or full payment)
5. **Confirmation** — Email sent, confirmation page shown

#### Admin Dashboard
- **`/admin/login`** — Password-protected entry
- **`/admin/bookings`** — Table view: all bookings, filterable by date/status
- **`/admin/bookings/[id]`** — Booking detail, edit status, add notes
- **`/admin/rooms`** — Manage room inventory, rates, status
- **`/admin/settings`** — Site settings (deposit %, booking rules, contact info)

#### Email Templates
- **Booking confirmation** — Guest name, dates, room, confirmation code, check-in instructions
- **Admin notification** — New booking alert to hotel staff
- **Cancellation** — If booking cancelled (admin-triggered)

### Phase 2: Investor Portal (Later)
- **`/investors`** — Password-protected landing
- **`/investors/financials`** — Charts, rent roll, occupancy rates
- **`/investors/documents`** — Upload/download contracts, reports
- **`/investors/updates`** — News feed, project updates

**Defer until:** Phase 1 is live and stable

---

## API Routes

### Public
- `POST /api/bookings/check-availability` — Check room availability for date range
- `POST /api/bookings/create` — Create booking + Stripe payment intent
- `GET /api/bookings/[confirmationCode]` — Retrieve booking details
- `POST /api/contact` — Send contact form email

### Admin (auth required)
- `GET /api/admin/bookings` — List all bookings (filters: date, status)
- `GET /api/admin/bookings/[id]` — Get booking detail
- `PATCH /api/admin/bookings/[id]` — Update booking (status, notes)
- `GET /api/admin/rooms` — List all rooms
- `PATCH /api/admin/rooms/[id]` — Update room (rate, status, description)
- `GET /api/admin/settings` — Get site settings
- `PATCH /api/admin/settings` — Update site settings

### Webhooks
- `POST /api/webhooks/stripe` — Handle Stripe events (payment success, failure, refund)

---

## Deployment Plan

### Initial Deploy (Day 1)
1. Create Next.js project locally
2. Set up Tailwind + shadcn/ui
3. Configure Supabase connection
4. Build basic pages (home, rooms, book)
5. Push to GitHub
6. Connect GitHub to Vercel
7. Deploy to `brendlehg.vercel.app` (preview URL)
8. Test basic flow

### Production Deploy (Day 2-3)
1. Complete booking flow + Stripe integration
2. Build admin dashboard
3. Set up email service (Resend)
4. Test full workflow (book → pay → confirm → admin view)
5. Point `brendlehg.com` to Vercel (update DNS)
6. Go live

### Post-Launch
1. Monitor bookings, fix bugs
2. Gather feedback
3. Optimize performance
4. Add Phase 2 features (investor portal)

---

## Folder Structure

```
hotel-brendle/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Home
│   │   ├── rooms/
│   │   │   └── page.tsx          # Rooms listing
│   │   ├── book/
│   │   │   └── page.tsx          # Booking form
│   │   ├── confirmation/
│   │   │   └── [code]/
│   │   │       └── page.tsx      # Booking confirmation
│   │   ├── contact/
│   │   │   └── page.tsx          # Contact
│   │   └── about/
│   │       └── page.tsx          # About
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx          # Admin login
│   │   ├── bookings/
│   │   │   ├── page.tsx          # Bookings list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Booking detail
│   │   ├── rooms/
│   │   │   └── page.tsx          # Rooms management
│   │   └── settings/
│   │       └── page.tsx          # Site settings
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── check-availability/
│   │   │   │   └── route.ts
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── [code]/
│   │   │       └── route.ts
│   │   ├── admin/
│   │   │   ├── bookings/
│   │   │   ├── rooms/
│   │   │   └── settings/
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts
│   │   └── contact/
│   │       └── route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn components
│   ├── BookingCalendar.tsx
│   ├── RoomCard.tsx
│   ├── BookingForm.tsx
│   └── AdminNav.tsx
├── lib/
│   ├── supabase.ts               # DB client
│   ├── stripe.ts                 # Stripe client
│   ├── resend.ts                 # Email client
│   └── utils.ts                  # Helpers
├── public/
│   ├── hero-video.mp4            # Hero video (ported from old site)
│   └── images/
├── .env.local                    # Environment vars (not committed)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://udxvixjiihhtwrswahvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public_key>
SUPABASE_SERVICE_ROLE_KEY=<service_key>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<publishable_key>
STRIPE_SECRET_KEY=<secret_key>
STRIPE_WEBHOOK_SECRET=<webhook_secret>

# Resend (email)
RESEND_API_KEY=<resend_key>

# Admin auth
ADMIN_PASSWORD_HASH=<bcrypt_hash>

# Site
NEXT_PUBLIC_SITE_URL=https://brendlehg.com
```

---

## Testing Strategy

### Manual Testing (Day 1-3)
- [ ] Book a room through full flow (dev mode)
- [ ] Verify email confirmation received
- [ ] Check booking appears in admin dashboard
- [ ] Test Stripe payment (test mode)
- [ ] Verify webhook handling (Stripe CLI)
- [ ] Test admin login, booking management
- [ ] Mobile responsive check (all pages)

### Pre-Launch Checklist
- [ ] Hero video loads and plays
- [ ] All forms validate properly
- [ ] Stripe payments work (live mode)
- [ ] Email confirmations send
- [ ] Admin dashboard shows correct data
- [ ] DNS points to Vercel
- [ ] SSL certificate active
- [ ] 404/error pages styled
- [ ] Contact form works
- [ ] Mobile/tablet/desktop tested

---

## Open Questions (Answer Before Building)

1. **Room Inventory:**
   - How many rooms? (Currently 30 of 67 online)
   - Room types? (Standard, Deluxe, Suite?)
   - Rates per night for each type?
   - Photos for each room type?

2. **Payment Flow:**
   - Deposit percentage (e.g., 50%) or full payment upfront?
   - Refund policy? (displayed during booking)

3. **Email Service:**
   - Resend account — should I set it up, or do you have one?
   - Confirmation email sender: `bookings@brendlehg.com`? (requires DNS setup)

4. **Hero Video:**
   - Where to get the video file from current site?
   - Any alternative/updated video to use?

5. **Contact Info:**
   - Hotel phone number for site?
   - Booking inquiries email?

6. **Check-in/Check-out Times:**
   - Standard check-in: 3 PM?
   - Standard check-out: 11 AM?

---

## Next Steps

1. Answer open questions above
2. Create GitHub repo: `hotel-brendle`
3. Initialize Next.js project
4. Set up database schema in Supabase
5. Build Phase 1 features (booking + admin)
6. Deploy to Vercel
7. Point DNS
8. Go live

---

**This guide is the source of truth. Update it as decisions are made or scope changes.**
