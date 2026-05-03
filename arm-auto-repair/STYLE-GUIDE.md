# ARM Auto Repair - Style & Build Guide

## Brand Overview

ARM Auto Repair and Mechanical is a professional ASE-certified auto repair shop in Robstown, Texas. The brand embodies Texas pride, American craftsmanship, and professional automotive expertise.

## Design Philosophy

**Core Values:**
- **Professional Excellence** - ASE certified, serious expertise
- **Texas Pride** - Local, community-focused, Texan identity
- **American Heritage** - Vintage Americana aesthetic, trusted tradition
- **Honest Work** - Straightforward, no-nonsense service

**Visual Direction:**
- Vintage Americana with modern functionality
- Clean, bold, high-contrast
- Mobile-first (customers searching for repair on their phones)
- Fast-loading, professional, trustworthy

---

## Color Palette

### Primary Colors

**ARM Red**
- Hex: `#C8102E` (approximated from logo)
- Use: Primary CTAs, headers, accents
- Emotion: Confidence, energy, action

**ARM Blue**
- Hex: `#1E3A5F` (approximated from logo)
- Use: Navigation, text headers, backgrounds
- Emotion: Trust, professionalism, stability

**Cream/Off-White**
- Hex: `#F4EDE4`
- Use: Backgrounds, contrast areas, text on dark
- Emotion: Vintage warmth, approachability

### Secondary Colors

**Dark Navy (text)**
- Hex: `#0D1B2A`
- Use: Body text, dark backgrounds

**Light Gray**
- Hex: `#F8F9FA`
- Use: Section backgrounds, subtle dividers

**Success Green** (for trust badges, certifications)
- Hex: `#2D5016`
- Use: ASE certification badges, success states

---

## Typography

### Headings

**Primary Font:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif

**H1:** 
- 48px / 3rem (desktop), 36px / 2.25rem (mobile)
- Font weight: 800 (Extra Bold)
- Letter spacing: -0.02em
- Text transform: uppercase (sparingly, for impact)

**H2:**
- 36px / 2.25rem (desktop), 28px / 1.75rem (mobile)
- Font weight: 700 (Bold)

**H3:**
- 24px / 1.5rem
- Font weight: 600 (Semi-Bold)

### Body Text

**Body Copy:**
- 16px / 1rem (base)
- Font weight: 400 (Regular)
- Line height: 1.6
- Color: `#0D1B2A`

**Large Body:**
- 18px / 1.125rem
- Use for intro paragraphs, key service descriptions

**Small Text:**
- 14px / 0.875rem
- Use for captions, disclaimers, footer text

---

## Logo Usage

### Primary Logo
- The circular badge logo (as provided)
- Minimum size: 80px diameter (digital), 1" diameter (print)
- Clear space: Minimum 20px around logo on all sides

### Logo Variations Needed
- Full color (primary)
- White on transparent (for dark backgrounds)
- Navy on transparent (for light backgrounds)
- Simplified/icon version (just "ARM" with gear for favicons, app icons)

### Don'ts
- Don't stretch or distort
- Don't change colors outside brand palette
- Don't add effects (shadows, glows, etc.) unless part of design system
- Don't place on busy backgrounds without ensuring contrast

---

## Components & UI Elements

### Buttons

**Primary Button (CTA)**
```
Background: ARM Red (#C8102E)
Text: White
Padding: 14px 28px
Border radius: 4px
Font weight: 600
Text transform: uppercase
Letter spacing: 0.05em

Hover state: Darken 10%
```

**Secondary Button**
```
Background: Transparent
Border: 2px solid ARM Blue
Text: ARM Blue
Padding: 12px 26px (to account for border)
Border radius: 4px
Font weight: 600

Hover state: Background ARM Blue, Text White
```

**Phone CTA Button** (mobile-priority)
```
Background: ARM Red
Icon: Phone icon (left)
Text: "Call (361) 220-1629"
Full width on mobile
Sticky to bottom on mobile (for easy thumb access)
```

### Cards

**Service Cards**
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Padding: 24px
- Box shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Lift effect (translateY -2px, shadow increase)

**Certification Badges**
- ASE logo + text
- Circular or square format
- Border: 2px solid Success Green
- Small size: 60px
- Medium size: 100px

### Forms

**Input Fields**
```
Border: 1px solid #D1D5DB
Border radius: 4px
Padding: 12px 16px
Font size: 16px (to prevent zoom on iOS)
Focus state: Border ARM Blue, subtle shadow
```

### Icons

**Style:** Outline/line icons (not solid)
**Stroke width:** 2px
**Size:** 24px standard, 32px for feature icons
**Color:** Inherit from context (ARM Blue for primary, Dark Navy for secondary)

**Key Icons Needed:**
- Wrench/tools
- Gear/cog
- Car
- Check/checkmark (for certifications)
- Phone
- Location pin
- Clock (hours)
- Calendar (appointments)

---

## Page Sections

### Hero Section
- Full-width background (could be shop photo or textured background)
- Overlay: Dark overlay 60% opacity if using photo
- Content: Centered or left-aligned
  - Logo or H1: "ARM Auto Repair"
  - Tagline: "ASE Certified Auto Repair in Robstown, Texas"
  - Primary CTA: "Call (361) 220-1629"
  - Secondary CTA: "Our Services" (scroll to services)
