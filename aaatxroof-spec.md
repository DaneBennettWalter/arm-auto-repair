# aaatxroof.com — Project Spec & Build Plan

**Created:** 2026-04-26  
**Status:** Ready to build (pending sub-agent scope approval)

---

## Mission
Build the best roofing company website ever. Professional, trustworthy, converts visitors to customers, dominates local search, and scales as the company grows.

---

## Market & Positioning

**Target Market:** Central Texas (Austin to San Antonio corridor) — where the money is  
**NOT:** Corpus Christi, coastal, Robstown (those are other businesses)  
**Business Model:** Lead generation company feeding vetted work to subcontractors  
**Customer-Facing Positioning:** "AAA Texas Roofing — Best roofers in Central Texas"  
**Brand Strategy:** Customer sees premium roofing company, not a lead router. Strong, confident, best-in-class. NO ambiguous "we handle your project" messaging.

---

## Current State (Pre-Build)

- **Domain:** aaatxroof.com (owned by Dane)
- **CRM:** None yet — CSV/Google Sheet or built into backend
- **Content:** No photos (use best-in-class stock until real projects available)
- **Reviews:** None yet (build system for future collection)
- **Branding:** Need new logo + color palette (AI-generated, Option A approach)
- **Team:** Company heads feeding to subs (not featured on site)
- **AI Features:** Save for v2

---

## Core Principles

**Trust First**
- Roofing = high-ticket, high-trust purchase
- Every element builds credibility
- No gimmicks, no stock photos that look fake, no generic content

**Mobile-First**
- Most roofing searches happen on mobile (often during/after storms)
- Fast loading even on weak networks
- One-tap calling

**Conversion Optimized**
- Clear CTAs throughout
- Multiple contact paths (call, text, quote form)
- Friction-free lead capture

**SEO Dominant**
- Local SEO (Austin, San Antonio, Central Texas corridor)
- Schema markup for reviews, local business, services
- Content strategy for long-tail roof queries

---

## Technical Stack

**Framework:** Next.js 14+ (App Router)
- Server components for speed
- Static generation where possible
- Edge runtime for API routes

**UI:** shadcn/ui + Tailwind CSS
- Professional, consistent design system
- Accessible components
- Easy to maintain and extend

**CMS:** Headless (Sanity or Payload CMS)
- Easy content updates without touching code
- Version control for content
- Image optimization built-in

**Hosting:** Vercel
- Edge network, fast globally
- Automatic deployments
- Built-in analytics

**Database:** PostgreSQL (Supabase or Neon)
- Store leads, quotes, project data
- Real-time capabilities if needed

**Forms/Leads:** Custom API + CSV export (or CRM integration later)
- No third-party form builders
- Spam protection (Turnstile or similar)

---

## Site Architecture

### Pages

**Homepage**
- Hero: "We protect Central Texas homes" + CTA (Call Now, Get Quote)
- Trust signals (years in business, projects completed, insurance partnerships)
- Services overview (residential, commercial, storm damage, insurance claims)
- Recent projects (before/after, when available)
- Reviews section (ready for future content)
- Coverage area map (Austin-San Antonio corridor)
- Emergency contact section

**Services Pages** (individual pages)
- Residential Roofing
- Commercial Roofing
- Storm Damage Repair
- Roof Inspections
- Insurance Claims Assistance
- Maintenance & Repairs

**Projects/Portfolio**
- Before/after galleries (stock until real projects available)
- Filter by project type, location, material
- Case studies for major projects

**About**
- Company story (Texas roots, Central Texas focus, quality commitment)
- Certifications, partnerships, insurance
- Why choose us

**Contact**
- Phone, text, email
- Service area map
- Hours

**Resources/Blog**
- "How to file a roof insurance claim in Texas"
- "Signs you need a new roof"
- "Choosing the right roofing material for Central Texas"
- Storm preparation guides
- SEO content

---

## Key Features

### Lead Capture (Professional Grade)
**NOT** a lengthy form at the bottom of the page.

**Instead:**
- Sticky header with phone number (one-tap call on mobile)
- Floating CTA button (Get Free Quote)
- Quick quote form (max 3 fields initially: name, phone, address)
- Future: AI chat assistant (v2)

### Reviews & Social Proof
- System ready for Google Reviews integration
- Star ratings display
- Video testimonials (when available)
- Filter by project type

### Emergency Response
- Prominent "Emergency? Call Now" section
- 24/7 availability messaging
- Storm damage fast-track

### Before/After Gallery
- High-quality professional photos (stock initially)
- Lightbox viewing
- Filter by project type, location, material
- Lazy loading for performance

### Service Area Map
- Interactive map showing coverage (Austin to San Antonio corridor)
- "Not sure if we serve your area? Check here."

### SEO Content Hub
- Blog for educational content
- Local landing pages (if targeting multiple cities)
- FAQ schema markup

---

## Design Standards

**Visual Identity**
- Professional, clean, modern
- Texas-appropriate (no generic stock imagery)
- Real-looking stock photos until real projects available
- Consistent typography (1-2 fonts max)
- Color palette: Trustworthy, strong (to be determined with logo)

**Photography**
- High-resolution, professional stock
- Before/after comparisons
- Future: Drone shots of completed roofs, real projects, real team

**Copywriting**
- Direct, confident, no fluff
- Speak to Central Texas homeowners and businesses
- Address pain points (storm damage, insurance hassles, quality concerns)
- Proof over promises

---

## Performance Targets

