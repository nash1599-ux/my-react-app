#!/usr/bin/env python3
"""
G-Unit Sales Board -> Google Sheets sync.

Usage (from Cursor Cloud Agent, triggered via @Cursor in Slack):
    python update_gunit_board.py --board-text "<pasted board text>"
    python update_gunit_board.py --board-file board.tsv
    python update_gunit_board.py --dry-run --board-file board.tsv

Accepts either a short Slack paste ("12 Apps | 8 CX") or a full TSV export
of the G-Unit board (week apps, last week, daily running totals, notes,
and the special event log).

Setup required before a live write:
  1. Google Sheets API + Drive API enabled on the GCP project.
  2. Service account JSON stored as a Cursor environment secret.
     Prefer GOOGLE_SERVICE_ACCOUNT_JSON (raw key JSON). Alternatively set
     GOOGLE_APPLICATION_CREDENTIALS to a file path. Never commit the JSON.
  3. Target Google Sheet shared as Editor with the service account email
     (ends in @<project>.iam.gserviceaccount.com).
  4. GUNIT_SHEET_ID set to the spreadsheet ID, or use the default below.

pip install -r requirements-gunit.txt
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import tempfile
from datetime import date
from io import StringIO

# ============================================================
# CONFIG
# ============================================================
SHEET_ID = os.environ.get("GUNIT_SHEET_ID", "1-a64P6SQyTg8Cq3d_uuYOKHCIpZh0uKizTYDi85FjEw")
CREDS_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")
WORKSHEET_NAME = "G-Unit Board"
BLENDED_RATE_DEFAULT = 97.50

# Known nickname -> canonical name aliases. Extend this as new nicknames show up.
ALIASES = {
    "quay": "Jaquay Tyler",
    "quay tyler": "Jaquay Tyler",
    "ky": "Kyron Tisdale",
    "ky. tisdale": "Kyron Tisdale",
    "ky tisdale": "Kyron Tisdale",
    "steve nash": "Nashly Paul",
    "steveo ramos": "Ismael Ramos",
    "steve ramos": "Ismael Ramos",
    "shaad hypolite": "Rashaad Hypolite",
    "jayden": "Jayden Dale",
    "jordan": "Jordan Aguirre",  # confirmed distinct from "Jordan Reeces" - do not merge
}

CX_TIERS = [(9, 100), (7, 75), (5, 50), (4, 30)]
MEDALS = {1: "🥇", 2: "🥈", 3: "🥉"}

SHEETS_SCOPES = (
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
)


# ============================================================
# PARSING
# ============================================================
LINE_RE = re.compile(
    r"(?P<rank>\d+)\.?\s*[\U0001F947\U0001F948\U0001F949]?\s*"
    r"(?P<name>[A-Za-z.'\-\s]+?)\s+"
    r"(?P<apps>\d+)\s*App[s]?\s*\|\s*(?P<cx>\d+)\s*CX"
    r"(?P<tail>.*)",
    re.IGNORECASE,
)

BANNER_RE = re.compile(
    r"DG:\s*(?P<dg_num>\d+)/(?P<dg_den>\d+)\s*\|\s*(?P<nl>\d+)\s*NL LEFT\s*\|\s*(?P<day>.+)",
    re.IGNORECASE,
)

FOLD_RE = re.compile(
    r"add (?:lines|apps|line count) to (?P<target>[A-Za-z.'\-\s]+?)(?:\s*[.|]|$)",
    re.IGNORECASE,
)

DEPARTED_RE = re.compile(
    r"\b(?:left|remove|she left|he left)\b",
    re.IGNORECASE,
)

MEDAL_RE = re.compile(r"[\U0001F947\U0001F948\U0001F949]")
RATE_RE = re.compile(r"\$?\s*([0-9]+(?:\.[0-9]+)?)")


def normalize_name(raw_name: str) -> str:
    key = raw_name.strip().lower()
    return ALIASES.get(key, raw_name.strip())


def strip_medal(raw_name: str) -> str:
    return MEDAL_RE.sub("", raw_name or "").strip()


def looks_like_full_board(text: str) -> bool:
    if "\t" not in text:
        return False
    head = text[:4000].upper().replace("\n", " ")
    return "RANK" in head and (
        "WEEK APPS" in head or "WEEKAPPS" in head or "CX COUNT" in head or "CXCOUNT" in head
    )


def parse_int(value, default=None):
    if value is None:
        return default
    text = str(value).strip().replace(",", "").replace("$", "")
    if text in {"", "-", "n/a", "N/A"}:
        return default
    try:
        return int(float(text))
    except ValueError:
        return default


def parse_float(value, default=None):
    if value is None:
        return default
    text = str(value).strip().replace(",", "").replace("$", "")
    if text in {"", "-", "n/a", "N/A"}:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def empty_row():
    return {
        "rank": None,
        "display_name": "",
        "name": "",
        "apps": 0,
        "cx": 0,
        "cx_pct": "",
        "wow_apps_pct": "",
        "earned": "",
        "last_week_apps": None,
        "last_week_cx": None,
        "prev_week_apps": None,
        "prev_week_cx": None,
        "rolling_avg": None,
        "mon": None,
        "tue": None,
        "wed": None,
        "thu": None,
        "fri": None,
        "tail": "",
        "departed": False,
        "fold_to": None,
        "flags": [],
        "layout": "simple",
    }


def parse_text_board(text: str):
    """Parse a short Slack paste into (banner_info, [rows])."""
    banner_match = BANNER_RE.search(text)
    banner = {"layout": "simple"}
    if banner_match:
        banner.update(
            {
                "dg_num": int(banner_match.group("dg_num")),
                "dg_den": int(banner_match.group("dg_den")),
                "nl_left": int(banner_match.group("nl")),
                "day": banner_match.group("day").strip(),
            }
        )

    rows = []
    for line in text.splitlines():
        match = LINE_RE.search(line)
        if not match:
            continue
        display_name = match.group("name").strip()
        name = normalize_name(display_name)
        apps = int(match.group("apps"))
        cx = int(match.group("cx"))
        tail = (match.group("tail") or "").strip(" -|")
        row = empty_row()
        row.update(
            {
                "display_name": display_name,
                "name": name,
                "apps": apps,
                "cx": cx,
                "tail": tail,
                "departed": bool(DEPARTED_RE.search(tail)),
                "fold_to": normalize_name(FOLD_RE.search(tail).group("target"))
                if FOLD_RE.search(tail)
                else None,
                "flags": [],
            }
        )
        if cx > apps:
            row["flags"].append(
                f"DATA ERROR: CX ({cx}) exceeds Apps ({apps}) - needs correction at source"
            )
        rows.append(row)

    return banner, rows


def _cell(row, index, default=""):
    if index >= len(row):
        return default
    return row[index]


def parse_tsv_board(text: str):
    """Parse a full G-Unit board TSV export into (banner_info, [rows])."""
    table = list(csv.reader(StringIO(text), delimiter="\t"))
    banner = {
        "layout": "full",
        "blended_rate": BLENDED_RATE_DEFAULT,
        "title": "G-UNIT SALES BOARD",
        "notes": [],
        "events": [],
        "team_message": "",
        "event_rule": "",
    }

    for raw in table[:8]:
        first = (_cell(raw, 0) or "").strip()
        banner_match = BANNER_RE.search(first)
        if banner_match:
            banner.update(
                {
                    "dg_num": int(banner_match.group("dg_num")),
                    "dg_den": int(banner_match.group("dg_den")),
                    "nl_left": int(banner_match.group("nl")),
                    "day": banner_match.group("day").strip(),
                }
            )
        if first.upper().startswith("G-UNIT"):
            banner["title"] = first
        if "BLENDED" in first.upper():
            rate_match = RATE_RE.search(_cell(raw, 1) or first)
            if rate_match:
                banner["blended_rate"] = float(rate_match.group(1))

    rows = []
    section = "body"
    event_header_seen = False

    for raw in table:
        first = (_cell(raw, 0) or "").strip()
        second = (_cell(raw, 1) or "").strip()
        joined = " ".join(cell.strip() for cell in raw if str(cell).strip())

        if first.upper() == "NOTES":
            section = "notes"
            continue
        if joined.upper().startswith("SPECIAL EVENT LOG"):
            section = "events"
            event_header_seen = False
            continue
        if first.upper().startswith("RULE:"):
            banner["event_rule"] = first
            section = "done"
            continue
        if joined.upper().startswith("TEAM HAS EARNED"):
            banner["team_message"] = first or joined
            continue

        if section == "notes":
            if first:
                banner["notes"].append(first)
            continue

        if section == "events":
            if not first:
                continue
            if first.lower().startswith("date/day"):
                event_header_seen = True
                continue
            if event_header_seen or first.lower() not in {"date/day"}:
                banner["events"].append(
                    {
                        "date": first,
                        "event_type": _cell(raw, 1).strip(),
                        "multiplier": _cell(raw, 2).strip(),
                        "reps": _cell(raw, 3).strip(),
                        "apps_impacted": _cell(raw, 4).strip(),
                        "cx_before": _cell(raw, 5).strip(),
                        "cx_after": _cell(raw, 6).strip(),
                        "notes": _cell(raw, 7).strip(),
                    }
                )
            continue

        rank = parse_int(first)
        name_cell = second or first
        if second.upper() == "TOTALS" or first.upper() == "TOTALS":
            continue
        if rank is None or not name_cell or name_cell.upper() in {"NAME", "RANK"}:
            continue
        if not str(_cell(raw, 2)).strip() and not str(_cell(raw, 3)).strip():
            continue

        display_name = strip_medal(name_cell)
        apps = parse_int(_cell(raw, 2), 0) or 0
        cx = parse_int(_cell(raw, 3), 0) or 0
        row = empty_row()
        row.update(
            {
                "rank": rank,
                "display_name": display_name,
                "name": normalize_name(display_name),
                "apps": apps,
                "cx": cx,
                "cx_pct": str(_cell(raw, 4)).strip(),
                "wow_apps_pct": str(_cell(raw, 5)).strip(),
                "earned": str(_cell(raw, 6)).strip(),
                "last_week_apps": parse_int(_cell(raw, 7)),
                "last_week_cx": parse_int(_cell(raw, 8)),
                "prev_week_apps": parse_int(_cell(raw, 9)),
                "prev_week_cx": parse_int(_cell(raw, 10)),
                "rolling_avg": parse_float(_cell(raw, 11)),
                "mon": parse_int(_cell(raw, 12)),
                "tue": parse_int(_cell(raw, 13)),
                "wed": parse_int(_cell(raw, 14)),
                "thu": parse_int(_cell(raw, 15)),
                "fri": parse_int(_cell(raw, 16)),
                "layout": "full",
                "flags": [],
            }
        )
        if cx > apps:
            row["flags"].append(
                f"DATA ERROR: CX ({cx}) exceeds Apps ({apps}) - needs correction at source"
            )
        rows.append(row)

    return banner, rows


def parse_board(text: str):
    """Parse Slack text or a full TSV export into (banner_info, [rows])."""
    if looks_like_full_board(text):
        return parse_tsv_board(text)
    return parse_text_board(text)


def tier_bonus(cx: int) -> int:
    for threshold, bonus in CX_TIERS:
        if cx >= threshold:
            return bonus
    return 0


def format_money(amount: float) -> str:
    rounded = int(round(amount))
    return f"${rounded:,}"


def format_wow(this_week, last_week):
    if last_week in (None, 0) and this_week == 0:
        return "-"
    if last_week in (None,):
        return "-"
    if last_week == 0:
        return "▲ new" if this_week else "-"
    change = (this_week - last_week) / last_week * 100
    arrow = "▲" if change > 0 else "▼" if change < 0 else "►"
    return f"{arrow} {change:.0f}%"


def rolling_avg(this_week, last_week, prev_week):
    values = [value for value in (this_week, last_week, prev_week) if value is not None]
    if not values:
        return None
    return round(sum(values) / len(values), 1)


def enrich_row(row, blended_rate=BLENDED_RATE_DEFAULT):
    """Fill derived fields when a short paste did not include them."""
    apps = row["apps"]
    cx = row["cx"]
    row["cx_pct"] = row["cx_pct"] or (f"{(cx / apps * 100):.0f}%" if apps else "0%")
    if not row["earned"]:
        row["earned"] = format_money(apps * blended_rate + tier_bonus(cx))
    if not row["wow_apps_pct"]:
        row["wow_apps_pct"] = format_wow(apps, row["last_week_apps"])
    if row["rolling_avg"] is None:
        row["rolling_avg"] = rolling_avg(apps, row["last_week_apps"], row["prev_week_apps"])
    return row


# ============================================================
# VALIDATION AGAINST PRIOR SHEET STATE
# ============================================================
def previous_for_row(row, previous_by_name):
    return previous_by_name.get(row["name"]) or previous_by_name.get(row.get("display_name", ""))


def validate_against_previous(rows, previous_by_name):
    """RULE 2: CX Count can never decrease within an open week.

    Returns a list of correction-needed flags; does not silently fix them.
    """
    corrections = []
    for row in rows:
        prev = previous_for_row(row, previous_by_name)
        if prev is not None and row["cx"] < prev.get("cx", 0):
            corrections.append(
                f"{row.get('display_name') or row['name']}: CX dropped from {prev['cx']} to {row['cx']} - "
                f"cumulative CX should never decrease. Flagged, not auto-corrected."
            )
    return corrections


def apply_departures_and_folds(rows):
    """RULE 4: handle departures - either drop, or fold into a named mentor."""
    by_name = {row["name"]: row for row in rows}
    by_display = {row.get("display_name", ""): row for row in rows}
    final_rows = []
    log_entries = []

    for row in rows:
        if row["departed"] and row["fold_to"]:
            target = by_name.get(row["fold_to"]) or by_display.get(row["fold_to"])
            if target:
                target["apps"] += row["apps"]
                target["cx"] += row["cx"]
                log_entries.append(
                    f"Folded {row['display_name'] or row['name']}'s production "
                    f"({row['apps']} apps / {row['cx']} cx) "
                    f"into {row['fold_to']} - departure with credit reassignment."
                )
            else:
                log_entries.append(
                    f"Removed {row['display_name'] or row['name']} from roster - departed, fold target "
                    f"'{row['fold_to']}' was not on the board."
                )
            continue
        if row["departed"]:
            log_entries.append(
                f"Removed {row['display_name'] or row['name']} from roster - departed, no fold-in specified."
            )
            continue
        final_rows.append(row)

    return final_rows, log_entries


def rank_rows(rows, blended_rate=BLENDED_RATE_DEFAULT):
    if rows and all(row.get("rank") for row in rows):
        ranked = sorted(rows, key=lambda row: (row["rank"], -(row["apps"]), row["name"]))
        use_existing_rank = True
    else:
        ranked = sorted(rows, key=lambda row: (-row["apps"], row["name"]))
        use_existing_rank = False

    table = []
    for index, row in enumerate(ranked, start=1):
        enrich_row(row, blended_rate)
        rank = row["rank"] if use_existing_rank else index
        table.append(
            {
                "rank": rank,
                "medal": MEDALS.get(rank, ""),
                "display_name": row.get("display_name") or row["name"],
                "name": row["name"],
                "apps": row["apps"],
                "cx": row["cx"],
                "cx_pct": row["cx_pct"],
                "wow_apps_pct": row["wow_apps_pct"],
                "earned": row["earned"],
                "tier_bonus": tier_bonus(row["cx"]),
                "last_week_apps": row.get("last_week_apps"),
                "last_week_cx": row.get("last_week_cx"),
                "prev_week_apps": row.get("prev_week_apps"),
                "prev_week_cx": row.get("prev_week_cx"),
                "rolling_avg": row.get("rolling_avg"),
                "mon": row.get("mon"),
                "tue": row.get("tue"),
                "wed": row.get("wed"),
                "thu": row.get("thu"),
                "fri": row.get("fri"),
                "notes": "; ".join(row["flags"]) if row["flags"] else "",
                "layout": row.get("layout", "simple"),
            }
        )
    return table


# ============================================================
# GOOGLE SHEETS I/O
# ============================================================
def resolve_creds_path():
    """Return a credentials file path, materializing JSON from env if needed."""
    raw_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    if raw_json:
        parsed = json.loads(raw_json)
        handle = tempfile.NamedTemporaryFile(
            mode="w",
            prefix="gunit-sa-",
            suffix=".json",
            delete=False,
        )
        json.dump(parsed, handle)
        handle.close()
        return handle.name

    if os.path.isfile(CREDS_PATH):
        return CREDS_PATH

    raise FileNotFoundError(
        "Google service account credentials were not found. Set "
        "GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON secret) or "
        "GOOGLE_APPLICATION_CREDENTIALS (path to the key file), and share "
        f"the spreadsheet with the service account email."
    )


def get_worksheet():
    import gspread
    from google.oauth2.service_account import Credentials

    creds = Credentials.from_service_account_file(resolve_creds_path(), scopes=list(SHEETS_SCOPES))
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SHEET_ID)
    try:
        return sheet.worksheet(WORKSHEET_NAME)
    except gspread.WorksheetNotFound:
        return sheet.add_worksheet(title=WORKSHEET_NAME, rows=120, cols=18)


def read_previous_state(ws):
    """Returns {name: {apps, cx}} from either the simple or full board layout."""
    try:
        values = ws.get_all_values()
    except Exception:
        return {}

    previous = {}
    for raw in values:
        if len(raw) < 4:
            continue
        if parse_int(raw[0]) is None:
            continue
        display_name = strip_medal(raw[1])
        if not display_name or display_name.upper() == "TOTALS":
            continue
        canonical = normalize_name(display_name)
        try:
            state = {
                "apps": parse_int(raw[2], 0) or 0,
                "cx": parse_int(raw[3], 0) or 0,
            }
        except (TypeError, ValueError):
            continue
        previous[canonical] = state
        previous[display_name] = state
    return previous


def _blank(value):
    return "" if value is None else value


def build_full_sheet(banner, rows, event_log_entries):
    """Build the visual G-Unit board as a 2D array for Sheets."""
    blended = banner.get("blended_rate", BLENDED_RATE_DEFAULT)
    table = rank_rows(rows, blended)
    day = banner.get("day", "")
    dg = (
        f"DG: {banner['dg_num']}/{banner['dg_den']}   |   {banner['nl_left']} NL LEFT   |   {day}"
        if banner.get("dg_num") is not None
        else day
    )

    data = [
        [banner.get("title", "G-UNIT SALES BOARD")],
        [dg],
        [],
        ["Blended $/line (ESTIMATE)", format_money(blended) if isinstance(blended, (int, float)) else blended],
        [],
        [
            "RANK",
            "NAME",
            "WEEK APPS",
            "CX COUNT",
            "CX %",
            "WoW APPS %",
            "$ EARNED (est.)",
            "LAST WEEK (SUN FINAL)",
            "",
            "PREV WEEK (THU)",
            "",
            "ROLLING 3-WK AVG",
            "RUNNING WEEK TOTALS",
        ],
        ["", "", "", "", "", "", "", "Apps", "Cx", "Apps", "Cx", "", "MON", "TUE", "WED", "THU", "FRI"],
    ]

    totals = {
        "apps": 0,
        "cx": 0,
        "earned": 0,
        "last_week_apps": 0,
        "last_week_cx": 0,
        "prev_week_apps": 0,
        "prev_week_cx": 0,
        "mon": 0,
        "tue": 0,
        "wed": 0,
        "thu": 0,
        "fri": 0,
    }

    for row in table:
        medal_name = f"{row['medal']} {row['display_name']}".strip()
        earned_value = parse_int(str(row["earned"]).replace(",", "").replace("$", ""), 0) or 0
        data.append(
            [
                row["rank"],
                medal_name,
                row["apps"],
                row["cx"],
                row["cx_pct"],
                row["wow_apps_pct"],
                row["earned"],
                _blank(row["last_week_apps"]),
                _blank(row["last_week_cx"]),
                _blank(row["prev_week_apps"]),
                _blank(row["prev_week_cx"]),
                "" if row["rolling_avg"] is None else row["rolling_avg"],
                _blank(row["mon"]),
                _blank(row["tue"]),
                _blank(row["wed"]),
                _blank(row["thu"]),
                _blank(row["fri"]),
            ]
        )
        totals["apps"] += row["apps"]
        totals["cx"] += row["cx"]
        totals["earned"] += earned_value
        for key in (
            "last_week_apps",
            "last_week_cx",
            "prev_week_apps",
            "prev_week_cx",
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
        ):
            totals[key] += row[key] or 0

    cx_pct = f"{(totals['cx'] / totals['apps'] * 100):.0f}%" if totals["apps"] else "0%"
    weeks = [totals["apps"], totals["last_week_apps"] or None, totals["prev_week_apps"] or None]
    team_avg = rolling_avg(*weeks)
    data.append(
        [
            "",
            "TOTALS",
            totals["apps"],
            totals["cx"],
            cx_pct,
            "",
            format_money(totals["earned"]),
            totals["last_week_apps"],
            totals["last_week_cx"],
            totals["prev_week_apps"],
            totals["prev_week_cx"],
            team_avg if team_avg is not None else "",
            totals["mon"],
            totals["tue"],
            totals["wed"],
            totals["thu"],
            totals["fri"],
        ]
    )
    data.append([])
    data.append([banner.get("team_message") or f"TEAM HAS EARNED {format_money(totals['earned'])} THIS WEEK - KEEP PUSHING!"])
    data.append([])
    data.append([])
    data.append(["NOTES"])
    notes = banner.get("notes") or []
    if notes:
        data.extend([[note] for note in notes])
    else:
        data.append(["Week board synced from the latest TSV/Slack paste."])

    if event_log_entries:
        data.append([])
        data.append(["SYNC FLAGS"])
        data.extend([[entry] for entry in event_log_entries])

    data.append([])
    data.append(["SPECIAL EVENT LOG - standing practice, log every promo/multiplier day here going forward"])
    data.append(
        [
            "Date/Day",
            "Event Type",
            "Multiplier",
            "Reps Affected",
            "Apps Impacted",
            "CX Before Bonus",
            "CX After Bonus",
            "Notes",
        ]
    )
    events = banner.get("events") or []
    if events:
        for event in events:
            data.append(
                [
                    event.get("date", ""),
                    event.get("event_type", ""),
                    event.get("multiplier", ""),
                    event.get("reps", ""),
                    event.get("apps_impacted", ""),
                    event.get("cx_before", ""),
                    event.get("cx_after", ""),
                    event.get("notes", ""),
                ]
            )
    else:
        data.append(["(none this sync)"])

    if banner.get("event_rule"):
        data.append([])
        data.append([banner["event_rule"]])

    data.append([])
    data.append(["Last synced", str(date.today())])
    return data


def write_board(ws, banner, rows, event_log_entries):
    layout = banner.get("layout") or (rows[0].get("layout") if rows else "simple")
    if layout == "full":
        data = build_full_sheet(banner, rows, event_log_entries)
        ws.clear()
        ws.update("A1", data, value_input_option="USER_ENTERED")
        return

    header = ["Rank", "Name", "Apps", "CX", "CX %", "Tier Bonus $", "Notes"]
    table = rank_rows(rows, banner.get("blended_rate", BLENDED_RATE_DEFAULT))
    data = [header]
    for row in table:
        data.append(
            [
                row["rank"],
                row["name"],
                row["apps"],
                row["cx"],
                row["cx_pct"],
                row["tier_bonus"],
                row["notes"],
            ]
        )

    ws.clear()
    ws.update("A1", data)

    if banner.get("dg_num") is not None:
        ws.update(
            "I1",
            [
                [
                    f"DG {banner['dg_num']}/{banner['dg_den']}",
                    f"{banner['nl_left']} NL Left",
                    banner.get("day", ""),
                    str(date.today()),
                ]
            ],
        )

    if event_log_entries:
        start_row = len(data) + 3
        log_block = [["EVENT LOG"]] + [[entry] for entry in event_log_entries]
        ws.update(f"A{start_row}", log_block)


# ============================================================
# MAIN
# ============================================================
def load_board_text(args) -> str:
    if args.board_text:
        return args.board_text
    if args.board_file:
        with open(args.board_file, encoding="utf-8") as handle:
            return handle.read()
    if not sys.stdin.isatty():
        return sys.stdin.read()
    raise SystemExit("Provide --board-text, --board-file, or pipe board text on stdin.")


def process_board(text, previous_by_name=None):
    banner, rows = parse_board(text)
    if not rows:
        return banner, [], ["No leaderboard rows parsed - check the board format."]

    previous_by_name = previous_by_name or {}
    correction_flags = validate_against_previous(rows, previous_by_name)
    # Full TSV exports are already the standing board; do not re-fold notes.
    if banner.get("layout") == "full":
        final_rows, fold_log = rows, []
    else:
        final_rows, fold_log = apply_departures_and_folds(rows)

    all_notes = correction_flags + fold_log
    for row in final_rows:
        if row["flags"]:
            all_notes.extend(
                [f"{row.get('display_name') or row['name']}: {flag}" for flag in row["flags"]]
            )
    return banner, final_rows, all_notes


def main(argv=None):
    parser = argparse.ArgumentParser(description="Sync a pasted G-Unit board to Google Sheets.")
    parser.add_argument("--board-text", help="Raw pasted board text")
    parser.add_argument("--board-file", help="Path to a file containing board text or a TSV export")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and print the ranked board without writing to Google Sheets",
    )
    args = parser.parse_args(argv)

    text = load_board_text(args)
    banner, rows = parse_board(text)
    if not rows:
        print("No leaderboard rows parsed - check the board format.", file=sys.stderr)
        return 1

    previous = {}
    ws = None
    if not args.dry_run:
        ws = get_worksheet()
        previous = read_previous_state(ws)

    banner, final_rows, all_notes = process_board(text, previous)
    table = rank_rows(final_rows, banner.get("blended_rate", BLENDED_RATE_DEFAULT))

    if args.dry_run:
        payload = {
            "banner": {
                key: value
                for key, value in banner.items()
                if key not in {"notes", "events"} or value
            },
            "rows": table,
            "flags": all_notes,
        }
        print(json.dumps(payload, indent=2, default=str))
        return 0

    write_board(ws, banner, final_rows, all_notes)
    print(f"Updated '{WORKSHEET_NAME}' with {len(final_rows)} reps.")
    if all_notes:
        print("\nFLAGGED FOR REVIEW (not silently auto-corrected):")
        for note in all_notes:
            print(f"  - {note}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
