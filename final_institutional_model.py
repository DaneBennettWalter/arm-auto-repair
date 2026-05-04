#!/usr/bin/env python3
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from datetime import date

wb = openpyxl.Workbook()
wb.remove(wb.active)

# FACTS
LOAN_AMT = 850000
RATE = 0.075
TERM_YRS = 25
TERM_MOS = 300
monthly_rate = RATE/12
PAYMENT = round(LOAN_AMT * (monthly_rate * (1+monthly_rate)**TERM_MOS) / ((1+monthly_rate)**TERM_MOS - 1), 2)

# Executive Summary
ws = wb.create_sheet("Executive Summary")
ws['A1'] = "HOTEL BRENDLE - CASH-OUT REFINANCE REQUEST"
ws['A1'].font = Font(size=16, bold=True)
ws['A2'] = f"Prepared: {date.today().strftime('%B %d, %Y')}"
ws['A4'] = "PROPERTY INFORMATION"
ws['A4'].font = Font(bold=True, size=12)
ws['A5'] = "Address:"
ws['B5'] = "601 E Ave A, Robstown, TX 78380"
ws['A6'] = "Property Type:"
ws['B6'] = "Historic Hotel - Extended Stay"
ws['A7'] = "Total Rooms:"
ws['B7'] = 67
ws['A8'] = "Currently Available:"
ws['B8'] = 24
ws['A9'] = "To Be Renovated:"
ws['B9'] = 43
ws['A11'] = "LOAN REQUEST"
ws['A11'].font = Font(bold=True, size=12)
ws['A12'] = "Amount Requested:"
ws['B12'] = LOAN_AMT
ws['B12'].number_format = '$#,##0'
ws['B12'].font = Font(bold=True)
ws['A14'] = "USE OF PROCEEDS"
ws['A14'].font = Font(bold=True)
data = [("Existing Debt Payoff", 150000), ("Amenities & Jobsite Costs", 100000), 
        ("Room Renovation (40 rooms @ $15k)", 600000)]
r = 15
for item, amt in data:
    ws.cell(r, 1, item)
    ws.cell(r, 2, amt).number_format = '$#,##0'
    r += 1
ws[f'A{r}'] = "Total Uses"
ws[f'A{r}'].font = Font(bold=True)
ws[f'B{r}'] = f'=SUM(B15:B{r-1})'
ws[f'B{r}'].number_format = '$#,##0'
ws[f'B{r}'].font = Font(bold=True)
ws['A20'] = "LOAN TERMS"
ws['A20'].font = Font(bold=True, size=12)
ws['A21'] = "Interest Rate:"
ws['B21'] = RATE
ws['B21'].number_format = '0.00%'
ws['A22'] = "Amortization:"
ws['B22'] = f"{TERM_YRS} years"
ws['A23'] = "Monthly Payment (P&I):"
ws['B23'] = PAYMENT
ws['B23'].number_format = '$#,##0.00'
ws['A24'] = "Annual Debt Service:"
ws['B24'] = f'=B23*12'
ws['B24'].number_format = '$#,##0'
ws['A26'] = "KEY METRICS (Year 3 Stabilized)"
ws['A26'].font = Font(bold=True, size=12)
ws['A27'] = "Stabilized NOI:"
ws['B27'] = f"='Annual Summary'!D6"
ws['B27'].number_format = '$#,##0'
ws['A28'] = "DSCR:"
ws['B28'] = f"='Annual Summary'!G6"
ws['B28'].number_format = '0.00x'

# Current Ops from actual data
ws = wb.create_sheet("Current Operations")
ws['A1'] = "CURRENT OPERATIONS (April 2026)"
ws['A1'].font = Font(size=14, bold=True)
ws['A3'] = "OPERATING PERFORMANCE"
ws['A3'].font = Font(bold=True)
ws['A4'] = "Occupied Rooms:"
ws['B4'] = 18
ws['A5'] = "Available Rooms:"
ws['B5'] = 24
ws['A6'] = "Occupancy Rate:"
ws['B6'] = '=B4/B5'
ws['B6'].number_format = '0.0%'
ws['A8'] = "REVENUE"
ws['A8'].font = Font(bold=True)
ws['A9'] = "Monthly Rent (Contractual):"
ws['B9'] = 15340
ws['B9'].number_format = '$#,##0'
ws['A10'] = "Annualized Revenue:"
ws['B10'] = '=B9*12'
ws['B10'].number_format = '$#,##0'
ws['A12'] = "OPERATING EXPENSES (Q1 2026 Average)"
ws['A12'].font = Font(bold=True)
exp_data = [("Payroll", 4792), ("Property Taxes", 3000), ("Electric", 960), 
            ("Gas", 278), ("Water", 991), ("Sewer", 322), ("Trash", 110), ("Consumables", 1000)]
