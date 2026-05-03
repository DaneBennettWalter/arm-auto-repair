# Hotel Brendle - Execution Plan
**Created:** 2026-04-29 20:07 EDT  
**Approach:** Slow, methodical, sub-agents for major phases, Opus for design-critical work

---

## Confirmed Specifications

### Pricing
- **Nightly:** $40
- **Weekly:** $175 (saves $105 vs 7×$40 = $280)

### Room Inventory
- **12 Standard Rooms** — $40/night, $175/week
- **13 Double Rooms** — $40/night, $175/week (confirm if different rate)
- **Total:** 25 rooms (adding 1/week to 67 max)

### Hero Video
- **YouTube ID:** M-CxFhqbApk
- **Embed URL:** `https://www.youtube.com/embed/M-CxFhqbApk?autoplay=1&mute=1&loop=1&playlist=M-CxFhqbApk&controls=0&showinfo=0&rel=0&start=15&modestbranding=1&iv_load_policy=3`
- Starts at 15 seconds, loops, no controls

### Design Direction
**Critical:** Mobile-first, minimalist but not hollow (substance over emptiness)

**Inspirations:**
1. **Mara SRL** (marasrl.it/en) — Clean Italian furniture site
   - Spacious layouts
   - High-quality imagery
   - Elegant typography
   - Minimal but purposeful

2. **SubstrateRx** (countdown.substraterx.com) — Modern, bold
   - Strong visual hierarchy
   - Confident use of whitespace
   - Clear CTAs

3. **Outfit by hellohello** (outfit.hellohello.is) — Creative agency
   - Playful but professional
   - Smooth interactions
   - Attention to detail

**Key Design Principles:**
- **Mobile-first:** Design for mobile, scale up (not down)
- **Whitespace:** Generous but intentional
- **Typography:** Clear hierarchy, readable (Playfair + Inter)
- **Color:** New Mexico turquoise as accent, not dominant
- **Imagery:** High quality when present, not stock-photo generic
- **Interactions:** Smooth, purposeful animations (not gratuitous)
- **Content:** Every word earns its place
- **CTAs:** Clear, confident, not desperate

### Email
- **Service:** Gmail API (credentials available)
- **Sender:** howdy@brendlehotel.com

### Contact
- **Phone:** (361) 828-2400
- **Email:** howdy@brendlehotel.com
- **Address:** 601 E Ave A, Robstown, TX 78380

---

## Execution Strategy

### Phase Ownership

| Phase | Owner | Model | Reasoning |
|-------|-------|-------|-----------|
| **1: Foundation** | Sub-agent | Sonnet | Setup tasks, straightforward |
| **2: Public Pages** | Sub-agent | **Opus** | Design-critical, first impression |
| **3: Booking Core** | Sub-agent | Sonnet | Logic-heavy, less design-critical |
| **4: Payments** | Sub-agent | Sonnet | Stripe integration, well-documented |
| **5: Email** | Sub-agent | Sonnet | Gmail API, templates |
| **6: Admin Dashboard** | Sub-agent | Sonnet | Internal tool, less design-critical |
| **7: Testing** | Main | Sonnet | Coordination, review |
| **8-10: Deploy** | Main | Sonnet | Orchestration, final checks |

### Sub-Agent Approach

**Why sub-agents:**
- Parallel work on independent phases
- Isolated contexts (cleaner, focused)
- Easier to debug/retry
- Better for long-running tasks

**Sub-agent deliverables:**
- Working code committed to git
- README or notes on what was done
- Any blockers or questions surfaced

**Main agent role (me):**
- Orchestrate sub-agents
- Review deliverables
- Handle integration
- Make design decisions
- Final QA before launch

---

## Phase 1: Foundation & Setup

**Owner:** Sub-agent (Sonnet)  
**Estimated time:** 3-4 hours  
**Deliverable:** Project initialized, dependencies installed, basic structure in place

### Tasks

1. **Create GitHub repository**
   - Name: `hotel-brendle`
   - Initialize with .gitignore
   - Create README.md

2. **Initialize Next.js project**
   - TypeScript enabled
   - Tailwind CSS configured
   - App Router
   - ESLint + Prettier

