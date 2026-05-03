# Hotel Brendle - Build Plan
**Date:** 2026-04-29 13:16 EDT  
**Updated:** 2026-04-29 19:12 EDT  
**Status:** Build guide created, starting from scratch

---

## Decision: Start From Scratch ✅

**Keeping from old site:**
- Hero video
- Color palette + style
- Adding more New Mexico turquoise

**Not porting:** Replit codebase (starting fresh)

**Build guide:** See `hotel-brendle-build-guide.md` (source of truth)

---

## Keys Status ✅

All required keys now in `.env`:
- GitHub: ✅
- Vercel: ✅  
- Stripe: ✅
- Supabase: ✅
- DigitalOcean: ✅

**Still need:**
- Resend API key (email service)

---

## Hosting Platform: Vercel ✅

**Why:**
- Fast deployment
- Auto SSL
- Zero config for Next.js
- Free tier sufficient
- Can migrate later if needed

---

## Build Phases

### Phase 1: Core Booking System (Current Focus)

**What we'll add:**
- Room availability calendar
- Booking form (name, email, phone, dates, room type)
- Stripe payment integration (deposit or full payment)
- Email confirmation (need email service - Resend or SendGrid)
- Admin dashboard to view bookings

**Database:** Use existing Supabase (udxvixjiihhtwrswahvf.supabase.co)

**Tables to create:**
```sql
-- Rooms
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE,
    room_type VARCHAR(50),
    rate_per_night DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'available'
);

-- Bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms(id),
    guest_name VARCHAR(100),
    guest_email VARCHAR(100),
    guest_phone VARCHAR(20),
    check_in DATE,
    check_out DATE,
    total_amount DECIMAL(10,2),
    payment_status VARCHAR(20),
    stripe_payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Tech stack:**
- Frontend: React (already used in Replit version)
- Backend: Next.js API routes
- Database: Supabase (Postgres)
- Payment: Stripe
- Email: Resend (free tier, simple API)

---

### Admin Panel (Phase 1)

**Pages:**
- `/admin/login` - Password protected
- `/admin/bookings` - View all bookings, filter by date/status
- `/admin/rooms` - Manage room inventory

**Auth:** Simple password (can upgrade to proper auth later)

---

### Phase 2: Investor Portal (Later)

This requires:
- Financial data from spreadsheet
- Charts/graphs
- Document library

**Defer until:** Booking system is live and working.

---

## Open Questions (Need Answers to Build)

**See `hotel-brendle-build-guide.md` section "Open Questions" for full list.**

Critical:
1. **Room inventory** - How many rooms? Types? Rates? Photos?
2. **Payment flow** - Deposit % or full payment upfront?
3. **Email service** - Resend account (need to set up?)
4. **Hero video** - Where to grab the video file from current site?
5. **Contact info** - Phone number, booking email for site?
6. **Check-in times** - Check-in 3 PM / Check-out 11 AM?

---

## Next Steps

1. **Answer open questions** (see build guide)
2. **Get hero video** from current site
3. **Set up Resend account** (if needed)
4. **Create GitHub repo** (`hotel-brendle`)
5. **Initialize Next.js project** (following build guide)
6. **Build Phase 1** (booking + admin)
7. **Deploy to Vercel**
8. **Point DNS**
9. **Go live**

---

**Reference:** `hotel-brendle-build-guide.md` is the source of truth for this build.
