#!/usr/bin/env python3
"""
G-Unit Sales Board -> Google Sheets sync.

Usage (from Cursor Cloud Agent, triggered via @Cursor in Slack):
    python update_gunit_board.py --board-text "<pasted board text>"
    python update_gunit_board.py --board-file board.txt
    python update_gunit_board.py --dry-run --board-text "<pasted board text>"

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
import json
import os
import re
import sys
import tempfile
from datetime import date

# ============================================================
# CONFIG
# ============================================================
SHEET_ID = os.environ.get("GUNIT_SHEET_ID", "1-a64P6SQyTg8Cq3d_uuYOKHCIpZh0uKizTYDi85FjEw")
CREDS_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")
WORKSHEET_NAME = "G-Unit Board"

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
    r"DG:\s*(?P<dg_num>\d+)/(?P<dg_den>\d+)\s*\|\s*(?P<nl>\d+)\s*NL LEFT\s*\|\s*(?P<day>\w+)",
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


def normalize_name(raw_name: str) -> str:
    key = raw_name.strip().lower()
    return ALIASES.get(key, raw_name.strip())


def parse_board(text: str):
    """Parse a pasted G-Unit board into (banner_info, [rows]).

    Each row: {name, apps, cx, tail, departed, fold_to, flags}.
    """
    banner_match = BANNER_RE.search(text)
    banner = {}
    if banner_match:
        banner = {
            "dg_num": int(banner_match.group("dg_num")),
            "dg_den": int(banner_match.group("dg_den")),
            "nl_left": int(banner_match.group("nl")),
            "day": banner_match.group("day"),
        }

    rows = []
    for line in text.splitlines():
        match = LINE_RE.search(line)
        if not match:
            continue
        name = normalize_name(match.group("name"))
        apps = int(match.group("apps"))
        cx = int(match.group("cx"))
        tail = (match.group("tail") or "").strip(" -|")
        flags = []

        # RULE 1: CX can never exceed Apps
        if cx > apps:
            flags.append(
                f"DATA ERROR: CX ({cx}) exceeds Apps ({apps}) - needs correction at source"
            )

        departed = bool(DEPARTED_RE.search(tail))
        fold_match = FOLD_RE.search(tail)
        fold_to = normalize_name(fold_match.group("target")) if fold_match else None

        rows.append(
            {
                "name": name,
                "apps": apps,
                "cx": cx,
                "tail": tail,
                "departed": departed,
                "fold_to": fold_to,
                "flags": flags,
            }
        )

    return banner, rows


def tier_bonus(cx: int) -> int:
    for threshold, bonus in CX_TIERS:
        if cx >= threshold:
            return bonus
    return 0


# ============================================================
# VALIDATION AGAINST PRIOR SHEET STATE
# ============================================================
def validate_against_previous(rows, previous_by_name):
    """RULE 2: CX Count can never decrease within an open week.

    Returns a list of correction-needed flags; does not silently fix them.
    """
    corrections = []
    for row in rows:
        prev = previous_by_name.get(row["name"])
        if prev is not None and row["cx"] < prev.get("cx", 0):
            corrections.append(
                f"{row['name']}: CX dropped from {prev['cx']} to {row['cx']} - "
                f"cumulative CX should never decrease. Flagged, not auto-corrected."
            )
    return corrections


def apply_departures_and_folds(rows):
    """RULE 4: handle departures - either drop, or fold into a named mentor."""
    by_name = {row["name"]: row for row in rows}
    final_rows = []
    log_entries = []

    for row in rows:
        if row["departed"] and row["fold_to"]:
            target = by_name.get(row["fold_to"])
            if target:
                target["apps"] += row["apps"]
                target["cx"] += row["cx"]
                log_entries.append(
                    f"Folded {row['name']}'s production ({row['apps']} apps / {row['cx']} cx) "
                    f"into {row['fold_to']} - departure with credit reassignment."
                )
            else:
                log_entries.append(
                    f"Removed {row['name']} from roster - departed, fold target "
                    f"'{row['fold_to']}' was not on the board."
                )
            continue
        if row["departed"]:
            log_entries.append(
                f"Removed {row['name']} from roster - departed, no fold-in specified."
            )
            continue
        final_rows.append(row)

    return final_rows, log_entries


def rank_rows(rows):
    ranked = sorted(rows, key=lambda row: (-row["apps"], row["name"]))
    table = []
    for index, row in enumerate(ranked, start=1):
        cx_pct = f"{(row['cx'] / row['apps'] * 100):.0f}%" if row["apps"] else "0%"
        table.append(
            {
                "rank": index,
                "name": row["name"],
                "apps": row["apps"],
                "cx": row["cx"],
                "cx_pct": cx_pct,
                "tier_bonus": tier_bonus(row["cx"]),
                "notes": "; ".join(row["flags"]) if row["flags"] else "",
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
        return sheet.add_worksheet(title=WORKSHEET_NAME, rows=100, cols=12)


def read_previous_state(ws):
    """Returns {name: {apps, cx}} from the current sheet contents."""
    try:
        records = ws.get_all_records()
    except Exception:
        return {}
    previous = {}
    for record in records:
        name = record.get("Name")
        if not name:
            continue
        try:
            previous[name] = {
                "apps": int(record.get("Apps", 0) or 0),
                "cx": int(record.get("CX", 0) or 0),
            }
        except (TypeError, ValueError):
            continue
    return previous


def write_board(ws, banner, rows, event_log_entries):
    header = ["Rank", "Name", "Apps", "CX", "CX %", "Tier Bonus $", "Notes"]
    table = rank_rows(rows)
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

    if banner:
        ws.update(
            "I1",
            [
                [
                    f"DG {banner['dg_num']}/{banner['dg_den']}",
                    f"{banner['nl_left']} NL Left",
                    banner["day"],
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
    final_rows, fold_log = apply_departures_and_folds(rows)

    all_notes = correction_flags + fold_log
    for row in final_rows:
        if row["flags"]:
            all_notes.extend([f"{row['name']}: {flag}" for flag in row["flags"]])
    return banner, final_rows, all_notes


def main(argv=None):
    parser = argparse.ArgumentParser(description="Sync a pasted G-Unit board to Google Sheets.")
    parser.add_argument("--board-text", help="Raw pasted board text")
    parser.add_argument("--board-file", help="Path to a file containing board text")
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

    if args.dry_run:
        payload = {
            "banner": banner,
            "rows": rank_rows(final_rows),
            "flags": all_notes,
        }
        print(json.dumps(payload, indent=2))
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
