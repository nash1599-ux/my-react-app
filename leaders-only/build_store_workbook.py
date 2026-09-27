#!/usr/bin/env python3
"""Build the leaders-only store workbook. Do not post this to G-Unit chat."""

from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = Path(__file__).resolve().parent / "Opulent_Leaders_Store_Workbook.xlsx"
AS_OF = date(2026, 9, 27)

NAVY = "0F2744"
GOLD = "C9A227"
GREEN = "1F6B4A"
RED = "8B1E1E"
TEAL = "0E4D4D"
SLATE = "1F2933"
WHITE = "FFFFFF"
CREAM = "F7F1DE"
PALE = "F3F6F8"
HOLD = "F4E4C8"
OK = "D7EDE2"
WARN = "F8D7DA"

thin = Border(
    left=Side(style="thin", color="D0D5DD"),
    right=Side(style="thin", color="D0D5DD"),
    top=Side(style="thin", color="D0D5DD"),
    bottom=Side(style="thin", color="D0D5DD"),
)


def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)


def font(color=WHITE, bold=True, size=11):
    return Font(name="Calibri", color=color, bold=bold, size=size)


def apply_widths(ws, widths):
    for col, width in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(col)].width = width


def header_row(ws, row, values, color=NAVY):
    for col, value in enumerate(values, 1):
        cell = ws.cell(row, col, value)
        cell.fill = fill(color)
        cell.font = font()
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin
    ws.row_dimensions[row].height = 22


def style_body(ws, start, end, cols):
    for row in range(start, end + 1):
        ws.row_dimensions[row].height = 18
        for col in range(1, cols + 1):
            cell = ws.cell(row, col)
            cell.border = thin
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            if row % 2 == 0 and cell.fill.fgColor is None or cell.fill.fgColor.rgb in (None, "00000000"):
                if not cell.fill.fgColor or str(cell.fill.fgColor.rgb) in ("00000000", "None"):
                    cell.fill = fill(PALE)


def banner(ws, title, subtitle, cols):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=cols)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=cols)
    a = ws.cell(1, 1, title)
    a.fill = fill(NAVY)
    a.font = font(size=16)
    a.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 28
    b = ws.cell(2, 1, subtitle)
    b.fill = fill(GOLD)
    b.font = font(NAVY, size=11)
    b.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[2].height = 20
    for col in range(1, cols + 1):
        ws.cell(1, col).fill = fill(NAVY)
        ws.cell(2, col).fill = fill(GOLD)


def money_row(ws, row, values, money_cols):
    for col, value in enumerate(values, 1):
        cell = ws.cell(row, col, value)
        cell.border = thin
        if col in money_cols and isinstance(value, (int, float)):
            cell.number_format = '"$"#,##0'
            cell.alignment = Alignment(horizontal="right", vertical="center")
        else:
            cell.alignment = Alignment(vertical="center", wrap_text=True)
        if row % 2 == 0:
            cell.fill = fill(PALE)


