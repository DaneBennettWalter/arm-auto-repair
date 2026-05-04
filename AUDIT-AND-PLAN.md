# Hotel Brendle Loan Application - AUDIT & PLAN

**Date:** May 4, 2026  
**Status:** Values not calculating - CIRCULAR REFERENCE found

---

## AUDIT FINDINGS

### CRITICAL ISSUE: Circular Reference

**The problem:**
1. **Laundry Revenue tab** needs "Occupied Rooms" → links to 10-Year Monthly Projections (Rooms × Occupancy %)
2. **10-Year Monthly Projections** needs "Laundry Revenue" → links to Laundry Revenue tab
3. **Excel cannot calculate this loop** → all values show as None/blank

**Why this happened:**
- Laundry Revenue was built as separate tab to show detail
- But it needs data FROM the main projections
- And main projections need data FROM laundry
- Classic circular reference

### OTHER FINDINGS

**Formula structure is correct:**
- ✓ All formulas are properly written
- ✓ Column structure is correct
- ✓ No broken references
- ✓ Logic is sound

**Problem is architectural:**
- ❌ Values don't calculate because of circular dependency
- ❌ Executive Summary shows blanks (depends on Annual Summary)
- ❌ Annual Summary shows blanks (depends on Monthly Projections)
- ❌ Monthly Projections shows blanks (depends on Laundry Revenue)
- ❌ Laundry Revenue shows blanks (depends on Monthly Projections)

---

## SOLUTION OPTIONS

### Option 1: Eliminate Laundry Revenue Tab (FASTEST)
**Remove the circular reference by calculating laundry directly in 10-Year Monthly Projections**

**Changes:**
- Delete Laundry Revenue tab
- Add laundry calculation columns directly in 10-Year Monthly Projections
- Columns would be: Room Rev | Occupied | Laundry Loads | Laundry Rev | Total Rev | Op Exp | NOI | Debt | CF | DSCR

**Pros:**
- Breaks circular reference immediately
- All calculations in one place
- Simpler structure

**Cons:**
- Loses detailed laundry breakdown
- Less institutional-looking (fewer tabs)

### Option 2: Calculate Occupied Rooms in Laundry Tab (RECOMMENDED)
**Break the circular reference by duplicating the occupancy calculation**

**Changes:**
- Keep Laundry Revenue tab
- Instead of linking to Monthly Projections for occupied rooms, calculate it directly:
  - Add columns for: Month | Rooms Available | Occupancy % | Occupied Rooms
  - Use same logic as Monthly Projections (ramp up during reno, stabilize at 80%)
  - Calculate laundry from these local values
- Monthly Projections continues to link to Laundry Revenue for revenue only

**Pros:**
- Maintains detailed laundry tab
- Professional presentation with separate revenue streams
- Shows detail to lender

**Cons:**
- Duplicates occupancy logic (must match exactly)
- More complex to maintain

### Option 3: Hybrid - Summary Tab for All Revenue Streams
**Create a master "Revenue Detail" tab that feeds into Monthly Projections**

**Structure:**
- New tab: "Revenue Detail" with 120 months
  - Calculate rooms, occupancy, occupied rooms
  - Calculate room revenue
  - Calculate laundry revenue
  - Calculate any other revenue
- Monthly Projections links to Revenue Detail for all revenue
- Eliminates circular reference

**Pros:**
- Clean separation of concerns
- All revenue calculations in one place
- Easy to add more revenue streams later

**Cons:**
- Adds another tab
- Monthly Projections becomes more of a summary

---

## RECOMMENDED PLAN

**Phase 1: Fix Circular Reference (Option 2)**

1. **Modify Laundry Revenue tab:**
   - Add columns A-D: Year | Month | Rooms Available | Occupancy % | Occupied Rooms
   - Calculate occupancy using same logic as Monthly Projections
   - Use local Occupied Rooms for laundry calculations (no external links)

2. **Keep Monthly Projections as-is:**
   - Continue linking to Laundry Revenue for laundry revenue
   - One-way dependency (Projections → Laundry) only

3. **Test calculations:**
   - Verify all values populate
   - Check DSCR calculations
   - Verify Executive Summary links work

**Phase 2: Add Missing Detail Tabs**

After fixing circular reference, add:

4. **Historical Rent Roll tab:**
   - April 2026 actual rent roll
   - 18 occupied rooms with names
   - Shows current baseline

5. **Room Revenue Detail tab:**
   - 120 months of room-by-room breakdown
   - Occupancy assumptions by phase
   - Supports room revenue calculations

6. **Renovation Schedule tab:**
   - Week-by-week timeline
   - Rooms coming online each week
   - Supports 6-month renovation timeline

7. **Sensitivity Analysis tab:**
   - Different occupancy scenarios
   - Different rent scenarios
   - Shows DSCR under various conditions

---

## PROPOSED TAB STRUCTURE (Final)

**Core Financial (9 tabs):**
1. Executive Summary
2. Current Operations (April 2026 baseline)
3. Historical Rent Roll (April 2026 actual)
4. Renovation Budget Detail (line items)
5. Renovation Schedule (6-month timeline)
6. Room Revenue Detail (120 months)
7. Laundry Revenue (120 months) ← FIX FIRST
8. 10-Year Monthly Projections (master cash flow) ← FIX FIRST
9. Annual Summary

**Supporting (6 tabs):**
10. Debt Service Schedule
11. Sources & Uses
12. Property Valuation
13. Sensitivity Analysis
14. Assumptions & Notes
15. Supporting Documents (links/references)

**Total: 15 tabs** (institutional-grade, comprehensive)

---

## IMMEDIATE ACTION PLAN

**Step 1: Fix Circular Reference (30 min)**
- Modify Laundry Revenue tab to calculate occupied rooms locally
- Test all values calculate correctly
- Verify DSCR shows reasonable number (3.5-4.0)

**Step 2: Add Historical Rent Roll (15 min)**
- April 2026 actual data (already have it)
- 18 occupied rooms with tenant names
- Shows current baseline

**Step 3: Add Renovation Schedule (20 min)**
- 6-month week-by-week timeline
- Rooms online each week
- Visual clarity for lender

**Step 4: Add Room Revenue Detail (30 min)**
- 120 months of room revenue breakdown
- Occupancy ramp-up detail
- Supports projections

**Step 5: Add Sensitivity Analysis (30 min)**
- Low/Base/High occupancy scenarios
- Shows DSCR under stress
- Demonstrates prudent planning

**Step 6: Add Assumptions & Notes (15 min)**
- Document all assumptions
- Explain methodology
- Professional transparency

**Total time:** ~2.5 hours for complete institutional package

---

## QUESTIONS FOR APPROVAL

1. **Approve Option 2** (fix circular reference by calculating occupancy in Laundry tab)?

2. **Add all 6 new tabs** or prioritize subset?

3. **Any other detail needed** beyond these 15 tabs?

4. **Proceed with Step 1 immediately** (fix circular reference)?

---

**Ready for your approval to proceed.**