- Height: 60vh minimum (mobile), 70vh (desktop)

### Services Section
- Grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Each service: Icon + Title + Short description
- Key services to feature:
  - Engine Repair (Gas & Diesel)
  - Diagnostics
  - Brake Service
  - Oil Changes & Maintenance
  - Transmission Service
  - Electrical Systems

### Trust/Certification Section
- Background: Light Gray or Cream
- ASE certification badges prominently displayed
- "ASE Certified for Gas and Diesel" headline
- Brief about what ASE means (builds trust)

### Location/Contact Section
- Google Map embed (601 E Main St, Robstown, TX)
- Address block
- Phone number (clickable on mobile)
- Business hours (when available)

### Footer
- ARM logo (smaller, white version on dark background)
- Address
- Phone
- Business hours
- Copyright
- Optional: Social links (if applicable)

---

## Content Voice & Tone

**Voice Characteristics:**
- Straightforward, no BS
- Confident but not arrogant
- Texan-friendly
- Professional without being corporate
- Educational when needed

**Example Headlines:**
- "Honest Auto Repair in Robstown"
- "ASE Certified. Texas Trusted."
- "Your Vehicle. Our Expertise."

**Example Body Copy:**
- "We're ASE certified technicians right here in Robstown, Texas. Whether you drive gas or diesel, we've got the expertise to keep your vehicle running right. No upsells, no runaround—just professional service you can count on."

---

## Technical Stack Recommendation

**Framework:** Next.js 15+ (App Router)
- Fast, SEO-friendly
- Built-in image optimization
- Easy deployment to Vercel

**Styling:** Tailwind CSS
- Rapid development
- Consistent design system
- Mobile-first approach

**Component Library:** shadcn/ui
- Professional components
- Accessible
- Customizable

**Forms:** React Hook Form + Zod validation
- Clean, performant
- Good UX

**CMS (if needed):** Sanity or Contentful
- For service updates, hours, announcements
- Optional for v1, can add later

**Deployment:** Vercel
- Automatic deployments from GitHub
- Great performance
- Easy DNS setup for ARMAUTOTX.com

**Analytics:** Plausible or Google Analytics
- Track phone clicks, form submissions
- Understand customer behavior

---

## Mobile-First Priorities

**Critical Mobile Features:**
1. **Tap-to-call button** - Prominent, easy to hit
2. **Address with map link** - Open in Google/Apple Maps
3. **Fast load time** - Customers often searching on the go
4. **Readable text** - No pinch-to-zoom needed
5. **Simple navigation** - Max 5 items in mobile menu

**Performance Targets:**
- Lighthouse score: 90+ on all metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

---

## Page Structure (v1)

### Essential Pages

1. **Home** (`/`)
   - Hero
   - Services overview
   - Certifications/trust
   - Location/contact

2. **Services** (`/services`)
   - Detailed service listings
   - Could be combined with home for v1

3. **Contact** (`/contact`)
   - Could be combined with home for v1
   - Map, phone, address, hours

### Future Pages (v2+)

- **About** - Team, history, why choose us
- **Reviews/Testimonials** - Social proof
- **Blog** - Auto maintenance tips (SEO)
- **Appointment Booking** - Online scheduling integration

---

## SEO Strategy

**Primary Keywords:**
- "Auto repair Robstown TX"
- "ASE certified mechanic Robstown"
- "Diesel repair Robstown"
- "Car repair near me" (location-based)

**Local SEO:**
- Google Business Profile (critical)
- Consistent NAP (Name, Address, Phone) across web
- Schema markup for LocalBusiness
- Embed Google reviews if available

**Meta Tags:**
```html
<title>ARM Auto Repair | ASE Certified Mechanic in Robstown, TX</title>
<meta name="description" content="ASE certified auto repair for gas and diesel vehicles in Robstown, Texas. Professional service you can trust at 601 E Main St. Call (361) 220-1629">
```

---

## Next Steps

### Phase 1: Foundation
- [ ] Set up Next.js project with Tailwind + shadcn/ui
- [ ] Configure logo variations (full color, white, navy, icon)
- [ ] Build design system in Tailwind config
- [ ] Create reusable components (Button, Card, etc.)

### Phase 2: Pages
- [ ] Home page with all sections
- [ ] Mobile-responsive layout
- [ ] Phone CTA with click tracking

### Phase 3: Polish
- [ ] Image optimization
- [ ] Performance tuning
- [ ] SEO metadata
- [ ] Schema markup

### Phase 4: Deploy
- [ ] Connect ARMAUTOTX.com to Vercel
- [ ] Configure DNS via Namecheap
- [ ] SSL certificate (automatic via Vercel)
- [ ] Test on real devices

### Phase 5: Launch
- [ ] Set up Google Business Profile
- [ ] Submit to search engines
- [ ] Analytics setup
- [ ] Monitor and iterate

---

**Last Updated:** 2026-05-03
**Status:** Style guide complete, ready for development