def add_cover(wb):
    ws = wb.active
    ws.title = "LEADERS ONLY"
    apply_widths(ws, [28, 28, 28, 28, 28, 28])
    banner(
        ws,
        "OPULENT / TEAM 7  ·  LEADERS ONLY",
        "Soft launch. Do not post in G-Unit chat. Do not show the floor board. As of Sun Sep 27, 2026.",
        6,
    )
    rows = [
        ("Status", "SOFT LAUNCH — Leaders and trainers only"),
        ("Source price file", "/Users/admin/Downloads/Opulent Price List.xlsx  (not on this machine — columns are ready, cash numbers marked FILL FROM OPULENT)"),
        ("Public G-Unit board", "Unchanged. Picture board stays on tagged #G-UNIT closes only."),
        ("Why this book exists", "Catch up Slack, lock Nash + Neika 2-week production, stand up cash-buy store sequences, and move Team 7 reps into store leadership."),
        ("Who sees this", "Store leaders / trainers. Not G-Unit group chat. Not the live picture board."),
        ("Roster move", "Kyron, Rashaad (Shaad), Ish leaving = 3 A-players out. Nate in. Neika pending leadership when COE is down."),
    ]
    header_row(ws, 4, ["Item", "Detail", "", "", "", ""])
    ws.merge_cells("B4:F4")
    for i, (item, detail) in enumerate(rows, 5):
        ws.cell(i, 1, item).fill = fill(SLATE)
        ws.cell(i, 1).font = font()
        ws.merge_cells(start_row=i, start_column=2, end_row=i, end_column=6)
        ws.cell(i, 2, detail)
        ws.cell(i, 2).fill = fill(CREAM if i % 2 else PALE)
        for col in range(1, 7):
            ws.cell(i, col).border = thin
            ws.cell(i, col).alignment = Alignment(wrap_text=True, vertical="center")
        ws.row_dimensions[i].height = 36

    header_row(ws, 12, ["Tab", "What it is", "Action", "", "", ""], color=TEAL)
    ws.merge_cells("B12:C12")
    tabs = [
        ("01 Catch-up Sheet", "G-Unit week of 9/21 through Sunday, tagged vs held", "Use for leaders recap only"),
        ("02 Held / Not Counted", "Saturday Guy, Jordan, Nianna, other teams", "Decide later. Do not dump into G-Unit chat."),
        ("03 Team 7 2-Week", "Nash and Neika production, last two full weeks + prior week", "Coaching baseline"),
        ("04 Cash Buy Method", "Floor sequence for buying phones with cash", "Train Team 7 leaders on this first"),
        ("05 iPhone 17 / 18", "New SKUs added to the buy/sell grid", "Fill Opulent cash numbers"),
        ("06 Wearables + Play", "Meta Glasses, PlayStation, Quest 2", "Fill Opulent cash numbers"),
        ("07 MacBook AT&T Pitch", "Store sequence + talk track", "Role-play with Nash and Neika"),
        ("08 Store Sequences", "Leader-only floor path, from greet to coach sit-in", "Soft launch checklist"),
        ("09 Leadership Bench", "Who is leaving, who is being built", "Nate A-player. Neika pending COE."),
    ]
    for i, (tab, what, action) in enumerate(tabs, 13):
        ws.cell(i, 1, tab)
        ws.merge_cells(start_row=i, start_column=2, end_row=i, end_column=3)
        ws.cell(i, 2, what)
        ws.merge_cells(start_row=i, start_column=4, end_row=i, end_column=6)
        ws.cell(i, 4, action)
        for col in range(1, 7):
            ws.cell(i, col).border = thin
            ws.cell(i, col).alignment = Alignment(wrap_text=True, vertical="center")
            if i % 2 == 0:
                ws.cell(i, col).fill = fill(PALE)
        ws.row_dimensions[i].height = 24
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = GOLD


