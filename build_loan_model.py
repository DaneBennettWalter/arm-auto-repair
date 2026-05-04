#!/usr/bin/env python3
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime, timedelta
from decimal import Decimal

print("Building Hotel Brendle 10-Year Loan Model...\n")

wb = openpyxl.Workbook()
wb.remove(wb.active)  # Remove default sheet

# KNOWN FACTS
CURRENT_DEBT = 141000
LOAN_AMOUNT = 850000
DEBT_PAYOFF = 150000
AMENITIES = 100000
ROOM_RENO = 600000
RENO_MONTHS = 6
TOTAL_ROOMS = 67
CURRENT_AVAILABLE = 24
LIGHT_RENO = 7
FULL_RENO = 36

# April 2026 baseline
CURRENT_OCCUPIED = 18
CURRENT_RENT = 15340
CURRENT_EXPENSES = 8265  # Q1 2026 average

# Loan terms (market standard for commercial hotel)
INTEREST_RATE = 0.075  # 7.5% annual
LOAN_TERM_YEARS = 25
LOAN_TERM_MONTHS = LOAN_TERM_YEARS * 12

# Calculate monthly payment (P&I)
monthly_rate = INTEREST_RATE / 12
n = LOAN_TERM_MONTHS
payment = LOAN_AMOUNT * (monthly_rate * (1 + monthly_rate)**n) / ((1 + monthly_rate)**n - 1)
MONTHLY_PAYMENT = round(payment, 2)

print(f"Loan: ${LOAN_AMOUNT:,} @ {INTEREST_RATE*100}% over {LOAN_TERM_YEARS} years")
print(f"Monthly P&I: ${MONTHLY_PAYMENT:,.2f}\n")

# ============================================================================
# SHEET 1: EXECUTIVE SUMMARY
# ============================================================================
ws = wb.create_sheet("Executive Summary")

ws['A1'] = "HOTEL BRENDLE - LOAN REQUEST"
ws['A1'].font = Font(size=16, bold=True)

ws['A3'] = "Property Address:"
ws['B3'] = "601 E Ave A, Robstown, TX 78380"

ws['A4'] = "Total Rooms:"
ws['B4'] = TOTAL_ROOMS

ws['A5'] = "Current Occupied:"
ws['B5'] = CURRENT_OCCUPIED

ws['A7'] = "LOAN REQUEST"
ws['A7'].font = Font(bold=True)

ws['A8'] = "Total Loan Amount:"
ws['B8'] = LOAN_AMOUNT
ws['B8'].number_format = '$#,##0'

ws['A10'] = "USE OF PROCEEDS:"
ws['A10'].font = Font(bold=True)
ws['A11'] = "Existing Debt Payoff"
ws['B11'] = DEBT_PAYOFF
ws['B11'].number_format = '$#,##0'

ws['A12'] = "Amenities & Jobsite"
ws['B12'] = AMENITIES
ws['B12'].number_format = '$#,##0'

ws['A13'] = "Room Renovation (40 rooms @ $15k)"
ws['B13'] = ROOM_RENO
ws['B13'].number_format = '$#,##0'

ws['A14'] = "TOTAL USES"
ws['A14'].font = Font(bold=True)
ws['B14'] = '=B11+B12+B13'
ws['B14'].number_format = '$#,##0'

ws['A16'] = "LOAN TERMS:"
ws['A16'].font = Font(bold=True)
ws['A17'] = "Interest Rate:"
ws['B17'] = INTEREST_RATE
ws['B17'].number_format = '0.00%'

ws['A18'] = "Term (years):"
ws['B18'] = LOAN_TERM_YEARS

ws['A19'] = "Monthly Payment:"
ws['B19'] = MONTHLY_PAYMENT
ws['B19'].number_format = '$#,##0.00'

ws['A20'] = "Annual Debt Service:"
ws['B20'] = '=B19*12'
ws['B20'].number_format = '$#,##0.00'

print("✓ Executive Summary")

# ============================================================================
# SHEET 2: CURRENT OPERATIONS
# ============================================================================
ws = wb.create_sheet("Current Operations")

ws['A1'] = "CURRENT OPERATIONS (April 2026 Baseline)"
ws['A1'].font = Font(size=14, bold=True)

ws['A3'] = "REVENUE:"
ws['A3'].font = Font(bold=True)
ws['A4'] = "Occupied Rooms"
ws['B4'] = CURRENT_OCCUPIED

ws['A5'] = "Monthly Rent"
ws['B5'] = CURRENT_RENT
ws['B5'].number_format = '$#,##0'

ws['A6'] = "Annual Revenue"
ws['B6'] = '=B5*12'
ws['B6'].number_format = '$#,##0'

ws['A8'] = "EXPENSES:"
ws['A8'].font = Font(bold=True)
ws['A9'] = "Monthly Operating Expenses"
ws['B9'] = CURRENT_EXPENSES
ws['B9'].number_format = '$#,##0'

ws['A10'] = "Annual Operating Expenses"
ws['B10'] = '=B9*12'
ws['B10'].number_format = '$#,##0'

ws['A12'] = "NET OPERATING INCOME:"
ws['A12'].font = Font(bold=True)
ws['A13'] = "Annual NOI"
ws['B13'] = '=B6-B10'
ws['B13'].number_format = '$#,##0'

