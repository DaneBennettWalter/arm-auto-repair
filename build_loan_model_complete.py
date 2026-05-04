#!/usr/bin/env python3
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill
from datetime import datetime

wb = openpyxl.Workbook()
wb.remove(wb.active)

# Constants
CURRENT_DEBT = 141000
LOAN_AMOUNT = 850000
INTEREST_RATE = 0.075
LOAN_TERM_YEARS = 25
TOTAL_ROOMS = 67
CURRENT_AVAILABLE = 24
CURRENT_OCCUPIED = 18
CURRENT_RENT = 15340
CURRENT_EXPENSES = 8265

monthly_rate = INTEREST_RATE / 12
n = LOAN_TERM_YEARS * 12
MONTHLY_PAYMENT = round(LOAN_AMOUNT * (monthly_rate * (1 + monthly_rate)**n) / ((1 + monthly_rate)**n - 1), 2)

# Tab 1: Executive Summary
ws = wb.create_sheet("Executive Summary")
ws['A1'] = "HOTEL BRENDLE LOAN REQUEST"
ws['A1'].font = Font(size=16, bold=True)
ws['A3'] = "Property:"
ws['B3'] = "601 E Ave A, Robstown, TX 78380"
ws['A4'] = "Total Rooms:"
ws['B4'] = 67
ws['A6'] = "LOAN REQUEST:"
ws['A6'].font = Font(bold=True)
ws['A7'] = "Total Amount"
ws['B7'] = LOAN_AMOUNT
ws['B7'].number_format = '$#,##0'
ws['A9'] = "USE OF PROCEEDS:"
ws['A10'] = "Debt Payoff"
ws['B10'] = 150000
ws['B10'].number_format = '$#,##0'
ws['A11'] = "Amenities/Jobsite"
ws['B11'] = 100000
ws['B11'].number_format = '$#,##0'
ws['A12'] = "Room Renovation"
ws['B12'] = 600000
ws['B12'].number_format = '$#,##0'
ws['A13'] = "Total"
ws['B13'] = '=SUM(B10:B12)'
ws['B13'].number_format = '$#,##0'
ws['B13'].font = Font(bold=True)
ws['A15'] = "TERMS:"
ws['A16'] = "Rate"
ws['B16'] = INTEREST_RATE
ws['B16'].number_format = '0.00%'
ws['A17'] = "Term"
ws['B17'] = f"{LOAN_TERM_YEARS} years"
ws['A18'] = "Monthly P&I"
ws['B18'] = MONTHLY_PAYMENT
ws['B18'].number_format = '$#,##0.00'
ws['A19'] = "Annual Debt Service"
ws['B19'] = '=B18*12'
ws['B19'].number_format = '$#,##0'

# Tab 2: 10-Year Cash Flow
ws = wb.create_sheet("10-Year Cash Flow")
ws['A1'] = "10-YEAR MONTHLY CASH FLOW PROJECTION"
ws['A1'].font = Font(size=14, bold=True)
headers = ['Year', 'Month', 'Rooms', 'Occ%', 'Rent', 'Revenue', 'Expenses', 'NOI', 'Debt Svc', 'Cash Flow', 'DSCR']
for col, header in enumerate(headers, 1):
    ws.cell(3, col, header).font = Font(bold=True)

row = 4
start_month = 0
for year in range(1, 11):
    for month in range(1, 13):
        ws.cell(row, 1, year)
        ws.cell(row, 2, month)
        
        # Rooms ramp
        if start_month < 6:
            rooms = round(24 + (start_month * 7.17))
        else:
            rooms = 67
        ws.cell(row, 3, rooms)
        
        # Occupancy
        if start_month < 6:
            occ = 0.60
        elif start_month < 12:
            occ = 0.70 + ((start_month - 6) / 6) * 0.05
        else:
            occ = 0.75
        ws.cell(row, 4, occ).number_format = '0.0%'
        
        # Rent
        rent = 850 if start_month >= 6 else 852
        ws.cell(row, 5, rent).number_format = '$#,##0'
        
        # Revenue
        ws.cell(row, 6, f'=C{row}*D{row}*E{row}').number_format = '$#,##0'
        
        # Expenses (scale with rooms)
        base_exp = CURRENT_EXPENSES
        exp_per_room = base_exp / CURRENT_AVAILABLE
        ws.cell(row, 7, f'=C{row}*{exp_per_room:.2f}').number_format = '$#,##0'
        
        # NOI
        ws.cell(row, 8, f'=F{row}-G{row}').number_format = '$#,##0'
        
        # Debt Service
        ws.cell(row, 9, MONTHLY_PAYMENT).number_format = '$#,##0'
        
        # Cash Flow
        ws.cell(row, 10, f'=H{row}-I{row}').number_format = '$#,##0'
        
        # DSCR
        ws.cell(row, 11, f'=H{row}/I{row}').number_format = '0.00'
        
        start_month += 1
        row += 1

