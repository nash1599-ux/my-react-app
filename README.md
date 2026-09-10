# G-Unit sales board

Live tracker for G-Unit phone sales. When someone posts in `#precisionmanagement-att-sales` with `#g-unit`, the phone count is parsed, added to the board, posted into `#g-unit-saleschannel`, and logged on a Google Sheet tab you can monitor.

## Slack flow

1. A rep posts in `#precisionmanagement-att-sales`, for example `2 phones #g-unit`, `Gigi sold 1 #g-unit`, or a shout-out with `NL1` / `NL2` / `CX1` plus `#g-unit`.
2. The parser reads the phone count (phones count as apps on the board). Optional `1 CX` is recorded too.
3. A live update is posted to `#g-unit-saleschannel`.
4. The same sale is appended to the **G-Unit Sales Log** tab in the G-Unit Google Sheet.

Invite Cursor into both Slack channels so it can read the source posts and write the destination board.

### Parse a shout-out

```bash
python ingest_gunit_hashtag.py --text "2 phones #g-unit" --author "Gigi"
```

Add `--write-sheet` to append the row to Google Sheets (needs `GOOGLE_SERVICE_ACCOUNT_JSON` or OAuth, same as the existing board sync).

## Google Sheet monitor

Spreadsheet: [G-Unit Board](https://docs.google.com/spreadsheets/d/1-a64P6SQyTg8Cq3d_uuYOKHCIpZh0uKizTYDi85FjEw)

| Tab | What it is |
| --- | --- |
| `G-Unit Board` | Ranked leaderboard (apps / CX) |
| `G-Unit Sales Log` | One row per `#g-unit` shout-out: time, rep, phones, CX, raw text |
| `G-Unit Weekly Tracker` | Import `data/gunit-weekly-tracker.csv` (reps by week) |
| `G-Unit Daily Log` | Import `data/gunit-daily-log.csv` (one row per field day) |

The app **Weekly tracker** tab can snapshot the live board and download fresh CSVs. Use File → Import in Google Sheets if the live write key is not connected.

The Salesboard UI has a **Live #g-unit sales** panel so you can also log a post locally while the Sheet connection is being set up.

## Culture, weather, leaderboard poster

The app has four tabs:

- **Leaderboard** — live board from the `#g-unit` pipeline
- **Poster** — graphic for Slack
- **Culture** — 9 Steps, C.O.E, lap system, S.E.E, L.O.A, quotes, copy-to-Slack posts
- **Weekly tracker** — week-to-week spreadsheet

Weather defaults to Casselberry / Orlando, FL.

## Salesboard app

```bash
npm start
```

Paste a full Slack scoreboard, or log a single `#g-unit` sale. Phones increment that rep's apps.

```bash
npm test
python -m unittest tests/test_gunit_hashtag.py tests/test_update_gunit_board.py
```

## Board sync (full paste)

```bash
python update_gunit_board.py --dry-run --board-text "<pasted board>"
```

Live writes still need a real Google service-account key in `GOOGLE_SERVICE_ACCOUNT_JSON` (not a desktop OAuth client). Share the sheet with the service account as Editor.
