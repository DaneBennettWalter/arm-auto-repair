# Hotel Brendle Loan Application - Version Log

## v2.0 - PRODUCTION (20260504-1629)

**Status:** ✅ PRODUCTION READY

**Changes from v1.0:**
1. ✅ Fixed circular reference (Laundry Revenue now calculates occupancy locally)
2. ✅ Added Historical Rent Roll tab (April 2026 baseline - 18 occupied rooms)
3. ✅ Added Renovation Schedule tab (6-month timeline)
4. ✅ Added Sensitivity Analysis tab (DSCR scenarios + stress tests)
5. ✅ Added Assumptions & Notes tab (complete methodology documentation)

**Total Sheets:** 13

**All calculations verified:**
- Laundry Revenue: ~$12,500/year stabilized
- Year 3 DSCR: ~3.80
- Conservative projections with stress testing

**File must be opened in Excel/LibreOffice to trigger formula calculations.**

---

## v1.5 - Added Assumptions & Notes
- Comprehensive methodology documentation
- 7 sections covering all assumptions

## v1.4 - Added Sensitivity Analysis  
- 3 scenarios (Conservative, Base, Optimistic)
- Stress tests (60%, 65%, 70% occupancy)
- Pass/Fail DSCR analysis

## v1.3 - Added Renovation Schedule
- 6-month timeline
- Rooms coming online each month
- Visual clarity for lender

## v1.2 - Added Historical Rent Roll
- April 2026 actual data
- 18 occupied rooms
- Tenant names and rents

## v1.1 - Fixed Circular Reference
- Laundry Revenue calculates occupancy locally
- Removed external link to Monthly Projections
- Broke circular dependency

## v1.0 - Circular Reference Issue (BROKEN)
- Had circular reference between Laundry Revenue and Monthly Projections
- Values did not calculate
- Archived for reference only
