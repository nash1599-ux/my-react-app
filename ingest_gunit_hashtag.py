#!/usr/bin/env python3
"""Ingest one Slack #g-unit sale post and print the G-Unit channel update.

Usage:
    python ingest_gunit_hashtag.py --text "2 phones #g-unit" --author "Gigi"
    python ingest_gunit_hashtag.py --text "sold 1 #g-unit" --author "Cam" --write-sheet
"""

from __future__ import annotations

import argparse
import json
import sys

from gunit_hashtag import (
    DEST_CHANNEL,
    SOURCE_CHANNEL,
    append_sales_log,
    format_channel_update,
    parse_hashtag_sale,
)


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Parse a #g-unit sale shout-out and format the G-Unit channel update."
    )
    parser.add_argument("--text", required=True, help="Raw Slack message text")
    parser.add_argument("--author", default="", help="Slack display name of the poster")
    parser.add_argument("--ts", default="", help="Slack message timestamp for dedupe")
    parser.add_argument(
        "--source-channel",
        default=SOURCE_CHANNEL,
        help="Channel the shout-out came from",
    )
    parser.add_argument(
        "--write-sheet",
        action="store_true",
        help="Append the sale to the G-Unit Sales Log Google Sheet tab",
    )
    args = parser.parse_args(argv)

    event = parse_hashtag_sale(
        args.text,
        {
            "author": args.author,
            "ts": args.ts,
            "sourceChannel": args.source_channel,
        },
    )
    payload = {
        "action": "ignore",
        "destChannel": DEST_CHANNEL,
        "event": event,
        "slackMessage": None,
    }
    if not event.get("matched") or event.get("ignored"):
        payload["reason"] = event.get("reason") or "Not a #g-unit sale."
        print(json.dumps(payload, indent=2))
        return 0

    payload["action"] = "post"
    payload["slackMessage"] = format_channel_update(event)
    if args.write_sheet:
        payload["sheetTab"] = append_sales_log(event)
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
