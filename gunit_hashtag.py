"""Parse individual Slack #g-unit sale shout-outs.

Phones count as apps on the G-Unit board. CX is optional.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Optional

from update_gunit_board import ALIASES, normalize_name

HASHTAG_RE = re.compile(r"#g[-_]?unit\b", re.IGNORECASE)
PHONE_RE = re.compile(r"\b(\d+)\s*(?:phones?|phns?|handsets?)\b", re.IGNORECASE)
APP_RE = re.compile(r"\b(\d+)[ \t]+(?:apps?|lines?)\b", re.IGNORECASE)
CX_RE = re.compile(r"\b(\d+)[ \t]+cx\b", re.IGNORECASE)
NL_TOKEN_RE = re.compile(r"\bNL[ \t]*[:#-]?[ \t]*(\d+)\b", re.IGNORECASE)
CX_TOKEN_RE = re.compile(r"\bCX[ \t]*[:#-]?[ \t]*(\d+)\b", re.IGNORECASE)
SO_LINE_RE = re.compile(r"^\s*(?:s/o|shout\s*out)\b.*$", re.IGNORECASE | re.MULTILINE)
SALE_LINE_RE = re.compile(
    r"\b(cx|nl|sold|closed|#g[-_]?unit|\d+\s*phones?)\b", re.IGNORECASE
)
SOLD_RE = re.compile(r"\b(?:sold|closed|got|did)\s+(\d+)\b", re.IGNORECASE)
HASH_NUM_RE = re.compile(r"#g[-_]?unit\b[^\d]{0,12}(\d+)", re.IGNORECASE)
NUM_HASH_RE = re.compile(r"\b(\d+)\s*#g[-_]?unit\b", re.IGNORECASE)
BOARD_ROW_RE = re.compile(r"\d+\s*App[s]?\s*\|\s*\d+\s*CX", re.IGNORECASE)
SOURCE_CHANNEL = "precisionmanagement-att-sales"
SOURCE_CHANNEL_ID = "C0A7871FAUV"
DEST_CHANNEL = "g-unit-saleschannel"
DEST_CHANNEL_ID = "C0BS4E8LH42"
LOG_WORKSHEET = "G-Unit Sales Log"
LOG_HEADERS = [
    "Timestamp",
    "Author",
    "Rep",
    "Phones",
    "CX",
    "Raw text",
    "Source channel",
    "Slack ts",
]

KNOWN_NAMES = sorted(
    {
        *ALIASES.keys(),
        *ALIASES.values(),
        "steveo",
        "shaad",
        "matthew grant",
        "leo chowdury",
    },
    key=len,
    reverse=True,
)


def has_gunit_hashtag(text: str) -> bool:
    return bool(HASHTAG_RE.search(text or ""))


def looks_like_full_board(text: str) -> bool:
    hits = [line for line in (text or "").splitlines() if BOARD_ROW_RE.search(line)]
    return len(hits) >= 2


def _first_number(pattern: re.Pattern, text: str):
    match = pattern.search(text or "")
    return int(match.group(1)) if match else None


def _token_max(pattern: re.Pattern, text: str):
    values = [
        int(match.group(1))
        for match in pattern.finditer(text or "")
        if 1 <= int(match.group(1)) <= 20
    ]
    if not values:
        return None
    return max(len(values), max(values))


def extract_cx_count(text: str) -> int:
    token = _token_max(CX_TOKEN_RE, text or "")
    if token is not None:
        return token
    return _first_number(CX_RE, text or "") or 0


def extract_phone_count(text: str) -> int:
    raw = text or ""
    for pattern in (PHONE_RE, APP_RE):
        value = _first_number(pattern, raw)
        if value is not None:
            return value
    new_lines = _token_max(NL_TOKEN_RE, raw)
    if new_lines is not None:
        return new_lines
    for pattern in (SOLD_RE, HASH_NUM_RE, NUM_HASH_RE):
        value = _first_number(pattern, raw)
        if value is not None:
            return value
    cx = extract_cx_count(raw) or None
    if cx == 0:
        cx = None
    numbers = [
        int(match.group(1))
        for match in re.finditer(r"\b(\d+)\b", raw)
        if 1 <= int(match.group(1)) <= 20 and int(match.group(1)) != cx
    ]
    if len(numbers) == 1:
        return numbers[0]
    return 1


def strip_shoutouts(text: str) -> str:
    """Drop S/O lines and the name-list lines that follow them."""
    kept = []
    skipping = False
    for line in (text or "").splitlines():
        if SO_LINE_RE.match(line):
            skipping = True
            continue
        if skipping:
            if SALE_LINE_RE.search(line):
                skipping = False
                kept.append(line)
            continue
        kept.append(line)
    return "\n".join(kept)


def find_mentioned_name(text: str, fallback: str = "") -> str:
    haystack = strip_shoutouts(text or "")
    for name in KNOWN_NAMES:
        pattern = re.compile(rf"\b{re.escape(name)}\b", re.IGNORECASE)
        if pattern.search(haystack):
            return normalize_name(name)
    return normalize_name(fallback or "Unknown rep")


def parse_hashtag_sale(text: str, meta: Optional[dict] = None) -> dict:
    meta = meta or {}
    raw = (text or "").strip()
    if not has_gunit_hashtag(raw):
        return {"matched": False, "reason": "No #g-unit hashtag."}
    if looks_like_full_board(raw):
        return {
            "matched": True,
            "ignored": True,
            "reason": "Looks like a full scoreboard paste, not a single sale.",
        }

    phones = extract_phone_count(raw)
    cx = extract_cx_count(raw)
    author = str(meta.get("author") or "").strip()
    name = find_mentioned_name(raw, author)
    return {
        "matched": True,
        "ignored": False,
        "id": meta.get("id") or meta.get("ts") or "",
        "ts": meta.get("ts") or datetime.now(timezone.utc).isoformat(),
        "sourceChannel": meta.get("sourceChannel") or SOURCE_CHANNEL,
        "author": author or name,
        "name": name,
        "displayName": name,
        "phones": phones,
        "apps": phones,
        "cx": cx,
        "text": raw,
    }


def format_channel_update(event: dict, totals: Optional[dict] = None, rows: Optional[list] = None) -> str:
    phones = event.get("phones", 0)
    phone_label = "phone" if phones == 1 else "phones"
    lines = [
        "🪖 *G-UNIT LIVE SALE*",
        f"*{event.get('displayName')}* +{phones} {phone_label}"
        + (f" · +{event['cx']} CX" if event.get("cx") else ""),
    ]
    if totals:
        lines.extend(
            [
                "",
                (
                    f"This week: *{totals.get('apps', 0)} apps / "
                    f"{totals.get('cx', 0)} CX*"
                ),
            ]
        )
    if rows:
        lines.extend(["", "*Leaderboard*"])
        medals = {1: "🥇", 2: "🥈", 3: "🥉"}
        for index, row in enumerate(rows[:8], start=1):
            medal = medals.get(row.get("rank") or index) or f"{index}."
            apps = row.get("apps", 0)
            app_label = "App" if apps == 1 else "Apps"
            lines.append(
                f"{medal} {row.get('display_name') or row.get('name')}  "
                f"{apps} {app_label} | {row.get('cx', 0)} CX"
            )
    return "\n".join(lines)


def sales_log_row(event: dict) -> list:
    return [
        event.get("ts", ""),
        event.get("author", ""),
        event.get("name", ""),
        event.get("phones", 0),
        event.get("cx", 0),
        event.get("text", ""),
        event.get("sourceChannel", SOURCE_CHANNEL),
        event.get("id", ""),
    ]


def append_sales_log(event: dict, oauth_code: Optional[str] = None) -> str:
    """Append one sale to the G-Unit Sales Log tab. Creates the tab if needed."""
    import gspread

    from update_gunit_board import SHEET_ID, get_credentials

    creds = get_credentials(oauth_code=oauth_code)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SHEET_ID)
    try:
        worksheet = sheet.worksheet(LOG_WORKSHEET)
    except gspread.WorksheetNotFound:
        worksheet = sheet.add_worksheet(title=LOG_WORKSHEET, rows=2000, cols=8)
        worksheet.update("A1", [LOG_HEADERS, sales_log_row(event)])
        return LOG_WORKSHEET

    values = worksheet.get_all_values()
    if not values:
        worksheet.update("A1", [LOG_HEADERS, sales_log_row(event)])
        return LOG_WORKSHEET
    worksheet.append_row(sales_log_row(event), value_input_option="USER_ENTERED")
    return LOG_WORKSHEET


def event_to_json(event: dict) -> str:
    return json.dumps(event, indent=2, default=str)