3. **Install dependencies**
   - Core: next, react, react-dom, typescript
   - Styling: tailwindcss, tailwindcss-animate
   - UI: shadcn/ui components (button, input, card, dialog, calendar, select, table)
   - Database: @supabase/supabase-js
   - Payments: stripe, @stripe/stripe-js, @stripe/react-stripe-js
   - Forms: react-hook-form, @hookform/resolvers, zod
   - Dates: react-day-picker, date-fns
   - Auth: bcryptjs, jsonwebtoken
   - Email: googleapis (for Gmail API)
   - Dev: @types/* for TS definitions

4. **Configure Tailwind with custom design system**
   - Turquoise color palette (#5FB3B3 primary)
   - Desert, earth, clay neutrals
   - Playfair Display + Inter fonts
   - Custom spacing, typography scale

5. **Set up project structure**
   - /app (routes + API)
   - /components (UI, booking, rooms, layout, admin)
   - /lib (supabase, stripe, gmail, auth, utils, constants, validations)
   - /types (database, app types)
   - /public (video, images)
   - /supabase (migrations, seeds)

6. **Configure Next.js**
   - next.config.js (image domains, security headers)
   - Environment variable structure (.env.example)
   - TypeScript config

7. **Create base library files**
   - lib/supabase.ts (client + admin)
   - lib/stripe.ts (Stripe instance)
   - lib/constants.ts (hotel info, booking rules, room types)
   - lib/utils.ts (helpers: formatCurrency, formatDate, calculateNights, generateConfirmationCode)
   - types/index.ts (Room, Booking, AdminUser types)

8. **Initial commit & push**
   - Commit all foundation work
   - Push to GitHub

**Success criteria:**
- `npm run dev` starts successfully
- TypeScript compiles with no errors
- Tailwind classes work
- shadcn/ui components importable

**Questions for main agent:**
- GitHub credentials confirmed?
- Supabase project URL confirmed?
- Any specific folder structure preferences?

---

## Phase 2: Public Pages & UI

**Owner:** Sub-agent (**Opus**)  
**Estimated time:** 6-8 hours  
**Deliverable:** Beautiful, mobile-first public pages

### Design Requirements

**Mobile-first approach:**
- Design at 375px width first
- Scale up to tablet (768px) and desktop (1280px+)
- Touch-friendly tap targets (min 44×44px)
- Readable text (min 16px body)

**Hero section (homepage):**
- YouTube embed background (M-CxFhqbApk)
- Overlay for text legibility (subtle, not heavy)
- Clean, confident headline: "Hotel Brendle"
- Subhead: Short, welcoming (not cliché)
- CTA: "Book Your Stay" (turquoise, prominent)
- No clutter, no unnecessary copy

**Pages to build:**
1. **Homepage** (`app/page.tsx`)
   - Hero with video
   - Brief overview (3 sections: comfort, value, location)
   - CTA to rooms or booking

2. **Rooms** (`app/rooms/page.tsx`)
   - List 2 room types: Standard, Double
   - Cards with description, amenities, pricing
   - Clean grid layout (1 col mobile, 2 col tablet, 3 col desktop)
   - CTA: "Book This Room" → /book

3. **About** (`app/about/page.tsx`)
   - Story: Hotel Brendle, Robstown, Texas
   - What we offer (amenities list)
   - Not too wordy, not too sparse

4. **Contact** (`app/contact/page.tsx`)
   - Contact form (name, email, phone optional, message)
   - Hotel info (phone, email, address)
   - Map placeholder (can add Google Maps embed later)

**Components to build:**
- `components/layout/Header.tsx` — Sticky nav, mobile menu
- `components/layout/Footer.tsx` — Contact, links, hours
- `components/rooms/RoomCard.tsx` — Room display card

**Typography:**
- Headings: Playfair Display (elegant, not overdone)
- Body: Inter (clean, readable)
- Scale: h1 48px/36px mobile, h2 36px/30px, h3 30px/24px, body 16px

**Spacing:**
- Generous but intentional
- Consistent rhythm (8px grid)
- Sections separated clearly

**Color usage:**
- Turquoise: CTAs, links, accents (not backgrounds)
- White: Primary background
- Desert (#E8DCC4): Alternate sections, cards
- Clay (#4A3728): Primary text
- Earth (#8B7355): Secondary text

**Interactions:**
- Hover states on all interactive elements
- Smooth transitions (200ms duration)
- Focus indicators (keyboard nav)
- No jarring animations

**Success criteria:**
- Looks professional on iPhone SE (375px)
- Scales beautifully to desktop
- Passes vibe check: minimalist but not hollow
- Typography hierarchy clear
- CTAs stand out without screaming

**Questions for main agent:**
- Any specific copy preferences?
- Room descriptions needed?
- Additional pages?

---

## Phase 3: Booking System Core

**Owner:** Sub-agent (Sonnet)  
**Estimated time:** 10-12 hours  
**Deliverable:** Complete booking flow (dates → room → guest info)

### Components to build

1. **Booking page** (`app/book/page.tsx`)
   - Step indicator (1: Dates/Room, 2: Guest Info, 3: Payment)
   - State management for booking data

2. **AvailabilityCalendar** (`components/booking/AvailabilityCalendar.tsx`)
   - react-day-picker integration
   - Disable past dates
   - Highlight selected range
   - Show nights count
   - Display check-in/out times

3. **RoomSelector** (`components/booking/RoomSelector.tsx`)
   - Fetch available rooms via API
   - Display Standard vs Double
   - Show pricing (nightly + weekly)
   - Calculate total for selected dates
   - Handle selection

4. **GuestInfoForm** (`components/booking/GuestInfoForm.tsx`)
   - Name, email, phone, guest count
   - Special requests (textarea)
   - Validation (Zod schema)
   - react-hook-form

5. **BookingSummary** (`components/booking/BookingSummary.tsx`)
   - Room details
   - Dates, nights
   - Pricing breakdown (subtotal, tax, total)
   - Sticky on desktop

### API Routes

1. **Check Availability** (`app/api/bookings/check-availability/route.ts`)
   - POST: { check_in, check_out }
   - Query Supabase for available rooms (not booked for those dates)
   - Return available rooms array

2. **Validation schemas** (`lib/validations.ts`)
   - createBookingSchema (Zod)
   - All input validation

### Database queries
- Join rooms + bookings
- Filter by date overlap
- Exclude cancelled/no-show

**Success criteria:**
- User can select dates
- Available rooms display correctly
- Guest form validates
- State flows between steps
- No TypeScript errors

---

## Phase 4: Payment Integration

**Owner:** Sub-agent (Sonnet)  
**Estimated time:** 6-8 hours  
**Deliverable:** Stripe payment processing end-to-end

### Implementation

1. **Create Booking API** (`app/api/bookings/create/route.ts`)
   - Validate booking data
   - Check room availability (prevent double-booking race)
   - Calculate total (nights × rate + tax)
   - Generate confirmation code (6-char alphanumeric)
   - Create booking record (payment_status: pending)
   - Create Stripe Payment Intent
   - Return client_secret + confirmation_code

2. **Stripe Webhook** (`app/api/webhooks/stripe/route.ts`)
   - Verify signature
   - Handle events:
     - payment_intent.succeeded → Update booking (paid), send email
     - payment_intent.payment_failed → Update booking (failed)
     - charge.refunded → Update booking (refunded)

3. **Payment Component** (`components/booking/StripePaymentForm.tsx`)
   - Stripe Elements integration
   - Payment Element (card input)
   - Error handling
   - Submit → confirmPayment → redirect to confirmation

4. **Confirmation Page** (`app/confirmation/[code]/page.tsx`)
   - Fetch booking by confirmation_code
   - Display booking details
   - Guest instructions (check-in info)
   - Contact info

**Stripe setup:**
- Use test keys initially
- Switch to live before production launch
- Configure webhook endpoint after Vercel deploy

**Success criteria:**
- Test payment completes (4242 4242 4242 4242)
- Webhook receives event
- Booking status updates
- Confirmation page displays

---

## Phase 5: Email System

**Owner:** Sub-agent (Sonnet)  
**Estimated time:** 4-5 hours  
**Deliverable:** Gmail API sending confirmation emails

### Implementation

1. **Gmail API Client** (`lib/gmail.ts`)
   - OAuth2 setup with Google credentials
   - sendEmail function (to, subject, html)

2. **Email Templates** (`lib/email-templates.ts`)
   - bookingConfirmationEmail (guest)
   - adminBookingNotificationEmail (staff)
   - checkInReminderEmail (day before)

3. **Integration**
   - Webhook handler: send email on payment_intent.succeeded
   - Mark confirmation_sent = true
   - Log email failures

4. **Contact Form API** (`app/api/contact/route.ts`)
   - Receive form submission
   - Send to admin email
   - Return success/error

**Gmail API setup:**
- Use credentials from .env
- Sender: howdy@brendlehotel.com
- Test with real send

**Success criteria:**
- Booking confirmation email delivers
- Admin notification email delivers
- Contact form email delivers
- Emails render correctly (mobile + desktop)

---

## Phase 6: Admin Dashboard

**Owner:** Sub-agent (Sonnet)  
**Estimated time:** 8-10 hours  
**Deliverable:** Admin login, dashboard, bookings management

### Implementation

1. **Auth** (`lib/auth.ts`)
   - hashPassword, verifyPassword (bcrypt)
   - generateToken, verifyToken (JWT)
   - loginAdmin, getAdminSession
   - Cookie-based session

2. **Admin Login** (`app/admin/login/page.tsx` + API)
   - Email + password form
   - Validate credentials
   - Set HTTP-only cookie
   - Redirect to dashboard

3. **Admin Layout** (`app/admin/layout.tsx`)
   - Check session (redirect if not logged in)
   - Admin navigation (Dashboard, Bookings, Rooms, Settings)
   - Logout button

4. **Dashboard** (`app/admin/dashboard/page.tsx`)
   - Stats cards: Total rooms, Available, Upcoming bookings, Current guests, Revenue (30d)
   - Recent bookings table

5. **Bookings List** (`app/admin/bookings/page.tsx`)
   - Table: Code, Guest, Room, Dates, Status, Payment, Amount
   - Filters: All, Confirmed, Checked-in, Checked-out, Cancelled
   - Link to booking detail

6. **Booking Detail** (`app/admin/bookings/[id]/page.tsx`)
   - Full booking info
   - Update status (confirmed → checked_in → checked_out)
   - Add admin notes
   - Cancel booking (with reason)

7. **Admin API routes**
   - GET /api/admin/bookings — List all
   - GET /api/admin/bookings/[id] — Get one
   - PATCH /api/admin/bookings/[id] — Update status/notes

**Success criteria:**
- Login works
- Dashboard displays correct stats
- Bookings list loads and filters
- Can view and update booking details
- Session persists across refreshes

---

## Phases 7-10: Testing, Deployment, Launch

**Owner:** Main agent (coordination)  
**Estimated time:** 8-10 hours total

### Phase 7: Testing
- Run comprehensive checklist (see Part 4)
- Cross-browser testing
- Mobile testing (real devices)
- Lighthouse audit (target >90)
- Fix any issues

### Phase 8: Deployment
- Add production env vars to Vercel
- Switch Stripe to live mode
- Deploy via Vercel
- Run migrations on production Supabase
- Seed initial room data
- Test on live URL

### Phase 9: DNS
- Point brendlehg.com to Vercel
- Verify SSL certificate
- Configure email domain (Gmail)
- Wait for propagation
- Test on custom domain

### Phase 10: Monitoring
- Set up Sentry (error tracking)
- Configure Google Analytics 4
- Set up UptimeRobot (uptime monitoring)
- Configure Stripe production webhook
- Test all integrations
- Document procedures

---

## Execution Order

1. **Phase 1** (Foundation) — Sub-agent, start now
2. **Phase 2** (Public Pages) — Sub-agent (Opus), after Phase 1
3. **Phase 3** (Booking Core) — Sub-agent, after Phase 2
4. **Phase 4** (Payments) — Sub-agent, after Phase 3
5. **Phase 5** (Email) — Sub-agent, can run parallel with Phase 6
6. **Phase 6** (Admin) — Sub-agent, can run parallel with Phase 5
7. **Integration** — Main agent, integrate all pieces
8. **Testing** — Main agent, comprehensive QA
9. **Deployment** — Main agent, push to production
10. **Launch** — Main agent, final checks and go-live

**Estimated total:** 50-65 hours (with parallel work on Phases 5-6, can compress timeline)

---

## Next Step

**Action:** Spawn sub-agent for Phase 1 (Foundation)  
**Model:** Sonnet (setup tasks, straightforward)  
**Task:** Initialize project, install dependencies, create base structure  
**Deliverable:** Working Next.js project, ready for Phase 2

Ready to start?