def add_catchup(wb):
    ws = wb.create_sheet("01 Catch-up Sheet")
    apply_widths(ws, [22, 12, 10, 10, 10, 10, 10, 10, 10, 12, 12, 14, 36])
    banner(
        ws,
        "G-UNIT CATCH-UP  ·  WEEK OF MON SEP 21 – SUN SEP 27, 2026",
        "Tagged #G-UNIT only. Slack private channels are not readable from here. This is the live log through Sunday 12:41 AM UTC. Public picture board is still Friday 20/12.",
        13,
    )
    header_row(
        ws,
        4,
        ["Rep", "Role", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Apps", "CX", "CX%", "Notes"],
    )
    rows = [
        ["Nate", "A-player in", 0, 0, 0, 2, 6, 0, 0, 8, 4, 0.50, "Thu Cx1 / 2 phones. Fri Cx2 / 3 Samsungs then Cx1 / 2x 18 Pro + 17e."],
        ["Steveo Ramos (Ish)", "Leaving — A", 0, 0, 4, 1, 1, 0, 0, 6, 4, 0.67, "Ismael counts on Steveo. Two Wed, Thu 18 Pro Prem, Fri 18 Pro Prem."],
        ["Matthew Grant", "Stay", 0, 0, 2, 0, 1, 0, 0, 3, 2, 0.67, "Wed +2 / +1 CX. Fri Cx1 / NL1 late close."],
        ["Guy Lesperance", "Stay", 0, 0, 0, 0, 2, 0, 0, 2, 1, 0.50, "Fri tagged +2 / +1 CX. Sat Cx2 is HELD — no #G-UNIT tag."],
        ["Kyron Tisdale", "Leaving — A", 0, 0, 0, 1, 0, 0, 0, 1, 1, 1.00, "Thu ice-breaker +1 / +1 CX."],
        ["Steve Nash", "Team 7 build", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "No tagged #G-UNIT or #Team7 close this week."],
        ["Neika", "Team 7 / pending COE", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "No tagged close this week. Leadership sits until COE is down."],
        ["Shaad Hyppolite", "Leaving — A", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "0 this week. CC #3 never counted."],
        ["Mackenzie Faith", "Stay", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "0 this week."],
        ["Matthew ²", "Stay", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "0 this week."],
        ["Jordan #23", "Stay / other tag", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Thu 18 PM untagged and Fri/Sat #precisionmanagement held out."],
        ["Ashunte Reyes", "Stay", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "0 this week."],
        ["Judah Rodgers", "Stay", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "0 this week."],
    ]
    for i, row in enumerate(rows, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            if col == 12 and isinstance(value, float):
                cell.number_format = "0%"
            if row[0] in ("Steve Nash", "Neika"):
                cell.fill = fill("D6EAF5")
            elif "Leaving" in str(row[1]):
                cell.fill = fill(WARN)
            elif row[0] == "Nate":
                cell.fill = fill(OK)
            elif i % 2 == 0:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 32

    ws.cell(19, 1, "TEAM TAGGED")
    ws.cell(19, 10, 20)
    ws.cell(19, 11, 12)
    ws.cell(19, 12, 0.6)
    ws.cell(19, 12).number_format = "0%"
    ws.cell(19, 13, "DG 20/12. Goal already cleared Friday. NL left still 37 (not refreshed).")
    for col in range(1, 14):
        ws.cell(19, col).fill = fill(GREEN)
        ws.cell(19, col).font = font()
        ws.cell(19, col).border = thin

    ws.cell(21, 1, "If Saturday Guy +2 / +2 CX is later approved")
    ws.cell(21, 10, 22)
    ws.cell(21, 11, 14)
    ws.cell(21, 13, "Do not add until you say the tag rule is waived. Not on the public board.")
    for col in range(1, 14):
        ws.cell(21, col).fill = fill(HOLD)
        ws.cell(21, col).border = thin
        ws.cell(21, col).font = Font(name="Calibri", bold=True, color=NAVY)

    ws.freeze_panes = "A5"
    ws.auto_filter.ref = "A4:M17"
    ws.sheet_properties.tabColor = GREEN

    chart = BarChart()
    chart.title = "Tagged apps this week"
    chart.y_axis.title = "Apps"
    chart.style = 10
    data = Reference(ws, min_col=10, min_row=4, max_row=9)
    cats = Reference(ws, min_col=1, min_row=5, max_row=9)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.shape = 4
    chart.height = 8
    chart.width = 15
    ws.add_chart(chart, "A23")


def add_held(wb):
    ws = wb.create_sheet("02 Held - Not Counted")
    apply_widths(ws, [18, 14, 16, 14, 12, 12, 18, 50])
    banner(
        ws,
        "HELD OUT OF THE G-UNIT SHEET",
        "Caught in Slack but not written to the public board. Leaders copy only.",
        8,
    )
    header_row(ws, 4, ["When", "Name", "Tag", "Roster?", "Apps", "CX", "Decision", "What posted"])
    held = [
        ["Fri 9/25", "Jordan #23", "#precisionmanagement", "Yes", 1, 1, "HOLD — wrong tag", "18 Pro Max. S/O Precision, not #G-UNIT."],
        ["Fri 9/25", "Coivon", "#G-UNIT", "No", 1, 1, "HOLD — not on roster", "17e. Tagged G-Unit but not a G-Unit row."],
        ["Fri 9/25", "Guy", "#you the goat", "Yes", None, None, "HOLD — no G-UNIT tag", "Close posted without #G-UNIT."],
        ["Sat 9/26 ~1:50p", "Guy Lesperance", "S/O G-UNIT only", "Yes", 2, 2, "HOLD — no #G-UNIT hashtag", "Cx2 / 2 phones. iPhone 17e + Z Fold 8. Strong write-up, missing tag."],
        ["Sat 9/26", "Jordan #23", "#precisionmanagement", "Yes", 1, 1, "HOLD — wrong tag", "S/O G-Unit in text, hashtag is Precision. Cx1 / NL1."],
        ["Sat 9/26 ~3:00p", "Nianna", "#G-UNIT + #Team7", "No", 2, 1, "TEAM 7 note only", "2x iPhone 18 Pro. Not Nash. Not Neika. Not a G-Unit roster row."],
        ["Sat 9/26", "Jamaal Brown", "none", "No", 1, 1, "HOLD — not roster", "17 Pro Max. No #G-UNIT tag."],
        ["Sat 9/26", "Leandro", "other team", "No", 9, None, "Ignore", "9x iPhone dump. Not G-Unit."],
        ["Sat 9/26", "La Cabrita", "#LasCabritas", "No", None, None, "Ignore", "8 NL and 3 NL posts."],
        ["Sat 9/26", "David Rodriguez", "#Precision", "No", None, None, "Ignore", "Other team."],
        ["Sat 9/26", "Analdo", "#Precision", "No", None, None, "Ignore", "Other team."],
        ["Sat 9/26", "CBk", "#OLYMPIANS", "No", None, None, "Ignore", "Other team."],
        ["Sat 9/26", "Chasity / Josiah / Adriana", "#JL", "No", None, None, "Ignore", "JL closes."],
        ["Sat 9/26", "Jada", "#saltyspitoon", "No", None, None, "Ignore", "Other team."],
    ]
    for i, row in enumerate(held, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value if value is not None else "—")
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if "HOLD" in str(row[6]):
                cell.fill = fill(HOLD)
            elif "TEAM 7" in str(row[6]):
                cell.fill = fill("D6EAF5")
            else:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 28
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = "B45309"


def add_team7(wb):
    ws = wb.create_sheet("03 Team 7 2-Week")
    apply_widths(ws, [22, 18, 14, 12, 12, 14, 14, 16, 50])
    banner(
        ws,
        "TEAM 7  ·  NASH + NEIKA PRODUCTION",
        "Past 2 weeks = Mon 9/14 and Mon 9/21. Prior week 9/7 shown so the drop is visible. Slack #Team7 volume besides Nianna is not readable from private channels.",
        9,
    )
    header_row(
        ws,
        4,
        ["Rep", "Week start", "Window", "Apps", "CX", "Known devices", "Last week", "Prev week", "Notes"],
    )
    rows = [
        ["Steve Nash", "2026-09-07", "Prior week (for trend)", 4, 2, "Thu live +4", 5, 9, "On the Thu 9/10 live board. That 4 is the last Nash production we have."],
        ["Steve Nash", "2026-09-14", "Past week 2", 0, 0, "—", 0, 4, "G-Unit tagged sheet shows 0. No Slack catch we can read."],
        ["Steve Nash", "2026-09-21", "Past week 1 / this week", 0, 0, "—", 0, 0, "No #G-UNIT or #Team7 close through Sunday morning."],
        ["Neika", "2026-09-07", "Prior week (for trend)", 4, 2, "Galaxy S25 + iPhone 17 PM", 0, 0, "First week on the board. Live call: CX2 / NL3 S25 + NL4 17 PM."],
        ["Neika", "2026-09-14", "Past week 2", 0, 0, "—", 0, 4, "G-Unit tagged sheet shows 0."],
        ["Neika", "2026-09-21", "Past week 1 / this week", 0, 0, "—", 0, 0, "No tagged close. Leadership still pending COE."],
    ]
    for i, row in enumerate(rows, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if row[2].startswith("Past week"):
                cell.fill = fill("D6EAF5")
            else:
                cell.fill = fill(CREAM)
        ws.row_dimensions[i].height = 30

    header_row(ws, 12, ["Scorecard — last 2 weeks only (9/14 + 9/21)", "", "", "", "", "", "", "", ""], color=TEAL)
    header_row(ws, 13, ["Rep", "2-wk apps", "2-wk CX", "Avg / week", "Trend vs 9/7", "Leadership read", "", "", ""])
    score = [
        ["Steve Nash", 0, 0, 0, "4 → 0 → 0", "Volume gone cold. Needs a leader sit-in and a cash-buy + 17/18 script this week, not a G-Unit hype post."],
        ["Neika", 0, 0, 0, "4 → 0 → 0", "Same 2-week zero. Keep her on the leadership track only after COE is down. Use the store sequence, not the G-Unit board."],
        ["Nate (compare)", 8, 4, 8, "7 prior, then 8 this week", "The one A-player added. He is the floor example while Kyron / Shaad / Ish walk."],
        ["Nianna (not Nash/Neika)", 2, 1, 2, "Sat 2x 18 Pro #Team7", "Only #Team7 close we caught this weekend. Do not mix her onto Nash/Neika rows."],
    ]
    for i, row in enumerate(score, 14):
        ws.merge_cells(start_row=i, start_column=6, end_row=i, end_column=9)
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if row[0].startswith("Nate"):
                cell.fill = fill(OK)
            elif row[0].startswith("Nianna"):
                cell.fill = fill(PALE)
            else:
                cell.fill = fill(HOLD)
        ws.row_dimensions[i].height = 36

    ws.cell(19, 1, "2-week Team 7 (Nash+Neika) apps")
    ws.cell(19, 2, 0)
    ws.cell(19, 3, "2-week Team 7 (Nash+Neika) CX")
    ws.cell(19, 4, 0)
    ws.cell(19, 5, "Honest read: last two weeks are a blank. The 4/4 week of 9/7 is the last real production. Soft-launch the store sequence on them first.")
    ws.merge_cells("E19:I19")
    for col in range(1, 10):
        ws.cell(19, col).fill = fill(NAVY)
        ws.cell(19, col).font = font()
        ws.cell(19, col).border = thin
    ws.row_dimensions[19].height = 32
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = "0E7490"


def add_cash_method(wb):
    ws = wb.create_sheet("04 Cash Buy Method")
    apply_widths(ws, [10, 28, 42, 42, 28])
    banner(
        ws,
        "BUY PHONE CASH METHOD  ·  LEADERS ONLY",
        "Soft launch store sequence. Customer walks with cash in hand for the old device. We walk them to a 17/18, glasses, PlayStation, Quest 2, or MacBook.",
        5,
    )
    header_row(ws, 4, ["Step", "Name", "Leader does", "Rep says / does", "Fail if"])
    steps = [
        ["1", "Lock the why", "Stand in on first 5 deals. Do not send this to G-Unit chat.", "What is the phone actually doing for you right now — and what is broken?", "Jumping to price."],
        ["2", "Inspect before you quote", "Grade A / B / C / dead. Photo the device.", "IMEI, iCloud off, carrier lock, battery, glass, Face ID, charge port.", "Quoting from memory."],
        ["3", "Cash offer from the sheet", "Rep cannot go below floor without a leader.", "I can put cash in your hand today off this grade. Then we put you in the new device.", "Negotiating off-sheet."],
        ["4", "Park the cash against the new sale", "Show the math on paper.", "Cash for your old phone covers the start. New line / upgrade carries the rest.", "Handing cash and letting them walk."],
        ["5", "Pick the next device", "Force a fork: 17/18, glasses, PS, Quest, MacBook.", "If it is a daily driver → 17 or 18. Content / work → MacBook. Fun / kids → PlayStation or Quest.", "Selling only what they asked for."],
        ["6", "AT&T paper", "Leader checks credit path and COE.", "Same account, one bill, installment + unlimited + hotspot if they take the MacBook.", "Skipping protection and attach."],
        ["7", "Attach + book it", "Coach the close, then let the rep own the handshake.", "Case, glass, protection, accessory. Write the buy and the new sale on the store sheet, not G-Unit.", "Posting the buy in G-Unit."],
        ["8", "Leader recap", "2-minute film session.", "What grade, what cash, what they left with, what you missed.", "No notes."],
    ]
    for i, row in enumerate(steps, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if col == 1:
                cell.fill = fill(GOLD)
                cell.font = font(NAVY)
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif i % 2 == 0:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 48

    header_row(ws, 14, ["Rule", "Detail", "", "", ""], color=RED)
    ws.merge_cells("B14:E14")
    rules = [
        "Do not tell G-Unit. This is a leaders soft launch.",
        "Cash number comes from the Opulent list. If the cell says FILL, do not guess on the floor.",
        "No buy if iCloud is on, device is stolen/blocked, or IMEI does not check clean.",
        "Floor is floor. Only a leader can go under, and they write why on this book.",
        "Cash buy is not a close until a new device or attach is at least offered. Preferred: they leave with 17/18, glasses, PS, Quest, or MacBook.",
        "Neika does not run this unsupervised until COE is down.",
        "Kyron / Shaad / Ish are leaving — do not build this sequence around them.",
    ]
    for i, rule in enumerate(rules, 15):
        ws.merge_cells(start_row=i, start_column=1, end_row=i, end_column=5)
        cell = ws.cell(i, 1, rule)
        cell.border = thin
        cell.fill = fill(WARN if i % 2 else CREAM)
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        ws.row_dimensions[i].height = 22
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = RED


def add_iphone_grid(wb):
    ws = wb.create_sheet("05 iPhone 17 and 18")
    apply_widths(ws, [22, 16, 14, 14, 14, 14, 14, 16, 16, 28])
    banner(
        ws,
        "IPHONE 17 + 18 ADDED TO THE BUY / SELL GRID",
        "Cash cells are empty on purpose. Paste from Opulent Price List.xlsx. Do not invent a floor.",
        10,
    )
    header_row(
        ws,
        4,
        [
            "Device",
            "Storage",
            "Buy A",
            "Buy B",
            "Buy C",
            "No buy / parts",
            "Flip / sell target",
            "Margin A",
            "AT&T path",
            "Source",
        ],
    )
    devices = [
        ("iPhone 17e", ["128", "256", "512"]),
        ("iPhone 17", ["256", "512"]),
        ("iPhone 17 Plus", ["256", "512"]),
        ("iPhone 17 Pro", ["256", "512", "1TB"]),
        ("iPhone 17 Pro Max", ["256", "512", "1TB"]),
        ("iPhone 18", ["256", "512"]),
        ("iPhone 18 Plus", ["256", "512"]),
        ("iPhone 18 Pro", ["256", "512", "1TB"]),
        ("iPhone 18 Pro Max", ["256", "512", "1TB"]),
        ("iPhone 18 Pro Prem", ["256", "512", "1TB"]),
    ]
    row = 5
    for name, storages in devices:
        for storage in storages:
            path = "Upgrade / new line. Cash covers start."
            if "Prem" in name or "Pro" in name:
                path = "Lead with Pro. Cash buy + installment. Protection required."
            values = [
                name,
                storage,
                None,
                None,
                None,
                None,
                None,
                f"=IF(OR(C{row}=\"\",G{row}=\"\"),\"\",G{row}-C{row})",
                path,
                "FILL FROM OPULENT",
            ]
            for col, value in enumerate(values, 1):
                cell = ws.cell(row, col, value)
                cell.border = thin
                if col in (3, 4, 5, 6, 7):
                    cell.number_format = '"$"#,##0'
                    cell.fill = fill("FFF3CD")
                elif col == 8:
                    cell.number_format = '"$"#,##0'
                    cell.fill = fill(OK)
                elif "18" in name:
                    cell.fill = fill("E0F2FE")
                else:
                    cell.fill = fill(PALE)
                cell.alignment = Alignment(vertical="center")
            row += 1

    ws.cell(row + 1, 1, "Yellow cash cells = paste Opulent numbers. Green margin calculates from Buy A vs flip target.")
    ws.merge_cells(start_row=row + 1, start_column=1, end_row=row + 1, end_column=10)
    ws.cell(row + 1, 1).font = Font(name="Calibri", italic=True, color=NAVY)
    note = row + 3
    header_row(ws, note, ["How to paste from the Mac file", "", "", "", "", "", "", "", "", ""], color=TEAL)
    ws.merge_cells(start_row=note + 1, start_column=1, end_row=note + 3, end_column=10)
    ws.cell(
        note + 1,
        1,
        "The file /Users/admin/Downloads/Opulent Price List.xlsx is on the store Mac, not this repo. "
        "Open it, copy the iPhone 17 and 18 cash columns, paste into Buy A/B/C here. "
        "If a model is missing on Opulent, add the row on both sheets so leaders stay on one grid. "
        "17e / 18 Pro / 18 Pro Prem are already moving on the G-Unit floor — those three are first fill.",
    )
    ws.cell(note + 1, 1).alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[note + 1].height = 60
    dv = DataValidation(type="list", formula1='"FILL FROM OPULENT,LOCKED,LEADER OVERRIDE"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add("J5:J40")
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = "2563EB"


def add_other_sku(wb):
    ws = wb.create_sheet("06 Wearables + Play")
    apply_widths(ws, [24, 20, 14, 14, 14, 16, 16, 36])
    banner(
        ws,
        "META GLASSES · PLAYSTATION · QUEST 2  ADDED",
        "Same rule: yellow = fill from Opulent. These are the add-on exits after a cash-buy phone.",
        8,
    )
    header_row(ws, 4, ["Category", "SKU", "Buy / take-in", "Sell / bundle", "Margin", "When to pitch", "Attach", "Talk track"])
    skus = [
        ["Meta Glasses", "Ray-Ban Meta (std)", None, None, "=IF(OR(C5=\"\",D5=\"\"),\"\",D5-C5)", "Content / social customer after phone buy", "Case + extra charging", "You already shoot with the phone. These stay on your face so the phone stays in the pocket."],
        ["Meta Glasses", "Ray-Ban Meta (wayfarer / headliner)", None, None, "=IF(OR(C6=\"\",D6=\"\"),\"\",D6-C6)", "Fashion + creator", "Prescription note if needed", "Same Meta AI / capture pitch. Do not discount below sheet."],
        ["PlayStation", "PS5 Disc", None, None, "=IF(OR(C7=\"\",D7=\"\"),\"\",D7-C7)", "Kids / household after a family phone deal", "Extra controller + game", "Cash from the old phones covers the console. Phones stay on AT&T."],
        ["PlayStation", "PS5 Digital", None, None, "=IF(OR(C8=\"\",D8=\"\"),\"\",D8-C8)", "Budget console exit", "Digital card / extra pad", "Cheaper door. Upsell disc only if they own physical games."],
        ["PlayStation", "PS5 Pro", None, None, "=IF(OR(C9=\"\",D9=\"\"),\"\",D9-C9)", "Performance household", "Extra pad + headset", "Only if the cash-buy stack covers the jump."],
        ["Quest", "Meta Quest 2 128", None, None, "=IF(OR(C10=\"\",D10=\"\"),\"\",D10-C10)", "First VR, kids, fitness", "Strap + link cable", "Old phones become cash. Quest is the fun add they will say yes to today."],
        ["Quest", "Meta Quest 2 256", None, None, "=IF(OR(C11=\"\",D11=\"\"),\"\",D11-C11)", "Same, more storage", "Strap + charging dock", "Do not sell Quest 2 as new-gen. Sell it as the in-stock cash-bundle headset."],
    ]
    for i, row in enumerate(skus, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if col in (3, 4):
                cell.number_format = '"$"#,##0'
                cell.fill = fill("FFF3CD")
            elif col == 5:
                cell.number_format = '"$"#,##0'
                cell.fill = fill(OK)
            elif i % 2 == 0:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 36
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = "7C3AED"


def add_macbook(wb):
    ws = wb.create_sheet("07 MacBook AT&T Pitch")
    apply_widths(ws, [8, 26, 50, 40])
    banner(
        ws,
        "AT&T PITCH FOR MACBOOK  ·  LEADERS ROLE-PLAY",
        "No invented promo dollars. Use today's AT&T installment / trade / wireless attach from the store system. This is the talk track and sequence.",
        4,
    )
    header_row(ws, 4, ["#", "Beat", "What the leader trains", "Rep line"])
    beats = [
        ["1", "Spot it", "Work bag, school kid, 'my laptop is slow', content customer, or anyone who just sold us a phone for cash.", "You already put cash in your pocket on the old phone. Let's put the work machine on the same AT&T bill."],
        ["2", "One bill", "Wireless + MacBook installment. Do not split them into two mental purchases.", "Phone, hotspot, and MacBook hit one AT&T statement. You are not opening a new random account."],
        ["3", "Cash covers the ugly part", "Use the phone buy as the down. That is the whole method.", "The cash from the iPhone is the start. AT&T carries the MacBook monthly."],
        ["4", "Need, not spec", "School / work / editing. Then pick Air vs Pro from stock.", "What do you actually open it for — papers, work, or video? That picks Air or Pro."],
        ["5", "Hotspot attach", "If they take the MacBook, offer the line that feeds it.", "The MacBook is only as good as the connection. We keep you on unlimited and a hotspot that travels."],
        ["6", "Trade the dead laptop", "If they have an old Mac / Windows brick, take it in on the same visit.", "That old laptop is sitting in a bag. We will look it up on the same Opulent sheet."],
        ["7", "Protection + Apple path", "Do not leave a MacBook naked. Leader checks what AT&T will paper today.", "We wrap protection today so a drop does not wipe the cash you just made."],
        ["8", "Close math on paper", "Write: cash-buy phones + leftover + monthly. No mystery.", "Here is cash in. Here is what leaves with you. Here is the monthly. Yes or we adjust the device, not the process."],
        ["9", "If they stall", "Do not discount the MacBook off-sheet. Change the mix: Air instead of Pro, or park a Quest / glasses instead.", "If Pro is heavy this week, Air still gets you off that dying laptop. We can revisit Pro after the next phone buy."],
        ["10", "Book it off G-Unit", "Write the MacBook on this leaders sheet and the store system. Do not hype it in G-Unit yet.", "This is a store sequence close, not a G-Unit picture-board close unless you later say so."],
    ]
    for i, row in enumerate(beats, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if col == 1:
                cell.fill = fill(GOLD)
                cell.font = font(NAVY)
            elif i % 2 == 0:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 40

    header_row(ws, 16, ["MacBook row to add on the price sheet", "SKU", "Buy / trade", "Sell / bundle"], color=TEAL)
    macs = [
        ["Add", "MacBook Air 13 (current)", None, None],
        ["Add", "MacBook Air 15 (current)", None, None],
        ["Add", "MacBook Pro 14", None, None],
        ["Add", "MacBook Pro 16", None, None],
    ]
    for i, row in enumerate(macs, 17):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            if col in (3, 4):
                cell.number_format = '"$"#,##0'
                cell.fill = fill("FFF3CD")
            else:
                cell.fill = fill(PALE)
    ws.merge_cells("A22:D24")
    ws.cell(
        22,
        1,
        "Pitch rule: AT&T numbers come from today's POS / offer screen, not this workbook. "
        "Leaders fill the yellow cells from Opulent after they open the Mac file. "
        "Nash and Neika role-play beats 1–8 before they run it on a real customer. "
        "Neika still needs COE down before she is marked leader on this path.",
    )
    ws.cell(22, 1).alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[22].height = 48
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = "111827"


def add_sequences(wb):
    ws = wb.create_sheet("08 Store Sequences")
    apply_widths(ws, [16, 22, 22, 22, 22, 40])
    banner(
        ws,
        "SOFT-LAUNCH STORE SEQUENCES  ·  TEAM 7 → LEADERSHIP",
        "Purpose: turn Team 7 sales reps into people who can run the store, manage, and train. Not a G-Unit announcement.",
        6,
    )
    header_row(ws, 4, ["Sequence", "Who runs it", "Who shadows", "When it is live", "G-Unit visibility", "Success look"])
    seq = [
        ["Cash-buy phone", "Leader + Nate", "Nash, then Neika", "Soft launch now", "Hidden", "Old phone bought on sheet. Customer does not leave empty-handed."],
        ["17 / 18 exit", "Nate example", "Nash", "Soft launch now", "Hidden unless they later tag #G-UNIT", "Every cash-buy is offered a 17 or 18 before they leave."],
        ["Glasses / PS / Quest", "Leader", "Nash + Neika", "After first 5 cash-buys", "Hidden", "Add-on attached on at least 1 of 3 cash-buys."],
        ["MacBook AT&T", "Leader only first", "Neika after COE", "After role-play", "Hidden", "One-bill pitch delivered without made-up promo numbers."],
        ["Floor manage", "Leader", "Nash", "This week", "Hidden", "Nash can run a 2-hour block: greet, inspect, quote, handoff."],
        ["Train a rep", "Nash with leader in ear", "Neika watches", "After Nash hits a live cash-buy", "Hidden", "Nash can recap a deal in 2 minutes using this book."],
        ["COE gate", "Neika", "Leader", "When COE is down", "Hidden", "Neika moves from pending to leadership bench. Not before."],
    ]
    for i, row in enumerate(seq, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if value == "Hidden":
                cell.fill = fill(HOLD)
            elif i % 2 == 0:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 36
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = GOLD


def add_bench(wb):
    ws = wb.create_sheet("09 Leadership Bench")
    apply_widths(ws, [22, 16, 16, 14, 14, 14, 40])
    banner(
        ws,
        "G-UNIT A-PLAYER EXIT  ·  TEAM 7 BENCH",
        "3 A-players leaving. 1 A-player added. 1 pending. Do not announce this on the picture board.",
        7,
    )
    header_row(ws, 4, ["Name", "Seat", "Move", "This week apps", "This week CX", "Last 2-wk apps", "Read"])
    rows = [
        ["Kyron Tisdale", "G-Unit A", "LEAVING", 1, 1, 1, "Was 15 the Sunday before 9/7. Ice-breaker only this week. Do not build training on him."],
        ["Rashaad / Shaad Hyppolite", "G-Unit A", "LEAVING", 0, 0, 0, "2 on week of 9/7 after Sat late post. 0 since. CC #3 never counted."],
        ["Ish / Ismael / Steveo", "G-Unit A", "LEAVING", 6, 4, 10, "Still producing (6/4 this week, 4 last week). Leaving anyway. His rows stay Steveo on the public board until you say otherwise."],
        ["Nate", "G-Unit A", "ADDED", 8, 4, 8, "The replacement A-player. 7 the week of 9/7, 8 this week. He is the live model for Team 7."],
        ["Neika", "Team 7", "PENDING LEADER", 0, 0, 0, "4/2 on 9/7 (S25 + 17 PM). 0 the last two weeks. Leadership only after COE is down."],
        ["Steve Nash", "Team 7", "DEVELOP", 0, 0, 0, "4/2 on 9/7. 0 the last two weeks. First trainee on cash-buy + floor manage."],
        ["Nianna", "Team 7 (not bench)", "WATCH", 2, 1, 2, "Only #Team7 tag we caught Sat (2x 18 Pro). Not Nash. Not Neika. Not a leader seat."],
    ]
    for i, row in enumerate(rows, 5):
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if row[2] == "LEAVING":
                cell.fill = fill(WARN)
            elif row[2] == "ADDED":
                cell.fill = fill(OK)
            elif row[2] == "PENDING LEADER":
                cell.fill = fill("FDE68A")
            else:
                cell.fill = fill("D6EAF5")
        ws.row_dimensions[i].height = 40

    ws.cell(13, 1, "Net A-player math")
    ws.cell(13, 2, "−3 + 1 = −2 until Neika clears COE")
    ws.merge_cells("B13:G13")
    ws.cell(13, 1).fill = fill(NAVY)
    ws.cell(13, 1).font = font()
    ws.cell(13, 2).fill = fill(NAVY)
    ws.cell(13, 2).font = font()

    header_row(ws, 15, ["Build order this week", "Owner", "Done when", "", "", "", ""], color=TEAL)
    ws.merge_cells("C15:G15")
    plan = [
        ["1. Keep Nate on the floor as the live close example", "Leader", "Nate keeps writing tagged sales; Team 7 watches the process, not the Slack hype"],
        ["2. Nash runs cash-buy inspect + quote with a leader", "Leader + Nash", "One real buy written on sheet 05/06"],
        ["3. Neika role-plays MacBook + 17/18, no solo COE work", "Leader + Neika", "She can run the 10-beat pitch without inventing AT&T dollars"],
        ["4. Fill yellow Opulent cells from the Mac file", "Leader", "17e, 18 Pro, 18 Pro Prem, glasses, PS5, Quest 2, MacBook Air have numbers"],
        ["5. Flip Neika to leader only after COE is down", "You", "COE complete, then she gets a seat on sheet 08"],
    ]
    for i, row in enumerate(plan, 16):
        ws.merge_cells(start_row=i, start_column=3, end_row=i, end_column=7)
        for col, value in enumerate(row, 1):
            cell = ws.cell(i, col, value)
            cell.border = thin
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if i % 2 == 0:
                cell.fill = fill(PALE)
        ws.row_dimensions[i].height = 28
    ws.freeze_panes = "A5"
    ws.sheet_properties.tabColor = RED


def main():
    wb = Workbook()
    add_cover(wb)
    add_catchup(wb)
    add_held(wb)
    add_team7(wb)
    add_cash_method(wb)
    add_iphone_grid(wb)
    add_other_sku(wb)
    add_macbook(wb)
    add_sequences(wb)
    add_bench(wb)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(f"wrote {OUT} as of {AS_OF.isoformat()}")


if __name__ == "__main__":
    main()