r = 13
total_exp = 0
for item, amt in exp_data:
    ws.cell(r, 1, item)
    ws.cell(r, 2, amt).number_format = '$#,##0'
    total_exp += amt
    r += 1
ws[f'A{r}'] = "Total Monthly Expenses:"
ws[f'A{r}'].font = Font(bold=True)
ws[f'B{r}'] = f'=SUM(B13:B{r-1})'
ws[f'B{r}'].number_format = '$#,##0'
ws[f'B{r}'].font = Font(bold=True)
ws[f'A{r+1}'] = "Annual Operating Expenses:"
ws[f'B{r+1}'] = f'=B{r}*12'
ws[f'B{r+1}'].number_format = '$#,##0'
ws[f'A{r+3}'] = "NET OPERATING INCOME"
ws[f'A{r+3}'].font = Font(bold=True, size=12)
ws[f'A{r+4}'] = "Annual NOI:"
ws[f'B{r+4}'] = f'=B10-B{r+1}'
ws[f'B{r+4}'].number_format = '$#,##0'
ws[f'B{r+4}'].font = Font(bold=True)

print(f"✓ Executive Summary")
print(f"✓ Current Operations")

# 10-Year Monthly Cash Flow
ws = wb.create_sheet("10-Year Monthly Projections")
ws['A1'] = "10-YEAR MONTHLY CASH FLOW PROJECTIONS"
ws['A1'].font = Font(size=14, bold=True)
headers = ['Year', 'Mo', 'Rooms Avail', 'Occ %', 'Avg Rent', 'Revenue', 'Op Exp', 'NOI', 'Debt Svc', 'Cash Flow', 'DSCR']
for col, h in enumerate(headers, 1):
    ws.cell(3, col, h).font = Font(bold=True)

row = 4
mo_count = 0
for yr in range(1, 11):
    for mo in range(1, 13):
        ws.cell(row, 1, yr)
        ws.cell(row, 2, mo)
        # Rooms
        if mo_count < 6:
            rooms = round(24 + mo_count * 7.17)
        else:
            rooms = 67
        ws.cell(row, 3, rooms)
        # Occupancy
        if mo_count < 6:
            occ = 0.75 * (18/24)  # Current rate during reno
        elif mo_count < 18:
            # Ramp from 70% to 80% over 12 months post-reno
            occ = 0.70 + (mo_count - 6) * 0.00833
        else:
            occ = 0.80
        ws.cell(row, 4, occ).number_format = '0.0%'
        # Rent
        rent = 850 if mo_count >= 6 else 852
        ws.cell(row, 5, rent).number_format = '$#,##0'
        # Revenue
        ws.cell(row, 6, f'=C{row}*D{row}*E{row}').number_format = '$#,##0'
        # Expenses
        ws.cell(row, 7, f'=C{row}*344').number_format = '$#,##0'  # $344/room/mo
        # NOI
        ws.cell(row, 8, f'=F{row}-G{row}').number_format = '$#,##0'
        # Debt Svc
        ws.cell(row, 9, PAYMENT).number_format = '$#,##0'
        # Cash Flow
        ws.cell(row, 10, f'=H{row}-I{row}').number_format = '$#,##0'
        # DSCR
        ws.cell(row, 11, f'=IF(I{row}=0,0,H{row}/I{row})').number_format = '0.00'
        
        mo_count += 1
        row += 1

print(f"✓ 10-Year Monthly Projections ({row-4} months)")

wb.save('Hotel-Brendle-Loan-Application.xlsx')
print(f"\n✅ SAVED: Hotel-Brendle-Loan-Application.xlsx")