# Tab 3: Annual Summary
ws = wb.create_sheet("Annual Summary")
ws['A1'] = "ANNUAL SUMMARY"
ws['A1'].font = Font(size=14, bold=True)
headers = ['Year', 'Gross Revenue', 'Operating Exp', 'NOI', 'Debt Service', 'Cash Flow', 'DSCR']
for col, header in enumerate(headers, 1):
    ws.cell(3, col, header).font = Font(bold=True)

for year in range(1, 11):
    row = 3 + year
    start_row = 4 + ((year-1) * 12)
    end_row = start_row + 11
    
    ws.cell(row, 1, year)
    ws.cell(row, 2, f"=SUM('10-Year Cash Flow'!F{start_row}:F{end_row})").number_format = '$#,##0'
    ws.cell(row, 3, f"=SUM('10-Year Cash Flow'!G{start_row}:G{end_row})").number_format = '$#,##0'
    ws.cell(row, 4, f'=B{row}-C{row}').number_format = '$#,##0'
    ws.cell(row, 5, f"=SUM('10-Year Cash Flow'!I{start_row}:I{end_row})").number_format = '$#,##0'
    ws.cell(row, 6, f'=D{row}-E{row}').number_format = '$#,##0'
    ws.cell(row, 7, f'=D{row}/E{row}').number_format = '0.00'

# Tab 4: Debt Service Schedule
ws = wb.create_sheet("Debt Service Schedule")
ws['A1'] = "DEBT SERVICE SCHEDULE (25 Years)"
ws['A1'].font = Font(size=14, bold=True)
headers = ['Month', 'Payment', 'Interest', 'Principal', 'Balance']
for col, header in enumerate(headers, 1):
    ws.cell(3, col, header).font = Font(bold=True)

balance = LOAN_AMOUNT
for month in range(1, n + 1):
    row = 3 + month
    interest = balance * monthly_rate
    principal = MONTHLY_PAYMENT - interest
    balance -= principal
    
    ws.cell(row, 1, month)
    ws.cell(row, 2, MONTHLY_PAYMENT).number_format = '$#,##0.00'
    ws.cell(row, 3, interest).number_format = '$#,##0.00'
    ws.cell(row, 4, principal).number_format = '$#,##0.00'
    ws.cell(row, 5, max(0, balance)).number_format = '$#,##0.00'

# Tab 5: Sources & Uses
ws = wb.create_sheet("Sources & Uses")
ws['A1'] = "SOURCES & USES OF FUNDS"
ws['A1'].font = Font(size=14, bold=True)
ws['A3'] = "SOURCES:"
ws['A3'].font = Font(bold=True)
ws['A4'] = "New Loan"
ws['B4'] = LOAN_AMOUNT
ws['B4'].number_format = '$#,##0'
ws['A5'] = "Total Sources"
ws['B5'] = '=B4'
ws['B5'].number_format = '$#,##0'
ws['B5'].font = Font(bold=True)
ws['A7'] = "USES:"
ws['A7'].font = Font(bold=True)
ws['A8'] = "Existing Debt Payoff"
ws['B8'] = 150000
ws['B8'].number_format = '$#,##0'
ws['A9'] = "Amenities & Jobsite"
ws['B9'] = 100000
ws['B9'].number_format = '$#,##0'
ws['A10'] = "Room Renovation (40 rooms)"
ws['B10'] = 600000
ws['B10'].number_format = '$#,##0'
ws['A11'] = "Total Uses"
ws['B11'] = '=SUM(B8:B10)'
ws['B11'].number_format = '$#,##0'
ws['B11'].font = Font(bold=True)

wb.save('hotel-brendle-loan-model.xlsx')
print("✅ Complete 10-year model built: hotel-brendle-loan-model.xlsx")
print(f"   Sheets: {len(wb.sheetnames)}")
for sheet in wb.sheetnames:
    print(f"   - {sheet}")

