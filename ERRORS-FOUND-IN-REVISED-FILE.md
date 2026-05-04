# ERRORS FOUND IN REVISED LOAN APPLICATION

**File:** Hotel-Brendle-Loan-Application-REVISED.xlsx  
**Date Audited:** May 4, 2026

---

## CRITICAL ERRORS - MUST FIX

### 1. **10-Year Monthly Projections - STRUCTURE BROKEN**

**Missing Column:** Operating Expenses is completely missing

**Current broken structure:**
- Col 6: Revenue (room revenue) ✓
- Col 7: Laundry Rev ✓
- Col 8: Total Revenue ✓
- **Col 9: "NOI" but formula is =F4-G4** ❌ (subtracts laundry from room rent??)
- **Col 10: "Debt Svc" but formula is =H4-I4** ❌ (makes no sense)
- **Col 11: "Cash Flow" but formula is =H4-I4** ❌ (duplicate of col 10)
- **Col 12: "DSCR" but formula is =J4-K4** ❌ (subtracting instead of dividing)
- **Col 13: No header but formula is =IF(K4=0,0,J4/K4)** (looks like DSCR formula)

**What it SHOULD be:**
- Col 6: Room Revenue
- Col 7: Laundry Revenue
- Col 8: Total Revenue
- **Col 9: Operating Expenses** (MISSING!)
- **Col 10: NOI** (=Col8 - Col9)
- **Col 11: Debt Service** ($6,281.43 constant)
- **Col 12: Cash Flow** (=Col10 - Col11)
- **Col 13: DSCR** (=Col10 / Col11)

**Impact:** ALL financial calculations are wrong. DSCR, NOI, Cash Flow all incorrect.

---

### 2. **Annual Summary - WRONG SOURCE DATA**

**Operating Expenses formula:** `=SUM('10-Year Monthly Projections'!G28:G39)`

**Problem:** Column G is Laundry Revenue, NOT Operating Expenses!

**Result:** 
- Shows Op Exp as $13,932/year (actually laundry revenue)
- Should be ~$276,000/year (67 rooms × $344/room/mo × 12 months)

**Impact:** NOI is inflated by ~$262k, DSCR completely wrong

---

### 3. **Executive Summary - INACCURATE INFORMATION**

**Current errors:**

| Item | Current | Should Be |
|------|---------|-----------|
| Room Renovation line | "40 rooms @ $15k" | "43 rooms - detailed budget" |
| Total Uses | $850,000 | Should link to actual calculated costs |
| DSCR | 1.03 | Needs recalculation with correct NOI |
| Stabilized NOI | $546,720 | Wrong due to Op Exp error |

**Missing information:**
- No mention of property value
- No mention of LTV ratio
- No mention of occupancy assumptions
- No mention of renovation timeline (6 months)
- No mention of laundry revenue stream

---

### 4. **Sources & Uses - DUPLICATE ENTRIES**

**Current:**
```
Existing Debt Payoff: ='Renovation Budget Detail'!E156
Room Renovation (40 rooms @ $15k): 600000
Room Renovation (43 rooms): ='Renovation Budget Detail'!E$13
Jobsite Costs & Contingency: 25000
```

**Problems:**
- Two renovation line items (duplicate)
- One says "40 rooms" (wrong)
- Cell reference E156 doesn't exist in detail tab
- Cell reference E$13 is wrong row
- Missing amenities line item ($85k)

**Should be:**
```
Existing Debt Payoff: $150,000
Room Renovation (43 rooms): [link to actual subtotal]
Extended Laundry Facility: [link to laundry total]
Extended Kitchen Facility: [link to kitchen total]
Infrastructure & Jobsite: [link to infra total]
Contingency: [link to contingency]
```

---

### 5. **Laundry Revenue - ASSUMPTIONS CHANGED**

**Current:** 1 load per room per week  
**Was:** 1.5 loads per room per week

**Impact:** Laundry revenue decreased from ~$18,780/year to ~$12,520/year

**Is this intentional or error?** If corrected to be more conservative, OK. But needs verification.

---

### 6. **Debt Service in Monthly Projections**

**Current values:**
- Month 1: $929
- Month 2: $929  
- Month 3: $1,200

**Should be:** $6,281.43 EVERY month

**Cause:** Formula is wrong (=H4-I4 instead of constant $6,281.43)

---

## CALCULATION VERIFICATION

### What the numbers SHOULD be (Year 3 stabilized):

**Revenue:**
- 67 rooms × 80% occupancy = 54 occupied
- 54 rooms × $850/mo = $45,900/month room revenue
- Laundry: 54 rooms × 1 load/week × 4.3 weeks × $4.50 = $1,044/month
- **Total: ~$47,000/month = $564,000/year**

**Operating Expenses:**
- 67 rooms × $344/room/mo = $23,048/month
- **Total: $276,576/year**

**NOI:**
- $564,000 - $276,576 = **$287,424/year**

**Debt Service:**
- $6,281.43 × 12 = **$75,377/year**

**Cash Flow:**
- $287,424 - $75,377 = **$212,047/year**

**DSCR:**
- $287,424 ÷ $75,377 = **3.81** (excellent!)

### What the file CURRENTLY shows (Year 3):

- Gross Revenue: $560,652 ❌ (too high - includes wrong calculations)
- Operating Expenses: $13,932 ❌ (shows laundry revenue instead!)
- NOI: $546,720 ❌ (inflated due to missing Op Exp)
- Debt Service: $532,788 ❌ (completely wrong)
- DSCR: 1.03 ❌ (dangerously low, but not real)

---

## ROOT CAUSE

**When laundry column was added, Operating Expenses column was deleted or formulas not shifted correctly.**

Result: Every formula after column 8 references the wrong column.

---

## RECOMMENDED FIX

1. **Rebuild 10-Year Monthly Projections tab** with correct column structure
2. **Add Operating Expenses column** with proper formula (rooms × $344/room/mo)
3. **Fix all downstream formulas** (NOI, Debt Service, Cash Flow, DSCR)
4. **Verify Annual Summary** pulls from correct columns
5. **Update Executive Summary** with accurate data
6. **Clean up Sources & Uses** - remove duplicates, fix references
7. **Verify all calculations** match expected values

---

## URGENCY

**This file cannot be submitted to a lender in current state.**

**Errors are fundamental and pervasive:**
- Missing critical data (Operating Expenses)
- Broken formulas throughout
- DSCR showing 1.03 when it should be 3.81
- Would be rejected immediately

**Recommend:** Restore from my original file and apply only the laundry correction you intended.

---

**Shall I rebuild this correctly?**
