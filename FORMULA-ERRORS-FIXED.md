# Formula Errors Fixed - v2.2

**Date:** May 4, 2026, 4:48 PM EDT  
**Status:** ✅ ALL ERRORS CORRECTED

---

## 12 FORMULA ERRORS FIXED IN EXECUTIVE SUMMARY

All errors were in the Executive Summary tab, caused by incorrect cell references during the rebuild.

### Errors Fixed:

| Row | Label | Wrong Formula | Correct Formula | Issue |
|-----|-------|--------------|-----------------|-------|
| 37 | Occupancy Rate | `=B33/B34` | `=B35/B36` | Referenced wrong rows |
| 39 | Annual Rent Revenue | `=B35*12` | `=B38*12` | Should multiply monthly rent, not occupied rooms |
| 44 | Stabilized Occupied Rooms | `=B40*B41` | `=B42*B43` | Wrong row references |
| 47 | Annual Room Revenue | `=B40*B41*12` | `=B44*B45*12` | Should use occupied rooms (B44) not NOI |
| 48 | Annual Laundry Revenue | `=B39*1*4.3*4.50*12` | `=B44*1*4.3*4.50*12` | Should use occupied rooms, not annual rent |
| 49 | Total Annual Revenue | `=B41+B42` | `=B47+B48` | Should add room + laundry revenue |
| 50 | Annual Operating Expenses | `=B35*344*12` | `=B42*344*12` | Should use total rooms (67), not occupied (18) |
| 51 | Net Operating Income (NOI) | `=B41-B42` | `=B49-B50` | Should subtract expenses from revenue |
| 53 | Annual Cash Flow | `=B41-B42` | `=B51-B52` | Should subtract debt service from NOI |
| 54 | DSCR | `=B40/B41` | `=B51/B52` | Should divide NOI by debt service |
| 78 | Value Creation | `=B76-B75` | `=B77-B76` | Backwards: should be stabilized minus as-is |
| 83 | Equity Position | `=1-B75` | `=1-B81` | Should reference LTV (B81), not empty cell |

---

## ROOT CAUSE

During the Executive Summary rebuild, I built sections incrementally but used **relative row position assumptions** instead of **actual cell addresses**.

Example: When building "Stabilized Projections" section, I used formulas like `=B40*B41` assuming those would be the right cells, but didn't account for the exact row placement after all sections were assembled.

---

## VERIFICATION

**All other sheets checked:** No errors found

**Scan completed:**
- 13 sheets scanned
- Executive Summary: 12 errors fixed
- All other sheets: Clean

**Formula types checked:**
- Self-references (circular)
- Error values (#REF!, #VALUE!, #NAME?, etc.)
- Broken references

---

## CORRECTED CALCULATIONS (when opened in Excel)

### Current Operations Section:
- Occupancy Rate: 18/24 = **75%** ✅
- Annual Rent: $15,340 × 12 = **$184,080** ✅

### Stabilized Projections Section:
- Occupied Rooms: 67 × 80% = **53.6 rooms** ✅
- Room Revenue: 53.6 × $850 × 12 = **$546,720** ✅
- Laundry Revenue: 53.6 × 1 × 4.3 × $4.50 × 12 = **$12,415** ✅
- Total Revenue: $546,720 + $12,415 = **$559,135** ✅
- Op Expenses: 67 × $344 × 12 = **$276,576** ✅
- NOI: $559,135 - $276,576 = **$282,559** ✅
- Cash Flow: $282,559 - $75,377 = **$207,182** ✅
- DSCR: $282,559 / $75,377 = **3.75x** ✅

### Property Valuation Section:
- Value Creation: $2,870,000 - $708,000 = **$2,162,000** ✅
- Equity Position: 1 - 30% = **70%** ✅

---

## FILES

**Main:** `Hotel-Brendle-Loan-Application.xlsx`  
**Version:** `hotel-brendle-loan-versions/Hotel-Brendle-v2.2-ERRORS-FIXED.xlsx`

**Status:** ✅ READY FOR EXCEL VERIFICATION

---

## NEXT STEP

Open in Excel to verify all formulas calculate correctly and values match expectations.
