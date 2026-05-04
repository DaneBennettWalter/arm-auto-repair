# Hotel Brendle Loan Package Strategy

**Date:** May 4, 2026  
**Context:** Cash-out refinance for 37-room renovation

---

## THE PROBLEM

**RV Park Template Risks:**
- 32 interconnected tabs with hundreds of formulas
- Already has errors (per Dane)
- One broken cell reference breaks entire model
- Designed for RV park development (not hotel renovation)
- Extremely time-consuming to adapt correctly
- High risk of cascading formula errors

**Reality Check:**
Trying to adapt this complex template is dangerous. We could spend days fixing broken formulas and still miss critical errors that a lender would catch immediately.

---

## PROPOSED APPROACH

### Option 1: Build Clean Hotel-Specific Model (RECOMMENDED)

**Advantages:**
- ✅ No inherited errors
- ✅ Every formula verified as we build
- ✅ Hotel-specific logic (not adapted from RV park)
- ✅ Simpler = easier to audit and defend
- ✅ We control every cell

**Process:**
1. **Use RV template as REFERENCE** (see what lenders expect)
2. **Build fresh Hotel Brendle model** with clean formulas
3. **Start simple, expand as needed** (15-20 tabs max)
4. **Validate each tab before moving to next**

**Core Tabs We Need:**

1. **Input Assumptions**
   - Property details (67 rooms, 30 online, 37 to renovate)
   - Rent rates, occupancy assumptions
   - Renovation costs per room
   - Timeline assumptions

2. **Current Performance**
   - Historical revenue (12-24 months)
   - Historical expenses
   - Current NOI
   - Current occupancy trends

3. **Renovation Budget**
   - Cost per room (materials, labor)
   - Total renovation cost (37 rooms)
   - Contingency
   - Timeline/phasing

4. **Revenue Ramp**
   - Rooms coming online over time
   - Stabilized occupancy assumptions
   - ADR by room tier
   - Monthly revenue projections (3-5 years)

5. **Operating Expenses**
   - Fixed costs (insurance, taxes, management)
   - Variable costs (utilities, maintenance, housekeeping)
   - Scaled for increasing room count
   - Monthly expense projections

6. **Debt Service**
   - Current debt (if any)
   - New loan request amount
   - Interest rate assumptions
   - Amortization schedule
   - Monthly payment calculations

7. **Cash Flow Projections**
   - Monthly revenue
   - Monthly expenses
   - Monthly debt service
   - Net cash flow
   - 36-60 month projections

8. **DSCR Analysis**
   - Debt Service Coverage Ratio by year
   - Show >1.25x coverage
   - Sensitivity analysis

9. **Property Valuation**
   - Current value (as-is)
   - Stabilized value (post-renovation)
   - Comparable properties
   - Cap rate analysis

10. **Sources & Uses**
    - Total project cost
    - Loan amount
    - Owner equity
    - Use of proceeds breakdown

11. **Executive Summary**
    - 1-page overview
    - Key metrics
    - Loan request highlights

**Timeline:** 2-3 days to build correctly

---

### Option 2: Carefully Audit Then Adapt Template

**If we must use the RV template:**

**Phase 1: AUDIT (Before any changes)**
1. Open template, check all formulas work
2. Map every tab-to-tab reference
3. Document what each tab does
4. Identify existing errors
5. Fix errors FIRST, validate model works
6. Save as "clean baseline"

**Phase 2: ADAPT (One tab at a time)**
1. Start with simplest tabs (Input Assumptions)
2. Replace RV park data with hotel data
3. Test formulas after EACH change
4. Document every modification
5. Validate dependent tabs still work
6. Never skip ahead

**Phase 3: VALIDATE**
1. Check every calculation manually
2. Verify totals match expectations
3. Test edge cases
4. Have someone else review
5. Check for #REF!, #VALUE!, #DIV/0! errors

**Timeline:** 5-7 days minimum (very high error risk)

---

## MY RECOMMENDATION

**Build a clean Hotel Brendle model from scratch.**

**Why:**
1. Faster than debugging 32 tabs of RV park formulas
2. Lower error risk
3. Hotel-specific logic, not adapted
4. Easier to explain and defend to lender
5. We understand every cell

**What to borrow from RV template:**
- Tab structure ideas
- Presentation format
- What metrics lenders expect
- Formula patterns (adapt, don't copy)

**What NOT to do:**
- Copy/paste formulas blindly
- Assume template is error-free
- Skip validation steps
- Rush to "just get it done"

---

## IMMEDIATE NEXT STEPS

**Before we build anything, I need from you:**

1. **Renovation cost estimate**
   - How much per room to renovate?
   - Total budget for 37 rooms?
   - Any contingency %?

2. **Loan amount target**
   - How much cash-out are you seeking?
   - Current debt on property (if any)?
   - Target LTV (loan-to-value)?

3. **Timeline**
   - How fast can rooms be renovated?
   - 1 room/week? 2/week?
   - When would stabilization occur?

4. **Operating assumptions**
   - What expenses increase as room count grows?
   - What expenses stay fixed?
   - Staffing needs at 67 rooms vs 30 rooms?

5. **Template preference**
   - Build clean model (my recommendation)?
   - Or attempt to adapt RV template (risky)?

---

## PROPOSED STRUCTURE (Clean Model)

**Simplified, Hotel-Specific:**

1. Cover Page
2. Executive Summary
3. Property Overview
4. Current Operations (historical)
5. Renovation Plan & Budget
6. Revenue Projections
7. Expense Projections
8. Cash Flow Pro Forma (5 years)
9. Debt Service & DSCR
10. Property Valuation
11. Sources & Uses
12. Sensitivity Analysis
13. Supporting Documentation
14. Appendix (rent roll, photos, etc.)

**~15 tabs, clean formulas, hotel-specific logic**

---

**What's your preference? Build clean or attempt to adapt the 32-tab RV model?**
