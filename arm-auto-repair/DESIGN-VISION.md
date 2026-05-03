# ARM Auto Repair - Design Vision

## The Goal: Bold, Unique, Memorable

**NOT this:**
- Generic Bootstrap template
- Stock photos of mechanics
- Blue gradient headers
- Generic "trust us" copy
- Cookie-cutter service grid

**Instead:**
- Vintage Americana meets modern brutalism
- Bold typography that demands attention
- Real texture, real character
- Layouts that break the grid when it matters
- Photography that shows the actual shop (we'll need to take these)

---

## Visual References & Inspiration

**Vintage Americana + Modern Web:**
- Large, confident type
- Distressed textures from the logo carried through
- Red/blue/cream palette used aggressively, not timidly
- Circular badge motifs as design elements
- Think: vintage gas station signage meets contemporary web design

**Layout Inspiration:**
- Asymmetric hero sections
- Overlapping elements
- Text that breaks out of containers
- Photos with bold geometric crops
- Sections with texture backgrounds (subtle grain, paper texture)

**Typography:**
- Mix of ultra-bold display type and clean body copy
- All-caps headings for impact (sparingly)
- Generous white space
- Text as a design element, not just content

---

## Unique Design Elements

### Hero Section
**NOT:** Centered logo, centered text, generic background
**INSTEAD:**
- Full-bleed photo of the actual shop or a vehicle being worked on
- Logo badge positioned off-center (large, maybe 200px+)
- Headline overlapping the logo slightly
- Phone CTA as a bold red button, large, unmissable
- Diagonal color blocks or asymmetric layout

### Services Section
**NOT:** 3-column grid of icons + text
**INSTEAD:**
- Large, bold service names (48-72px)
- Each service gets real estate
- Alternating layouts (left/right, full-width)
- Photos of actual work (engine bays, brake jobs, diagnostic equipment)
- Expand/collapse details or dedicated services page with depth

### Trust/Certification Section
**NOT:** Small badges in footer
**INSTEAD:**
- ASE certification badges LARGE and proud
- "What ASE Means" education section
- Photos of certifications on wall
- Maybe technician photos (if available)
- This builds real trust, not just logo spam

### Location Section
**NOT:** Embedded Google Map in iframe
**INSTEAD:**
- Custom-styled map (Mapbox or similar)
- OR: Bold map graphic with location pin
- Service area callout: "Serving Corpus Christi, Robstown, Portland, and the entire Coastal Bend"
- Address in large, readable type
- Hours in a bold, designed block

---

## Photography Strategy

**We need real photos:**
- Shop exterior (601 E Main St)
- Shop interior (clean, organized bays)
- Work in progress (close-ups of hands, tools, parts)
- Before/after if available
- Team photo (if comfortable)

**If we don't have photos yet:**
- Phase 1: Launch with minimal stock photos (very carefully chosen)
- Phase 2: Replace with real photography ASAP
- NEVER use cheesy stock "mechanic holding wrench smiling at camera"

**Photo treatment:**
- High contrast
- Maybe slight grain/texture overlay for vintage feel
- Bold crops (close-ups, not wide shots)
- Black and white with color accents (red/blue from brand)

---

## Color Usage - Bold, Not Boring

**ARM Red (#C8102E):**
- Primary CTAs (phone button)
- Accent headlines
- Hover states
- Border accents
- NOT backgrounds (too aggressive)

**ARM Blue (#1E3A5F):**
- Section backgrounds
- Large text blocks
- Navigation
- Footer
- Pairs with cream/white text

**Cream (#F4EDE4):**
- Background alternates
- Text on dark sections
- Vintage paper texture overlays

**Dark Navy (#0D1B2A):**
- Body text
- Dark sections
- Contrast backgrounds

**Usage Pattern:**
- Alternate section backgrounds: White → Blue → Cream → White → Blue
- Red only for CTAs and accents
- High contrast throughout

---

## Typography System - Make It Sing

**Display Font (Headings):**
- Consider: Bebas Neue, Oswald, Anton, or similar ultra-bold condensed
- Or custom web font: Druk, Obviously, GT America
- All-caps for main headings
- 48-96px for H1
- Letter-spacing: tight (-0.02em to -0.05em)

**Body Font:**
- Inter, Work Sans, or system fonts
- 16-18px base
- 1.6-1.8 line-height
- NOT the same as headings (contrast is key)

**Example Heading:**
```
ASE CERTIFIED
AUTO REPAIR
IN ROBSTOWN
```
- 72px, Bebas Neue, all-caps, tight tracking
- White on blue background
- Maybe slight distressed texture

---

## Interaction & Motion

**Subtle, purposeful:**
- Smooth scroll (not jumpy)
- Hover states on buttons (lift effect, color shift)
- Lazy-load images with fade-in
- Parallax on hero image (subtle)
- Mobile menu slide-in
- NO: Excessive animations, spinners, auto-carousels

**Performance:**
- Fast load (under 2 seconds)
- Optimized images (WebP)
- Minimal JS
- Smooth on mobile

---

## Mobile Design - Priority #1

**Most customers will see mobile first:**
- Sticky phone button (bottom of screen, always visible)
- Tap-to-call with single tap
- Large tap targets (minimum 44px)
- Readable text (minimum 16px)
- Simplified nav (hamburger menu)
- Fast scroll, no jank

**Desktop enhancements:**
- Larger photography
- More complex layouts
- Hover effects
- But mobile is the baseline, desktop is enhancement

---

## Page Structure - Multi-Page Site

### 1. Home (`index.html`)
- Hero: Bold intro, logo, phone CTA
- Services overview: 6-8 key services with links to full page
- Why ARM: ASE certification, experience, local
- Service area: Coastal Bend map/list
- Location: Address, hours, contact
- Footer: Full contact info

### 2. Services (`services.html`)
**EXTENSIVE - Each service gets detail:**

**Engine Services:**
- Engine Diagnostics
- Engine Repair (Gas)
- Engine Repair (Diesel)
- Engine Rebuilds
- Timing Belt/Chain Replacement
- Head Gasket Repair

**Brake Services:**
- Brake Inspection
- Brake Pad Replacement
- Rotor Resurfacing/Replacement
- Brake Fluid Flush
- ABS Diagnostics
- Emergency Brake Repair

**Maintenance:**
- Oil Change (Conventional/Synthetic)
- Filter Replacement (Air, Fuel, Cabin)
- Fluid Services (Transmission, Coolant, Power Steering)
- Tune-Ups
- Belt Replacement
- Battery Service

**Electrical:**
- Electrical Diagnostics
- Alternator Replacement
- Starter Replacement
- Wiring Repair
- Lighting Repair
- Computer Diagnostics

**Transmission:**
- Transmission Diagnostics
- Transmission Repair
- Transmission Rebuild
- Clutch Replacement
- Differential Service

**Suspension & Steering:**
- Alignment
- Shocks/Struts
- Ball Joints
- Tie Rods
- Power Steering Repair

**Heating & Cooling:**
- A/C Diagnostics & Repair
- A/C Recharge
- Radiator Repair
- Cooling System Flush
- Heater Repair

**Specialty:**
- Diesel Repair (ASE Certified)
- Check Engine Light Diagnostics
- Pre-Purchase Inspections
- Fleet Services

Each service should have:
- Brief description (2-3 sentences)
- Why it matters
- Signs you need this service

### 3. Service Area (`service-area.html` or section on home)
**Coastal Bend SEO:**

"Proudly serving Robstown and the entire Coastal Bend region:"

**Primary Cities:**
- Corpus Christi
- Robstown
- Portland
- Ingleside
- Aransas Pass

**Also Serving:**
- Port Aransas
- Rockport
- Fulton
- Kingsville
- Alice
- Sinton
- Odem
- Bishop
- Driscoll
- Gregory
- Taft
- Mathis
- Calallen
- Flour Bluff

Map showing service radius (25-30 mile radius from Robstown)

### 4. About (Optional for v1)
- Shop history
- ASE certification details
- Why choose us
- Team (if photos available)

### 5. Contact (`contact.html` or section on home)
- Phone (large, tap-to-call)
- Address with map
- Hours
- Simple contact form (Formspree)

---

## SEO Strategy - Coastal Bend Domination

**Title Tags:**
- Home: "ARM Auto Repair | ASE Certified Mechanic in Robstown & Corpus Christi, TX"
- Services: "Auto Repair Services | ASE Certified Gas & Diesel | Corpus Christi Area"
- Service Area: "Serving Robstown, Corpus Christi, Portland & Coastal Bend | ARM Auto Repair"

**Meta Descriptions:**
- Home: "ASE certified auto repair for gas and diesel vehicles. Serving Robstown, Corpus Christi, Portland, and the entire Coastal Bend region. Call (361) 220-1629."
- Services: "Complete auto repair services including engine repair, brakes, diagnostics, and more. ASE certified for gas and diesel. Serving the Coastal Bend."

**On-Page SEO:**
- H1: "ASE Certified Auto Repair in Robstown, Texas"
- H2s: "Serving Corpus Christi and the Coastal Bend"
- City names naturally in content
- Schema.org LocalBusiness markup
- Service area schema
- Address/phone in footer (NAP consistency)

**Local Keywords:**
- "auto repair Robstown TX"
- "mechanic Corpus Christi"
- "diesel repair Coastal Bend"
- "ASE certified mechanic Robstown"
- "car repair near Corpus Christi"
- "brake service Portland TX"
- Each city + "auto repair"

**Content Strategy:**
- Dedicated service area page or section
- Blog (future): "Common Car Problems in Coastal Bend Heat" etc.
- Google Business Profile optimization (critical)

---

## Tech Stack - Simple But Modern

**Core:**
- HTML5 (semantic markup)
- CSS3 (custom properties, grid, flexbox)
- Vanilla JS (minimal, for mobile menu and interactions)

**Styling Approach:**
- Custom CSS (not a framework)
- CSS Grid for layouts
- CSS custom properties for theming
- Mobile-first responsive
- NO Bootstrap, NO Tailwind for this (custom = unique)

**Fonts:**
- Google Fonts or self-hosted
- WOFF2 format, optimized loading

**Images:**
- WebP with JPG fallback
- Lazy loading
- Optimized sizes

**Forms:**
- Formspree (free tier: 50 submissions/month)
- Or simple mailto: fallback

**Hosting:**
- DigitalOcean App Platform (static site)
- Or Namecheap shared hosting
- Single service, simple deployment

**Domain:**
- armautotx.com (already purchased)
- SSL via Let's Encrypt (automatic)

**Analytics:**
- Google Analytics (track phone clicks, form submissions)
- Or Plausible (privacy-focused)

---

## Build Timeline

**Phase 1: Design & Build (8-10 hours)**
- Create HTML structure (home, services)
- Write custom CSS
- Implement responsive layouts
- Add minimal JS for interactions
- Optimize logo and placeholder images
- SEO setup (meta tags, schema)

**Phase 2: Content (4-6 hours)**
- Write service descriptions
- Write homepage copy
- Service area content
- About section (if included)

**Phase 3: Deploy (2 hours)**
- Set up hosting (DigitalOcean or Namecheap)
- Configure DNS (armautotx.com)
- SSL setup
- Test on devices
- Performance optimization

**Phase 4: Launch (1 hour)**
- Google Business Profile
- Submit to search engines
- Analytics setup

**Phase 5: Photography (future)**
- Schedule shop photoshoot
- Replace placeholder images
- Continuous improvement

**Total: ~15-20 hours to launch**

Still simple tech, but EXECUTED WELL.

---

**Last Updated:** 2026-05-03
**Status:** Design vision complete, ready to build