ws['A15'] = "Current Debt Service"
ws['B15'] = 0  # Assuming current debt has minimal service
ws['B15'].number_format = '$#,##0'

ws['A16'] = "Cash Flow Before New Debt"
ws['B16'] = '=B13-B15'
ws['B16'].number_format = '$#,##0'

print("✓ Current Operations")


# ============================================================================
# SHEET 3: RENOVATION TIMELINE
# ============================================================================
ws = wb.create_sheet("Renovation Timeline")

ws['A1'] = "RENOVATION TIMELINE & ROOM DEPLOYMENT"
ws['A1'].font = Font(size=14, bold=True)

ws['A3'] = "Month"
ws['B3'] = "Rooms Renovated"
ws['C3'] = "Cumulative Online"
ws['D3'] = "Notes"

# Headers bold
for col in ['A', 'B', 'C', 'D']:
    ws[f'{col}3'].font = Font(bold=True)

# Month 0: Current state
ws['A4'] = 0
ws['B4'] = 0
ws['C4'] = CURRENT_AVAILABLE
ws['D4'] = "Current: 24 rooms available"

# Months 1-6: Renovation period (43 rooms to add: 7 light + 36 full)
rooms_per_month = 43 / RENO_MONTHS  # ~7.17 rooms/month
cumulative = CURRENT_AVAILABLE

for month in range(1, 7):
    row = 4 + month
    ws[f'A{row}'] = month
    ws[f'B{row}'] = round(rooms_per_month)
    cumulative += round(rooms_per_month)
    ws[f'C{row}'] = f'=C{row-1}+B{row}'
    if month == 6:
        ws[f'D{row}'] = "Renovation complete"

# Month 7+: Stabilized
for month in range(7, 13):
    row = 4 + month
    ws[f'A{row}'] = month
    ws[f'B{row}'] = 0
    ws[f'C{row}'] = f'=C{row-1}'
    if month == 7:
        ws[f'D{row}'] = "Stabilized: 67 rooms"

print("✓ Renovation Timeline")

# ============================================================================
# SHEET 4: 10-YEAR REVENUE PROJECTIONS
# ============================================================================
ws = wb.create_sheet("Revenue Projections")

ws['A1'] = "10-YEAR REVENUE PROJECTIONS"
ws['A1'].font = Font(size=14, bold=True)

# Headers
ws['A3'] = "Year"
ws['B3'] = "Month"
ws['C3'] = "Rooms Available"
ws['D3'] = "Occupancy %"
ws['E3'] = "Occupied Rooms"
ws['F3'] = "Avg Rent/Room"
ws['G3'] = "Monthly Revenue"
ws['H3'] = "Annual Revenue"

for col in range(1, 9):
    ws.cell(3, col).font = Font(bold=True)

# Assumptions
STABILIZED_OCCUPANCY = 0.75  # 75% conservative
AVG_RENT_CURRENT = CURRENT_RENT / CURRENT_OCCUPIED  # ~$852/room
AVG_RENT_POST_RENO = 850  # Use $850 average ($700-$1000 range)

start_month = 0
row = 4

for year in range(1, 11):  # 10 years
    for month in range(1, 13):  # 12 months
        ws[f'A{row}'] = year
        ws[f'B{row}'] = month
        
        # Rooms available (ramp up during reno, then stabilized)
        if start_month < 6:
            # During renovation
            rooms = CURRENT_AVAILABLE + (start_month * (43 / 6))
        else:
            rooms = TOTAL_ROOMS
        
        ws[f'C{row}'] = round(rooms)
        
        # Occupancy (ramp to stabilized)
        if start_month < 6:
            occ_pct = (CURRENT_OCCUPIED / CURRENT_AVAILABLE) * 0.8  # 80% of current during reno
        elif start_month < 12:
            # Ramp from current to stabilized over 6 months post-reno
            occ_pct = 0.70 + ((start_month - 6) / 6) * 0.05
        else:
            occ_pct = STABILIZED_OCCUPANCY
        
        ws[f'D{row}'] = occ_pct
        ws[f'D{row}'].number_format = '0.0%'
        
        # Occupied rooms
        ws[f'E{row}'] = f'=C{row}*D{row}'
        ws[f'E{row}'].number_format = '0'
        
        # Average rent
        if start_month < 6:
            rent = AVG_RENT_CURRENT
        else:
            rent = AVG_RENT_POST_RENO
        
        ws[f'F{row}'] = rent
        ws[f'F{row}'].number_format = '$#,##0'
        
        # Monthly revenue
        ws[f'G{row}'] = f'=E{row}*F{row}'
        ws[f'G{row}'].number_format = '$#,##0'
        
        # Annual revenue (formula sums 12 months)
        if month == 12:
            ws[f'H{row}'] = f'=SUM(G{row-11}:G{row})'
            ws[f'H{row}'].number_format = '$#,##0'
        
        start_month += 1
        row += 1

print("✓ Revenue Projections")

# Save workbook
wb.save('hotel-brendle-loan-model.xlsx')
print("\n✅ Model saved: hotel-brendle-loan-model.xlsx")
print(f"   Total sheets: {len(wb.sheetnames)}")