- **Lighthouse Score:** 95+ across all metrics
- **Core Web Vitals:** Green across the board
- **Time to Interactive (mobile):** <2s on 4G
- **First Contentful Paint:** <1s

---

## Analytics & Conversion Tracking

- Google Analytics 4
- Call tracking (track phone calls from website)
- Form submissions
- Heatmaps (optional, Hotjar or similar)
- A/B testing capability (if needed)

---

## Integrations

**CRM:** CSV export initially, direct integration later
**Google My Business:** Ready for future auto-sync reviews, updates
**Email:** Transactional emails (quote confirmations, follow-ups)
**SMS:** Optional text confirmations, updates
**Scheduling:** Optional online booking for inspections (v2)

---

## Content Strategy

**Phase 1 (Launch):**
- Core pages (Home, Services, About, Contact)
- Stock project showcases
- Initial blog posts (3-5 high-value articles)

**Phase 2 (Post-Launch):**
- Weekly blog posts (SEO-focused)
- Replace stock with real project photos
- Case studies for major commercial projects

**Ongoing:**
- Fresh reviews (when available)
- Seasonal content (storm prep, maintenance)
- Local news tie-ins (community involvement, Central Texas projects)

---

## Build Plan

### Phase 1: Foundation
**Goal:** Solid architecture, design system, core scaffold

**Tasks:**
- Next.js 14 setup (App Router, TypeScript, Tailwind, shadcn/ui)
- Design system foundations (colors, typography, components)
- Basic site structure (routing, layout)
- Database schema (leads, projects, content)

**Sub-Agents:**
- Sub-agent 1: Next.js scaffold, core config, Vercel deployment
- Sub-agent 2: Logo + brand palette generation (AI)
- Sub-agent 3: Design system (shadcn/ui integration, custom components)

**Deliverable:** Clean codebase, design system, branding ready to build pages

---

### Phase 2: Core Pages
**Goal:** Homepage, Services, Contact — functional and beautiful

**Tasks:**
- Homepage (hero, trust signals, services overview, CTA, reviews placeholder)
- Services pages (templates, content structure)
- Contact page (map, multi-channel contact options)
- Lead capture system (form, API routes, CSV export)

**Sub-Agents:**
- Sub-agent 1: Homepage build
- Sub-agent 2: Services pages + templates
- Sub-agent 3: Contact page + lead capture backend
- Main agent (Roan): Content strategy, copy review, integration

**Deliverable:** Fully functional core site, ready to capture leads

---

### Phase 3: Content & Integrations
**Goal:** CMS, projects/portfolio, SEO foundation

**Tasks:**
- CMS setup (Sanity or Payload) + content models
- Projects/portfolio section (stock gallery)
- Reviews system (ready for future Google Reviews integration)
- Blog structure + initial SEO content (3-5 articles)
- Service area map (Austin-San Antonio corridor)

**Sub-Agents:**
- Sub-agent 1: CMS setup + content models
- Sub-agent 2: Projects/portfolio build
- Sub-agent 3: SEO content creation + blog setup
- Main agent: Content direction, copy editing

**Deliverable:** Full-featured site with dynamic content capability

---

### Phase 4: Polish & Launch
**Goal:** Performance, SEO, testing, go live

**Tasks:**
- Performance optimization (Lighthouse 95+, Core Web Vitals)
- SEO (schema markup, meta tags, sitemap, local SEO)
- Mobile testing (real devices)
- Cross-browser testing
- Analytics setup (GA4, call tracking)
- Final content review
- Launch

**Sub-Agents:**
- Sub-agent 1: Performance + SEO technical
- Sub-agent 2: Testing + QA
- Main agent: Final review, launch coordination

**Deliverable:** Live, professional, high-performance site

---

### Phase 5: Post-Launch (Ongoing)
**Goal:** AI features, content expansion, optimization

**Tasks:**
- AI quote assistant (natively agentic)
- AI chat support
- Additional blog content
- Replace stock photos with real projects
- A/B testing
- Conversion rate optimization

---

## What This Is NOT

- Not a WordPress template
- Not a Bootstrap theme
- Not a generic "roofing template" with stock photos
- Not a cluttered form-heavy design
- Not slow
- Not hard to update
- Not 50k lines of spaghetti code across 38 TypeScript files

---

## Design & Development Principles (Non-Negotiable)

- **No spaghetti code** — Simple things stay simple
- **App driven models** — Architecture follows application needs
- **Natively agentic where possible** — AI-native workflows from ground up
- **Stacked for the finish line** — Tools that get to production, not just prototypes
- **Able to scale** — Design for growth from day one
- **Professional grade** — No WordPress, no lame shortcuts
- **Choose best maintained codebases** — Like shadcn/ui
- **When redesigning: DELETE the old codebase** — No bolting new over garbage
- **It has to be the best** — Worth the trust we're asking for

---

## Current Blocker

**Sub-agent scope approval pending.**  
- Request ID: bb73574d-9f13-4574-babd-b9cdd53d72f1
- Need to approve via http://127.0.0.1:18789/ gateway dashboard
- Once approved, can proceed with parallel sub-agent execution

---

## Next Steps (When Unblocked)

1. Approve sub-agent scope request
2. Launch Phase 1 sub-agents (scaffold, branding, design system)
3. Review branding options
4. Finalize design system with chosen brand palette
5. Proceed to Phase 2 (core pages)
6. Launch when ready

---

**Timeline:** As fast as quality allows. No hallucinated deadlines.
