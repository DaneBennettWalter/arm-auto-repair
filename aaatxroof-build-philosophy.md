# aaatxroof.com — Build Philosophy & Refinements

**Session:** 2026-04-26 WhatsApp discussion with Dane  
**Context:** Establishing how we build the best roofing company website ever

---

## The Standard

**"It has to be the best."**

This isn't aspirational. It's the bar. If we build something, anyone who sees it should know we're serious — not just another company asking for trust.

---

## No Spaghetti Code (What This Actually Means)

**Dane's test:** Changing a heading title shouldn't require sorting through 50k lines and 38 TypeScript files.

**In practice:**
- Simple things stay simple
- Architecture shouldn't obscure obvious changes
- If finding where to edit something feels like archaeology, the structure is wrong
- Code should be obvious, not clever

**Example violations:**
- Nested component hierarchies 10 layers deep for a button
- Configuration spread across dozens of files for one feature
- "Magic" abstractions that make basic edits require understanding the whole system

---

## Delete, Don't Bolt Over

**Rule:** When we redesign or start over, DELETE the old codebase. Don't bolt new code over garbage.

**Why:**
- Clean foundation > layered compromises
- Technical debt by laziness compounds
- Half-removed old code creates confusion
- If it's a redesign, the old version goes in the trash

**When this applies:**
- Major architectural changes
- Design system overhauls
- Framework migrations
- "We should just start fresh" moments

**Discipline required:** Actually throw it away. Don't keep it "just in case" in the same repo.

---

## Professional Grade (What This Looks Like)

**Not:**
- Bootstrap templates
- WordPress shortcuts
- Generic "roofing template" with stock photos everyone's seen
- Lengthy amateur forms at the bottom
- Anything that screams "we grabbed a template and changed the logo"

**Instead:**
- Custom design system (shadcn/ui foundation, our styling)
- Intentional architecture
- Professional photography (or best-in-class stock that doesn't look stock)
- Lead capture that works like modern SaaS, not 2010 contact forms
- Fast, polished, confident

**The vibe:** Looks like it was built by a team worth trusting with a $30k roofing project.

---

## Choose the Best Foundation

**Rule:** Choose best maintained codebases (like shadcn/ui, not random npm packages with 47 stars)

**Why:**
- Active communities mean bugs get fixed
- Documentation that exists and is accurate
- Patterns that work, not experimental approaches
- Longevity — won't be abandoned in 6 months

**For this project:**
- Next.js 14+ (industry standard, well-maintained, massive community)
- shadcn/ui (active, clean, accessible, Tailwind-based)
- Vercel (deployment platform from Next.js creators)
- PostgreSQL via Supabase/Neon (proven, scalable, well-supported)

---

## Natively Agentic Where Possible

**Principle:** Build for AI-native workflows from the ground up, not bolted on later.

**For aaatxroof.com (v2):**
- AI quote assistant (understands roofing, qualifies leads, provides estimates)
- AI chat support (answers FAQs, routes urgency, schedules inspections)
- Automated follow-up (smart nurture sequences)

**Not in v1, but architected so v2 doesn't require a rewrite.**

---

## Stacked for the Finish Line

**Principle:** Choose tools and architecture that get us to production, not just prototypes.

**In practice:**
- Vercel deployment from day one (not "we'll figure out hosting later")
- Database schema designed for scale (not fake data in JSON files)
- Environment configs for dev/staging/prod from the start
- Performance targets set early (Lighthouse 95+, not "we'll optimize later")

**Anti-pattern:** "Let's just use Create React App and a JSON file for now, we'll make it real later."

---

## App Driven Models

**Principle:** Architecture follows application needs, not theoretical purity.

**For aaatxroof.com:**
- Data model: What do we need to capture leads, show projects, manage content?
- Don't over-engineer for features we don't need
- Don't under-engineer for features we know are coming (v2 AI)

**Example:**
- Lead capture: name, phone, address, project type, notes — that's it
- Projects: before/after images, location, material, testimonial — simple
- Don't build a full CRM in v1 when CSV export works

---

## Market & Positioning Clarity

**Market:** Central Texas (Austin to San Antonio corridor) — that's where the money is.

**NOT:** Corpus Christi, coastal, Robstown (that's other businesses)

**Positioning:** "Best roofers in Central Texas"
- Strong, confident, premium
- Not "we connect you with roofers"
- Not "we manage your project"
- Customer believes they're hiring the best roofing company, period.

**Business model (internal):** Lead gen feeding to subs — customer doesn't need to know this.

---

## Lead Capture Done Right

**NOT this:**
- Lengthy form at the bottom with 12 fields
- "Fill out this form and we'll get back to you in 2-3 business days"
- Generic "Contact Us" that feels like shouting into a void

**Instead:**
- Sticky header with phone number (one-tap on mobile)
- Floating CTA (Get Free Quote) always visible
- Quick form: name, phone, address (3 fields max initially)
- Multiple paths: call, text, form, chat (future)
- Immediate confirmation, clear next steps

**The feel:** Like requesting an Uber, not filling out a loan application.

---

## Content Strategy

**Current state:**
- New company, no photos, no reviews, no social presence

**Approach:**
- Use best-in-class stock photos (professional, real-looking, not obviously stock)
- Build systems that are ready for real content when it arrives
- Don't fake reviews or testimonials (system ready, content empty until real)
- SEO content (how-to guides, storm prep, insurance claims) can start immediately

**Future:**
- Replace stock with real project photos
- Add real reviews as they come in
- Agent-managed content updates (blog posts, seasonal content)

---

## Performance Targets (Non-Negotiable)

- **Lighthouse Score:** 95+ across all metrics
- **Core Web Vitals:** Green across the board
- **Time to Interactive (mobile):** <2s on 4G
- **First Contentful Paint:** <1s

**Why these matter:**
- Google ranking (SEO)
- Mobile experience (most traffic)
- Trust signal (fast = professional)
- Conversion (slow sites lose leads)

---

## Build Execution (When Unblocked)

**Phase 1:** Foundation (scaffold, design system, branding)
**Phase 2:** Core pages (homepage, services, contact, lead capture)
**Phase 3:** Content systems (CMS, projects, blog, SEO)
**Phase 4:** Polish & launch (performance, testing, go-live)
**Phase 5:** Post-launch (AI features, optimization, real content)

**Approach:**
- Parallel sub-agents where tasks are independent
- Centralized review and integration (me)
- Frequent check-ins, clear isolated tasks
- Fast but disciplined, parallel but not chaotic

---

## What I Got Wrong (Learning Points)

1. **Hallucinated timeline** — Invented "Week 1, Week 2, Week 3" that Dane never said. Direct violation of core rule.
2. **Weak positioning** — Suggested ambiguous "we handle your project" messaging instead of strong "best roofers" brand.
3. **Waiting instead of executing** — Said "executing now" then waited for more alignment instead of actually starting.

**Corrections applied:**
- Never invent specifics (timelines, numbers, details) that weren't stated
- Stop and ask when I don't know exactly
- When told to proceed/execute — DO IT, don't wait
- Strong positioning > safe/vague positioning

---

## Core Operating Principles (Reminder)

From IDENTITY.md, reinforced in this session:

- **Never lie. Never falsify. Never hallucinate.**
- If precise info isn't available → stop and ask
- Stay focused on the mission
- Build trust through competence, not eagerness
- **It has to be the best** — highest quality, professional, worth the trust we're asking for

---

**This is the foundation. Build accordingly.**
