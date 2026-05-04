# Hotel Brendle - Loan Readiness Spreadsheet Setup

**Date:** May 4, 2026  
**Status:** Planning Phase  
**Property:** 601 E Ave A (Hotel Brendle)

---

## What We Have

### Existing Documents:
- ✅ Rent roll file: "601 E Ave A" (location TBD)
- ✅ Example loan readiness spreadsheets (30-tab complex documents)
- ✅ Hotel Brendle project directory with basic info

### Tools Available:
✅ **Python 3.14.4** with:
- csv module (read/write CSV)
- sqlite3 (database for complex calculations)
- json (data structures)
- decimal (precise financial math)
- datetime (date calculations)

✅ **LibreOffice** installed
- Can create .xlsx files
- Can convert CSV → Excel format
- Command-line tools (soffice)

❌ **pandas/openpyxl** - Not installed, pip unavailable

---

## Approach for 30-Tab Loan Spreadsheets

### Phase 1: Analyze Example Documents (TODAY)

**I need you to:**
1. **Share the example loan readiness spreadsheet**
   - Upload to workspace, or
   - Tell me the file path

2. **Share the rent roll**
   - "601 E Ave A" file location

**I will:**
1. Open and analyze the 30-tab structure
2. Document each tab's purpose
3. Identify formulas and calculations
4. Map data dependencies between tabs
5. Create a replication plan

### Phase 2: Data Collection

For each tab, identify:
- What data is needed (historical, projections, assumptions)
- Where data comes from (rent roll, tax returns, estimates)
- Calculation methods
- Output format

### Phase 3: Build System

**Option A: Python CSV Generator + LibreOffice**
```
1. Python scripts generate CSV files (one per tab)
2. LibreOffice macro combines CSVs into single .xlsx
3. Apply formatting and formulas in LibreOffice
4. Export final .xlsx file
```

**Option B: LibreOffice Calc Direct**
```
1. Create .ods template (LibreOffice native)
2. Python populates data via CSV imports
3. Formulas pre-built in template
4. Export to .xlsx when complete
```

**Option C: Google Sheets API**
```
1. Use Google Sheets API (if credentials available)
2. Build spreadsheet programmatically
3. Share/export as Excel
```

---

## What I Need From You

### Immediate:
1. **Location of example loan spreadsheet**
   - File path or upload to workspace
   - This is the template we'll replicate

2. **Location of rent roll ("601 E Ave A")**
   - File path or upload

3. **What's the loan for?**
   - Acquisition financing?
   - Renovation/improvement?
   - Refinance existing debt?
   - Working capital?

### Soon:
4. **Historical financial data:**
   - Past 2-3 years of revenue/expenses
   - Occupancy rates
   - Tax returns available?

5. **Property details:**
   - Number of rooms (I know it's 67 from earlier docs)
   - Current occupancy/revenue
   - Any existing debt

6. **Loan parameters:**
   - Amount seeking
   - Intended use
   - Timeline for application

---

## Typical 30-Tab Loan Package Structure

Based on commercial hotel loans, tabs usually include:

### Summary Tabs (1-5):
1. Executive Summary
2. Loan Request Overview
3. Property Overview
4. Key Metrics Dashboard
5. Table of Contents

### Historical Data (6-12):
6. Historical P&L (3 years)
7. Monthly Revenue Detail
8. Expense Breakdown
9. Occupancy History
10. ADR/RevPAR Trends
11. Balance Sheet (current)
12. Cash Flow Statement

### Rent Roll (13-14):
13. Current Rent Roll
14. Lease Analysis

### Projections (15-22):
15. 3-Year Revenue Projections
16. Expense Projections
17. NOI Forecast
18. Cash Flow Pro Forma
19. Sensitivity Analysis
20. Best/Base/Worst Case
21. Seasonality Adjustments
22. Market Assumptions

### Loan Analysis (23-28):
23. Debt Service Schedule
24. Amortization Table
25. DSCR Calculations
26. Break-Even Analysis
27. Loan-to-Value (LTV)
28. Cash-on-Cash Return

### Supporting (29-30):
29. Market Comps
30. Sources & Uses

---

## Next Steps (In Order)

**Step 1: SHARE FILES**
Tell me where the example spreadsheet and rent roll are located.

**Step 2: ANALYZE**
I'll document the structure and create a replication plan.

**Step 3: DATA GATHERING**
We'll identify what financial data we need to collect.

**Step 4: BUILD SYSTEM**
Create Python scripts + LibreOffice templates.

**Step 5: POPULATE**
Fill in Hotel Brendle specific data.

**Step 6: VALIDATE**
Check all calculations and formulas.

**Step 7: FORMAT**
Professional presentation ready for lender.

**Step 8: PACKAGE**
Export final .xlsx with all 30 tabs.

---

## LibreOffice Command-Line Tools

We can use these to automate:

```bash
# Convert CSV to XLSX
soffice --headless --convert-to xlsx:"Calc MS Excel 2007 XML" file.csv

# Merge multiple files
soffice --headless --invisible --norestore macro:///path/to/merge.py

# Apply template
soffice --headless --infilter="csv:44,34,76" --convert-to xlsx input.csv
```

---

## Python Financial Calculation Example

We can build accurate financial models:

```python
from decimal import Decimal, ROUND_HALF_UP

def calculate_dscr(noi, annual_debt_service):
    """Calculate Debt Service Coverage Ratio"""
    return (Decimal(noi) / Decimal(annual_debt_service)).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )

def calculate_loan_payment(principal, rate, years):
    """Calculate monthly loan payment"""
    monthly_rate = Decimal(rate) / Decimal(12) / Decimal(100)
    months = Decimal(years * 12)
    
    if monthly_rate == 0:
        return Decimal(principal) / months
    
    payment = (Decimal(principal) * monthly_rate * 
               (1 + monthly_rate) ** months) / \
              ((1 + monthly_rate) ** months - 1)
    
    return payment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
```

---

## Alternative: Use Model to Generate Formulas

Since we have Claude Sonnet 4.5, I can:
1. Read the example spreadsheet structure
2. Generate all Excel formulas as text
3. Create formula documentation
4. You manually apply to spreadsheet, or
5. We use LibreOffice macros to apply programmatically

---

## Questions for Clarification

1. **Where are the files?**
   - Example loan spreadsheet location?
   - Rent roll ("601 E Ave A") location?

2. **Which approach do you prefer?**
   - Python + LibreOffice (more automation)
   - Manual template + data import (simpler)
   - Google Sheets (if you have access)

3. **Timeline?**
   - When do you need this completed?
   - Any specific deadline?

4. **Lender requirements?**
   - Do they need specific format?
   - Are the example docs from your target lender?

---

**Status:** Ready to analyze once you point me to the example spreadsheet and rent roll files.

I can work with complex multi-tab spreadsheets - just need to see the structure you want to replicate!
