# Hotel Brendle - Complete Build Guide
**Created:** 2026-04-29 19:21 EDT  
**Version:** 1.0  
**Status:** Ready to execute

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Requirements & Specifications](#requirements--specifications)
3. [Tech Stack & Justification](#tech-stack--justification)
4. [Development Environment Setup](#development-environment-setup)
5. [Database Architecture](#database-architecture)
6. [Design System](#design-system)
7. [Project Structure](#project-structure)
8. [Phase 1: Foundation & Setup](#phase-1-foundation--setup)
9. [Phase 2: Public Pages & UI](#phase-2-public-pages--ui)
10. [Phase 3: Booking System Core](#phase-3-booking-system-core)
11. [Phase 4: Payment Integration](#phase-4-payment-integration)
12. [Phase 5: Email System](#phase-5-email-system)
13. [Phase 6: Admin Dashboard](#phase-6-admin-dashboard)
14. [Phase 7: Testing & QA](#phase-7-testing--qa)
15. [Phase 8: Deployment](#phase-8-deployment)
16. [Phase 9: Domain & DNS Configuration](#phase-9-domain--dns-configuration)
17. [Phase 10: Post-Launch Monitoring](#phase-10-post-launch-monitoring)
18. [Future Phases](#future-phases)
19. [Security Checklist](#security-checklist)
20. [Performance Optimization](#performance-optimization)
21. [SEO & Analytics](#seo--analytics)
22. [Maintenance & Updates](#maintenance--updates)

---

## Project Overview

### Mission
Build a professional, production-grade booking website for Hotel Brendle (601 E Ave A, Robstown, TX 78380) that handles guest bookings, payments, and property management.

### Current State
- **Location:** 601 E Ave A, Robstown, TX 78380
- **Capacity:** 67 rooms maximum
- **Available now:** 25 rooms
- **Growth rate:** 1 new room per week
- **Existing site:** brendlehg.com (Replit-hosted, being replaced)
- **Revenue:** ~$9,200/month net

### Goals
1. Professional booking system with full payment processing
2. Real-time room availability management
3. Admin dashboard for staff to manage bookings and inventory
4. Email confirmations via Gmail API (howdy@brendlehotel.com)
5. Mobile-first, responsive design
6. Fast, secure, scalable
7. SEO-optimized for local searches
8. Analytics to track conversions

### Success Metrics
- Booking conversion rate >5%
- Page load time <2 seconds
- Mobile usability score >95
- Zero payment failures
- 100% email delivery rate
- Admin dashboard usable by non-technical staff

---

## Requirements & Specifications

### Business Requirements

#### Room Inventory
- **Current:** 25 rooms available for booking
- **Growth:** +1 room per week
- **Maximum:** 67 rooms total
- **Rate structure:** Starting at $175/week
  - Clarification needed: Is this weekly or nightly rate?
  - Assumption for build: $175/week = ~$25/night (confirm before launch)
- **Room types:** TBD (assume Standard, Deluxe, Suite for now)

#### Payment Flow
- **Method:** Full payment upfront (no deposits)
- **Processor:** Stripe
- **Supported cards:** Visa, Mastercard, Amex, Discover
- **Currency:** USD
- **Refund policy:** TBD (define before launch)

#### Contact Information
- **Phone:** (361) 828-2400
- **Email:** howdy@brendlehotel.com (needs setup)
- **Address:** 601 E Ave A, Robstown, TX 78380
- **Website:** brendlehg.com → brendlehotel.com (future)

#### Check-in/Check-out
- **Check-in:** 3:00 PM
- **Check-out:** 11:00 AM
- **Early check-in:** Available on request (admin can note)
- **Late checkout:** Available on request (admin can note)

#### Email System
- **Service:** Gmail API (Google Workspace)
- **Sender:** howdy@brendlehotel.com
- **Domain:** brendlehotel.com (DNS needs configuration)
- **Templates needed:**
  - Booking confirmation
  - Check-in reminder (day before)
  - Admin notification (new booking)
  - Cancellation notification

### Technical Requirements

#### Performance
- **Page load:** <2 seconds (First Contentful Paint)
- **Time to Interactive:** <3 seconds
- **Lighthouse score:** >90 across all metrics
- **Uptime:** 99.9% (Vercel SLA)

#### Security
- **SSL:** Required (Vercel automatic)
- **PCI compliance:** Stripe handles this
- **Data encryption:** At rest (Supabase) and in transit (TLS)
- **Admin auth:** Secure password hashing (bcrypt, 12 rounds)
- **CSRF protection:** Next.js built-in
- **XSS protection:** React automatic escaping + CSP headers

#### SEO
- **Meta tags:** All pages
- **Open Graph:** Home, rooms, booking pages
- **Schema.org:** Hotel, LocalBusiness markup
- **Sitemap:** Auto-generated
- **Robots.txt:** Configured
- **Page speed:** Optimized (affects ranking)

#### Accessibility
- **WCAG 2.1 Level AA compliance**
- **Keyboard navigation:** Full support
- **Screen reader:** Semantic HTML, ARIA labels
- **Color contrast:** 4.5:1 minimum
- **Focus indicators:** Visible on all interactive elements

#### Browser Support
- **Modern browsers:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile browsers:** iOS Safari, Chrome Android
- **Graceful degradation:** Core functionality works without JS

---

## Tech Stack & Justification

### Frontend Framework: Next.js 14 (App Router)

**Why Next.js:**
- **Server-side rendering:** Better SEO, faster initial load
- **API routes:** Backend and frontend in one codebase
- **Image optimization:** Built-in, automatic WebP conversion
- **File-based routing:** Simple, intuitive structure
- **TypeScript:** Type safety reduces bugs
- **Vercel deployment:** Zero-config, optimized by creators
- **React Server Components:** Better performance, smaller bundles

**Why App Router (not Pages):**
- **Latest features:** React 18+ Server Components
- **Better layouts:** Nested, persistent across routes
- **Streaming:** Progressive page loading
- **Future-proof:** This is the direction Next.js is going

### Styling: Tailwind CSS

**Why Tailwind:**
- **Utility-first:** Rapid development, no context switching
- **Responsive:** Mobile-first by default
- **Performance:** Purges unused CSS, tiny bundles
- **Consistency:** Design tokens prevent style drift
- **No CSS files:** Everything in components
- **Dark mode:** Built-in support (future feature)

### UI Components: shadcn/ui

**Why shadcn/ui:**
- **Best-in-class:** Professional, accessible components
- **Customizable:** Copy/paste into codebase, full control
- **Radix UI primitives:** Battle-tested accessibility
- **TypeScript native:** Full type safety
- **Active maintenance:** Regular updates, large community
- **No lock-in:** Components are yours, not npm dependencies

**Alternatives rejected:**
- **Material UI:** Too opinionated, heavy bundle
- **Chakra UI:** Good but less flexibility
- **Ant Design:** Enterprise-focused, not needed here

### Database: Supabase (PostgreSQL)

**Why Supabase:**
- **Postgres:** Industry-standard, powerful, reliable
- **Hosted:** No server management
- **Real-time:** Can add live updates later (admin dashboard)
- **Row-level security:** Built-in auth/permissions
- **Backups:** Automatic daily backups
- **Already provisioned:** Account exists, ready to use

**Schema management:**
- **Migrations:** SQL files, version-controlled
- **Type generation:** Supabase CLI generates TypeScript types
- **Seeding:** Initial data (rooms) via SQL scripts

### Payment Processing: Stripe

**Why Stripe:**
- **Industry leader:** Most reliable payment processor
- **Developer-friendly:** Excellent API, documentation
- **PCI compliance:** Handled by Stripe
- **Webhooks:** Real-time payment status updates
- **Test mode:** Thorough testing before going live
- **Dashboard:** Non-technical staff can view transactions

**Integration approach:**
- **Stripe Checkout:** Hosted payment page (no PCI liability)
- **Payment Intents API:** Flexible, supports future features
- **Webhooks:** `payment_intent.succeeded`, `payment_intent.payment_failed`

### Email: Gmail API (Google Workspace)

**Why Gmail API (not Resend/SendGrid):**
- **Domain email:** howdy@brendlehotel.com via Google Workspace
- **Deliverability:** Google's reputation ensures inbox delivery
- **No separate service:** One less dependency
- **Free with workspace:** Already paying for Google Workspace
- **OAuth 2.0:** Secure authentication

**Setup required:**
1. Google Workspace account for brendlehotel.com
2. Enable Gmail API in Google Cloud Console
3. Create OAuth 2.0 credentials (service account)
4. Authorize sending from howdy@brendlehotel.com

**Fallback:**
- If Gmail API setup is complex, can use Resend temporarily
- Migrate to Gmail API once domain is configured

### Hosting: Vercel

**Why Vercel:**
- **Built for Next.js:** Created by same team, optimized
- **Zero config:** Push to GitHub, auto-deploy
- **Edge network:** Global CDN, fast everywhere
- **Serverless functions:** API routes auto-scale
- **SSL:** Automatic, zero setup
- **Preview deployments:** Every PR gets a URL
- **Analytics:** Built-in performance monitoring
- **Free tier:** Sufficient for this project

**Alternatives rejected:**
- **DigitalOcean:** More control, but requires manual setup/maintenance
- **AWS:** Overkill, complex, expensive
- **Netlify:** Good, but less optimized for Next.js than Vercel

### Version Control: GitHub

**Why GitHub:**
- **Industry standard:** Everyone knows it
- **Vercel integration:** Seamless auto-deploy
- **Actions:** CI/CD built-in (if needed later)
- **Private repos:** Free
- **Already have API key:** Ready to use

### Development Tools

**Package manager:** npm (comes with Node.js, simple)

**TypeScript:** Yes, for type safety and better DX

**ESLint:** Code quality, catch bugs early

**Prettier:** Consistent formatting

**Husky:** Git hooks for pre-commit linting

---

## Development Environment Setup

### Prerequisites

**Required software:**
- Node.js 18+ LTS (20.x recommended)
- npm 9+
- Git 2.x
- Code editor (VS Code recommended)

**VS Code extensions (recommended):**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (built-in)

### Environment Variables

Create `.env.local` in project root (never commit this):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://udxvixjiihhtwrswahvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gmail API (once configured)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GMAIL_SENDER_EMAIL=howdy@brendlehotel.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_HOTEL_PHONE=(361) 828-2400
NEXT_PUBLIC_HOTEL_EMAIL=howdy@brendlehotel.com
NEXT_PUBLIC_HOTEL_ADDRESS=601 E Ave A, Robstown, TX 78380

# Admin
ADMIN_PASSWORD_HASH=$2b$12$... (generate with bcrypt)

# Optional: Analytics (add later)
NEXT_PUBLIC_GA_ID=G-...
```

**Get Supabase keys:**
1. Go to Supabase dashboard
2. Project: udxvixjiihhtwrswahvf
3. Settings > API
4. Copy URL, anon key, service_role key

**Get Stripe keys:**
1. Already have Stripe account
2. Dashboard > Developers > API keys
3. Copy publishable key (pk_test_...) and secret key (sk_test_...)
4. Webhooks (set up later) > Generate webhook secret

**Generate admin password hash:**
```bash
npx bcrypt-cli "your-secure-password" 12
```
Store hash in `.env.local`, share plaintext password securely with Dane

---

## Database Architecture

### Complete Schema

#### Table: `rooms`

```sql
CREATE TABLE rooms (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Room identity
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- 'standard', 'deluxe', 'suite'
    
    -- Pricing
    rate_per_night DECIMAL(10,2) NOT NULL, -- In USD
    rate_per_week DECIMAL(10,2) NOT NULL,  -- Weekly discount rate
    
    -- Details
    description TEXT,
    max_occupancy INT DEFAULT 2,
    size_sqft INT, -- Room size in square feet
    
    -- Amenities (JSON array)
    amenities JSONB DEFAULT '[]'::jsonb,
    -- Example: ["wifi", "tv", "mini-fridge", "microwave", "private-bathroom"]
    
    -- Media
    image_urls JSONB DEFAULT '[]'::jsonb,
    -- Example: ["https://...", "https://..."]
    
    -- Status
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'maintenance')),
    available_from DATE, -- When room becomes available for booking
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_available_from ON rooms(available_from);

-- Trigger: Update updated_at on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Table: `bookings`

```sql
CREATE TABLE bookings (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Unique confirmation code (6-character alphanumeric)
    confirmation_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Foreign key
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    
    -- Guest information
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    
    -- Stay dates
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    
    -- Pricing
    room_rate DECIMAL(10,2) NOT NULL, -- Rate per night at time of booking
    total_amount DECIMAL(10,2) NOT NULL, -- Final amount charged
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'
    )),
    stripe_payment_intent_id VARCHAR(100),
    stripe_charge_id VARCHAR(100),
    paid_at TIMESTAMP,
    
    -- Booking status
    booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN (
        'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
    )),
    
    -- Additional info
    guest_count INT DEFAULT 1,
    special_requests TEXT,
    admin_notes TEXT,
    
    -- Communication
    confirmation_sent BOOLEAN DEFAULT FALSE,
    confirmation_sent_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_confirmation_code ON bookings(confirmation_code);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email);

-- Composite index for availability queries
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, check_in, check_out)
    WHERE booking_status NOT IN ('cancelled', 'no_show');

-- Trigger: Update updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: Check-in before check-out
ALTER TABLE bookings ADD CONSTRAINT check_dates 
    CHECK (check_out > check_in);

-- Constraint: Nights matches date range
ALTER TABLE bookings ADD CONSTRAINT check_nights 
    CHECK (nights = check_out - check_in);
```

#### Table: `admin_users`

```sql
CREATE TABLE admin_users (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Credentials
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt
    
    -- Profile
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'viewer')),
    
    -- Session
    last_login TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Trigger: Update updated_at
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Table: `site_settings`

```sql
CREATE TABLE site_settings (
    -- Key-value store
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INT REFERENCES admin_users(id)
);

-- Trigger: Update updated_at
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Example settings:**

```sql
-- Booking rules
INSERT INTO site_settings (key, value, description) VALUES
('booking_rules', '{
    "min_nights": 1,
    "max_nights": 30,
    "advance_booking_days": 180,
    "same_day_booking": false
}', 'Booking constraints');

-- Check-in times
INSERT INTO site_settings (key, value, description) VALUES
('check_times', '{
    "check_in_time": "15:00",
    "check_out_time": "11:00",
    "early_check_in": true,
    "late_checkout": true
}', 'Check-in and check-out times');

-- Contact info
INSERT INTO site_settings (key, value, description) VALUES
('contact_info', '{
    "phone": "(361) 828-2400",
    "email": "howdy@brendlehotel.com",
    "address": "601 E Ave A, Robstown, TX 78380"
}', 'Hotel contact information');

-- Policies
INSERT INTO site_settings (key, value, description) VALUES
('policies', '{
    "cancellation": "Cancellations must be made 48 hours before check-in for a full refund.",
    "pets": "Sorry, no pets allowed.",
    "smoking": "Non-smoking property."
}', 'Hotel policies');
```

#### Table: `audit_log`

```sql
CREATE TABLE audit_log (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Who
    admin_user_id INT REFERENCES admin_users(id),
    admin_email VARCHAR(100),
    
    -- What
    action VARCHAR(50) NOT NULL, -- 'login', 'create_booking', 'cancel_booking', etc.
    resource_type VARCHAR(50), -- 'booking', 'room', 'setting'
    resource_id INT,
    
    -- Details
    details JSONB,
    
    -- When
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_admin ON audit_log(admin_user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

### Migration Strategy

**Create SQL migration files:**

`supabase/migrations/001_initial_schema.sql` — All tables above

**Apply migrations:**
1. Via Supabase dashboard SQL editor (copy/paste)
2. Or via Supabase CLI: `supabase db push`

**Seed initial data:**

`supabase/seeds/001_initial_rooms.sql`:

```sql
-- Initial 25 rooms
INSERT INTO rooms (room_number, room_type, rate_per_night, rate_per_week, description, max_occupancy, amenities) VALUES
('101', 'standard', 25, 175, 'Cozy room with queen bed, private bathroom, and mini-fridge.', 2, '["wifi", "tv", "mini-fridge", "private-bathroom"]'),
('102', 'standard', 25, 175, 'Cozy room with queen bed, private bathroom, and mini-fridge.', 2, '["wifi", "tv", "mini-fridge", "private-bathroom"]'),
-- ... repeat for all 25 rooms
('125', 'standard', 25, 175, 'Cozy room with queen bed, private bathroom, and mini-fridge.', 2, '["wifi", "tv", "mini-fridge", "private-bathroom"]');

-- Initial admin user (password: change-me-now)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('dane@brendlehotel.com', '$2b$12$...', 'Dane Walter', 'superadmin');
```

**Run seeds:**
Via SQL editor after migrations

---

## Design System

### Color Palette

**Primary Colors:**
- **Turquoise:** `#5FB3B3` (primary CTA, links, accents)
- **Turquoise Dark:** `#4A8F8F` (hover states)
- **Turquoise Light:** `#7EC5C5` (backgrounds, cards)

**Neutral Colors:**
- **Desert Sand:** `#E8DCC4` (light backgrounds)
- **Warm Earth:** `#8B7355` (secondary text, borders)
- **Deep Clay:** `#4A3728` (primary text, headers)
- **White:** `#FFFFFF` (backgrounds)
- **Off-White:** `#FAF9F7` (alternate backgrounds)

**Accent Colors:**
- **Sunset Orange:** `#D97757` (secondary CTAs, warnings)
- **Sage Green:** `#8FAA8F` (success states)
- **Rust Red:** `#C76E5E` (errors, cancellations)

**Tailwind Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        turquoise: {
          DEFAULT: '#5FB3B3',
          dark: '#4A8F8F',
          light: '#7EC5C5',
        },
        desert: '#E8DCC4',
        earth: '#8B7355',
        clay: '#4A3728',
        sunset: '#D97757',
        sage: '#8FAA8F',
        rust: '#C76E5E',
      },
    },
  },
};
```

### Typography

**Font Stack:**

- **Headers:** Playfair Display (Google Fonts)
  - Elegant, readable, hotel-appropriate
  - Weights: 400, 700

- **Body:** Inter (Google Fonts)
  - Modern, clean, excellent readability
  - Weights: 400, 500, 600

**Tailwind Configuration:**

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', ...fontFamily.serif],
        body: ['Inter', ...fontFamily.sans],
      },
    },
  },
};
```

**Type Scale:**
- **h1:** 3rem (48px) / 3.5rem mobile: 2.25rem (36px)
- **h2:** 2.25rem (36px) / mobile: 1.875rem (30px)
- **h3:** 1.875rem (30px) / mobile: 1.5rem (24px)
- **h4:** 1.5rem (24px) / mobile: 1.25rem (20px)
- **body:** 1rem (16px)
- **small:** 0.875rem (14px)

### Spacing

**Scale:** 4px base unit (Tailwind default)
- **xs:** 0.5rem (8px)
- **sm:** 0.75rem (12px)
- **md:** 1rem (16px)
- **lg:** 1.5rem (24px)
- **xl:** 2rem (32px)
- **2xl:** 3rem (48px)
- **3xl:** 4rem (64px)

### Components

**Buttons:**

```jsx
// Primary CTA
<button className="bg-turquoise hover:bg-turquoise-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
  Book Your Stay
</button>

// Secondary
<button className="bg-white hover:bg-desert text-clay font-semibold py-3 px-6 rounded-lg border-2 border-earth transition-colors duration-200">
  Learn More
</button>
```

**Cards:**

```jsx
<div className="bg-white rounded-lg shadow-md p-6 border border-earth/20 hover:shadow-lg transition-shadow duration-200">
  {/* Content */}
</div>
```

**Inputs:**

```jsx
<input
  type="text"
  className="w-full px-4 py-3 border border-earth/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent"
/>
```

### Hero Section Design

**Layout:**
- Full-width video background
- Dark overlay (rgba(0,0,0,0.4)) for text contrast
- Centered content with:
  - Hotel name (h1, Playfair Display, white)
  - Tagline (p, Inter, white/80% opacity)
  - CTA button (turquoise, prominent)

**Video specs:**
- Format: MP4 (H.264)
- Size: Max 5MB (compressed)
- Duration: 10-20 seconds (loop)
- Dimensions: 1920x1080 (scales responsively)

**Implementation:**

```jsx
<section className="relative h-screen">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/hero-video.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
    <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
      Hotel Brendle
    </h1>
    <p className="text-xl md:text-2xl mb-8 text-white/90">
      Your home in the heart of Robstown
    </p>
    <button className="bg-turquoise hover:bg-turquoise-dark text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200">
      Book Your Stay
    </button>
  </div>
</section>
```

---

## Project Structure

```
hotel-brendle/
├── .git/
├── .gitignore
├── .env.local                     # Environment variables (not committed)
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── package-lock.json
├── README.md
│
├── app/
│   ├── layout.tsx                 # Root layout (fonts, metadata)
│   ├── globals.css                # Tailwind imports + global styles
│   ├── page.tsx                   # Home page (hero + overview)
│   │
│   ├── rooms/
│   │   └── page.tsx               # Rooms listing
│   │
│   ├── book/
│   │   └── page.tsx               # Booking flow
│   │
│   ├── confirmation/
│   │   └── [code]/
│   │       └── page.tsx           # Booking confirmation page
│   │
│   ├── contact/
│   │   └── page.tsx               # Contact page
│   │
│   ├── about/
│   │   └── page.tsx               # About Hotel Brendle
│   │
│   ├── policies/
│   │   └── page.tsx               # Cancellation, policies
│   │
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout (nav, auth check)
│   │   ├── login/
│   │   │   └── page.tsx           # Admin login
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Admin home (stats)
│   │   ├── bookings/
│   │   │   ├── page.tsx           # Bookings list
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Booking detail
│   │   ├── rooms/
│   │   │   ├── page.tsx           # Rooms management
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Room edit
│   │   └── settings/
│   │       └── page.tsx           # Site settings
│   │
│   └── api/
│       ├── bookings/
│       │   ├── check-availability/
│       │   │   └── route.ts
│       │   ├── create/
│       │   │   └── route.ts
│       │   └── [code]/
│       │       └── route.ts
│       │
│       ├── admin/
│       │   ├── login/
│       │   │   └── route.ts
│       │   ├── bookings/
│       │   │   ├── route.ts       # List all
│       │   │   └── [id]/
│       │   │       └── route.ts   # Get/update single
│       │   ├── rooms/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       └── route.ts
│       │   └── settings/
│       │       └── route.ts
│       │
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts
│       │
│       └── contact/
│           └── route.ts
│
├── components/
│   ├── ui/                        # shadcn components (Button, Input, etc.)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── calendar.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── AdminNav.tsx
│   │
│   ├── booking/
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── RoomSelector.tsx
│   │   ├── GuestInfoForm.tsx
│   │   └── BookingSummary.tsx
│   │
│   ├── rooms/
│   │   ├── RoomCard.tsx
│   │   └── RoomGrid.tsx
│   │
│   └── admin/
│       ├── BookingTable.tsx
│       ├── RoomTable.tsx
│       └── StatCard.tsx
│
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── stripe.ts                  # Stripe client
│   ├── gmail.ts                   # Gmail API client
│   ├── auth.ts                    # Admin auth helpers
│   ├── utils.ts                   # General utilities
│   ├── validations.ts             # Zod schemas
│   └── constants.ts               # App constants
│
├── types/
│   ├── database.ts                # Database types (auto-generated)
│   └── index.ts                   # App-specific types
│
├── public/
│   ├── hero-video.mp4
│   ├── images/
│   │   ├── rooms/
│   │   └── amenities/
│   ├── favicon.ico
│   └── robots.txt
│
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seeds/
        └── 001_initial_rooms.sql
```

---

## Phase 1: Foundation & Setup

### Step 1: Create GitHub Repository

```bash
# Local machine
cd ~/.openclaw/workspace
mkdir hotel-brendle
cd hotel-brendle
git init
git branch -M main

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Environment
.env*.local
.env.production

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF

git add .gitignore
git commit -m "Initial commit: .gitignore"

# Create remote repo via GitHub CLI (if available) or manually
# Assuming manual: go to github.com, create "hotel-brendle" repo
# Then:
git remote add origin https://github.com/[USERNAME]/hotel-brendle.git
git push -u origin main
```

### Step 2: Initialize Next.js Project

```bash
# Still in hotel-brendle/
npx create-next-app@latest . --typescript --tailwind --app --use-npm

# When prompted:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? No
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? No

# This creates:
# - app/ directory
# - tsconfig.json
# - tailwind.config.js
# - next.config.js
# - package.json with dependencies
```

### Step 3: Install Additional Dependencies

```bash
npm install @supabase/supabase-js stripe react-day-picker date-fns bcryptjs zod react-hook-form @hookform/resolvers jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

**Package purposes:**
- `@supabase/supabase-js` — Database client
- `stripe` — Payment processing
- `react-day-picker` — Calendar UI for date selection
- `date-fns` — Date manipulation utilities
- `bcryptjs` — Password hashing
- `zod` — Schema validation
- `react-hook-form` — Form state management
- `@hookform/resolvers` — Zod integration with react-hook-form
- `jsonwebtoken` — Admin session tokens

### Step 4: Install shadcn/ui

```bash
npx shadcn@latest init

# When prompted:
# ✔ Would you like to use TypeScript? Yes
# ✔ Which style would you like to use? Default
# ✔ Which color would you like to use as base color? Slate
# ✔ Where is your global CSS file? app/globals.css
# ✔ Would you like to use CSS variables for colors? Yes
# ✔ Where is your tailwind.config.js located? tailwind.config.js
# ✔ Configure the import alias for components: @/components
# ✔ Configure the import alias for utils: @/lib/utils

# Install needed components
npx shadcn@latest add button input card dialog calendar select table dropdown-menu avatar badge
```

### Step 5: Configure Tailwind with Custom Colors

Edit `tailwind.config.js`:

```javascript
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        turquoise: {
          DEFAULT: '#5FB3B3',
          dark: '#4A8F8F',
          light: '#7EC5C5',
        },
        desert: '#E8DCC4',
        earth: '#8B7355',
        clay: '#4A3728',
        sunset: '#D97757',
        sage: '#8FAA8F',
        rust: '#C76E5E',
      },
      fontFamily: {
        heading: ['Playfair Display', ...fontFamily.serif],
        body: ['Inter', ...fontFamily.sans],
        sans: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### Step 6: Configure Next.js

Edit `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'udxvixjiihhtwrswahvf.supabase.co', // Supabase storage
    ],
  },
  // Strict mode for development
  reactStrictMode: true,
};

module.exports = nextConfig;
```

### Step 7: Set Up Environment Variables

Create `.env.local`:

```bash
# Supabase (get from dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://udxvixjiihhtwrswahvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gmail API (configure later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GMAIL_SENDER_EMAIL=howdy@brendlehotel.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_HOTEL_PHONE=(361) 828-2400
NEXT_PUBLIC_HOTEL_EMAIL=howdy@brendlehotel.com
NEXT_PUBLIC_HOTEL_ADDRESS=601 E Ave A, Robstown, TX 78380

# Admin (generate password hash with: npx bcrypt-cli "password" 12)
ADMIN_PASSWORD_HASH=

# JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET=
```

**Generate secrets:**

```bash
# Admin password hash
npx bcrypt-cli "your-secure-password" 12
# Copy hash to ADMIN_PASSWORD_HASH

# JWT secret
openssl rand -base64 32
# Copy to JWT_SECRET
```

### Step 8: Create Base Library Files

**`lib/supabase.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser/frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client with service role (use only in API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**`lib/stripe.ts`:**

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

**`lib/constants.ts`:**

```typescript
export const HOTEL_INFO = {
  name: 'Hotel Brendle',
  phone: process.env.NEXT_PUBLIC_HOTEL_PHONE!,
  email: process.env.NEXT_PUBLIC_HOTEL_EMAIL!,
  address: process.env.NEXT_PUBLIC_HOTEL_ADDRESS!,
  checkInTime: '3:00 PM',
  checkOutTime: '11:00 AM',
};

export const BOOKING_RULES = {
  minNights: 1,
  maxNights: 30,
  advanceBookingDays: 180,
  sameDayBooking: false,
};

export const ROOM_TYPES = {
  standard: {
    label: 'Standard Room',
    description: 'Cozy room with queen bed and private bathroom',
  },
  deluxe: {
    label: 'Deluxe Room',
    description: 'Spacious room with king bed and sitting area',
  },
  suite: {
    label: 'Suite',
    description: 'Large suite with separate living area',
  },
};
```

**`lib/utils.ts`:**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate 6-character confirmation code
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

// Calculate nights between dates
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
```

### Step 9: Create Type Definitions

**`types/index.ts`:**

```typescript
export type RoomType = 'standard' | 'deluxe' | 'suite';
export type RoomStatus = 'available' | 'unavailable' | 'maintenance';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export interface Room {
  id: number;
  room_number: string;
  room_type: RoomType;
  rate_per_night: number;
  rate_per_week: number;
  description: string;
  max_occupancy: number;
  amenities: string[];
  image_urls: string[];
  status: RoomStatus;
  available_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  confirmation_code: string;
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // Date string
  check_out: string;
  nights: number;
  room_rate: number;
  total_amount: number;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  paid_at: string | null;
  booking_status: BookingStatus;
  guest_count: number;
  special_requests: string | null;
  admin_notes: string | null;
  confirmation_sent: boolean;
  confirmation_sent_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  special_requests?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'superadmin' | 'viewer';
  last_login: string | null;
  is_active: boolean;
}
```

### Step 10: Commit Foundation

```bash
git add .
git commit -m "Foundation: Next.js, Tailwind, shadcn/ui, types, lib setup"
git push
```

---

## Phase 2: Public Pages & UI

### Step 1: Root Layout with Fonts

**`app/layout.tsx`:**

```typescript
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hotel Brendle | Robstown, TX',
  description: 'Comfortable rooms in the heart of Robstown, Texas. Starting at $175/week.',
  keywords: 'hotel, Robstown, Texas, accommodation, rooms, weekly rates',
  openGraph: {
    title: 'Hotel Brendle | Robstown, TX',
    description: 'Your home in the heart of Robstown.',
    type: 'website',
    locale: 'en_US',
    url: 'https://brendlehg.com',
    siteName: 'Hotel Brendle',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-body antialiased bg-white text-clay">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**`app/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-inter: 'Inter', sans-serif;
    --font-playfair: 'Playfair Display', serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

### Step 2: Header Component

**`components/layout/Header.tsx`:**

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading text-2xl font-bold text-clay">
          Hotel Brendle
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/rooms" className="text-clay hover:text-turquoise transition-colors">
            Rooms
          </Link>
          <Link href="/about" className="text-clay hover:text-turquoise transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-clay hover:text-turquoise transition-colors">
            Contact
          </Link>
          <Link href="/book">
            <Button className="bg-turquoise hover:bg-turquoise-dark">
              Book Now
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-clay"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-earth/20 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link href="/rooms" className="text-clay hover:text-turquoise">
              Rooms
            </Link>
            <Link href="/about" className="text-clay hover:text-turquoise">
              About
            </Link>
            <Link href="/contact" className="text-clay hover:text-turquoise">
              Contact
            </Link>
            <Link href="/book">
              <Button className="w-full bg-turquoise hover:bg-turquoise-dark">
                Book Now
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
```

### Step 3: Footer Component

**`components/layout/Footer.tsx`:**

```typescript
import Link from 'next/link';
import { HOTEL_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-clay text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Contact Us</h3>
            <p className="mb-2">{HOTEL_INFO.address}</p>
            <p className="mb-2">
              <a href={`tel:${HOTEL_INFO.phone}`} className="hover:text-turquoise-light transition-colors">
                {HOTEL_INFO.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${HOTEL_INFO.email}`} className="hover:text-turquoise-light transition-colors">
                {HOTEL_INFO.email}
              </a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rooms" className="hover:text-turquoise-light transition-colors">
                  Rooms
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-turquoise-light transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-turquoise-light transition-colors">
                  Policies
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-turquoise-light transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Check-in Times */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Check-in Times</h3>
            <p className="mb-2">
              <strong>Check-in:</strong> {HOTEL_INFO.checkInTime}
            </p>
            <p>
              <strong>Check-out:</strong> {HOTEL_INFO.checkOutTime}
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} Hotel Brendle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### Step 4: Home Page (Hero + Overview)

**First, download hero video:**

```bash
cd public/
curl -o hero-video.mp4 "https://brendlehg.com/path-to-video.mp4"
# OR: manually download from site and place in public/
```

**`app/page.tsx`:**

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
            Hotel Brendle
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl">
            Your home in the heart of Robstown, Texas
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-turquoise hover:bg-turquoise-dark text-lg px-8 py-6">
              Book Your Stay
            </Button>
          </Link>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-clay mb-4">
              Welcome to Hotel Brendle
            </h2>
            <p className="text-lg text-earth max-w-2xl mx-auto">
              Comfortable, affordable rooms in the heart of Robstown. 
              Perfect for long-term stays or a quick visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-turquoise-light rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-turquoise-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Comfortable Rooms</h3>
                <p className="text-earth">
                  Clean, quiet rooms with all the amenities you need for a great stay.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-turquoise-light rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-turquoise-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Affordable Rates</h3>
                <p className="text-earth">
                  Starting at just $175/week. Perfect for extended stays.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-turquoise-light rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-turquoise-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Great Location</h3>
                <p className="text-earth">
                  In the heart of Robstown, close to local businesses and amenities.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/rooms">
              <Button size="lg" variant="outline" className="border-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
                View Our Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

### Step 5: About Page

**`app/about/page.tsx`:**

```typescript
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'About Us | Hotel Brendle',
  description: 'Learn about Hotel Brendle and our commitment to affordable, comfortable accommodation in Robstown, TX.',
};

export default function AboutPage() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading text-5xl font-bold text-clay mb-8 text-center">
          About Hotel Brendle
        </h1>

        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="font-heading text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-earth mb-4">
              Hotel Brendle has been serving the Robstown community for years, 
              providing comfortable, affordable accommodation for travelers and 
              long-term residents alike.
            </p>
            <p className="text-earth mb-4">
              Located at 601 E Ave A in the heart of Robstown, we're proud to 
              be part of this vibrant South Texas community.
            </p>
            <p className="text-earth">
              With 67 rooms (and growing!), we offer a variety of accommodations 
              to suit your needs, whether you're staying for a night or a month.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="font-heading text-2xl font-bold mb-4">What We Offer</h2>
            <ul className="space-y-3 text-earth">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-turquoise mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Clean, comfortable rooms with private bathrooms</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-turquoise mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free WiFi throughout the property</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-turquoise mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cable TV in every room</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-turquoise mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Weekly rates starting at just $175</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-turquoise mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Convenient location in downtown Robstown</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-turquoise mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>On-site parking</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Step 6: Contact Page

**`app/contact/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { HOTEL_INFO } from '@/lib/constants';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('sent');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading text-5xl font-bold text-clay mb-8 text-center">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-heading text-2xl font-bold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-turquoise mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href={`tel:${HOTEL_INFO.phone}`} className="text-turquoise hover:underline">
                      {HOTEL_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-turquoise mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href={`mailto:${HOTEL_INFO.email}`} className="text-turquoise hover:underline">
                      {HOTEL_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-turquoise mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-earth">{HOTEL_INFO.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-heading text-2xl font-bold mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <textarea
                  className="w-full px-4 py-3 border border-earth/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  rows={4}
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-turquoise hover:bg-turquoise-dark"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </Button>

                {status === 'sent' && (
                  <p className="text-sage text-center">Message sent! We'll get back to you soon.</p>
                )}
                {status === 'error' && (
                  <p className="text-rust text-center">Something went wrong. Please try again.</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map (optional - can add Google Maps embed) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-2xl font-bold mb-4">Find Us</h2>
            <div className="aspect-video bg-desert rounded-lg flex items-center justify-center">
              <p className="text-earth">Map placeholder (add Google Maps iframe)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Step 7: Commit Public Pages

```bash
git add .
git commit -m "Public pages: home (hero), about, contact"
git push
```

---

## Phase 3: Booking System Core

_(Continuing in next section due to length...)_

### Step 1: Room Listing Page

**`app/rooms/page.tsx`:**

```typescript
import { supabaseAdmin } from '@/lib/supabase';
import RoomCard from '@/components/rooms/RoomCard';
import type { Room } from '@/types';

export const metadata = {
  title: 'Our Rooms | Hotel Brendle',
  description: 'View available rooms at Hotel Brendle. Starting at $175/week.',
};

export default async function RoomsPage() {
  // Fetch all available rooms
  const { data: rooms, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('status', 'available')
    .order('room_number');

  if (error) {
    console.error('Error fetching rooms:', error);
    return <div>Error loading rooms</div>;
  }

  // Group by room type
  const roomsByType = (rooms as Room[]).reduce((acc, room) => {
    if (!acc[room.room_type]) acc[room.room_type] = [];
    acc[room.room_type].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-5xl font-bold text-clay mb-4 text-center">
          Our Rooms
        </h1>
        <p className="text-center text-earth mb-12 max-w-2xl mx-auto">
          All rooms include WiFi, cable TV, private bathroom, and basic amenities. 
          Weekly rates starting at just $175.
        </p>

        {Object.entries(roomsByType).map(([type, typeRooms]) => (
          <div key={type} className="mb-16">
            <h2 className="font-heading text-3xl font-bold text-clay mb-6 capitalize">
              {type} Rooms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {typeRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**`components/rooms/RoomCard.tsx`:**

```typescript
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';

export default function RoomCard({ room }: { room: Room }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-desert flex items-center justify-center">
        {room.image_urls.length > 0 ? (
          <img
            src={room.image_urls[0]}
            alt={`Room ${room.room_number}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="text-earth">Room {room.room_number}</p>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="font-heading text-xl font-bold mb-2">
          Room {room.room_number}
        </h3>
        <p className="text-earth mb-4">{room.description}</p>
        <div className="mb-4">
          <p className="text-2xl font-bold text-turquoise">
            {formatCurrency(room.rate_per_week)}/week
          </p>
          <p className="text-sm text-earth">
            {formatCurrency(room.rate_per_night)}/night
          </p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-1 bg-turquoise-light/20 text-turquoise-dark text-xs rounded"
            >
              {amenity}
            </span>
          ))}
        </div>
        <Link href="/book">
          <Button className="w-full bg-turquoise hover:bg-turquoise-dark">
            Book This Room
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
```

### Step 2: Booking Flow - Date Selection

**`app/book/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar';
import RoomSelector from '@/components/booking/RoomSelector';
import GuestInfoForm from '@/components/booking/GuestInfoForm';
import BookingSummary from '@/components/booking/BookingSummary';
import type { Room, CreateBookingData } from '@/types';

export default function BookPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingData, setBookingData] = useState<Partial<CreateBookingData>>({});

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-heading text-5xl font-bold text-clay mb-8 text-center">
          Book Your Stay
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-turquoise' : 'text-earth/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step >= 1 ? 'border-turquoise bg-turquoise text-white' : 'border-earth/50'}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Dates & Room</span>
            </div>
            <div className="w-12 h-px bg-earth/20" />
            <div className={`flex items-center ${step >= 2 ? 'text-turquoise' : 'text-earth/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step >= 2 ? 'border-turquoise bg-turquoise text-white' : 'border-earth/50'}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Guest Info</span>
            </div>
            <div className="w-12 h-px bg-earth/20" />
            <div className={`flex items-center ${step >= 3 ? 'text-turquoise' : 'text-earth/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step >= 3 ? 'border-turquoise bg-turquoise text-white' : 'border-earth/50'}`}>
                3
              </div>
              <span className="ml-2 font-semibold">Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Date & Room Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-2xl font-bold mb-4">Select Dates</h2>
                <AvailabilityCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onCheckInChange={setCheckIn}
                  onCheckOutChange={setCheckOut}
                />
              </CardContent>
            </Card>

            <div>
              {checkIn && checkOut && (
                <RoomSelector
                  checkIn={checkIn}
                  checkOut={checkOut}
                  selectedRoom={selectedRoom}
                  onSelectRoom={(room) => {
                    setSelectedRoom(room);
                    setStep(2);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Step 2: Guest Info */}
        {step === 2 && checkIn && checkOut && selectedRoom && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-bold mb-4">Guest Information</h2>
                  <GuestInfoForm
                    checkIn={checkIn}
                    checkOut={checkOut}
                    roomId={selectedRoom.id}
                    onSubmit={(data) => {
                      setBookingData(data);
                      setStep(3);
                    }}
                    onBack={() => setStep(1)}
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <BookingSummary
                checkIn={checkIn}
                checkOut={checkOut}
                room={selectedRoom}
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && checkIn && checkOut && selectedRoom && bookingData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-bold mb-4">Payment</h2>
                  {/* Stripe payment will go here */}
                  <p>Payment form placeholder (Stripe integration next phase)</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <BookingSummary
                checkIn={checkIn}
                checkOut={checkOut}
                room={selectedRoom}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

_(Due to the comprehensive nature of this build guide, I'll continue with the remaining implementation details in the next sections. This document is designed to be as detailed and actionable as possible, providing step-by-step instructions for every component, API route, and feature.)_

**Remaining sections to complete:**
- Booking components (Calendar, RoomSelector, GuestInfoForm, BookingSummary)
- API routes (check-availability, create booking)
- Stripe payment integration (Phase 4)
- Gmail API email system (Phase 5)
- Admin dashboard (Phase 6)
- Testing procedures (Phase 7)
- Deployment to Vercel (Phase 8)
- DNS configuration (Phase 9)
- Post-launch monitoring (Phase 10)
- Future phases (Investor portal, enhancements)
- Security checklist
- Performance optimization
- SEO & Analytics
- Maintenance procedures

**Character limit reached. This guide should be continued in additional sections to cover all phases comprehensively. Shall I continue with the remaining phases?**
