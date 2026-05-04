# Hotel Brendle - Cash-Out Refinance Action Plan

**Date:** May 4, 2026  
**Status:** ✅ Context Loaded - Moving Forward

---

## What I Now Know (From Memory)

### Property Details:
- **Address:** 601 E Ave A, Robstown, TX 78380
- **Type:** Historic 67-room hotel
- **Renovated:** 30 rooms online and renting
- **Remaining:** 37 rooms need renovation
- **Occupancy:** ~26 of 30 rooms (87%)
- **Rent:** $640/mo or $600/mo per room

### Current Financial Performance:
- **Gross Revenue:** $16,800/month
- **Operating Expenses:** $7,647/month
- **Net Operating Income:** $9,153/month (~$110K annually)
- **Cash flowing, operating asset**

### Loan Objective:
**Cash-out refinance** to fund renovation of remaining 37 rooms

### Documents Available:
- ✅ Rent roll on Google Drive (filename: "601 E Ave A" or similar)
- ✅ Example loan readiness spreadsheet (30-tab complex document)
- ✅ Google Drive API credentials in `.env`

---

## Immediate Action Plan

### Step 1: Access Google Drive (NOW)
Need to install Google API libraries:
```bash
# Try system package manager first
sudo pacman -S python-google-api-python-client python-google-auth-oauthlib

# Or alternative installation method if pip unavailable
```

Then run script to:
1. Find rent roll spreadsheet
2. Download example loan readiness template
3. List all Hotel Brendle related files

### Step 2: Analyze 30-Tab Loan Template
Once accessed:
1. Document tab structure
2. Map data dependencies
3. Identify required inputs
4. Note calculation formulas
5. Create replication plan

### Step 3: Build Financial Model
Using Hotel Brendle data:
1. Historical performance (past 12 months)
2. Current rent roll analysis
3. Renovation cost estimates
4. Post-renovation projections
5. Debt service calculations
6. DSCR analysis (target 1.25+)
7. Cash-on-cash return projections

### Step 4: Create Loan Package
30-tab spreadsheet including:
- Executive summary
- Property overview
- Historical financials
- Rent roll detail
- Renovation budget
- 3-5 year projections
- Debt service analysis
- Supporting documentation

---

## Key Financial Metrics to Calculate

### Current Performance:
- NOI: $110K/year
- Occupancy: 87%
- ADR (Average Daily Rate): ~$21/day ($640/mo ÷ 30 days)
- RevPAR: ADR × Occupancy = ~$18.27/day
- Operating Expense Ratio: 45.5%

### Renovation Analysis:
- Cost per room to renovate: Need estimate
- Total renovation budget: 37 rooms × cost/room
- Timeline: Rooms/week renovation rate
- Revenue ramp: As rooms come online

### Post-Renovation Projections:
- Stabilized occupancy: 85-90% of 67 rooms
- Gross revenue potential: 60 rooms × $640 × 12 = $461K/year
- Net income projection: ~$250K/year (assuming scaled expenses)
- Value creation: Increased NOI → increased property value

### Loan Structuring:
- Current value estimate: Need appraisal
- Loan amount requested: Renovation cost + cushion
- LTV (Loan-to-Value): Target 70-75%
- DSCR: NOI / Annual Debt Service (need 1.25+)
- Interest rate assumption: Current commercial rates
- Term: 20-30 years typical
- Cash-out proceeds: Loan amount - existing debt

---

## Tools We'll Use

### For Spreadsheet Work:
✅ **Python + CSV:** Generate data files
✅ **LibreOffice Calc:** Combine into .xlsx with formulas
✅ **Built-in modules:** csv, sqlite3, decimal (precise math), datetime

### For Calculations:
✅ **Claude Sonnet 4.5:** Financial modeling, formula generation
⭐ **Switch to Opus 4:** For final analysis and complex scenarios

### For Data Access:
Need to install: `python-google-api-python-client`

---

## Next Immediate Actions

**RIGHT NOW:**
1. Install Google API Python libraries
2. Run script to find/download rent roll from Drive
3. Access example 30-tab loan template

**THEN:**
4. Analyze template structure
5. Gather historical financial data
6. Build financial model
7. Create loan presentation package

---

## Questions I Won't Ask Again

~~1. Where is the rent roll?~~ → Google Drive, filename "601 E Ave A"  
~~2. What's the loan for?~~ → Cash-out to renovate remaining 37 rooms  
~~3. How many rooms?~~ → 67 total (30 done, 37 remaining)  
~~4. Property address?~~ → 601 E Ave A, Robstown TX  
~~5. Current performance?~~ → $16.8K gross / $9.1K net monthly  

---

**Status:** Context loaded, ready to execute once Google API access is established.

**Apology:** You're right - I should have checked memory first before asking questions we've already covered. Moving forward with what we know.
